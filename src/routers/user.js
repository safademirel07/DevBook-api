const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/user")
const validation = require("../validators/register");
const router = new express.Router()
const validator = require("validator")

const firebaseAdmin = require("../firebase/firebase")



router.post("/users/register", async (req,res) => {

    User.findOne({ email : req.body.email}).then(user => {
        if (user) {
            return res.status(404).send({"error": "This is email is already in use."})
        }
        return;

    })

    if (!validator.isEmail(req.body.email)) {
        return res.status(404).send({"error": "Please enter a valid email address."})
    } 


    if (req.body.password != req.body.password2) {
        return res.status(400).send({"error": "Passwords doesnt match."})
    }

    const user = new User(req.body)

    try {

        firebaseAdmin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
          })
            .then(async function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log('[Firebase] Successfully created new user:', userRecord.uid);

              user.firebaseUID = userRecord.uid

              await user.save()
              const token = await user.generateAuthToken()
      
              return res.status(201).send( { 
                  "_id" : user._id,
                  "photoUrl" : user.photoUrl,      
                  //"name" : user.name,      
                  "email" : user.email,      
                  token 
              })


            })
            .catch(function(error) {
                return res.status(400).send({"error": "An Firebase eror happened."})
            });


        
    } catch (e) {
        console.log(e)
        return res.status(400).send({"error": "An unknown eror happened."})
    }

})

router.post("/users/login", async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send( { 
            "_id" : user._id,
            "photoUrl" : user.photoUrl,      
            //"name" : user.name,      
            "email" : user.email,  
            token 
        }) 
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post("/users/auth", auth, async (req,res) => {
    return res.send({"message" : "Auth success"})

})


router.post("/users/logout", auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req. token
        })
        await req.user.save()
        res.send({"message" : "Logout successful"})
    } catch (e) { 
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({"message" : "Logout All successful"})
    } catch (e) {
        res.status(500).send(e)
    }
})
    
      
router.get("/users/me", auth, async (req,res) => {
    const user = req.user
    res.send(user)
})


router.patch("/users/me", auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["photoUrl"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: "Invalid updates!"})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
}) 


router.delete("/users/me", auth, async (req,res) => {
     try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        return res.status(500).send(e)
    }
})



module.exports = router