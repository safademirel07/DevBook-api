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
const Event = require("../models/event")
const { hash } = require("bcrypt")
const { reverse } = require("dns")
const { Hash } = require("crypto")

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    "696996135248-aqb9eie8r6hiim50ip86cslr0pareejc.apps.googleusercontent.com",
    "0m3pJz6HKuorVuLzteebvKvC", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: "1//04kENkPawUyaoCgYIARAAGAQSNwF-L9IrMF4Jom1h-acmEnDr8DweYOuy5SdlxOr0SN0JLexBScLeZomwhhRszHG-nfwKwral4sA"
});
const accessToken = oauth2Client.getAccessToken()

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: "safademirel07@gmail.com", 
         clientId: "696996135248-aqb9eie8r6hiim50ip86cslr0pareejc.apps.googleusercontent.com",
         clientSecret: "0m3pJz6HKuorVuLzteebvKvC",
         refreshToken: "1//04kENkPawUyaoCgYIARAAGAQSNwF-L9IrMF4Jom1h-acmEnDr8DweYOuy5SdlxOr0SN0JLexBScLeZomwhhRszHG-nfwKwral4sA",
         accessToken: accessToken
    }
});

const mailOptions = {
    from: "safademirel07@gmail.com",
    to: "safademirel07@gmail.com",
    subject: "Node Test Mailer",
    generateTextFromHTML: true,
    html: "<b>test</b>"
};

router.get("/event/all", auth, async (req,res) => {
    try {
        const events = []

        const hashtag = req.params.hashtag



        let limit =  100; 
        let page = (Math.abs(req.query.page) || 1) - 1;

        var isoDate = new Date().toISOString()
        


        const foundEvents = Event.find({ date : {"$gte" : isoDate}}).sort({date : 1}).limit(limit).skip(limit * page)
    
        for await (const event of foundEvents) {
            
            const eventProfile = await Profile.findOne({_id : event.profile});

            if (!eventProfile) {
                console.log("Owner of event doesnt exist. Continue");
                continue;
            } 

            var isMaybe = false
            var isParticipant = false
            var isMine = false


            const userProfile = req.profile
            if (userProfile)
            {
                isMine = event.profile.toString() == userProfile._id.toString() ? true : false;
                isMaybe = event.maybes.filter(maybe => maybe.profiles.toString() == userProfile._id.toString()).length;
                isParticipant = event.participants.filter(participant => participant.profiles.toString() == userProfile._id.toString()).length;
            }

            const maybeCount = event.maybes.length;
            const participantCount = event.participants.length;
        
    
            newPost = {"profileName" : eventProfile.handler, "profileImage" : eventProfile.profilePhoto, ...event.toJSON(), isMine, isMaybe : isMaybe!=0?true:false, isParticipant: isParticipant!=0?true:false, maybeCount, participantCount, owner : eventProfile}
            events.push(newPost)
        }


        res.send({events})
    } catch (e) {
        res.status(400).send({"error" : "An error occured while fetching events."})
    }

})


router.get("/event/all/:search", auth, async (req,res) => {
    try {
        const events = []

        const search = req.params.search


        let limit = 100; 
        let page = (Math.abs(req.query.page) || 1) - 1;
        var isoDate = new Date().toISOString()


/*
         const foundEvents = Event.aggregate([ 
            { "$match": {
                $or : [{"description": new RegExp(search, "i")},{"title": new RegExp(search, "i")}],
                {date : {"$gte" : isoDate}},
                
            } , 
            },  
            { "$sort": {date: 1}}, 
            { "$skip": limit * page}, 
            { "$limit": limit}
        ])

 */




        const foundEvents = Event.find( {$or : [{"description": new RegExp(search, "i")},{"title": new RegExp(search, "i")},{"date": new RegExp(search, "i")}], $and : [{date : {"$gte" : isoDate}}]}).sort({date : 1}).limit(limit).skip(limit * page)


    
        for await (const event of foundEvents) {
            
            const eventProfile = await Profile.findOne({_id : event.profile});

            if (!eventProfile) {
                console.log("Owner of post doesnt exist. Continue");
                continue;
            } 

            var isMaybe = false
            var isParticipant = false
            var isMine = false


            const userProfile = req.profile
            if (userProfile)
            {
                isMine = event.profile.toString() == userProfile._id.toString() ? true : false;
                isMaybe = event.maybes.filter(maybe => maybe.profiles.toString() == userProfile._id.toString()).length;
                isParticipant = event.participants.filter(participant => participant.profiles.toString() == userProfile._id.toString()).length;
            }

            const maybeCount = event.maybes.length;
            const participantCount = event.participants.length;
        
    
            newPost = {"profileName" : eventProfile.handler, "profileImage" : eventProfile.profilePhoto, ...event, isMine, isMaybe : isMaybe!=0?true:false, isParticipant: isParticipant!=0?true:false, maybeCount, participantCount, owner : eventProfile}
            events.push(newPost)
        }


        res.send({events})
    } catch (e) {
        res.status(400).send({"error" : "An error occured while fetching events."})
    }

})


