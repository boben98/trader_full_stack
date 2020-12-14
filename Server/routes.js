const db = require("./config/db");
const User = require("./models/user");
const Account = require("./models/account");
const Algo = require("./models/algo");
const passport = require("passport");
const getUserMW = require("./middlewares/getUserMW");
const updateUserMW = require("./middlewares/updateUserMW");
const getAccountMW = require("./middlewares/getAccountMW");
const getAlgoMW = require("./middlewares/getAlgoMW");
const updateAlgoMW = require("./middlewares/updateAlgoMW");
const getTransactionsMW = require("./middlewares/getTransactionsMW");
const setHeaderMW = require("./middlewares/setHeaderMW");
const registerMW = require("./middlewares/auth/registerMW");
const loginMW = require("./middlewares/auth/loginMW");
const logoutMW = require("./middlewares/auth/logoutMW");
const sendEmailMW = require("./middlewares/auth/sendEmailMW");
const setPasswordMW = require("./middlewares/setPasswordMW");
const backtestMW = require("./middlewares/backtestMW");

module.exports = function (app) {
  const objRepo = {
    UserModel: User,
    AlgoModel: Algo,
    AccountModel: Account,
  };

  const authMW = passport.authenticate("jwt", { session: false });
  const log = (req, res, next) => {
    console.log(req);
    next();
  };

  app.get("/transactions/:count", authMW, setHeaderMW(), getTransactionsMW());
  app.get("/account", log, authMW, setHeaderMW(), getAccountMW());
  app.get("/algo", authMW, setHeaderMW(), getAlgoMW());
  app.post("/algo/save", authMW, setHeaderMW(), updateAlgoMW(objRepo));
  app.get("/user", authMW, setHeaderMW(), getUserMW());
  app.post("/user/save", authMW, setHeaderMW(), updateUserMW(objRepo));
  app.use("/backtest", authMW, backtestMW());

  app.use("/login", loginMW());
  //app.get("/logout", authMW, logoutMW());
  app.use("/register", registerMW(objRepo));
  /*app.use(
    "/forgotten",
    sendEmailMW(),
    setPasswordMW(objRepo),
    updateUserMW(objRepo)
  );*/
};
