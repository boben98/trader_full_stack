const oanda = require("./config/oanda");
const axios = require("axios");
const User = require("./models/user");
const Algo = require("./models/algo");
const Account = require("./models/account");
const SMA = require("technicalindicators").SMA;
const compareTimes = require("./timeHandler").compareTimes;
const granToSeconds = require("./timeHandler").granToSeconds;

let user = new User();

async function runBacktest({ account, algo, timeframe }) {
  user.account = account;
  user.algo = algo;
  user.timeframe = timeframe;
  user.orders = [];
  user.allOrders = [];
  user.candles = {};
  user.MA1 = [];
  user.MA2 = [];
  user.startBalance = user.account.balance;
  user.margin = user.account.balance;
  await getAllCandles();
  return await runAlgorithm();
}

/*let algo = {
  instrument: "EUR_HUF",
  MAperiod1: 15,
  MAperiod2: 30,
};

user.algo = algo;

getAllCandles();*/

async function getAllCandles() {
  const url = `https://api-fxpractice.oanda.com/v3/instruments/${user.algo.instrument}/candles`;
  return await axios
    .get(url, {
      params: {
        price: "AB",
        from: user.timeframe.from.toISOString(),
        to: user.timeframe.to.toISOString(),
        granularity: user.algo.granularity,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 5d982a2b544425e8783646142d4b2a83-53d7111b51f1dc94ee16084aa98c6692`,
      },
    })
    .then(async (response) => {
      user.candles = response.data.candles;
      const len = response.data.candles.length;
      let candleValues = [];
      for (let i = 0; i < len; i++) {
        const close = parseFloat(response.data.candles[i].bid.c);
        candleValues[i] = close;
      }
      let MA1 = SMA.calculate({
        period: user.algo.MAperiod1,
        values: candleValues,
      });
      let MA2 = SMA.calculate({
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
    })
    .catch(console.log);
}

async function runAlgorithm() {
  for (
    let i = 0;
    i < user.candles.length &&
    user.candles[i - 1].MA1 &&
    user.candles[i - 1].MA2;
    i++
  ) {
    try {
      await setLots();
      const cross = await checkCross(i);
      await trade(cross, i);
      await checkForClose(i);
    } catch (err) {
      console.log(err);
    }
  }
  return {
    orders: user.allOrders,
    difference: user.account.balance - user.startBalance,
  };
}

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

async function setLots() {
  let balance = user.account.balance;

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

async function checkCross(index) {
  let ret = 0;

  if (
    user.candles[index].MA1 >= user.candles[index].MA2 &&
    user.candles[index - 1].MA1 < candles[index - 1].MA2
  )
    ret = 1;
  else if (
    user.candles[index].MA1 <= user.candles[index].MA2 &&
    user.candles[index - 1].MA1 > candles[index - 1].MA2
  )
    ret = -1;
  return ret;
}

async function trade(cross, i) {
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

async function trailingStop(order, i) {
  if (order) {
    if (
      (compareTimes(order.candle.time),
      new Date().toISOString,
      granToSeconds[user.algo.granularity] * user.algo.trailWait)
    )
      if (order.units > 0) {
        //return;

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

        diff = (Math.abs(order.units) * diff * 10000) / user.candles[i].bid.c;
      }
    } else if (order.units < 0) {
      if (user.candles[i].ask.h >= order.stopLoss) {
        let pipDiff = order.candle.bid.c - user.candles[i].ask.c;
        diff = (Math.abs(order.units) * diff * 10000) / user.candles[i].ask.c;
      }
    }

    if (diff) {
      user.account.balance += diff;
      user.margin += order.units / user.algo.marginRatio + diff;
      for (let i = 0; i < user.orders.length; i++) {
        if (user.orders[i] === order) user.orders.splice(i, 1);
      }
    } else trailingStop(order, i);
  });
}

module.exports = {
  run: runBacktest,
};
