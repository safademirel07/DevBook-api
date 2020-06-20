const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Profile = require("./profile")
const dateFormat = require('dateformat');

const eventSchema = new mongoose.Schema({  
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true,
    },  
    title : {
      type : String,
      text : true,
      minlength : 1,
      required: [true, 'Title must be provided'],
    },
    description : {
      type : String,
      text : true,
      minlength : 1,
      required: [true, 'Description must be provided'],
    },
    location : {
      type : String,
      text : true,
      minlength : 1,
      required: [true, 'Location must be provided'],
    },
    latitude : {
      type : String,
      text : true,
      minlength : 1,
      required: [true, 'Latitude must be provided'],
    },
    longitude : {
      type : String,
      text : true,
      minlength : 1,
      required: [true, 'Longitude must be provided'],
    },
    participants: [
        {
          profiles: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
          }
        }
      ],
    maybes: [
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
        required: [true, 'Date must be provided'],
      },
})

eventSchema.methods.toJSON = function () {
  const post = this
  const postObject = post.toObject()

  //const length = postObject.likes.length - postObject.dislikes.length

  //delete postObject.likes
  //delete postObject.dislikes
  //delete postObject.__v

  
  postObject.date= dateFormat(postObject.date,"dd.mm.yyyy HH:MM")

  return postObject 
}

const Event = mongoose.model("Event", eventSchema)
module.exports = Event
