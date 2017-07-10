// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");
const request = require("request-promise-native");
const _ = require("lodash");
const etag = require("etag");
const format = require("date-fns/format");

admin.initializeApp(functions.config().firebase);

exports.generateAndroidData = functions.https.onRequest((req, res) => {
  start(getData).then(data => {
    res.set("Cache-Control", "public, max-age: 3600, s-maxage: 3600");
    if (req.headers["If-None-Match"] == etag(JSON.stringify(data))) {
      return res.status(304).send;
    }
    res.status(200).send(data);
  });
});

const getData = () => {
  const value = {};

  const generateHttpCall = endpoint =>
    Object.assign(
      {},
      {
        method: "GET",
        //uri: `http://localhost:5000/data/${endpoint}`,
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

const transformRoom = data => (value, key) => {
  return { id: key, name: value.title };
};

const transformSession = data => (value, key) => {
  return _(value)
    .assign({
      speakers_ids: value.speakers,
      start_timestamp: new Date(),
      end_timestamp: new Date(),
      room_id: 42
    })
    .omit(["speakers", "image"])
    .value();
};

const addSession = data => {
  _.forEach(data.schedule, jour => {
    const date = jour.date;
    _.forEach(jour.timeslots, heure => {
      const startTime = heure.startTime;
      const endTime = heure.endTime;
      const flatSlot = _.flatten(heure.sessions);
      _.forEach(flatSlot, (slot, index) => {
        const session = data.sessions.find(({ id }) => id === slot);
        session.start_timestamp = format(`${date}T${startTime}`);
        session.end_timestamp = format(`${date}T${endTime}`);
        session.room_id = index; // or the equivalent 'data.rooms[index].id'
      });
    });
  });
};

const transformSpeaker = data => (value, key) => {
  return _(value)
    .assign({
      photo_url: value.photoUrl,
      short_bio: value.shortBio,
      social_links: value.socials.map(social => ({
        network: social.name.toLowerCase(),
        url: social.link
      }))
    })
    .omit(["photoUrl", "shortBio", "socials", "badges", "featured"])
    .value();
};

const start = getData => {
  return getData()
    .then(data => {
      data.rooms = _.flatMap(data.schedule[0].tracks, transformRoom(data));
      data.sessions = _.flatMap(data.sessions, transformSession(data));
      data.speakers = _.flatMap(data.speakers, transformSpeaker(data));
      addSession(data);
      return _.omit(data, "schedule");
    })
    .then(data => Promise.resolve(data))
    .catch(err => {
      console.log("💩 AieAieAie!\n", err);
    });
};
