const mongoose = require("mongoose")
const dateFormat = require('dateformat');

const commentSchema = new mongoose.Schema({  
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required : true
    },  
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required : true
    },
    text : {
        type : String,
        required : true,
    },
    date: {
        type: Date,
        default : Date.now,
    },
})

commentSchema.methods.toJSON = function () {
    const comment = this
    const commentObject = comment.toObject()
  
    commentObject.date= dateFormat(commentObject.date,"dd.mm.yyyy HH:MM")
  
    return commentObject 
  }
  

const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment
