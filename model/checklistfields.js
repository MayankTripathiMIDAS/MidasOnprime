const mongoose = require("mongoose");
const fields = require("./fields");

const listitems = new mongoose.Schema({
  title: String,
  items: [fields],
});

module.exports = listitems;
