const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Profile = require("../models/profile")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ","")
        const decoded = jwt.verify(token, "secretKey@!QQ")

        const user = await User.findOne({_id : decoded._id, "tokens.token" : token})
        
        if (!user) {
            throw new Error()
        }
        const profile = await Profile.findOne({user : user._id})

        req.token = token
        req.user = user
        req.profile = profile
        next() 
    } catch (e) {
        res.status(401).send({ error: "Please authenticate."})
    }
}

module.exports = auth