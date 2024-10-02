const mongoose = require("mongoose");

const SeoSchema = new mongoose.Schema({
  siteId: Number,
  title: String,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  url: String,
  status: String,
  content: String,
});

const Seo = new mongoose.model("SeoPages", SeoSchema);
module.exports = Seo;
