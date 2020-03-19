const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Order = db.model("Order", {
  symbol: String,
  ticket: Number,
  time: {
    type: Date,
    default: Date.now()
  },
  type: {
    type: String,
    enum: ["BUY", "SELL"]
  },
  quantity: Number,
  open_price: Number,
  close_price: Number,
  stop_loss: {
    type: Number,
    default: 0
  },
  take_profit: {
    type: Number,
    default: 0
  },
  lots: Number,
  profit: Number
});

module.exports = Order;
