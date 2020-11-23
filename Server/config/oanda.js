const fx = require("simple-fxtrade");
const User = require("../models/user");
const Order = require("../models/order");
const Account = require("../models/account");
const Algo = require("../models/algo");
const SMA = require("technicalindicators").SMA;
const axios = require("axios");

let user = {};

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

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

function setIntervalX(cb, delay, rep) {
    var x = 0;
    var i = setInterval(() => {
       cb();
       if (++x === rep) {
           clearInterval(i);
       }
    }, delay);
}

function createInterval(cb, param, interval) { setInterval(function() { cb(param); }, interval); }

async function fxConfig(username){
  console.log("config: " + username);
  try {
    await fx.configure({ apiKey: user[username].oanda_api_key });
    await fx.setAccount(user[username].account.accountId);
  } catch (err) { console.log(err); }
  
  //const account = (await fx.summary()).account;
  //console.log(account);
  //testDataOptions();
}

const run = async () => {
  await User.find()
    .populate('_account')
    .populate('_algo')
    .exec(async (err, result) => {
    if (err) return console.log(err);
    await result.forEach(async (u) => {
      let un = u.username;
      user[un] = u;
      user[un].inTrade = false;
      user[un].MA1 = [];
      user[un].MA2 = [];
      user[un].candleValues = [];
      user[un].account = u._account;
      user[un].algo = u._algo;
      
      //await setAccountID();
      //await testDataOptions();
      //await testTrading();
    });   
    await runAlgorithm();
  });
};

async function getAccountSummary(username) {
  await fxConfig(username);
  console.log("summary");
  let account;
  try {
    account = (await fx.summary()).account;
    return Account(account);
  } catch (err) { console.log(err); }
  
}

async function getTransactions(size, username) {
  await fxConfig(username);
  let trans;
  try {
    trans = await fx.transactions();
  } catch(err) { console.log(err); return; }
  let lastID = trans.lastTransactionID;
  let firstID = lastID - 6 * size + 1;
  if (firstID < 1) firstID = 1;
  const url = `https://api-fxpractice.oanda.com/v3/accounts/${user[username].account.accountId}/transactions/idrange`;
  return await axios
    .get(url, {
      params: {
        from: firstID,
        to: lastID,
      },
      headers: {
        contenttype: "application/json",
        Authorization: `Bearer ${user[username].oanda_api_key}`,
      },
    })
    .then(async (response) => {
      let filtered = response.data.transactions.filter(
        (t) => t.type === "ORDER_FILL" && t.pl !== "0.0000"
      );
      let length = filtered.length;
      if (length > size) filtered.splice(0, length - size);
      return filtered;
    })
    .catch(console.log);
}

async function getBalance(username) {
  await fxConfig(username);
  console.log("balance: " + username);
  let summary;
  try {
    summary = await fx.summary();
  } catch (err) { console.log(err); return; }
  return parseFloat(summary.account.balance);
}

async function runAlgorithm() {  
  const keys = Object.keys(user);
  keys.forEach(async (username) => {
    user[username].startBalance = await getBalance(username);
    user[username].startUnits = user[username].algo.units;
    setInterval(onData, granToSeconds[user[username].algo.granularity] * 200, username);
    //createInterval(onData, username, granToSeconds[user[username].algo.granularity] * 200)
  });
}

async function isActiveTime(username) {
  let now = new Date().toISOString();
  let end = user[username].algo.activeTimeEnd; //"0000-00-00T21:0:00.000000000Z";
  let start = user[username].algo.activeTimeStart; //"0000-00-00T23:0:00.000000000Z";

  let bool1 = await compareTimes(now, end);
  let bool2 = await compareTimes(start, now);
  return bool1 || bool2;
}

async function onData(username) {
  if (typeof(username) === "any") return;
  console.log("onData: " + username);
  //if ((await isActiveTime(username)) === false) return;
  try {
    await setLots(username);
    await updateMAs(username);
    const cross = await checkCross(username);
    await trade(cross, username);
  } catch (err) { console.log(err); }  
}

