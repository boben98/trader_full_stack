var expect = require("chai").expect;
const setHeaderMW = require("../middlewares/setHeaderMW");

describe("Content-type", function () {
  it("should be application/json", function (done) {
    const req = {};

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
