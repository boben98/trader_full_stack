const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/trader", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
module.exports = mongoose;
