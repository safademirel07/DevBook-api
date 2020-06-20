const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/user")
const Profile = require("../models/profile")
const Post = require("../models/post")
const Comment = require("../models/comment")
const router = new express.Router()
const validateEducation = require("../validators/education")
const dateFormat = require('dateformat');
const extract = require('mention-hashtag')
const Hashtag = require("../models/hashtag")
const { hash } = require("bcrypt")
const { reverse } = require("dns")
const { Hash } = require("crypto")


router.get("/post/all", auth, async (req,res) => {
    try {
        const posts = []

        const sort = req.query.sort

        const search = req.query.search


        var sortMethod = {}

        if (sort == 0) { // newest to old
            sortMethod = {date : -1}
        } else if (sort == 1) {
            sortMethod = {date : 1}
        }
        else if (sort == 2) { // newest to old
            sortMethod = {readerLength : -1}
        } else if (sort == 3) {
            sortMethod = {readerLength : 1}
        }


        let limit = 5; 
        let page = (Math.abs(req.query.page) || 1) - 1;


        var foundPosts

        if (sort == 0 || sort == 1)
            foundPosts = Post.aggregate([ { "$match": {text:{'$regex' : search, '$options' : 'i'}}},  { "$sort": sortMethod}, { "$skip": limit * page}, { "$limit": limit}])
        else 
            foundPosts = Post.aggregate([{ "$match": {text:{'$regex' : search, '$options' : 'i'}}},  {$addFields: { readerLength: { $size: "$readers" } }, }, { "$sort": sortMethod},  { "$skip": limit * page}, { "$limit": limit}])


        console.log("page " + page)
        
            
        for await (const post of foundPosts) {

            console.log(post)

            const postProfile = await Profile.findOne({_id : post.profile});

            if (!postProfile) {
                console.log("Owner of post doesnt exist. Continue");
                continue;
            } 
            


            post.date= dateFormat(post.date,"dd.mm.yyyy HH:MM")


            const comments = await Comment.countDocuments({post : post._id});
            var likeSum = post.likes.length - post.dislikes.length;
            var isMine = false
            var isDisliked = false
            var isLiked = false

            const userProfile = req.profile
            if (userProfile)
            {
                isMine = post.profile.toString() == userProfile._id.toString() ? true : false;
                isDisliked = post.dislikes.filter(dislike => dislike.profiles.toString() == userProfile._id.toString()).length;
                isLiked = post.likes.filter(like => like.profiles.toString() == userProfile._id.toString()).length;
            }

            var readers = 0
            if (post.readers)
                readers = post.readers.length;

    
            newPost = {"profileName" : postProfile.handler, "profileImage" : postProfile.profilePhoto, ...post,isMine, isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,  commentLength:  comments, readers}
            posts.push(newPost)
        }


        res.send({posts})
    } catch (e) {
        console.log(e)
        res.status(400).send({"error" : "An error occured while fetching posts."})
    }

})

router.get("/post/all/:hashtag", auth, async (req,res) => {
    try {

        const hashtag = req.params.hashtag

        const sort = req.query.sort

                const search = req.query.search


        var sortMethod = {}

        if (sort == 0) { // newest to old
            sortMethod = {date : -1}
        } else if (sort == 1) {
            sortMethod = {date : 1}
        }
        else if (sort == 2) { // newest to old
            sortMethod = {readerLength : -1}
        } else if (sort == 3) {
            sortMethod = {readerLength : 1}
        }


        let limit = 5; 
        let page = (Math.abs(req.query.page) || 1) - 1;


        var foundPosts

        const posts = []

        if (sort == 0 || sort == 1)
            foundPosts = Post.aggregate([ { "$match": { $and : [ {text:{'$regex' : "#"+hashtag, '$options' : 'i'}}, {text:{'$regex' : search, '$options' : 'i'}}]}},  { "$sort": sortMethod}, { "$skip": limit * page}, { "$limit": limit}])
        else 
            foundPosts = Post.aggregate([ { "$match": { $and : [ {text:{'$regex' : "#"+hashtag, '$options' : 'i'}}, {text:{'$regex' : search, '$options' : 'i'}}]}},  {$addFields: { readerLength: { $size: "$readers" } }, }, { "$sort": sortMethod},  { "$skip": limit * page},  { "$limit": limit}, ])


    
        for await (const post of foundPosts) {

            const postProfile = await Profile.findOne({_id : post.profile});

            if (!postProfile) {
                console.log("Owner of post doesnt exist. Continue");
                continue;
            } 


             post.date= dateFormat(post.date,"dd.mm.yyyy HH:MM")

            const comments = await Comment.countDocuments({post : post._id});
            var likeSum = post.likes.length - post.dislikes.length;
            var isMine = false
            var isDisliked = false
            var isLiked = false

            const userProfile = req.profile
            if (userProfile)
            {
                isMine = post.profile.toString() == userProfile._id.toString() ? true : false;
                isDisliked = post.dislikes.filter(dislike => dislike.profiles.toString() == userProfile._id.toString()).length;
                isLiked = post.likes.filter(like => like.profiles.toString() == userProfile._id.toString()).length;
            }

            const readers = post.readers.length;


    
            newPost = {"profileName" : postProfile.handler, "profileImage" : postProfile.profilePhoto, ...post, isMine, isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,  commentLength:  comments, readers}
            posts.push(newPost)
        }


        res.send({posts})
    } catch (e) {
        console.log(e)
        res.status(400).send({"error" : "An error occured while fetching posts."})
    }

})

