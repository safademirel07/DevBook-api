const mongoose = require("mongoose")
const dateFormat = require('dateformat');

const messagingSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },

    peer_profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    pair_id: {
        type: String,
    },
    last_message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})


const Messaging = mongoose.model("Messaging", messagingSchema)
module.exports = Messaging
