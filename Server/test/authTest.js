/*var expect = require("chai").expect;
const loginMW = require("../middlewares/auth/loginMW");
const registerMW = require("../middlewares/auth/registerMW");
const User = require("../models/user");
const Account = require("../models/account");
const Algo = require("../models/algo");

describe("login middleware ", function () {
  it("should return a token", function (done) {
    const objRepo = {
      UserModel: User,
      AlgoModel: Algo,
      AccountModel: Account,
    };
    const req = {
      login: (a, b, cb) => {
        cb("noterr");
      },
      body: {
        name: "asdas",
        email: "asdasd",
        phone: 2321312,
        oanda_api_key: "dfasdasdasdddasdfas",
        accountId: "asdsadasd",
        password: "pass",
      },
    };

    const res = {
      json: (a) => {
        return a;
      },
    };

    expect(loginMW({})(req, res)).to.be.instanceof(String);
    done();
  });
});*/
