const mongoose = require("mongoose")
const validator = require("validator")
const repositorySchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true
    },
    title : {
        type : String,
        minlength: [3, 'title  must be at least 3 characters.'],
        maxlength: [24, 'title must be less than 24 characters.'],
        required: [true, 'title cannot be blank.']
    },
    description : {
        type : String,
        maxlength: [250, 'description must be less than 250 characters.'],
        required: [true, 'description cannot be blank.']
    },
    url : {
        type : String,
        required: [true, 'url cannot be blank.'],
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Url field must be a URL")
            } 
        }  
    }
})

const Repository = mongoose.model("Repository",repositorySchema)

module.exports = Repository