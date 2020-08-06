//jshint esversion:8
const fetcher=require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
let subscriptionData;

exports.getMyProfile=(req,res)=>{
  const cookie=req.cookies;
  const id=cookie.leaderBoardChallengeClickedID;
  const phone=cookie.phone;
  subscriptionFetcher(phone, ()=>{
    res.render("myProfile",
    {
    name:typeof(cookie.username) === 'undefined' ? null : cookie.username,
    email:cookie.email,

    start_date:subscriptionData.susc_date,
    phone:phone,
    carrier:cookie.carrier,
    end_date:subscriptionData.end_date
    });
  });

};



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
