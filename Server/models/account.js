const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Order = db.model("Order", {
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

module.exports = Order;
