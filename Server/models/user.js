const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const User = new Schema({
  name: String,
  email: String,
  phone: Number,
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

User.virtual("oanda_api_key")
  .set(function(oanda_api_key) {
    this._oanda_api_key = oanda_api_key;
    this.salt = this.makeSalt();
    this.hashed_oanda_api_key = this.encryptPassword(oanda_api_key);
  })
  .get(function() {
    return this._oanda_api_key;
  });

module.exports = mongoose.model("Client", User);
