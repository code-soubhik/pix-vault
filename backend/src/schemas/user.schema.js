const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    }
})

const User = mongoose.model("user", userModel);

module.exports = User;