router.get("/event/:id", auth, async (req,res) => {
    const _id = req.params.id
    const myProfile = req.profile

    if (!myProfile) {
        return res.status(404).send({error:"Profile not found."});
    }

    try {
        const event = await Event.findOne({ _id})

        if (!event) {
            return res.status(404).send({error:"Event not found."});
        }

        const eventProfile = await Profile.findOne({_id : event.profile})



        if (!eventProfile) {
            return res.status(404).send({error:"Event owner not found."});
        }


        const participants = []

        for (const profile of event.participants) {

            const participantProfile = await Profile.findOne({_id : profile.profiles})

            if (!participantProfile)
            {
                continue;
            }

            participants.push({"profileID" : participantProfile._id,"profileName" : participantProfile.handler,"profileJob" : participantProfile.company, "profileImage" : participantProfile.profilePhoto})
            
        }
        
        const maybes = []

        for (const profile of event.maybes) {

            const maybeProfile = await Profile.findOne({_id : profile.profiles})

            if (!maybeProfile)
            {
                continue;
            }

            maybes.push({"profileID" : maybeProfile._id,"profileName" : maybeProfile.handler,"profileJob" : maybeProfile.company, "profileImage" : maybeProfile.profilePhoto})
            
        }  

        

        const isMaybe = event.maybes.filter(maybe => maybe.profiles.toString() == req.profile._id.toString()).length;
        const isParticipant = event.participants.filter(participant => participant.profiles.toString() == req.profile._id.toString()).length;

        const maybeCount = event.maybes.length;
        const participantCount = event.participants.length;

        const isMine = event.profile.toString() == myProfile._id.toString() ? true : false;


        res.send({"profileName" : eventProfile.handler, "profileImage" : eventProfile.profilePhoto, ...event.toJSON(), isMine, isMaybe : isMaybe!=0?true:false, isParticipant: isParticipant!=0?true:false, maybeCount, participantCount,participants, maybes, owner : eventProfile});

        } catch (e) {
        res.status(500).send(e)
    }
})


router.post("/event", auth, async (req,res) => {
    const profile = req.profile
    const event = new Event({...req.body, "profile" : req.profile._id})


    try {
        await event.save()
        res.status(201). send(event)
    } catch(e) {
        res.status(400).send(e)
    }
})


router.delete("/event/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile
    
    try {

        const event = await Event.findOneAndDelete({_id, "profile" : profile._id})

        if (!event) {
            res.status(404).send({error:"Event not found."});
        }

        res.send(event)

    } catch(e) {
        res.status(400).send(e)
    }
})

