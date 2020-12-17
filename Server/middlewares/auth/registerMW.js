const passport = require("passport");
const oanda = require("../../config/oanda");

module.exports = (objRepo) => {
  const User = objRepo.UserModel;
  const Account = objRepo.AccountModel;
  const Algo = objRepo.AlgoModel;

  return (req, res, next) => {
    if (
      typeof req.body.name === "undefined" ||
      typeof req.body.email === "undefined" ||
      typeof req.body.phone === "undefined" ||
      typeof req.body.oanda_api_key === "undefined" ||
      typeof req.body.accountId === "undefined" ||
      typeof req.body.password === "undefined"
    ) {
      return res.status(400).json({ message: "User parameters missing" });
    }

    let user = new User();

    user.name = req.body.name;
    user.username = req.body.email;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.oanda_api_key = req.body.oanda_api_key;

    let account = new Account();
    account.accountId = req.body.accountId;
    account.save((err) => {
      if (err) {
        console.log(err);
      }
    });
    user._account = account;

    let algo = new Algo();
    algo.save((err) => {
      if (err) {
        console.log(err);
      }
    });
    user._algo = algo;

    User.register(user, req.body.password, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "User registration failed", error: err });
      }

      oanda.update();
      passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) {
          return res.status(400).json({
            message: "User registration failed",
            error: err,
          });
        }
        if (!user) return res.json({ message: info });
        req.login(user, { session: false }, (err) => {
          if (err) {
            res.send(err);
          }
          return res.json({ user: user.username });
        });
      })(req, res);
    });
  };
};
