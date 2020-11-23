const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const User = new Schema({
  name: String,
  email: String,
  phone: Number,
  oanda_api_key: String,
  _algo: {
    type: Schema.Types.ObjectId,
    ref: "Algo"
  },
  _account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  }
});

User.plugin(passportLocalMongoose);

User.virtual("password")
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

module.exports = mongoose.model("User", User);
