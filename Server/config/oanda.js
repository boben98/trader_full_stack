const fx = require("simple-fxtrade");
const User = require("../models/user");
const Account = require("../models/account");
const Algo = require("../models/algo");
const SMA = require("technicalindicators").SMA;
const axios = require("axios");
const compareTimes = require("../timeHandler").compareTimes;
const granToSeconds = require("../timeHandler").granToSeconds;

let user = {};

async function addUsers() {
  await User.remove();
  let user = new User();

  user.name = "Józsi";
  user.email = "jozsi@jozsi.jozsi";
  user.username = "jozsi@jozsi.jozsi";
  user.phone = 36707070707;
  user.oanda_api_key =
    "5d982a2b544425e8783646142d4b2a83-53d7111b51f1dc94ee16084aa98c6692";

  let account1 = new Account();
  account1.accountId = "101-004-13865294-001";
  account1.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  user._account = account1;

  let algo1 = new Algo();
  algo1.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  user._algo = algo1;

  User.register(user, "password", (err, a) => {
    if (err) {
      console.log(err);
    }
  });

  let user2 = new User();

  user2.name = "Béla";
  user2.email = "bela@bela.bela";
  user2.username = "bela@bela.bela";
  user2.phone = 36707070707;
  user2.oanda_api_key =
    "ee4ca9f97ab6ae7b325b4f66969d3112-c362a4bf70223ac134ea55a54ce83a8d";

  let account2 = new Account();
  account2.accountId = "101-004-17150793-001";
  account2.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  user2._account = account2;

  let algo2 = new Algo();
  algo2.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  user2._algo = algo2;

  User.register(user2, "password2", (err, a) => {
    if (err) {
      console.log(err);
    }
  });
}

const balMuls = [0.6, 0.8, 1, 2, 3, 5, 7, 10];
const lotMuls = [0.25, 0.5, 0.7, 1, 1.5, 1.95, 2.34, 2.808, 3.3696];

async function fxConfig(username) {
  console.log("config: " + username);
  try {
    await fx.configure({ apiKey: user[username].oanda_api_key });
    await fx.setAccount(user[username].account.accountId);
  } catch (err) {
    console.log(err);
  }
}

async function updateUserArray() {
  await User.find()
    .populate("_account")
    .populate("_algo")
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
      });
    });
}

const run = async () => {
  //await addUsers();
  await User.find()
    .populate("_account")
    .populate("_algo")
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
  } catch (err) {
    console.log(err);
  }
}

async function getTransactions(size, username) {
  await fxConfig(username);
  let trans;
  try {
    trans = await fx.transactions();
  } catch (err) {
    console.log(err);
    return;
  }
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
        "Content-Type": "application/json",
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
  } catch (err) {
    console.log(err);
    return;
  }
  return parseFloat(summary.account.balance);
}

async function runAlgorithm() {
  const keys = Object.keys(user);
  keys.forEach(async (username) => {
    user[username].startBalance = await getBalance(username);
    user[username].startUnits = user[username].algo.units;
    //await testDataOptions(username);
    setInterval(
      onData,
      granToSeconds[user[username].algo.granularity] * 200,
      username
    );
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
  if (typeof username === "any") return;
  console.log("onData: " + username);
  if ((await isActiveTime(username)) === false) return;
  try {
    await setLots(username);
    const cross = await checkCross(username);
    await trade(cross, username);
  } catch (err) {
    console.log(err);
  }
}

async function setLots(username) {
  let balance;
  try {
    balance = await getBalance(username);
  } catch (err) {
    console.log(err);
    return;
  }

  for (let i = 0; i < 8; i++) {
    if (
      balance < user[username].startBalance * balMuls[i] &&
      user[username].algo.units > user[username].startUnits * lotMuls[i]
    )
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
      user[username].MA1 = SMA.calculate({
        period: user[username].algo.MAperiod1,
        values: user[username].candleValues,
      });
      user[username].MA2 = SMA.calculate({
        period: user[username].algo.MAperiod2,
        values: user[username].candleValues,
      });
    }
  }
}

async function checkCross(username) {
  await updateMAs(username);
  const len1 = user[username].MA1.length;
  const len2 = user[username].MA2.length;

  const diff = Math.abs(
    user[username].MA1[len1 - 1] - user[username].MA2[len2 - 1]
  );

  if (!user[username].makeOrder && diff > user[username].makeOrderWaitLimit)
    user[username].makeOrder = true;

  let ret = 0;

  if (
    user[username].MA1[len1 - 1] >= user[username].MA2[len2 - 1] &&
    user[username].MA1[len1 - 2] < user[username].MA2[len2 - 2]
  )
    ret = 1;
  else if (
    user[username].MA1[len1 - 1] <= user[username].MA2[len2 - 1] &&
    user[username].MA1[len1 - 2] > user[username].MA2[len2 - 2]
  )
    ret = -1;
  return ret;
}

async function trade(cross, username) {
  if (!user[username].makeOrder) return;
  if (cross === 0 || user[username].inTrade) return;
  setTimeout(() => {
    user[username].inTrade = false;
  }, granToSeconds[user[username].algo.granularity] * 10000);
  if (user[username].inTrade) return;
  user[username].inTrade = true;
  console.log("\t\t\t\tTRADE");
  const order = {
    order: {
      units: user[username].algo.units * cross,
      instrument: user[username].algo.instrument,
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT",
      trailingStopLossOnFill: { distance: user[username].algo.trailValue },
    },
  };
  await fxConfig(username);
  try {
    await fx.orders.create(order);
    user[username].makeOrder = false;
  } catch (err) {
    console.log(err);
  }
}

async function getCandles(username) {
  const url = `https://api-fxpractice.oanda.com/v3/accounts/${user[username].account.accountId}/instruments/${user[username].algo.instrument}/candles`;
  return await axios
    .get(url, {
      params: {
        count: 100,
        price: "B",
        granularity: user[username].algo.granularity,
      },
      headers: {
        "Content-Type": "application/json",
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
        updateMAs(username);
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

async function testDataOptions(username) {
  console.log("Summary");
  let a = (await fx.summary()).account;
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

  */
  await fxConfig(username);
  console.log("Candles");
  console.log((await fx.candles({ id: "EUR_USD" })).candles);
  console.log("\n");
  /*

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
  update: updateUserArray,
};
