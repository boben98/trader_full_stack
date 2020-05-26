const oanda = require("../config/oanda");

module.exports = (objRepo) => {
  return (req, res) => {
    /*Order.find().exec((err, result) => {
      if (err) return console.log(err);
      res.json(result);
    });*/
    oanda.getTransactions(req.params.count).then((value) => {
      res.json(value);
    });
  };
};