router.post("/event/participation/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile

    try {
        const event = await Event.findOne({ _id})

        if (!event) {
            res.status(404).send({"error" : "event not found"})
        }

        /*Check Maybe*/
        const maybeResult = event.maybes.filter(maybe => maybe.profiles.toString() == profile._id.toString());
        if (maybeResult.length > 0) {
            const removeIndexMaybe = event.maybes.map(item => item.profiles.toString()).indexOf(profile._id.toString());
            event.maybes.splice(removeIndexMaybe, 1);
        }
        /*End Check Maybe*/


        const partiResult = event.participants.filter(participant => participant.profiles.toString() == profile._id.toString());
        if (partiResult.length > 0) {
            const removeIndex = event.participants.map(item => item.profiles.toString()).indexOf(profile._id.toString());
            event.participants.splice(removeIndex, 1);
        } else {
            event.participants.unshift({ profiles: profile._id });
        }

        await event.save()

        const participants = []

        for (const profile of event.participants) {

            const participantProfile = await Profile.findOne({_id : profile.profiles})

            if (!participantProfile)
            {
                continue;
            }

            participants.push({"profileID" : participantProfile._id,"profileName" : participantProfile.handler,"profileJob" : participantProfile.company, "profileImage" : participantProfile.profilePhoto})
            
        }
        
        const maybes = []

        for (const profile of event.maybes) {

            const maybeProfile = await Profile.findOne({_id : profile.profiles})

            if (!maybeProfile)
            {
                continue;
            }

            maybes.push({"profileID" : maybeProfile._id,"profileName" : maybeProfile.handler,"profileJob" : maybeProfile.company, "profileImage" : maybeProfile.profilePhoto})
            
        }  

        /*
        smtpTransport.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            smtpTransport.close();
       });
       */

        const isMaybe = event.maybes.filter(maybe => maybe.profiles.toString() == req.profile._id.toString()).length;
        const isParticipant = event.participants.filter(participant => participant.profiles.toString() == req.profile._id.toString()).length;

        const maybeCount = event.maybes.length;
        const participantCount = event.participants.length;

        res.send({isMaybe : isMaybe!=0?true:false, isParticipant: isParticipant!=0?true:false, maybeCount, participantCount, participants, maybes });

    } catch(e) {
        res.status(400).send(e);
    }
})


router.post("/event/maybe/:id", auth, async (req,res) => {
    const _id = req.params.id
    const profile = req.profile

    try {
        const event = await Event.findOne({ _id})

        if (!event) {
            res.status(404).send({"error" : "event not found"})
        }

        /*Check Participation*/

        const partiResult = event.participants.filter(participant => participant.profiles.toString() == profile._id.toString());
        if (partiResult.length > 0) {
            const removeIndexParti= event.participants.map(item => item.profiles.toString()).indexOf(profile._id.toString());
            event.participants.splice(removeIndexParti, 1);
        }
        /*End Check Participation*/

        const maybeResult = event.maybes.filter(maybe => maybe.profiles.toString() == profile._id.toString());
        if (maybeResult.length > 0) {
            const removeIndex = event.maybes.map(item => item.profiles.toString()).indexOf(profile._id.toString());
            event.maybes.splice(removeIndex, 1);
        } else {
            event.maybes.unshift({ profiles: profile._id });
        }

        await event.save()
        
        const participants = []

        for (const profile of event.participants) {

            const participantProfile = await Profile.findOne({_id : profile.profiles})

            if (!participantProfile)
            {
                continue;
            }

            participants.push({"profileID" : participantProfile._id,"profileName" : participantProfile.handler,"profileJob" : participantProfile.company, "profileImage" : participantProfile.profilePhoto})
            
        }
        
        const maybes = []

        for (const profile of event.maybes) {

            const maybeProfile = await Profile.findOne({_id : profile.profiles})

            if (!maybeProfile)
            {
                continue;
            }

            maybes.push({"profileID" : maybeProfile._id,"profileName" : maybeProfile.handler,"profileJob" : maybeProfile.company, "profileImage" : maybeProfile.profilePhoto})
            
        }  

        const isMaybe = event.maybes.filter(maybe => maybe.profiles.toString() == req.profile._id.toString()).length;
        const isParticipant = event.participants.filter(participant => participant.profiles.toString() == req.profile._id.toString()).length;

        const maybeCount = event.maybes.length;
        const participantCount = event.participants.length;

        res.send({isMaybe : isMaybe!=0?true:false, isParticipant: isParticipant!=0?true:false, maybeCount, participantCount, participants, maybes });

    } catch(e) {
        res.status(400).send(e);
    }
})


module.exports = router