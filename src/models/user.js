const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Profile = require("./profile")
const validator = require("validator")

const userSchema = new mongoose.Schema({
    
    email : {
        type : String,
        unique : true,
        required : true,
        trim: true,
        lowercase : true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email field must be a email")
            } 
        }  
    },
    password : {
        type : String,
        required : true,
        trim : true,
    }, 
    date: {
        type: Date,
        default: Date.now
      },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
},)

userSchema.virtual("profile", {
    ref : "Profile",
    localField : "_id",
    foreignField : "user"
})

//model methods
userSchema.statics.findByCredentials = async (email, password) => {
    console.log(email)
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Unable to login")
    }

    return user
}

//instance methods
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id : user._id.toString()}, "secretKey@!QQ")

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}   


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject 
}
//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
    const user = this

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


const User = mongoose.model("User", userSchema)


module.exports = User