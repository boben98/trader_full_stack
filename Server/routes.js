const db = require("./config/db");
const User = require("./models/user");
const Account = require("./models/account");
const Order = require("./models/order");
const passport = require("passport");
const getUserMW = require("./middlewares/getUserMW");
const getAccountMW = require("./middlewares/getAccountMW");
const getTransactionsMW = require("./middlewares/getTransactionsMW");
const setHeaderMW = require("./middlewares/setHeaderMW");

let user = new User();

/*user.name = "Józsi";
user.email = "jozsi@jozsi.jozsi";
user.username = "jozsi@jozsi.jozsi";
user.phone = 36707070707;
user.oanda_api_key =
  "70af9ed822af837a698d8ebd2c5e4e51-d822a044a57f89238dbfeabaddce0f17";

User.register(user, "password", (err, a) => {
  if (err) {
    console.log(err);
  }

  user.save((err) => {
    if (err) {
      console.log(err);
    }
  });
});*/

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
