const oanda = require("./config/oanda");
const axios = require("axios");
const User = require("./models/user");
const SMA = require("technicalindicators").SMA;
const compareTimes = require("./timeHandler").compareTimes;
const granToSeconds = require("./timeHandler").granToSeconds;

let user = new User();

async function runBacktest(balance, algo, timeframe) {
  user.balance = balance;
  user.algo = algo;
  user.timeframe = timeframe;
  user.orders = [];
  user.allOrders = [];
  user.candles = [];
  user.MA1 = [];
  user.MA2 = [];
  user.startBalance = user.balance;
  user.margin = user.balance;
  return getAllCandles().then(() => runAlgorithm());
  //return runAlgorithm();
}

/*let algo = {
  instrument: "EUR_HUF",
  MAperiod1: 15,
  MAperiod2: 30,
};

user.algo = algo;

getAllCandles();*/

function getAllCandles() {
  return new Promise(async (resolve, reject) => {
    let allMilliSeconds = user.timeframe.to - user.timeframe.from;
    user.candleCount =
      allMilliSeconds / 1000 / granToSeconds[user.algo.granularity];
    let candles5000 = granToSeconds[user.algo.granularity] * 1000 * 5000;
    let times = [];
    times.push(user.timeframe.from);

    if (user.candleCount > 5000) {
      for (let i = candles5000; i < allMilliSeconds; i += candles5000) {
        times.push(new Date(user.timeframe.from.getTime() + i));
      }
    }

    times.push(user.timeframe.to);

    for (let i = 0; i < times.length - 1; i++)
      await getCandles(times[i], times[i + 1]);

    const len = user.candles.length;
    let candleValues = [];
    for (let i = 0; i < len; i++) {
      const close = parseFloat(user.candles[i].bid.c);
      candleValues[i] = close;
    }

    let MA1 = await SMA.calculate({
      period: user.algo.MAperiod1,
      values: candleValues,
    });
    let MA2 = await SMA.calculate({
      period: user.algo.MAperiod2,
      values: candleValues,
    });
    for (
      let i = 0;
      i < len && MA1[MA1.length - 2 - i] && MA2[MA2.length - 2 - i];
      i++
    ) {
      user.candles[len - 1 - i].MA1 = MA1[MA1.length - 2 - i];
      user.candles[len - 1 - i].MA2 = MA2[MA2.length - 2 - i];
    }
    console.log(user.candles);
    resolve();
  });
}

async function getCandles(from, to) {
  const url = `https://api-fxpractice.oanda.com/v3/instruments/${user.algo.instrument}/candles`;
  return await axios
    .get(url, {
      params: {
        price: "AB",
        from: from.toISOString(),
        to: to.toISOString(),
        granularity: user.algo.granularity,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 5d982a2b544425e8783646142d4b2a83-53d7111b51f1dc94ee16084aa98c6692`,
      },
    })
    .then((response) => {
      user.candles = user.candles.concat(response.data.candles);
    })
    .catch(console.log);
}

function runAlgorithm() {
  for (
    let i = user.algo.MAperiod2 + 1;
    i < user.candles.length &&
    typeof user.candles[i - 1].MA1 !== "undefined" &&
    typeof user.candles[i - 1].MA2 !== "undefined";
    i++
  ) {
    try {
      setLots();
      const cross = checkCross(i);
      trade(cross, i);
      checkForClose(i);
    } catch (err) {
      console.log(err);
    }
  }
  return {
    orders: user.allOrders,
    PL: user.balance - user.startBalance,
  };
}

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

function setLots() {
  let balance = user.balance;

  for (let i = 0; i < 8; i++) {
    if (
      balance < user.startBalance * balMuls[i] &&
      user.algo.units > user.startUnits * lotMuls[i]
    )
      user.algo.units = user.startUnits * lotMuls[i];
  }

  for (let i = 0; i < 8; i++) {
    if (
      balance >= user.startBalance * balMuls[i] &&
      user.algo.units < user.startUnits * lotMuls[i + 1]
    )
      user.algo.units = user.startUnits * lotMuls[i + 1];
  }
}

function checkCross(index) {
  let ret = 0;

  if (
    user.candles[index].MA1 >= user.candles[index].MA2 &&
    user.candles[index - 1].MA1 < user.candles[index - 1].MA2
  )
    ret = 1;
  else if (
    user.candles[index].MA1 <= user.candles[index].MA2 &&
    user.candles[index - 1].MA1 > user.candles[index - 1].MA2
  )
    ret = -1;
  return ret;
}

function trade(cross, i) {
  if (cross === 0 || user.margin < user.algo.units / user.algo.marginRatio)
    return;
  const order = {
    units: user.algo.units * cross,
    instrument: user.algo.instrument,
    trailValue: user.algo.trailValue,
    candle: user.candles[i],
  };
  let stop =
    order.units > 0
      ? user.candles[i].bid.c - order.trailValue
      : user.candles[i].ask.c + order.trailValue;
  order.stopLoss = stop;
  user.orders.push(order);
  user.allOrders.push(order);
  user.margin -= order.units / user.algo.marginRatio;
}

function trailingStop(order, i) {
  if (order) {
    if (
      compareTimes(
        user.allOrders[user.orders.length - 1].candle.time,
        order.candle.time,
        granToSeconds[user.algo.granularity] * user.algo.trailWait
      )
    )
      return;
    if (order.units > 0) {
      if (user.candles[i].bid.c - order.stopLoss > order.trailValue) {
        //adjust stop loss if it is too far
        order.stopLoss = user.candles[i].bid.c - order.trailValue;
      }
    } else if (order.units < 0) {
      if (order.stopLoss - user.candles[i].ask.c > order.trailValue) {
        //adjust stop loss if it is too far
        order.stopLoss = user.candles[i].ask.c + order.trailValue;
      }
    }
  }
}

async function checkForClose(i) {
  if (user.orders.length === 0) return;
  user.orders.forEach((order) => {
    let diff;
    if (order.units > 0) {
      if (user.candles[i].bid.l <= order.stopLoss) {
        let pipDiff = user.candles[i].bid.c - order.candle.ask.c;
        diff = (Math.abs(order.units) * pipDiff) / user.candles[i].bid.c;
      }
    } else if (order.units < 0) {
      if (user.candles[i].ask.h >= order.stopLoss) {
        let pipDiff = order.candle.bid.c - user.candles[i].ask.c;
        diff = (Math.abs(order.units) * pipDiff) / user.candles[i].ask.c;
      }
    }

    if (diff) {
      user.balance += diff;
      user.margin += order.units / user.algo.marginRatio + diff;
      for (let j = 0; j < user.orders.length; j++) {
        if (user.orders[j] === order) user.orders.splice(j, 1);
      }
      for (let j = 0; j < user.allOrders.length; j++) {
        if (user.allOrders[j] === order) {
          user.allOrders[j].closeCandle = user.candles[i];
          user.allOrders[j].PL = diff;
        }
      }
    } else trailingStop(order, i);
  });
}

module.exports = {
  run: runBacktest,
};
