const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongo_uri = process.env.MONGO_URI;
    await mongoose.connect(mongo_uri);
  } catch (error) {
    console.error("[connectDB]:" + error);
  }
};

module.exports = connectDB;