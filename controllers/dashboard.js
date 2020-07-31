//jshint esversion:6
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const data = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');

const url = "https://50gmk627db.execute-api.us-east-2.amazonaws.com/prod/payment/11111";
let subscriptionData;
exports.subscriptionFetcher = (req, res, next) => {
  const phone = req.cookies.phone;

  axios.get(url).then(resp => {
      console.log(resp.data + "shhsh");

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      next();
    });
};


exports.dashboard = (req, res) => {
  const cookie = req.cookies;
  const challengeData = data.dbChallengeFetcher(function(err, data) {
    if (err) {} else if (data) {
      console.log(data);
      res.cookie('dataDashboard', data, { httpOnly: true });
      res.render('dashboard', {

        name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
        data: data.Items,
        end_date: model.end_date
      });
    }
  });

};

exports.postDashboard = (req, res) => {
  currentPage = req.body.name - 1;
  res.redirect('/dashboard');
};
