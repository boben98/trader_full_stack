const fx = require("simple-fxtrade");
const User = require("../models/user");
const Order = require("../models/order");
const Account = require("../models/account");

const run = async () => {
  await User.find().exec(async (err, result) => {
    //console.log(err);
    await result.forEach(async r => {
      const api_key = r.oanda_api_key;
      fx.configure({ apiKey: api_key });
      await setAccountID();
      //await testDataOptions();
      await testTrading();
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
}

run();
