const fx = require("simple-fxtrade");
const User = require("../models/user");
const Order = require("../models/order");
const Account = require("../models/account");
const Algo = require("../models/algo");
const SMA = require("technicalindicators").SMA;
const axios = require("axios");

let api_key;
let account_id;

const run = async () => {
  await User.find().exec(async (err, result) => {
    if (err) return console.log(err);
    await result.forEach(async (r) => {
      api_key = r.oanda_api_key;
      fx.configure({ apiKey: api_key });
      await setAccountID();
      await testDataOptions();
      //await testTrading();
      await runAlgorithm();
    });
  });
};

async function setAccountID() {
  await fx
    .accounts()
    .then((a) => {
      a.accounts.forEach((d) => {
        //if (d.tags[0] == "HEDGING") ret = d.id;
      });
      account_id = "101-004-13865294-001";
      return account_id;
    })
    .then(async (id) => {
      fx.setAccount(id);
    })
    .catch(console.log);
}

async function getAccountSummary() {
  const account = (await fx.summary()).account;
  return Account(account);
}

async function getTransactions(size) {
  let trans = await fx.transactions();
  let lastID = trans.lastTransactionID;
  let firstID = lastID - size + 1;
  const url = `https://api-fxpractice.oanda.com/v3/accounts/${account_id}/transactions/idrange`;
  return await axios
    .get(url, {
      params: {
        from: firstID,
        to: lastID,
      },
      headers: {
        contenttype: "application/json",
        Authorization: `Bearer ${api_key}`,
      },
    })
    .then(async (response) => {
      return response.data.transactions;
    })
    .catch(console.log);
}

const algo = new Algo();
let MAs = [];
let lastMAs = [];
let MA15 = [];
let MA30 = [];
let candleValues = [];
let makeOrder = false;
let makeOrderWaitLimit = 0.0007;
let lastTicket;
let startBalance = 100000;
let units = 1000000;
const granularity = "M1";

let isOnDataActive = false;

async function getBalance() {
  let summary = await fx.summary();
  return parseFloat(summary.account.balance);
}

async function runAlgorithm() {
  await User.findOne().exec((err, r) => {
    if (err) return console.log(err);
    console.log(r);
    //startBalance = r._account.balance;
  });

  startBalance = getBalance();

  if ((await isActiveTime()) && !isOnDataActive) {
    setInterval(onData, granToSeconds[granularity] * 100);
  }
}

async function isActiveTime() {
  let now = new Date().toISOString();
  let early = "0000-00-00T21:0:00.000000000Z";
  let late = "0000-00-00T23:0:00.000000000Z";

  let bool1 = await compareTimes(now, early);
  let bool2 = await compareTimes(late, now);
  return bool1 || bool2;
}

async function onData() {
  await setLots();
  await updateMAs();
  const cross = await checkCross();
  await trade(cross);
}

let inTrade = false;

async function trade(cross) {
  if (cross === 0 || inTrade) return;
  setTimeout(() => {
    inTrade = false;
  }, granToSeconds[granularity] * 10000);
  inTrade = true;
  console.log("\t\t\t\tTRADE");
  const order = {
    order: {
      units: units * cross,
      instrument: "EUR_USD",
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT",
      trailingStopLossOnFill: { distance: 0.0005 },
    },
  };
  try {
    await fx.orders.create(order);
  } catch (err) {
    console.log(err);
  }
}

async function checkCross() {
  const len15 = MA15.length;
  const len30 = MA30.length;

  let ret = 0;

  if (MA15[len15 - 1] >= MA30[len30 - 1] && MA15[len15 - 2] < MA30[len30 - 2])
    ret = 1;
  else if (
    MA15[len15 - 1] <= MA30[len30 - 1] &&
    MA15[len15 - 2] > MA30[len30 - 2]
  )
    ret = -1;
  return ret;
}

const granToSeconds = {
  S5: 5,
  S10: 10,
  S15: 15,
  S30: 30,
  M1: 60,
  M2: 120,
  M4: 240,
  M5: 300,
  M10: 600,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H2: 7200,
};

