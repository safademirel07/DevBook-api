const mongoose = require("mongoose")
const number = require("mongoose/lib/cast/number")
const hashtagSchema = new mongoose.Schema({
    hashtag : {
        type : String,
        minlength: [1, 'hashtag  must be at least 3 characters.'],
        maxlength: [24, 'hashtag must be less than 24 characters.'],
        required: [true, 'hashtag cannot be blank.'],
        text : true,
    },
    value : {
        type : Number,
        default : 1,
    }
})

const Hashtag = mongoose.model("Hashtag",hashtagSchema)

module.exports = Hashtag