async function setLots(username) {
  let balance;
  try {
    balance = await getBalance(username);
  } catch (err) { console.log(err); return; }

  for (let i = 0; i < 8; i++) {
    if (balance < user[username].startBalance * balMuls[i] && user[username].algo.units > user[username].startUnits * lotMuls[i])
      user[username].algo.units = user[username].startUnits * lotMuls[i];
  }

  for (let i = 0; i < 8; i++) {
    if (
      balance >= user[username].startBalance * balMuls[i] &&
      user[username].algo.units < user[username].startUnits * lotMuls[i + 1]
    )
      user[username].algo.units = user[username].startUnits * lotMuls[i + 1];
  }
}

async function updateMAs(username) {
  const len = user[username].candleValues.length;
  const time = new Date().toISOString();
  const next = await compareTimes(
    user[username].lastCloseTime,
    time,
    granToSeconds[user[username].algo.granularity]
  );
  if (len < 30 || next) {
    const active = await getCandles(username);
    if (active) {
      user[username].MA1 = SMA.calculate({ period: user[username].algo.MAperiod1, values: user[username].candleValues });
      user[username].MA2 = SMA.calculate({ period: user[username].algo.MAperiod2, values: user[username].candleValues });
    }
  }
}

async function checkCross(username) {
  const len1 = user[username].MA1.length;
  const len2 = user[username].MA2.length;

  let ret = 0;

  if (user[username].MA1[len1 - 1] >= user[username].MA2[len2 - 1] && user[username].MA1[len1 - 2] < user[username].MA2[len2 - 2])
    ret = 1;
  else if (
    user[username].MA1[len1 - 1] <= user[username].MA2[len2 - 1] &&
    user[username].MA1[len1 - 2] > user[username].MA2[len2 - 2]
  )
    ret = -1;
  return ret;
}

async function trade(cross, username) {
  if (cross === 0 || user[username].inTrade) return;
  setTimeout(() => {
    user[username].inTrade = false;
  }, granToSeconds[user[username].algo.granularity] * 10000);
  user[username].inTrade = true;
  console.log("\t\t\t\tTRADE");
  const order = {
    order: {
      units: units * cross,
      instrument: user[username].instrument,
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT",
      trailingStopLossOnFill: { distance: 0.0005 },
    },
  };
  await fxConfig(username);
  try {
    await fx.orders.create(order);
  } catch (err) {
    console.log(err);
  }
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

async function timeToSeconds(time) {
  let time1 = time.substring(11, 19);
  return (
    parseInt(time1.substring(0, 2)) * 3600 +
    parseInt(time1.substring(3, 5)) * 60 +
    parseInt(time1.substring(6))
  );
}

async function getCandles(username) {
  const url =
    `https://api-fxpractice.oanda.com/v3/accounts/${user[username].account.accountId}/instruments/${user[username].algo.instrument}/candles`;
  return await axios
    .get(url, {
      params: {
        count: 100,
        price: "B",
        granularity: user[username].algo.granularity,
      },
      headers: {
        contenttype: "application/json",
        Authorization: `Bearer ${user[username].oanda_api_key}`,
      },
    })
    .then(async (response) => {
      const len = response.data.candles.length;
      const nextCloseTime = response.data.candles[len - 1].time;
      const next = await compareTimes(
        user[username].lastCloseTime,
        nextCloseTime,
        granToSeconds[user[username].algo.granularity]
      );
      if (!next) {
        //await getCandles();
        return false;
      }
      for (let i = 0; i < len; i++) {
        const close = parseFloat(response.data.candles[i].bid.c);
        user[username].candleValues[i] = close;
      }
      user[username].lastCloseTime = nextCloseTime;
      console.log(user[username].lastCloseTime, "\n");
      return true;
    })
    .catch(console.log);
}

async function testDataOptions() {
  console.log("Summary");
  let a = (await fx.summary()).account
  console.log(a);
  console.log("\n");
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
  console.log("\n");

  console.log("Candles");
  console.log((await fx.candles({ id: "EUR_USD" })).candles);
  console.log("\n");

  console.log("Close prices");
  fx.candles({ id: "EUR_USD" });
  const d = (await fx.candles({ id: "EUR_USD" })).candles;
  d.forEach((r) => {
    // console.log(r.mid.c);
  });*/
}

module.exports = {
  run: run,
  getAccountSummary: getAccountSummary,
  getTransactions: getTransactions,
};
