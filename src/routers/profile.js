const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/user")
const Profile = require("../models/profile")
const Education = require("../models/education")
const Experience = require("../models/experience")
const Repository = require("../models/repository")
const Social = require("../models/social")
const Skill = require("../models/skill")
const router = new express.Router()
const validateEducation = require("../validators/education")
var multer  = require('multer')
var fs = require('fs');
var uniqueFilename = require('unique-filename')


router.get("/profile/me", auth, async (req,res) => {
    if (!req.profile) {
        res.status(404).send({"error" : "Profile not found. Create a profile."});
    }

    else {
        const profile = req.profile.toJSON()
        try {
            const education = await Education.find({profile : profile._id});
            const experience = await Experience.find({profile : profile._id});
            const repository = await Repository.find({profile : profile._id});
            const social = await Social.findOne({profile : profile._id});
            const skills = await Skill.find({profile : profile._id});

            var socialMedia = {}

            if (social)
                socialMedia = {"facebook" : social.facebook,"twitter" : social.twitter, "instagram" : social.instagram, "youtube" : social.youtube, "linkedin" : social.linkedin, }

            res.send({...profile, education, experience, repository, socialMedia, skills})
        } catch (e) {
            console.log("[GET] - [Profile:Me] - Error: %s", e);
            res.send({"error" : "An unknown error occured."})
        }
    }



})


router.get("/profile/all", auth, async (req,res) => {
    try {
        let limit = 10; 
        let page = (Math.abs(req.query.page) || 1) - 1;

        const search = req.query.search

        if (search.length > 0)
        {
            const profiles = await Profile.find(
                {
                    $or : 
                    [
                        {"handler": new RegExp(search, "i")},
                        {"company": new RegExp(search, "i")},
                        {"website": new RegExp(search, "i")},
                        {"location": new RegExp(search, "i")},
                        {"biography": new RegExp(search, "i")}
                    ]
                })
                .sort({createDate : -1}).
                limit(limit).skip(limit * page)
    
        } else {
            const profiles = await Profile.find({}).sort({createDate : -1}).limit(limit).skip(limit * page)
    
        }
        res.send({profiles})
    
    } catch (e) {
        console.log("[GET] - [Profile:All] - Error: %s", e);
        res.status(400).send({"error" : "An error occured while fetching profiles."})

    }
})

router.get("/profile/:id", auth, async (req,res) => {
    const _id = req.params.id

    try {
        const profile = await Profile.findOne({ _id})
        if (!profile) {
            console.log("[GET] - [Profile:%s] - Error: %s", _id, "Profile not found.");
            return res.status(404).send({error:"Profile not found."});
        }

        const education = await Education.find({profile : profile._id});
        const experience = await Experience.find({profile : profile._id});
        const repository = await Repository.find({profile : profile._id});
        const social = await Social.findOne({profile : profile._id});
        const skills = await Skill.find({profile : profile._id});

        var socialMedia = {}

        if (social)
            socialMedia = {"facebook" : social.facebook,"twitter" : social.twitter, "instagram" : social.instagram, "youtube" : social.youtube, "linkedin" : social.linkedin, }

        return res.send({...profile.toJSON(), education, experience, repository, socialMedia, skills});

    } 
    catch (e) {
        console.log("[GET] - [Profile:%s] - Error: %s", _id, e);
        return res.status(500).send(e)
    }
})


function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
  
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
  
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
  
    return response;
  }

