const fx = require("simple-fxtrade");
const User = require("../models/user");
const Order = require("../models/order");
const Account = require("../models/account");
const Algo = require("../models/algo");
const SMA = require("technicalindicators").SMA;
const axios = require("axios");

let api_key;

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
      return a.accounts[0].id;
    })
    .then(async (id) => {
      fx.setAccount(id);
    })
    .catch(console.log);
}

const algo = new Algo();
let MAs = [];
let lastMAs = [];
let MA15 = [];
let MA30 = [];
let candleValues = [];
let candleValues0 = [];
let makeOrder = false;
let makeOrderWaitLimit = 0.0007;
let lastTicket;
const startBalance = 100000;
const startLots = 1;
const granularity = "M1";

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

async function runAlgorithm() {
  /*await User.findOne().exec((err, result) => {
    if (err) return console.log(err);
    startBalance = r._account.balance;
  });*/
  const stream = await fx.pricing.stream({ instruments: "EUR_USD" });

  // Handle some data
  stream.on("data", async (data) => {
    await onData(data);
  });
}

async function onData(data) {
  if (data.type === "PRICE") {
    //console.log(data);
    await setLots();
    await updateMAs(data);
    const cross = await checkCross();
  }
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
  time1 = time.substring(11, 19);
  return (
    parseInt(time1.substring(0, 2)) * 3600 +
    parseInt(time1.substring(3, 5)) * 60 +
    parseInt(time1.substring(6))
  );
}

async function roundDown(num, modulus) {
  return Math.floor(num / modulus) * modulus;
}

async function compareTimes(timeEarly, timeLater, difference) {
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
  return time1_seconds + difference < time2_seconds;
}

let lastCloseTime;

async function getCandles() {
  console.log("getCandles start");
  const url =
    "https://api-fxpractice.oanda.com/v3/accounts/101-004-13865294-001/instruments/EUR_USD/candles";
  return await axios
    .get(url, {
      params: {
        count: 30,
        price: "B",
        granularity: "S15",
      },
      headers: {
        contenttype: "application/json",
        Authorization:
          "Bearer 70af9ed822af837a698d8ebd2c5e4e51-d822a044a57f89238dbfeabaddce0f17",
      },
    })
    .then(async (response) => {
      /*if (candleValues.length > 100) candleValues.shift;
      const closeTime = response.data.candles[0].time;
      const next = await compareTimes(
        lastCloseTime,
        closeTime,
        granToSeconds.S5
      );
      if (candleValues.length === 0 || true) {
        let close = [];
        parseFloat(response.data.candles[0].bid.c);
        candleValues.push({
          close: close,
          time: closeTime,
        });
        candleValues0.push(close);
        lastCloseTime = closeTime;
        console.log(candleValues);
      }*/

      /*const firstCloseTime = response.data.candles[0].time;
      const next = await compareTimes(
        lastCloseTime,
        firstCloseTime,
        granToSeconds.M1
      );
      if (candleValues.length < 100 || next) {*/
      for (let i = 0; i < response.data.candles.length; i++) {
        lastCloseTime = response.data.candles[i].time;
        const close = parseFloat(response.data.candles[i].bid.c);
        candleValues[i] = {
          close: close,
          time: lastCloseTime,
        };
        candleValues0[i] = close;
      }
      //lastCloseTime = firstCloseTime;
      console.log(lastCloseTime);
      console.log(MA15);
      console.log("getCandles end");
      //}
    });
}

async function updateMAs(data) {
  const len = candleValues0.length;
  const time = new Date().toISOString();
  const next = await compareTimes(lastCloseTime, time, granToSeconds.S15);
  if (len < 30 || next) {
    console.log("call getCandles");
    await getCandles().then(() => {
      console.log("getCandles return");
      MA15 = SMA.calculate({ period: 15, values: candleValues0 });
      MA30 = SMA.calculate({ period: 30, values: candleValues0 });
      console.log(
        "time:\t\t\t\t" + time + "\ndata.time:\t\t\t" + data.time + "\n"
      );
    });
  }
}

async function checkCross() {
  let a = MAs[1] - MAs[0];
  if (a < 0) a = a * -1;

  if (!makeOrder && a > makeOrderWaitLimit) makeOrder = true;

  let ret = 0;

  if (lastMAs[0] < lastMAs[1] && MAs[0] > MAs[1]) {
    ret = 1;
  } else if (lastMAs[0] > lastMAs[1] && MAs[0] < MAs[1]) {
    ret = -1;
  }

  return ret;
}

async function setLots() {}

async function testTrading() {
  try {
    await fx.orders.create({
      order: {
        units: 1000000,
        instrument: "EUR_USD",
        timeInForce: "FOK",
        type: "MARKET",
        positionFill: "DEFAULT",
        trailingStopLossOnFill: { distance: 0.0005 },
      },
    });
  } catch (err) {
    console.log(err);
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
    //console.log(r.mid.c);
  });
}

run();
