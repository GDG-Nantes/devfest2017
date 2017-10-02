// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

const generateAndroidData = require("./generateAndroidData.js");
const getTicketStats = require("./getTicketStats.js");

exports.generateAndroidData = functions.https.onRequest(generateAndroidData)
exports.getTicketStats = functions.https.onRequest(getTicketStats)

