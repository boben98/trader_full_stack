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

/*let user = new User();

user.name = "Józsi";
user.email = "jozsi@jozsi.jozsi";
user.username = "jozsi@jozsi.jozsi";
user.phone = 36707070707;
user.oanda_api_key =
  "70af9ed822af837a698d8ebd2c5e4e51-d822a044a57f89238dbfeabaddce0f17";

let account1 = new Account();
account1.accountId = "101-004-13865294-001";
account1.save((err) => {
    if (err) {
      console.log(err);
    }
  });
user._account = account1;

let algo1 = new Algo();
algo1.save((err) => {
    if (err) {
      console.log(err);
    }
  });
user._algo = algo1;

User.register(user, "password", (err, a) => {
  if (err) {
    console.log(err);
  }

  user.save((err2) => {
    if (err2) {
      console.log(err2);
    }
  });
});

let user2 = new User();

user2.name = "Béla";
user2.email = "bela@bela.bela";
user2.username = "bela@bela.bela";
user2.phone = 36707070707;
user2.oanda_api_key =
  "ee4ca9f97ab6ae7b325b4f66969d3112-c362a4bf70223ac134ea55a54ce83a8d";

let account2 = new Account();
account2.accountId = "101-004-17150793-001";
account2.save((err) => {
    if (err) {
      console.log(err);
    }
  });
user2._account = account2;

let algo2 = new Algo();
algo2.save((err) => {
    if (err) {
      console.log(err);
    }
  });
user2._algo = algo2;

User.register(user2, "password2", (err, a) => {
  if (err) {
    console.log(err);
  }

  user2.save((err2) => {
    if (err2) {
      console.log(err2);
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
