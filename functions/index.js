// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const request = require("request-promise-native");
const _ = require("lodash");
const etag = require("etag");

admin.initializeApp(functions.config().firebase);

exports.generateAndroidData = functions.https.onRequest(async (req, res) => {
  res.set('Cache-Control', 'public, max-age: 3600, s-maxage: 3600')
  const data = await start(getData)
  if(req.headers['If-None-Match'] == etag(JSON.stringify(data))) {
    return res.status(304).send
  }
  res.status(200).send(data)
});

const getData = () => {
  const value = {};

  const generateHttpCall = (endpoint) =>
    Object.assign(
      {},
      {
        method: "GET",
        uri: `https://devfest2017.gdgnantes.com/data/${endpoint}`,
        json: true,
        resolveWithFullResponse: false
      }
    );

  return request(generateHttpCall("sessions.json"))
    .then(data => Object.assign(value, { sessions: data }))
    .then(() => request(generateHttpCall("schedule.json")))
    .then(data => Object.assign(value, { schedule: data }))
    .then(() => request(generateHttpCall("speakers.json")))
    .then(data => Object.assign(value, { speakers: data }))
    .then(data => Promise.resolve(value))
    .catch(err => {
      console.log("💩 AieAieAie!\n", err);
    });
};

const transform = data => (value, key) => {
  //console.log(`👷 `, key)
  //console.log('📢 ', value)
  return Object.assign(value, {
    test: "ben",
  });
}

const start = getData => {
  return getData()
    .then(data => {
      data.sessions = _.flatMap(data.sessions, transform(data))

      return data})
    .then(data => Promise.resolve(data))
    .catch(err => {
      console.log("💩 AieAieAie!\n", err);
    });
};
