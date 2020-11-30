const oanda = require("./config/oanda");
const axios = require("axios");
const User = require("./models/user");
const Algo = require("./models/algo");
const Account = require("./models/account");
const SMA = require("technicalindicators").SMA;

let user = new User();
let candles;

async function runBacktest({ account, algo, timeframe }) {
  //account = {currency, balance}
  user.account = account;
  user.algo = algo;
  user.timeframe = timeframe;
  user.orders = [];
  user.candles = {};
  user.MA1 = [];
  user.MA2 = [];
  user.startBalance = user.account.balance;
  await getAllCandles();
  await runAlgorithm();
}
let algo = {
  instrument: "EUR_HUF",
  MAperiod1: 15,
  MAperiod2: 30,
};

user.algo = algo;

getAllCandles();

async function getAllCandles() {
  const url = `https://api-fxpractice.oanda.com/v3/instruments/${user.algo.instrument}/candles`;
  return await axios
    .get(url, {
      params: {
        price: "AB",
        from: "2014-06-20T17:00:00.000000Z", //user.timeframe.from.toISOString(),
        to: "2014-06-28T17:00:00.000000Z", //user.timeframe.to.toISOString(),
        granularity: "H1", //user.algo.granularity,
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
    } catch (err) {
      console.log(err);
    }
  }
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
  if (cross === 0) return;
  const order = {
    units: user.algo.units * cross,
    instrument: user.algo.instrument,
    trailValue: user.algo.trailValue,
    candle: user.candles[i],
  };
  orders.push(order);
}

/*void TrailingStop();
{
  let res;
  res = OrderSelect(ticket, SELECT_BY_TICKET);

  if (res) {
    if (TimeCurrent() - OrderOpenTime() < PeriodSeconds() * TrailWait) return;
    if (OrderType() == OP_BUY) {
      if (Bid - OrderStopLoss() > TrailValue * Point()) {
        //adjust stop loss if it is too far
        res = OrderModify(
          OrderTicket(),
          OrderOpenPrice(),
          Bid - TrailValue * Point(),
          OrderTakeProfit(),
          0
        );
        if (!res) {
          Alert("TrailingStop OrderModify Error: ", GetLastError());
        }
      }
    } else if (OrderType() == OP_SELL) {
      if (OrderStopLoss() - Ask > TrailValue * Point()) {
        //adjust stop loss if it is too far
        res = OrderModify(
          OrderTicket(),
          OrderOpenPrice(),
          Ask + TrailValue * Point(),
          OrderTakeProfit(),
          0
        );
        if (!res) {
          Alert("TrailingStop OrderModify Error: ", GetLastError());
        }
      }
    }
  }
}*/

module.exports = {
  run: runBacktest,
};