router.post("/profile", auth, async (req,res) => {
    const profile = req.profile
    if (profile) {
        try {
            delete req.body._id
            delete req.body.createDate
            delete req.body.__v
            delete req.body.user
            delete req.body.skills
        } catch (e) {
            console.log("[POST] - [Profile] - Error: %s", e);
        }

        const updates = Object.keys(req.body)

        var photoUrlCreated = ""

        if (updates.includes("uploadedPhoto"))
        {
            var base64Data = req.body.uploadedPhoto;
            let base64Image = base64Data.split(';base64,').pop();
            photoUrlCreated = uniqueFilename("./public/uploads", 'img')+".jpeg"

            fs.writeFile(photoUrlCreated, base64Image, {encoding: 'base64'}, function(err) {
                console.log('File created');
            });
        }


        const allowedUpdates = ["handler","profilePhoto","company","website","location","status","skills","biography","githubUsername","uploadedPhoto"]

        const isValid = updates.every((update) => allowedUpdates.includes(update))

        if (!isValid) {
            return res.status(400).send({ error: "Invalid updates!" + isValid})
        }
        try {
            allowedUpdates.forEach((update) =>  {
                if (update == "uploadedPhoto") 
                {
                    if (updates.includes("uploadedPhoto")) {
                       // profile["profilePhoto"] = "https://devbook-api.azurewebsites.net" + photoUrlCreated.replace("public","").replace(/\\/g, "/")
                        profile["profilePhoto"] = "http://10.0.2.2:3000" + photoUrlCreated.replace("public","").replace(/\\/g, "/")
                    }
                }
                else 
                {
                    if (req.body[update] != null)
                    {
                        profile[update] = req.body[update]
                    } else {
                        profile[update] = ""
                    }
                }
            })
    
            await profile.save()

            return res.send(profile)
        } 
        catch (e) {
            console.log("[POST] - [Profile] - Error: %s", e);
            return res.status(500).send(e)
        }

    } else {

        const createKeys = Object.keys(req.body)

        createKeys.forEach((key) =>  {
            if (req.body[key] == null) {
                delete req.body[key]
            }


            
        })

        var photoUrlCreated = ""

        if (createKeys.includes("uploadedPhoto") && req.body.uploadedPhoto.length > 0)
        {
            var base64Data = req.body.uploadedPhoto;
            let base64Image = base64Data.split(';base64,').pop();
            photoUrlCreated = uniqueFilename("./public/uploads", 'img')+".jpeg"

            fs.writeFile(photoUrlCreated, base64Image, {encoding: 'base64'}, function(err) {
                console.log('File created');
            });
        }


        const profile = new Profile({
            ...req.body,
            profilePhoto : photoUrlCreated.length == 0 ? "" : "http://10.0.2.2:3000" + photoUrlCreated.replace("public","").replace(/\\/g, "/"),
            user : req.user._id,
        })
        
        try {
            await profile.save()
            return res.status(201).send(profile)
        } catch(e) {
            console.log("[POST] - [Profile] - Error: %s", e);
            return res.status(400).send(e)
        }
    }
})

router.post("/profile/education", auth, async (req,res) => {
    const profile = req.profile

    if (!profile) {
        return res.status(500).send({ error: "You don't have a profile."});
    }

    const education = new Education({
        ...req.body,
        profile : profile._id 
    })
    
    try {
        await education.save()
        res.status(201). send(education.toJSON())

    } catch(err) {
        if (err.name == 'ValidationError') {
            var errors = {
                "error" : "true",
                "messages" : []
            } 
            for (field in err.errors) {
                errors.messages.push(err.errors[field].message)
            }
            return res.status(400).send(errors)
          } else {
            console.log("[POST] - [Education] - Error: %s", err);
            return res.status(400).send(err)
        }
    }
})

router.delete("/profile/education/:id", auth, async (req,res) => {
    const profile = req.profile;

    if (!profile) {
        return res.status(500).send({ error: "You don't have a profile."});
    }
    
    const _id = req.params.id

    try {
        const education = await Education.findOneAndDelete({_id, profile : profile._id})
        if (!education) {
            return res.status(404).send({ error: "No education"});
        }
        return res.send(education)
    } catch (e) {
        console.log(e);
        return res.status(500).send(e)
    }
})

router.post("/profile/experience", auth, async (req,res) => {
    const profile = req.profile
    
    if (!profile) {
        res.status(404).send({"error":"Profile not found."});
    }
    
    const experience = new Experience({
        ...req.body,
        profile : profile._id 
    })
    
    try {
        await experience.save()
        return res.status(201). send(experience.toJSON())
    } catch(err) {
        if (err.name == 'ValidationError') {
            var errors = {
                "error" : "true",
                "messages" : []
            } 
            for (field in err.errors) {
                errors.messages.push(err.errors[field].message)
            }
            return res.status(400).send(errors)
          } else {
            return res.status(400).send(err)
        }
    }
})

router.delete("/profile/experience/:id", auth, async (req,res) => {
     const profile = req.profile
    
    if (!profile) {
        res.status(404).send({"error":"Profile not found."});
    }
        
    const _id = req.params.id

    try {
        const experience = await Experience.findOneAndDelete({_id, profile : profile._id})
        if (!experience) {
            return res.status(404).send({ error: "No experience"});
        }
        return res.send(experience)
    } catch (e) {
        return res.status(500).send(e)
    }
})

