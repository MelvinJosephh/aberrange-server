const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  permalink: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "published", "private"], default: "draft" },
  featuredImage: { type: Buffer }, // Storing as Buffer for image data
  author: {
    name: { type: String, required: true },
    profileImage: { type: Buffer } // Storing as Buffer for image data
  },
  publishDate: { type: Date, default: Date.now },
  readTime: { type: Number }, // estimated read time in minutes
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  excerpt: { type: String, maxLength: 200 },
  comments: [
    {
      user: { type: String },
      message: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
},
{ timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);
