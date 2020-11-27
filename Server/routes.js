const db = require("./config/db");
const User = require("./models/user");
const Account = require("./models/account");
const Order = require("./models/order");
const Algo = require("./models/algo");
const passport = require("passport");
const getUserMW = require("./middlewares/getUserMW");
const getAccountMW = require("./middlewares/getAccountMW");
const getTransactionsMW = require("./middlewares/getTransactionsMW");
const setHeaderMW = require("./middlewares/setHeaderMW");
const authMW = require("./middlewares/auth/authMW");
const registerMW = require("./middlewares/auth/registerMW");
const loginMW = require("./middlewares/auth/loginMW");
const logoutMW = require("./middlewares/auth/logoutMW");
const sendEmailMW = require("./middlewares/auth/sendEmailMW");
const setPasswordMW = require("./middlewares/setPasswordMW");
const updateUserDataMW = require("./middlewares/updateUserDataMW");

module.exports = function (app) {
  const objRepo = {
    UserModel: User,
    OrderModel: Order,
    AccountModel: Account,
  };

  app.get(
    "/transactions/:count",
    authMW(objRepo),
    setHeaderMW(),
    getTransactionsMW(objRepo)
  );
  app.get("/account", authMW(objRepo), setHeaderMW(), getAccountMW(objRepo));
  app.get("/user", authMW(objRepo), setHeaderMW(), getUserMW(objRepo));

  app.post("/login", loginMW(objRepo));
  app.get("/logout", authMW(objRepo), logoutMW());
  app.post("/register", registerMW(objRepo));
  app.post(
    "/forgotten",
    sendEmailMW(),
    setPasswordMW(objRepo),
    updateUserDataMW(objRepo)
  );
};
