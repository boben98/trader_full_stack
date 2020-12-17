var expect = require("chai").expect;
const getAccountMW = require("../middlewares/getAccountMW");
const User = require("../models/user");
const Account = require("../models/account");
const oanda = require("../config/oanda");

describe("Return type", function () {
  this.timeout(10000);
  it("should be Account", async function () {
    let email = null;
    await User.findOne((err, user) => {
      email = user.email;
    });
    const req = {
      user: {
        username: email,
      },
    };

    let res = {
      json: (a) => {
        res.account = a;
      },
    };

    oanda.run();
    setTimeout(() => {
      getAccountMW()(req, res);
    }, 1000);

    setTimeout(() => {
      expect(res.account).to.be.instanceOf(Account);
    }, 2000);
  });

  it("should be Algo", async function () {
    let email = null;
    await User.findOne((err, user) => {
      email = user.email;
    });
    const req = {
      user: {
        username: email,
      },
    };

    let res = {
      json: (a) => {
        res.algo = a;
      },
    };

    oanda.run();
    setTimeout(() => {
      getAlgoMW()(req, res);
    }, 1000);

    setTimeout(() => {
      expect(res.algo).to.be.instanceOf(Algo);
    }, 2000);
  });

  it("should be an array of transactions", async function () {
    let email = null;
    await User.findOne((err, user) => {
      email = user.email;
    });
    const req = {
      user: {
        username: email,
      },
      params: {
        count: 15,
      },
    };

    let res = {
      json: (a) => {
        res.transactions = a;
      },
    };

    oanda.run();
    setTimeout(() => {
      getTransactionsMW()(req, res);
    }, 1000);

    setTimeout(() => {
      expect(res.transactions).to.have.lengthOf(15);
      expect(res.transactions[0]).to.have.all.keys([
        "id",
        "instrument",
        "time",
        "units",
        "pl",
      ]);
    }, 2000);
  });
});
