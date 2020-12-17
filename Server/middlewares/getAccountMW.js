const oanda = require("../config/oanda");

module.exports = () => {
  return (req, res) => {
    console.log(req);
    oanda.getAccountSummary(req.user.username).then((value) => {
      return res.json(value);
    });
  };
};
