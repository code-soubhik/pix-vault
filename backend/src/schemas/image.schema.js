const mongoose = require("mongoose")

const imageModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    name: {
      type: String,
      trim: true
    },

    type: {
      type: String,
      enum: ["folder", "image", "root"],
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      default: null,   // null = root
    },

    path: {
      type: String,
      required: true,  // e.g. "/Photos/2025/Trip"
    },

    // Only for images
    mimetype: {
      type: String,
    },
    size: {
      type: Number,   // file size in bytes
    },
  },
  { timestamps: true }
);

// 📌 Indexes for faster queries
imageModel.index({ userId: 1, name: 1 });      // search by name
imageModel.index({ userId: 1, path: 1 });      // search by folder path
imageModel.index({ parentId: 1 });             // get folder contents quickly

const Image = mongoose.model("image", imageModel);

module.exports = Image;