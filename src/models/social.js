const mongoose = require("mongoose")
const validator = require("validator")

const socialSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true,
        unique : true,
    },
    youtube : {
        type : String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Youtube field must be a URL")
            } 
        }  
    },
    instagram : {
        type : String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Instagram field must be a URL")
            } 
        }  
    },
    twitter : {
        type : String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Twitter field must be a URL")
            } 
        }  
    },
    facebook : {
        type : String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Facebook field must be a URL")
            } 
        }  
    },
    linkedin : {
        type : String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("LinkedIn field must be a URL")
            } 
        }  
    },
})

const Social = mongoose.model("Social",socialSchema)

module.exports = Social
