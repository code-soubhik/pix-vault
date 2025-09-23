const mongoose = require("mongoose");

const imageModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    imageName: {
        type: String,
        require: true,
        default: Date.now()
    },
    imagePath: {
        type: String
    }
})

const Image = mongoose.model('image', imageModel);

module.exports = Image;