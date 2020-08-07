//jshint esversion:6
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const data = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');
const dotenv = require('dotenv');
dotenv.config();

let subscriptionData;
const subscriptionFetcher = (phone, callback) => {
  const url = process.env.fetch_userData+"11111";
  axios.get(url).then(resp => {

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      callback();
    });
};


exports.dashboard = (req, res) => {
  const cookie = req.cookies;
  const phone=cookie.phone;
  const challengeData = data.dbChallengeFetcher(function(err, dataFetched) {
    if (err) {} else if (phone, dataFetched) {
      subscriptionFetcher(phone, ()=>{
        console.log(dataFetched.Items);
        res.cookie('dataDashboard', dataFetched, { httpOnly: true,  overwrite: true});
        res.render('dashboard', {

          name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
          data: dataFetched.Items,
          end_date: model.end_date,
          tandc: typeof(cookie.tandc) === 'undefined' ? null : cookie.tandc,
        });
      });
    }
  });
};

exports.postDashboard = (req, res) => {
  console.log(req.body);
  const id=req.body.id;
  if(id!==null && typeof(id) !== 'undefined' ){
    res.cookie('challengeIdChallengeClicked', id, {httpOnly: true, overwrite: true});
    res.redirect('/challenge');
  }
};
