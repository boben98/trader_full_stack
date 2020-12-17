const mongoose = require("mongoose");
mongoose.connect("mongodb://mongodb:27017/trader", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
module.exports = mongoose;
