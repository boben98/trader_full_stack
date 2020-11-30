const backtest = require("../backtest");

module.exports = () => {
  return (req, res) => {
    if (
      typeof req.body.testparams.account === "undefined" ||
      typeof req.body.testparams.algo === "undefined" ||
      typeof req.body.testparams.timeframe === "undefined"
    )
      return res.status(400).json({ message: "Backtest parameters missing" });

    backtest.runBacktest(req.body.testparams).then((value) => {
      res.json(value);
    });
  };
};
