const backtest = require("../backtest");

module.exports = () => {
  return (req, res) => {
    let params = req.body;
    if (
      typeof params.balance === "undefined" ||
      typeof params.instrument === "undefined" ||
      typeof params.granularity === "undefined" ||
      typeof params.units === "undefined" ||
      typeof params.MAperiod1 === "undefined" ||
      typeof params.MAperiod2 === "undefined" ||
      typeof params.marginRatio === "undefined" ||
      typeof params.trailValue === "undefined" ||
      typeof params.trailWait === "undefined" ||
      typeof params.from === "undefined" ||
      typeof params.to === "undefined"
    )
      return res.status(400).json({ message: "Backtest parameter(s) missing" });

    let algo = {
      instrument: params.instrument,
      granularity: params.granularity,
      units: parseFloat(params.units),
      MAperiod1: parseInt(params.MAperiod1),
      MAperiod2: parseInt(params.MAperiod2),
      marginRatio: parseFloat(params.marginRatio),
      trailValue: parseFloat(params.trailValue),
      trailWait: parseFloat(params.trailWait),
    };

    let timeframe = {
      from: new Date(params.from),
      to: new Date(params.to),
    };

    backtest.run(parseInt(params.balance), algo, timeframe).then((value) => {
      res.json(value);
    });
  };
};
