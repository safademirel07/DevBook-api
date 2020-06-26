const express = require("express")

const os = require("os")
require("./db/mongoose")
var bodyParser = require('body-parser')

const userRouter = require("./routers/user")
const profileRouter = require("./routers/profile")
const postRouter = require("./routers/post")
const eventRouter = require("./routers/event")
const messagingRouter = require("./routers/messaging")




const app = express()
const port = process.env.PORT || 3000



app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))
app.use(express.json())
app.use(userRouter)
app.use(profileRouter)
app.use(postRouter)
app.use(eventRouter)
app.use(messagingRouter)

app.use(express.static('public'))



app.listen(port, () => {
    console.log("Server is up on port ", port)
})

//test
