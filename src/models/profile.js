const mongoose = require("mongoose")
const Education = require("./education")
const Experience = require("./experience")
const Social = require("./social")
const Repository = require("./repository")

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true,
    },
    handler : {
        type : String,
        unique : true,
        required : true,
        trim : true,
    }, 
    profilePhoto : {
        type : String,
        default : "",
    },
    company: {
        type: String,
        default : "",
    },
    website: {
        type: String,
        default : "",
    },
    location: {
        type: String,
        default : "",
    },
    status: {
        type: String,
    },
    biography: {
        type: String,
        default : "",
    },
    githubUsername: {
        type: String,
        default : "",
    },
    createDate : {
        type : Date,
        default : Date.now
    }
})

profileSchema.virtual("education", {
    type : [Education],
    ref : "Education",
    localField : "education",
    foreignField : "profile",
    default : []
})

profileSchema.virtual("experience", {
    ref : "Experience",
    localField : "experience",
    foreignField : "profile"
})

profileSchema.virtual("social", {
    ref : "Social",
    localField : "social",
    foreignField : "profile"
})

profileSchema.virtual("repository", {
    ref : "Repository",
    localField : "repository",
    foreignField : "profile"
})

profileSchema.virtual("post", {
    ref : "Post",
    localField : "post",
    foreignField : "profile"
})


profileSchema.virtual("comment", {
    ref : "Comment",
    localField : "comment",
    foreignField : "profile"
})

profileSchema.methods.toJSON = function () {
    const profile = this
    const profileObject = profile.toObject()
    return profileObject 
}

const Profile = mongoose.model("Profile", profileSchema)
module.exports = Profile