async function timeToSeconds(time) {
  let time1 = time.substring(11, 19);
  return (
    parseInt(time1.substring(0, 2)) * 3600 +
    parseInt(time1.substring(3, 5)) * 60 +
    parseInt(time1.substring(6))
  );
}

async function roundDown(num, modulus) {
  return Math.floor(num / modulus) * modulus;
}

async function compareTimes(timeEarly, timeLater, difference = 0) {
  //assuming the same day
  if (typeof timeEarly === "undefined") return true;
  /*const time1_seconds = await roundDown(
    await timeToSeconds(timeEarly),
    difference
  );
  const time2_seconds = await roundDown(
    await timeToSeconds(timeLater),
    difference
  );*/

  const time1_seconds = await timeToSeconds(timeEarly);
  const time2_seconds = await timeToSeconds(timeLater);
  const fullDay = 3600 * 23 + 60 * 59 + 59;
  if (time1_seconds + difference > fullDay) return true;
  return time1_seconds + difference <= time2_seconds;
}

let lastCloseTime;

async function getCandles() {
  const url =
    "https://api-fxpractice.oanda.com/v3/accounts/101-004-13865294-001/instruments/EUR_USD/candles";
  return await axios
    .get(url, {
      params: {
        count: 100,
        price: "B",
        granularity: granularity,
      },
      headers: {
        contenttype: "application/json",
        Authorization: `Bearer ${api_key}`,
      },
    })
    .then(async (response) => {
      const len = response.data.candles.length;
      const nextCloseTime = response.data.candles[len - 1].time;
      const next = await compareTimes(
        lastCloseTime,
        nextCloseTime,
        granToSeconds[granularity]
      );
      if (!next) {
        //await getCandles();
        return false;
      }
      for (let i = 0; i < len; i++) {
        const close = parseFloat(response.data.candles[i].bid.c);
        candleValues[i] = close;
      }
      lastCloseTime = nextCloseTime;
      console.log(lastCloseTime, "\n");
      return true;
    })
    .catch(console.log);
}

async function updateMAs() {
  const len = candleValues.length;
  const time = new Date().toISOString();
  const next = await compareTimes(
    lastCloseTime,
    time,
    granToSeconds[granularity]
  );
  if (len < 30 || next) {
    await getCandles().then((active) => {
      if (active) {
        MA15 = SMA.calculate({ period: 15, values: candleValues });
        MA30 = SMA.calculate({ period: 30, values: candleValues });
      }
    });
  }
}

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];
let Lots;

async function setLots() {
  let balance = getBalance();

  for (let i = 0; i < 8; i++) {
    if (balance < startBalance * balMuls[i] && Lots > startLots * lotMuls[i])
      Lots = startLots * lotMuls[i];
  }

  for (let i = 0; i < 8; i++) {
    if (
      balance >= startBalance * balMuls[i] &&
      Lots < startLots * lotMuls[i + 1]
    )
      Lots = startLots * lotMuls[i + 1];
  }
}

async function testDataOptions() {
  /*console.log("Summary");
  console.log((await fx.summary()).account);
  console.log("\n");

  console.log("Instruments");
  console.log((await fx.instruments()).instruments);
  console.log("\n");

  console.log("Orders");
  console.log((await fx.orders()).orders);
  console.log("\n");

  console.log("Trades");
  console.log((await fx.trades()).trades);
  console.log("\n");

  console.log("Positions");
  console.log((await fx.positions()).positions);
  console.log("\n");
  
  console.log("Transactions");
  console.log(await fx.transactions());
  console.log("\n");

  console.log("Pricing");
  console.log(await fx.pricing({ instruments: "EUR_USD" }));
  console.log("\n");*/

  console.log("Candles");
  console.log((await fx.candles({ id: "EUR_USD" })).candles);
  console.log("\n");

  console.log("Close prices");
  fx.candles({ id: "EUR_USD" });
  const d = (await fx.candles({ id: "EUR_USD" })).candles;
  d.forEach((r) => {
    // console.log(r.mid.c);
  });
}

module.exports = {
  run: run,
  getAccountSummary: getAccountSummary,
  getTransactions: getTransactions,
};
