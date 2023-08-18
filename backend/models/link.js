const mongoose = require("mongoose")
const Schema = mongoose.Schema

const linkSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    shortId: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    shortLink: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

module.exports = mongoose.model("Link", linkSchema)