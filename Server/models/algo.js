const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Algo = db.model("Algo", {
  stopLoss: {
    type: Number,
    default: 350
  },
  lots: {
    type: Number,
    default: 1.0
  },
  trailValue: {
    type: Number,
    default: 475
  },
  trailWait: {
    type: Number,
    default: 475
  },
  makeOrderWaitLimit: {
    type: Number,
    default: 0.0007
  }
});

module.exports = Algo;
