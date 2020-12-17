const oanda = require("../config/oanda");

module.exports = () => {
  return (req, res) => {
    console.log(req);
    oanda.getTransactions(req.params.count, req.user.username).then((value) => {
      return res.json(value);
    });
  };
};
