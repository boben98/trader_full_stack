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

module.exports = function (app) {
  const objRepo = {
    UserModel: User,
    OrderModel: Order,
    AccountModel: Account,
  };

  app.get("/transactions/:count", setHeaderMW(), getTransactionsMW(objRepo));

  app.get("/account", setHeaderMW(), getAccountMW(objRepo));

  app.get("/user", setHeaderMW(), getUserMW(objRepo));
};