router.get("/post/:id", auth, async (req,res) => {
    const _id = req.params.id
    const myProfile = req.profile

    if (!myProfile) {
        return res.status(404).send({error:"Profile not found."});
    }

    try {
        const post = await Post.findOne({ _id})

        
        if (!post) {
            return res.status(404).send({error:"Post not found."});
        }

        const postProfile = await Profile.findOne({_id : post.profile})


        if (!postProfile) {
            return res.status(404).send({error:"Post owner not found."});
        }


        const comments = []

        for await (const comment of Comment.find({post : post._id})) {
        
            const commentProfile = await Profile.findOne({_id : comment.profile})

            if (!commentProfile)
                continue;
            const isMine = comment.profile.toString() == myProfile._id.toString() ? true : false;

            comments.push({"profileName" : commentProfile.handler, "profileImage" : commentProfile.profilePhoto,isMine, ...comment.toJSON()})
        }

        const readerResult = post.readers.filter(reader => reader.profiles.toString() == myProfile._id.toString());
        if (readerResult.length == 0) {
            console.log("reader olarak kaydet :))))")
            post.readers.unshift({ profiles: myProfile._id });
            await post.save()
        }

        const readers = post.readers.length;
    
        var likeSum = post.likes.length - post.dislikes.length;

        const isDisliked = post.dislikes.filter(dislike => dislike.profiles.toString() == myProfile._id.toString()).length;
        const isLiked = post.likes.filter(like => like.profiles.toString() == myProfile._id.toString()).length;
        const isMine = post.profile.toString() == myProfile._id.toString() ? true : false;

        res.send({"profileName" : postProfile.handler, "profileImage" : postProfile.profilePhoto, ...post.toJSON(), isMine, isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,  commentLength:  comments.length, comments, readers});

        } catch (e) {
            console.log(e)
        res.status(500).send(e)
    }
})


router.get("/hashtags/", auth, async (req,res) => {

    let limit = 15; 
    let page = (Math.abs(req.query.page) || 1) - 1;

    const allHashtags = await Hashtag.find({}).sort({value : -1}).limit(limit).skip(limit * page)


    res.send(allHashtags)
})


router.get("/hashtags/:hashtag", auth, async (req,res) => {

    const hashtag = req.params.hashtag

    console.log("gelen ne " + hashtag)


    let limit = 15; 
    let page = (Math.abs(req.query.page) || 1) - 1;

    const allHashtags = await Hashtag.find({"hashtag": new RegExp(hashtag, "i")}).sort({value : -1}).limit(limit).skip(limit * page)


    res.send(allHashtags)
})


router.get("/hashtags", auth, async (req,res) => {

    let limit = 5; 
    let page = (Math.abs(req.query.page) || 1) - 1;

    const allHashtags = await Hashtag.find({}).sort({value : -1}).limit(limit).skip(limit * page)


    res.send(allHashtags)
})


router.post("/post", auth, async (req,res) => {
    const profile = req.profile
    

    const post = new Post({...req.body, "profile" : req.profile._id})

    const postContent = post.text;

    const hashtags = extract(postContent, { unique: true, type: '#'});

    for (const i in hashtags) {

        const hashtag = hashtags[i]

        if (hashtag.length > 24)
            continue

        const findHashtag = await Hashtag.findOne({hashtag : hashtag})

        if (findHashtag)
        {
            await findHashtag.update({$inc: {'value': 1}})
            await findHashtag.save()
            continue
        }

        const createHashtag = new Hashtag({hashtag})
        createHashtag.save()
    }
      
    try {
        await post.save()
        res.status(201). send(post)
    } catch(e) {
        res.status(400).send(e)
    }
})


