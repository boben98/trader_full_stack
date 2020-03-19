const User = require("./models/user");
//const OrderModel = require("../models/order");
//const passport = require('passport');

module.exports = function(app) {
  app.get("/", (req, res) => {
    res.send("Hello world");
  });
};
