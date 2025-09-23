const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongo_uri = process.env.MONGO_URI;
    await mongoose.connect(mongo_uri);
    console.log("DB successfully connected");
  } catch (error) {
    console.error("[connectDB]:" + error);
    process.exit(1);
  }
};

module.exports = connectDB;