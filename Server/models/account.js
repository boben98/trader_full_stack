const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Account = db.model("Account", {
  accountId: String,
  currency: String,
  balance: Number,
  equity: Number,
  marginAvailable: Number,
  marginUsed: Number,
  marginRate: Number,
  pl: Number,
  openPositionCount: Number,
});

module.exports = Account;
