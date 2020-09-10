//jshint esversion:8
const fetcher = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
let subscriptionData;
  let challengesArray=[];
exports.getMyProfile = (req, res) => {
  const cookie = req.cookies;
  const id = cookie.leaderBoardChallengeClickedID;
  const phone = cookie.phone;
  subscriptionFetcher(phone, () => {
    fetcher.fetchUserChallenges(cookie.email, (userData, challengeData, err) => {
      if (err) {
        res.send("Error happened!" + err);
      } else if (userData && challengeData) {
        callback_Original(challengeData, userData)
          .then(response => {
            res.render("myProfile", {
              name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
              email: cookie.email,
              challengesParticipated:challengesArray,
              start_date: subscriptionData.susc_date,
              phone: phone,
              carrier: cookie.carrier,
              end_date: subscriptionData.end_date
            });
          })
          .catch(error => {
            res.send("Error happened!" + error);
          });

      }
    });
  });

};

function callback_Original(challengeData, userData) {
  return new Promise((resolve, reject) => {
    challengesArray = challengeData.data.data.filter(function(e, index) {
      console.log(userData.data.competition_id.includes(e.competition_id) +"==="+ e.competition_id);
      return userData.data.competition_id.includes(e.competition_id);
    });
    resolve();
  });
}

const subscriptionFetcher = (phone, callback) => {
  const url = process.env.fetch_userData + phone;
  axios.get(url).then(resp => {

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
      callback();
    })
    .catch(error => {
      console.log(error);
    });
};
