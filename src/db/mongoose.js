const mongoose = require("mongoose")


//console.log(process.env.MONGODB_URI);

try {
   // mongoose.connect("mongodb+srv://devbook:97@D3V@Aa@devbook.sac7y.mongodb.net/devbook-test?retryWrites=true&w=majority", {
    mongoose.connect('mongodb://localhost:27017/devbook_api', {
        useNewUrlParser : true,
        useCreateIndex : true
    }) 
} catch (e)
{
    console.log(e);
}
