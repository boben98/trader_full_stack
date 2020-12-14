var expect = require("chai").expect;
const setHeaderMW = require("../middlewares/setHeaderMW");

describe("Content-type", () => {
  it("should be application/json", (done) => {
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

    let res = {
      header: null,
      setHeader: (type, value) => {
        res.header = {
          [type]: value,
        };
      },
    };

    setHeaderMW({})(req, res, (err) => {
      expect(err).to.eql(undefined);
    });
    expect(res.header["Content-Type"]).to.eql("application/json");
    done();
  });
});
