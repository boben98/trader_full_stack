const oanda = require("../oanda/oanda");

module.exports = () => {
  return (req, res) => {
    /*Order.find().exec((err, result) => {
      if (err) return console.log(err);
      res.json(result);
    });*/
    oanda.getTransactions(req.params.count, req.user.username).then((value) => {
      res.json(value);
    });
  };
};
