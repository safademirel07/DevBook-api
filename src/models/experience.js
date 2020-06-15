const mongoose = require("mongoose")
const dateFormat = require('dateformat');

const experienceSchema = mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true
    },
    title: {
        type: String,
        minlength: [3, 'title  must be at least 3 characters.'],
        maxlength: [24, 'title must be less than 24 characters.'],
        required: [true, 'title cannot be blank.'],
    },
    companyName: {
        type: String,
        minlength: [3, 'companyName must be at least 3 characters.'],
        maxlength: [24, 'companyName must be less than 24 characters.'],
        required: [true, 'companyName cannot be blank.'],
    },
    location: {
        type: String,
        minlength: [3, 'location must be at least 3 characters.'],
        maxlength: [24, 'location must be less than 24 characters.'],
    },
    from: {
        type: Date,
        required: [true, 'from cannot be blank.']
    },
    to: {
        type: Date
    },
    current: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        maxlength: [120, 'description must be less than 120 characters.'],
    }
})

experienceSchema.methods.toJSON = function () {
    const experience = this
    const experienceObject = experience.toObject()
    
    delete experienceObject.__v

    experienceObject.from= dateFormat(experienceObject.from,"dd.mm.yyyy")

    if (experienceObject.current == true) {
        delete experienceObject.to
    } else {
        experienceObject.to= dateFormat(experienceObject.to,"dd.mm.yyyy")
    }
  
    return experienceObject 
}

const Experience = mongoose.model("Experience", experienceSchema)


module.exports = Experience