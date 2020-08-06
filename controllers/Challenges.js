//jshint esversion:6
const model = require('../models/UserModel.js');
const fetcher=require('../data/dashboard_data.js');
const moment = require('moment');
moment().format();
const axios = require('axios');
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

exports.challenges=(req,res)=>{
  const cookie=req.cookies;
  console.log(cookie);
  const id=cookie.challengeIdChallengeClicked;
  fetcher.fetchSingleChallenge(id,(err,data)=>{
    subscriptionFetcher(cookie.phone,()=>{
      //model.end_date replace here
      console.log(subscriptionData.end_date.S);
      if(moment().isAfter('2020-08-11T01:14:00Z')){
        res.render("Challenge",
        {name:cookie.username,
        end_date:subscriptionData.end_date.S,
        start_date:subscriptionData.susc_date.S,
        phone:cookie.phone,
        carrier:subscriptionData.carrier.S,
        prize:data.Item.challengePrize.S,
        challengeName:data.Item.challengeName.S,
        challengeTime:data.Item.challengeTime.S,
        challengeDescription:data.Item.challengeDescription.S,
        challengeId:data.Item.challengeId.S,
        src:data.Item.src.S,
        code:null,
      });
      }
      else{
        res.render("Challenge",
        {name:cookie.username,
        end_date:subscriptionData.end_date.S,
        start_date:subscriptionData.susc_date.S,
        phone:cookie.phone,
        carrier:subscriptionData.carrier.S,
        prize:data.Item.challengePrize.S,
        challengeName:data.Item.challengeName.S,
        challengeTime:data.Item.challengeTime.S,
        challengeDescription:data.Item.challengeDescription.S,
        challengeId:data.Item.challengeId.S,
        src:data.Item.src.S,
        code:data.Item.challengeCode.S
      });
      }
    });
});

};
