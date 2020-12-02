const oanda = require("../config/oanda");

module.exports = () => {
  return (req, res) => {
    /*Account.findOne().exec((err, result) => {
      if (err) return console.log(err);
      res.json(result);
    });*/
    oanda.getAccountSummary(res.locals.user.username).then((value) => {
      res.json(value);
    });
  };
};
