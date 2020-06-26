var firebaseAdmin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://devbook-61217.firebaseio.com"
  });


module.exports = firebaseAdmin