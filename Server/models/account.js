const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Account = db.model("Account", {
  currency: String,
  balance: Number,
  equity: Number,
  margin: Number,
  free_margin: Number,
  margin_level: Number,
  _orders: {
    type: [Schema.Types.ObjectId],
    ref: "Order"
  },
  _user: {
    type: [Schema.Types.ObjectId],
    ref: "User"
  }
});

module.exports = Account;