router.post("/profile/repository", auth, async (req,res) => {
    const profile = req.profile

    if (!profile) {
        res.status(404).send({"error":"Profile not found."});
    }
    
    const repository = new Repository({
        ...req.body,
        profile : profile._id 
    })
    
    try {
        await repository.save()
        return res.status(201). send(repository)
    } catch(err) {
        if (err.name == 'ValidationError') {
            var errors = {
                "error" : "true",
                "messages" : []
            } 
            for (field in err.errors) {
                errors.messages.push(err.errors[field].message)
            }
            return res.status(400).send(errors)
          } else {
            return res.status(400).send(err)
        }
    }
})

router.delete("/profile/repository/:id", auth, async (req,res) => {
    const profile = req.profile

    if (!profile) {
        res.status(404).send({"error":"Profile not found."});
    }

    const _id = req.params.id

    try {
        const repository = await Repository.findOneAndDelete({_id, profile : profile._id})
        if (!repository) {
            return res.status(404).send({ error: "No repository"});
        }
        return res.send(repository)
    } catch (e) {
        return res.status(500).send(e)
    }
})

router.post("/profile/social", auth, async (req,res) => {
    const profile = req.profile

    if (!profile) {
        res.status(404).send({"error":"Profile not found."});
    }

    try {
        const social = await Social.findOne({ profile : profile._id})

   
        delete req.body._id
        delete req.body.__v
        delete req.body.profile

        if (req.body.facebook.length == 0) {
            delete req.body.facebook
        }
        if (req.body.instagram.length == 0) {
            delete req.body.instagram
        }
        if (req.body.twitter.length == 0) {
            delete req.body.twitter
        }
        if (req.body.youtube.length == 0) {
            delete req.body.youtube
        }
        if (req.body.linkedin.length == 0) {
            delete req.body.linkedin
        }
        if (req.body.github.length == 0) {
            delete req.body.github
        }

        if (social) {
            
            const updates = Object.keys(req.body)
            const allowedUpdates = ["facebook","twitter","instagram","youtube","linkedin","github"]
            const isValid = updates.every((update) => allowedUpdates.includes(update))
        
            if (!isValid) {
                return res.status(400).send({ error: "Invalid updates!"})
            }
            try {
                updates.forEach((update) => social[update] = req.body[update])
        
                await social.save()

                return res.send(social)
            } 
            catch (e) {
                return res.status(500).send(e)
            }
        }

        else {
            const social = new Social({
                ...req.body,
                profile : profile._id 
            })
            try {
                await social.save()
                return res.status(201). send(social)
        
            } catch(err) {
                if (err.name == 'ValidationError') {
                    var errors = {
                        "error" : "true",
                        "messages" : []
                    } 
                    for (field in err.errors) {
                        errors.messages.push(err.errors[field].message)
                    }
                    return res.status(400).send(errors)
                } else {
                    return res.status(400).send(err)
                }
            }
        }
    } catch (e) {
        return res.status(404).send({"error":"Unknown error."});
    }
})

router.post("/profile/skill", auth, async (req,res) => {
    const profile = req.profile

    if (!profile) {
        return res.status(500).send({ error: "You don't have a profile."});
    }

    const skill = new Skill({
        ...req.body,
        profile : profile._id 
    })
    
    try {
        await skill.save()
        return res.status(201). send(skill)
    } catch(err) {
        if (err.name == 'ValidationError') {
            var errors = {
                "error" : "true",
                "messages" : []
            } 
            for (field in err.errors) {
                errors.messages.push(err.errors[field].message)
            }
            return res.status(400).send(errors)
          } else {
            return res.status(400).send(err)
        }
    }
})

router.delete("/profile/skill/:id", auth, async (req,res) => {
    const profile = req.profile;

    if (!profile) {
        return res.status(500).send({ error: "You don't have a profile."});
    }

    const _id = req.params.id

    try {
        const skill = await Skill.findOneAndDelete({_id, profile : profile._id})
        if (!skill) {
            return res.status(404).send({ error: "No skill"});
        }
        return res.send(skill)
    } catch (e) {
        return res.status(500).send(e)
    }
})

module.exports = router