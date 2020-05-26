const oanda = require("../config/oanda");

module.exports = (objRepo) => {
  return (req, res) => {
    /*Account.findOne().exec((err, result) => {
      if (err) return console.log(err);
      res.json(result);
    });*/
    oanda.getAccountSummary().then((value) => {
      res.json(value);
    });
  };
};
