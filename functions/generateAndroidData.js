const request = require("request-promise-native");
const _ = require("lodash");
const etag = require("etag");
const moment = require("moment-timezone");
const removeMd = require('remove-markdown');

module.exports = (req, res) => {
  start(getData).then(data => {
    res.set("Cache-Control", "public, max-age: 3600, s-maxage: 3600");
    if (req.headers["If-None-Match"] == etag(JSON.stringify(data))) {
      return res.status(304).send;
    }
    res.status(200).send(data);
  });
};

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
  return { id: String(key), name: value.title };
};

const transformSession = data => (value, key) => {
  const speakers = value.speakers || [];
  const description = value.description ? removeMd(value.description, { stripListLeaders: false }) : undefined
  return _(value)
    .assign({
      id: String(value.id),
      track: value.category,
      title: value.titleMobile || value.title,
      description,
      speakers_ids: speakers.map(String)
    })
    .omit(["speakers", "image", "tags", "complexity"])
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
        const session = data.sessions.find(({ id }) => id === String(slot));
        if (!session) {
          console.log(`No session found for Id: ${slot}`);
          return;
        }
        session.start_timestamp = moment
          .tz(`${date}T${startTime}`, "Europe/Paris")
          .format();
        session.end_timestamp = moment
          .tz(`${date}T${endTime}`, "Europe/Paris")
          .format();

        if (session.type === 'codelab') {
          session.room_id = '4' // special case for codelabs
        } else if (session.type !== 'break') {
          session.room_id = String(index); // or the equivalent 'data.rooms[index].id'
        }
      });
    });
  });
};

const transformSpeaker = data => (value, key) => {
  // remove markdown on bio except for speaker id 5000
  let bio
  if (value.id === 5000) {
    bio = value.bio
  } else if (value.bio) {
    bio = removeMd(value.bio, { stripListLeaders: false })
  }
  return _(value)
    .assign({
      id: String(value.id),
      photo_url: `https://devfest2017.gdgnantes.com${encodeURI(value.photoUrl)}`,
      bio,
      social_links: value.socials.map(social => ({
        network: social.name.toLowerCase(),
        url: social.link
      }))
    })
    .omit(["photoUrl", "shortBio", "socials", "badges", "featured", "companyLogo"])
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
