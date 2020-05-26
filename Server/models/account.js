const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Account = db.model("Account", {
  currency: String,
  balance: Number,
  equity: Number,
  marginAvailable: Number,
  marginUsed: Number,
  marginRate: Number,
  pl: Number,
  openPositionCount: Number,
  _orders: {
    type: [Schema.Types.ObjectId],
    ref: "Order",
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Account;
