var expect = require("chai").expect;
const backtest = require("../backtest");

describe("Return absolute value", function () {
  this.timeout(10000);
  it("should be less than starting balance", function (done) {
    const algo = {
      instrument: "EUR_USD",
      granularity: "H1",
      units: 1000000,
      MAperiod1: 15,
      MAperiod2: 30,
      marginRatio: 30,
      trailValue: 0.0005,
      trailWait: 0,
      makeOrderWaitLimit: 0.0007,
    };

    const timeframe = {
      from: new Date("2018-07-01"),
      to: new Date("2019-08-01"),
    };

    const balance = 100000;

    backtest.run(balance, algo, timeframe).then((ret) => {
      expect(Math.abs(ret.profit)).to.be.within(0, balance);
      done();
    });
  });
});
