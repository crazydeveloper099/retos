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
  const url = process.env.fetch_userData+phone;
   console.log(phone);
  axios.get(url).then(resp => {
      if(resp.data!==""){
      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
      callback(subscriptionData);
    }
    else{
      callback(null);
    }
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => {
    });
};

exports.challenges=(req,res)=>{
  const cookie=req.cookies;
  const id=cookie.challengeIdChallengeClicked;
  const phone=cookie.phone;
  console.log(id);

  fetcher.fetchSingleChallenge(id,(err,data)=>{
    console.log(data);
  if(typeof(phone)==='undefined'){
      res.render("Challenge",
      {name:cookie.username,
      end_date:null,
      start_date:null,
      phone:null,
      carrier:null,
      prize:data.Item.challengePrize,
      challengeName:data.Item.challengeName.S,
      challengeTime:data.Item.challengeTime.S,
      challengeDescription:data.Item.challengeDescription.S,
      challengeId:data.Item.challengeId.S,
      src:data.Item.src.S,
      isLogged:false,
      isEverSubscribed:null,
      code:null,
      data:data
    });
  }
    else{
    subscriptionFetcher(phone,(dataRecieved)=>{
      if(dataRecieved===null){
          res.render("Challenge",
          {name:cookie.username,
          end_date:null,
          start_date:null,
          phone:null,
          carrier:null,
          prize:data.Item.challengePrize,
          challengeName:data.Item.challengeName.S,
          challengeTime:data.Item.challengeTime.S,
          challengeDescription:data.Item.challengeDescription.S,
          challengeId:data.Item.challengeId.S,
          src:data.Item.src.S,
          code:null,
          isLogged:true,
          isEverSubscribed:false,
          data:data
        });
      }
      else{
        if(moment().isAfter(model.end_date)){
          res.render("Challenge",
          {name:cookie.username,
          end_date:subscriptionData.end_date.S,
          start_date:subscriptionData.susc_date.S,
          phone:cookie.phone,
          carrier:subscriptionData.carrier.S,
          prize:data.Item.challengePrize,
          challengeName:data.Item.challengeName.S,
          challengeTime:data.Item.challengeTime.S,
          challengeDescription:data.Item.challengeDescription.S,
          challengeId:data.Item.challengeId.S,
          src:data.Item.src.S,
          code:null,
          isLogged:true,
          isEverSubscribed:true,
          data:data
        });
        }
        else{
        res.render("Challenge",
        {name:cookie.username,
        end_date:subscriptionData.end_date.S,
        start_date:subscriptionData.susc_date.S,
        phone:cookie.phone,
        carrier:subscriptionData.carrier.S,
        prize:data.Item.challengePrize,
        challengeName:data.Item.challengeName.S,
        challengeTime:data.Item.challengeTime.S,
        challengeDescription:data.Item.challengeDescription.S,
        challengeId:data.Item.challengeId.S,
        src:data.Item.src.S,
        code:"",
        isLogged:true,
        isEverSubscribed:true,
        data:data
      });
      }
    }
   });
  }
});
};
