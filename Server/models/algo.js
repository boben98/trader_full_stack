const Schema = require("mongoose").Schema;
const db = require("../config/db");

const Algo = db.model("Algo", {
  instrument: {
    type: String,
    default: "EUR_USD"
  },
  granularity: {
    type: String,
    default: "M1"
  },
  stopLoss: {
    type: Number,
    default: 350
  },
  units: {
    type: Number,
    default: 1000000
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
  },
  MAperiod1: {
    type: Number,
    default: 15
  },
  MAperiod2: {
    type: Number,
    default: 30
  },
  activeTimeStart: {
    type: String,
    default: "0000-00-00T23:0:00.000000000Z"
  },
  activeTimeEnd: { //next day
    type: String,
    default: "0000-00-00T21:0:00.000000000Z"
  }
});

module.exports = Algo;
