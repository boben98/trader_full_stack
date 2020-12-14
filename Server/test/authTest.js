var expect = require("chai").expect;
const loginMW = require("../middleware/auth/loginMW");
const registerMW = require("../middleware/auth/registerMW");

describe("login middleware ", () => {
  it("should return a token", (done) => {
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
});
