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
const Api = require('../Api/getCategories.js');

const dotenv = require('dotenv');
dotenv.config();

let subscriptionData;
const subscriptionFetcher = (phone,res , callback) => {
  const url = process.env.fetch_userData+"11111";
  axios.get(url).then(resp => {

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;

      res.cookie('subscriptionData', subscriptionData, { httpOnly: true,  overwrite: true});
    })
    .catch(error => {
    })
    .then(() => {
      callback();
    });
};


exports.dashboard = (req, res) => {
  const cookie = req.cookies;
  const phone=cookie.phone;

data.dbChallengeFetcher(function(err, dataFetched) {
    data.getCategory((errCategory,dataCategory)=>{
    if (err || errCategory) {} else if (dataFetched && dataCategory) {

      subscriptionFetcher(phone,res, ()=>{
        const blockCheckMiddleware=()=>{
             functionFile.fetchSingleUser(req.cookies.email, (err, data)=>{
               if(err){ res.send(err);}
               else if(data){
                 res.redirect('/blockedUser');
               }
             });
        };
          res.render('dashboard', {
            name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
            data: dataFetched.Items,
            end_date: model.end_date,
            tandc: typeof(cookie.tandc) === 'undefined' ? null : cookie.tandc,
            dataCategory:dataCategory.Items
          });
        });
      }
    });
  });
};


exports.postDashboard = (req, res) => {
  const id=req.body.id;
  if(id!==null && typeof(id) !== 'undefined' ){
    res.cookie('challengeIdChallengeClicked', id, {httpOnly: true, overwrite: true});
    res.redirect('/challenge');
  }
};
