const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Profile = require("./profile")
const dateFormat = require('dateformat');

const postSchema = new mongoose.Schema({  
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true,
    },  
    text : {
      type : String,
      minlength : 1,
      required: [true, 'Text must be provided'],
    },
    likes: [
        {
          profiles: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
          }
        }
      ],
    dislikes: [
        {
          profiles: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
          }
        }
      ],
    date: {
        type: Date,
        default : Date.now,
    },
})

postSchema.methods.toJSON = function () {
  const post = this
  const postObject = post.toObject()

  const length = postObject.likes.length - postObject.dislikes.length

  delete postObject.likes
  delete postObject.dislikes
  delete postObject.__v

  postObject.date= dateFormat(postObject.date,"dd.mm.yyyy HH:MM")

  return postObject 
}

const Post = mongoose.model("Post", postSchema)
module.exports = Post
