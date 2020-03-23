const fx = require("simple-fxtrade");
const User = require("../models/user");
const Order = require("../models/order");
const Account = require("../models/account");
const Algo = require("../models/algo");
const SMA = require("technicalindicators").SMA;

const run = async () => {
  await User.find().exec(async (err, result) => {
    if (err) return console.log(err);
    await result.forEach(async r => {
      const api_key = r.oanda_api_key;
      fx.configure({ apiKey: api_key });
      await setAccountID();
      //await testDataOptions();
      //await testTrading();
      await runAlgorithm();
    });
  });
};

async function setAccountID() {
  await fx
    .accounts()
    .then(a => {
      return a.accounts[0].id;
    })
    .then(async id => {
      fx.setAccount(id);
    })
    .catch(console.log);
}

const algo = new Algo();
let MAs = [];
let lastMAs = [];
let makeOrder = false;
let makeOrderWaitLimit = 0.0007;
let lastTicket;
const startBalance = 100000;
const startLots = 1;

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

async function runAlgorithm() {
  /*await User.findOne().exec((err, result) => {
    if (err) return console.log(err);
    startBalance = r._account.balance;
  });*/
  const stream = await fx.pricing.stream({ instruments: "EUR_USD" });

  // Handle some data
  stream.on("data", data => {
    onData(data);
  });
}

async function onData(data) {
  if (data.type === "PRICE") {
    setLots();
    let ticket = 0;
    updateMAs();
    const cross = checkCross();
  }
}

async function trailingStop(ticket) {}

async function updateMAs() {}

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
        units: 1,
        instrument: "EUR_USD",
        timeInForce: "FOK",
        type: "MARKET",
        positionFill: "DEFAULT",
        tradeId: 6368
      }
    });
  } catch (err) {
    console.log(err);
  }
}

async function testDataOptions() {
  console.log("Summary");
  console.log((await fx.summary()).account);
  console.log("\n");

  /*console.log("Instruments");
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
  console.log(await fx.pricing({ instruments: "EUR_USD" }));*/
}

run();
