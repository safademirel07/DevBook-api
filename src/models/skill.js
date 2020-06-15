const mongoose = require("mongoose")
const validator = require("validator")

const skillSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true
    },
    skillName : {
        type : String,
        minlength: [3, 'skillName  must be at least 3 characters.'],
        maxlength: [24, 'skillName must be less than 24 characters.'],
        required: [true, 'skillName cannot be blank.']
    },
})

const Skill = mongoose.model("Skill",skillSchema)

module.exports = Skill