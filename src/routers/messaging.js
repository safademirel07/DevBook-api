const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/user")
const Profile = require("../models/profile")
const Post = require("../models/post")
const Comment = require("../models/comment")
const Messaging = require("../models/messaging")
const router = new express.Router()
const validateEducation = require("../validators/education")
const dateFormat = require('dateformat');
const extract = require('mention-hashtag')
const Event = require("../models/event")
const { hash } = require("bcrypt")
const { reverse } = require("dns")
const { Hash } = require("crypto")
const mongoose = require("mongoose")
const { stringify } = require("querystring")

router.get("/messaging/all", auth, async (req, res) => {
    try {

        const profile = req.profile


        let limit = 10;
        let page = (Math.abs(req.query.page) || 1) - 1;

        const foundMessagings = await Messaging.find({ "pair_id": new RegExp(req.user.email, "i") }).limit(limit).skip(limit * page)

        const messages = []


        for (const messaging of foundMessagings) {
            if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.profile))) {

                const peerProfile = await Profile.findOne({ _id: messaging.peer_profile });

                if (!peerProfile) {
                    console.log("Peer profile doesnt exist. Continue");
                    continue;
                }

                const peerUser = await User.findOne({ _id: peerProfile.user });
                const email = peerUser.email;

                var isMe = false

                messagingObject = messaging.toJSON()
                messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }

                messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
                messages.push(messagingObject)




            } else if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.peer_profile))) {

                const peerProfile = await Profile.findOne({ _id: messaging.profile });

                if (!peerProfile) {
                    console.log("Peer profile doesnt exist. Continue");
                    continue;
                }

                const peerUser = await User.findOne({ _id: peerProfile.user });
                const email = peerUser.email;

                var isMe = false

                messagingObject = messaging.toJSON()
                messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }
                messagingObject["profile"] = messaging.peer_profile

                messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
                messages.push(messagingObject)



            }


        }

        res.send({ messages })
    } catch (e) {
        res.status(400).send({ "error": "An error occured while fetching messages." })
    }

})


router.post("/messaging", auth, async (req, res) => {
    const profile = req.profile

    const peerProfileString = req.body.peer_profile
    const lastMessage = req.body.last_message
    const lastMessageDate = req.body.date
    const pairID = req.body.pair_id

    var peerProfileID = mongoose.Types.ObjectId(peerProfileString);



    const message = await Messaging.findOne({ "pair_id": new RegExp(req.user.email, "i") })


    if (message) {
        message.last_message = lastMessage
        message.date = lastMessageDate
        message.save()

        const peerProfile = await Profile.findOne({ _id: message.peer_profile })

        if (!peerProfile) {
            console.log("Peer profile doesnt exist. Continue");
            return;
        }

        if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.profile))) {


            const peerUser = await User.findOne({ _id: peerProfile.user });
            const email = peerUser.email;

            var isMe = false

            messagingObject = messaging.toJSON()
            messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }

            messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
            res.send(messagingObject)




        } else if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.peer_profile))) {

            const peerUser = await User.findOne({ _id: peerProfile.user });
            const email = peerUser.email;

            var isMe = false

            messagingObject = messaging.toJSON()
            messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }
            messagingObject["profile"] = messaging.peer_profile

            messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
            res.send(messagingObject)
        }
    } else {




        const createMessage = new Messaging({ profile: profile._id, peer_profile: peerProfileID, last_message: lastMessage, date: lastMessageDate, pair_id: pairID })
        createMessage.save()

        const peerProfile = await Profile.findOne({ _id: createMessage.peer_profile })

        if (!peerProfile) {
            console.log("Peer profile doesnt exist. Continue");
            return;
        }

        if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.profile))) {


            const peerUser = await User.findOne({ _id: peerProfile.user });
            const email = peerUser.email;

            var isMe = false

            messagingObject = messaging.toJSON()
            messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }

            messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
            res.send(messagingObject)




        } else if (mongoose.Types.ObjectId(profile._id).equals(mongoose.Types.ObjectId(messaging.peer_profile))) {
            const peerUser = await User.findOne({ _id: peerProfile.user });
            const email = peerUser.email;

            var isMe = false

            messagingObject = messaging.toJSON()
            messagingObject["peer_profile"] = { ...peerProfile.toJSON(), email, isMe }
            messagingObject["profile"] = messaging.peer_profile

            messagingObject["date"] = dateFormat(messagingObject.date, "h:MM")
            res.send(messagingObject)
        }


    }
})

module.exports = router