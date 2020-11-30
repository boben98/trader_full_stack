const oanda = require("../oanda/oanda");

module.exports = () => {
  return (req, res) => {
    /*Account.findOne().exec((err, result) => {
      if (err) return console.log(err);
      res.json(result);
    });*/
    oanda.getAccountSummary(req.user.username).then((value) => {
      res.json(value);
    });
  };
};
