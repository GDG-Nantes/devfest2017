const request = require("request-promise-native");
const _ = require("lodash");
const etag = require("etag");

let token
module.exports = (req, res) => {
  if(req.body.token !== "EV4LT0wibMcKp6WhoyibW511") return res.status(401).send();
  token = req.body.text
  start(getData).then(data => {
    res.status(200).send(JSON.parse(data));
  });
};

const getToken = () => token || "dmcaq5p50eegchh9ihi291ltl5";

const getData = () => {
  const value = {};

  const generateHttpCall = () =>
    Object.assign(
      {},
      {
        method: "GET",
        uri: "https://www.billetweb.fr/bo/ticket_list.php",
        qs: {
          event: "18513",
        },
        headers: {
          Cookie: `PHPSESSID=${getToken()}`
        },
        json: false,
        resolveWithFullResponse: false
      }
    );

  return request(generateHttpCall())
    .catch(err => {
      console.log("💩 AieAieAie!\n", err);
    });
};

const parseAndGetData = (data) => {
  const re = /\"ticketQuantity[\D]+([\d]+)[\s]+\/[\s]+([\d]+)/
  const elements = re.exec(data)
  //return only the captured group
  return [elements[1], elements[2]]
}

const getFunMessage = (diff) => {
  switch (true) {
    case diff >= 300:
      return "Alors c'est normal qu'il reste des places, c'est encore l'été ⛱";
    case diff >= 200:
      return "Ah bah enfin! on va p'être réussir à être soldout 😅";
    case diff >= 100:
      return "Vite vite, faut tweeter pour mettre la pression, il restera bientôt moins de 100 places 🚀"
    case diff >= 50:
      return "Prévenons les derniers sponsors & contacts, ça va partir vite ! 🚨"
    case diff > 0:
      return "Soldout ! Soldout ! 🤞"
    default:
      return "Félicitations ! 🎉🎉🎉 Qui a gagné le pari ?"
  }
}

const formatForSlackCommand = (data) => {
  const diff = Number(data[1]) - Number(data[0])

  return `{
    "response_type": "in_channel",
    "text": "Tickets achetés: ${data[0]} / ${data[1]}. Il reste ${diff} places.",
    "attachments": [
        {
            "text":"${getFunMessage(diff)}"
        }
    ]
  }`
}

const start = getData => {
  return getData()
    .then(parseAndGetData)
    .then(formatForSlackCommand)
    .then(data => Promise.resolve(data))
    .catch(err => {
      console.log("💩 AieAieAie!\n", err);
    });
};