router.post("/comment/:id", auth, async (req,res) => {
    const postID = req.params.id
    const profile = req.profile


    const comment = new Comment({...req.body, "post" : postID, "profile" : req.profile._id})

    try {
        await comment.save()
        const isMine = comment.profile.toString() == profile._id.toString() ? true : false;

        res.status(201). send({"profileName" : profile.handler, "profileImage" : profile.profilePhoto,isMine, ...comment.toJSON()})
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete("/comment/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile
    
    try {

        const comment = await Comment.findOneAndDelete({_id, "profile" : profile._id})

        if (!comment) {
            res.status(404).send({error:"Comment not found."});
        }

        res.send(comment)

    } catch(e) {
        res.status(400).send(e)
    }
})


router.delete("/post/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile
    
    try {

        const post = await Post.findOneAndDelete({_id, "profile" : profile._id})

        if (!post) {
            res.status(404).send({error:"Post not found."});
        }

        res.send(post)

    } catch(e) {
        res.status(400).send(e)
    }
})

router.post("/post/like/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile

    try {
        const post = await Post.findOne({ _id})

        if (!post) {
            res.status(404).send({"error" : "post not found"})
        }

        /*Check Dislike*/
        const dislikeResult = post.dislikes.filter(dislike => dislike.profiles.toString() == req.profile._id.toString());
        if (dislikeResult.length > 0) {
            const removeIndexDislike = post.dislikes.map(item => item.profiles.toString()).indexOf(req.profile._id.toString());
            post.dislikes.splice(removeIndexDislike, 1);
        }
        /*End Check Dislike*/

        const likeResult = post.likes.filter(like => like.profiles.toString() == req.profile._id.toString());
        if (likeResult.length > 0) {
            const removeIndex = post.likes.map(item => item.profiles.toString()).indexOf(req.profile._id.toString());
            post.likes.splice(removeIndex, 1);
        } else {
            post.likes.unshift({ profiles: req.profile._id });
        }

        await post.save()

        const readers = post.readers.length;


       // const comments = await Comment.find({profile : profile._id, post : post._id});
        var likeSum = post.likes.length - post.dislikes.length;

        const isDisliked = post.dislikes.filter(dislike => dislike.profiles.toString() == req.profile._id.toString()).length;
        const isLiked = post.likes.filter(like => like.profiles.toString() == req.profile._id.toString()).length;
        res.send({isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum, readers});
       // res.send({"profileName" : profile.handler, "profileImage" : profile.profilePhoto , ...post.toJSON(), isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,  commentLength:  comments.length});

    } catch(e) {
        console.log(e);
        res.status(400).send(e);
    }



})


router.post("/post/dislike/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile

    try {
        const post = await Post.findOne({ _id})

        if (!post) {
            res.status(404).send({"error" : "post not found"})
        }

        /*Check Like*/
        const likeResult = post.likes.filter(like => like.profiles.toString() == req.profile._id.toString());
        if (likeResult.length > 0) {
            const removeIndex = post.likes.map(item => item.profiles.toString()).indexOf(req.profile._id.toString());
            post.likes.splice(removeIndex, 1);
        } 
        /*End Check Like*/

        const dislikeResult = post.dislikes.filter(dislike => dislike.profiles.toString() == req.profile._id.toString());
        console.log(dislikeResult);
        if (dislikeResult.length > 0) {
            const removeIndexDislike = post.dislikes.map(item => item.profiles.toString()).indexOf(req.profile._id.toString());
            post.dislikes.splice(removeIndexDislike, 1);
        }else {
            post.dislikes.unshift({ profiles: req.profile._id });
        }

        await post.save()

        //const comments = await Comment.find({profile : profile._id, post : post._id});
        var likeSum = post.likes.length - post.dislikes.length;
        const readers = post.readers.length;

        const isDisliked = post.dislikes.filter(dislike => dislike.profiles.toString() == req.profile._id.toString()).length;
        const isLiked = post.likes.filter(like => like.profiles.toString() == req.profile._id.toString()).length;
        res.send({isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,readers});

        //res.send({"profileName" : profile.handler, "profileImage" : profile.profilePhoto, ...post.toJSON(), isLiked : isLiked!=0?true:false , isDisliked : isDisliked!=0?true:false, like : likeSum,  commentLength:  comments.length});

    } catch(e) {
        console.log(e);
        res.status(400).send(e);
    }



})


module.exports = router