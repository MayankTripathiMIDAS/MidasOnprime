const mongoose = require("mongoose");

const BlogsSchema = new mongoose.Schema(
  {
    siteId: Number,
    title: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    url: String,
    status: String,
    content: String,
  },
  { timestamps: true }
);

const Blogs = new mongoose.model("Blogs", BlogsSchema);
module.exports = Blogs;
