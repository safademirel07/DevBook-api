const mongoose = require("mongoose")
const dateFormat = require('dateformat');

const educationSchema = mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true
    },
    schoolName: {
        type: String,
        minlength: [3, 'schoolName must be at least 3 characters.'],
        maxlength: [24, 'schoolName must be less than 24 characters.'],
        required: [true, 'schoolName cannot be blank.'],
    },
    degree: {
        type: String,
        minlength: [3, 'degree must be at least 3 characters.'],
        maxlength: [24, 'degree must be less than 24 characters.'],
        required: [true, 'degree cannot be blank.'],
    },
    fieldOfStudy: {
        type: String,
        minlength: [3, 'fieldOfStudy must be at least 3 characters.'],
        maxlength: [24, 'fieldOfStudy must be less than 24 characters.'],
        required: [true, 'fieldOfStudy cannot be blank.'],
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

educationSchema.methods.toJSON = function () {
    const education = this
    const educationObject = education.toObject()
    
    delete educationObject.__v

    educationObject.from= dateFormat(educationObject.from,"dd.mm.yyyy")

    if (educationObject.current == true) {
        delete educationObject.to
    } else {
        educationObject.to= dateFormat(educationObject.to,"dd.mm.yyyy")
    }
  
    return educationObject 
}
  

const Education = mongoose.model("Education", educationSchema)


module.exports = Education