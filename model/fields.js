const mongoose = require("mongoose");

const fields = new mongoose.Schema({
  name: String,
  value1: String,
  value2: String,
  value3: String,
  value4: String,
});
module.exports = fields;
