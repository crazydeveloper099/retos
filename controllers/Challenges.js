//jshint esversion:6
const model = require('../models/UserModel.js');
const fetcher=require('../data/dashboard_data.js');
const moment = require('moment');
moment().format();
const fs = require("fs");
const fb=require('./firebase_admin.js');

const rootPath = require("../app.js");

const axios = require('axios');
const dotenv = require('dotenv');
const uploadFile= require('../data/upload_file.js');
const fileUpload = require('express-fileupload');
dotenv.config();

let subscriptionData;



const subscriptionFetcher = (phone, callback) => {
  const url = process.env.fetch_userData+phone;
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
    })
    .then(() => {
    });
};

exports.challenges=(req,res)=>{
  const cookie=req.cookies;
  const id=cookie.challengeIdChallengeClicked;
  const phone=cookie.phone;

  fetcher.fetchSingleChallenge(id,(err,data)=>{
    let isFull=parseInt(data.Item.spots.S.split('/')[0])/parseInt(data.Item.spots.S.split('/')[1])
    checkParticipation(data,cookie.email,(isParticipated)=>{
      console.log(data)

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
      rules:data.Item.challengeRules.S,
      challengeId:data.Item.challengeId.S,
      src:data.Item.src.S,
      isLogged:false,
      isEverSubscribed:false,
      code:false,
      data:data,
      isParticipated:isParticipated,
      usersData:typeof(data.Item.usersData)==='undefined'?null:JSON.parse(data.Item.usersData.S),
      userImgObj:typeof(data.Item.userImg)==='undefined'?null:data.Item.userImg.L,
      spots:data.Item.spots.S,
      password:'null',
      passwordTimer:data.Item.passwordTimer?data.Item.passwordTimer.S:"null",
      isFull:isFull,
      ytInstructionLink:data.Item.ytLinkParticipationInfo.S,
      ytLobbyTutorial:data.Item.ytLinkLobbyTutorial.S,
      resultTimer:data.Item.resultTimer.S,
      isEnded:data.Item.isMatchEnded.S

    });
  }
    else{
    subscriptionFetcher(phone,(dataRecieved)=>{
      if(dataRecieved===null){
          res.render("Challenge",
          {
          name:cookie.username,
          end_date:null,
          start_date:null,
          phone:null,
          carrier:null,
          prize:data.Item.challengePrize,
          challengeName:data.Item.challengeName.S,
          challengeTime:data.Item.challengeTime.S,
          challengeDescription:data.Item.challengeDescription.S,
          challengeId:data.Item.challengeId.S,
          rules:data.Item.challengeRules.S,
          src:data.Item.src.S,
          code:false,
          isLogged:true,
          isEverSubscribed:false,
          data:data,
          isParticipated:isParticipated,
          usersData:typeof(data.Item.usersData)==='undefined'?null:JSON.parse(data.Item.usersData.S),
          userImgObj:typeof(data.Item.userImg)==='undefined'?null:data.Item.userImg.L,
          spots:data.Item.spots.S,
          password:'null',
          passwordTimer:data.Item.passwordTimer?data.Item.passwordTimer.S:"null",
          isFull:isFull,
          ytInstructionLink:data.Item.ytLinkParticipationInfo.S,
          ytLobbyTutorial:data.Item.ytLinkLobbyTutorial.S,
          resultTimer:data.Item.resultTimer.S,
          isEnded:data.Item.isMatchEnded.S
          
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
          rules:data.Item.challengeRules.S,
          src:data.Item.src.S,
          code:false,
          isLogged:true,
          isEverSubscribed:true,
          data:data,
        isParticipated:isParticipated,
        usersData:typeof(data.Item.usersData)==='undefined'?null:JSON.parse(data.Item.usersData.S),
        userImgObj:typeof(data.Item.userImg)==='undefined'?null:data.Item.userImg.L,
        spots:data.Item.spots.S,
        password:isParticipated==true?data.Item.password.S:'null',
        passwordTimer:data.Item.passwordTimer?data.Item.passwordTimer.S:"null",
        isFull:isFull,
        ytInstructionLink:data.Item.ytLinkParticipationInfo.S,
        ytLobbyTutorial:data.Item.ytLinkLobbyTutorial.S,
        resultTimer:data.Item.resultTimer.S,
        isEnded:data.Item.isMatchEnded.S



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
        rules:data.Item.challengeRules.S,
        src:data.Item.src.S,
        code:true,
        isLogged:true,
        isEverSubscribed:true,
        data:data,
        isParticipated:isParticipated,
        usersData:typeof(data.Item.usersData)==='undefined'?null:JSON.parse(data.Item.usersData.S),
        userImgObj:typeof(data.Item.userImg)==='undefined'?null:data.Item.userImg.L,
        spots:data.Item.spots.S,
        password:isParticipated==true?data.Item.password.S:'null',
        passwordTimer:data.Item.passwordTimer?data.Item.passwordTimer.S:"null" ,
        isFull:isFull  ,
        ytInstructionLink:data.Item.ytLinkParticipationInfo.S,
        ytLobbyTutorial:data.Item.ytLinkLobbyTutorial.S,
        resultTimer:data.Item.resultTimer.S,
        isEnded:data.Item.isMatchEnded.S

      });
      }
    }
   });
  }
});

});
};


const checkParticipation=(data,email,callback)=>{
 if(data.Item.users && data.Item.users.L && data.Item.users.L.length>0 ){ 
  for(i=0;i<data.Item.users.L.length;i++){ 
     if(data.Item.users.L[i].S===email){ 
         callback(true);
         break;
    }
    if(i===data.Item.users.L.length-1 && data.Item.users.L[i].S!==email){
      console.log('false');
      callback(false);
    }
  }
  
}
 else{
  callback(false);
 }
}

exports.postChallenge12=(req,res)=>{

            fetcher.fetchSingleUser(req.cookies.email,(errUser,dataUser)=>{
            
                let userData={
                  "win_count":dataUser.Item.challengesWon?JSON.parse(dataUser.Item.challengesWon.S).length:'-',
                  "total_count":dataUser.Item.challenges?JSON.parse(dataUser.Item.challenges.S).length:'-',
                  "fcmToken":dataUser.Item.fcmToken.S!=''?dataUser.Item.fcmToken.S:'null',
                  "name":dataUser.Item.name.S,
                }
          
            userData=JSON.stringify(userData);
            fetcher.participate(req.cookies.email,req.cookies.challengeIdChallengeClicked,"url",req.body.data,userData,(err,data, dataChallenge)=>{
              fetcher.fetchSingleChallenge(req.cookies.challengeIdChallengeClicked,(errChallengeResp,dataChallengeResp)=>{
              
                if(dataUser.Item.challenges){

                  var jData=JSON.parse(dataUser.Item.challenges.S);
                  console.log("************************");
                  console.log(dataChallengeResp)
                  console.log("************************");

                  var chData={
                    "challengeId": dataChallenge.Item.challengeId.S,
                    "src": dataChallenge.Item.src.S,
                    "end_time": dataChallenge.Item.end_time.S,
                    "challengeTime":dataChallenge.Item.end_time.S,
                    "challengeDescription": dataChallenge.Item.challengeDescription.S,
                    "challengeRules": dataChallenge.Item.challengeRules.S,
                    "challengeName": dataChallenge.Item.challengeName.S,
                    "challengeType": dataChallenge.Item.challengeType.S,
                    "isResultPublished":false,
            
                  };
                  if(jData.length>3){ 
                    jData.splice(0,1,chData);  
                    jData=JSON.stringify(jData);
                    fetcher.updateUsersChallenges(req.cookies.email,jData,(errTask, succTask)=>{
                      if(err || errTask){
                        res.send("error");
                      }
                      else{
                        res.json({status:"success",result:dataChallengeResp.Item.password.S});
                      }
                    });  
                  }
                  else{
                    jData.push(chData);
                    jData=JSON.stringify(jData);
                    fetcher.updateUsersChallenges(req.cookies.email,jData,(errTask, succTask)=>{
                      if(err || errTask){
                        res.send({status:"error"});
                      }
                      else{
                        res.json({status:"success",result:dataChallengeResp.Item.password.S});
                      }
                    });      
                  }
                }
                else{
                  var chData=[{
                    "challengeId": dataChallenge.Item.challengeId.S,
                    "src": dataChallenge.Item.src.S,
                    "end_time": dataChallenge.Item.end_time.S,
                    "challengeTime":dataChallenge.Item.end_time.S,
                    "challengeDescription": dataChallenge.Item.challengeDescription.S,
                    "challengeRules": dataChallenge.Item.challengeRules.S,
                    "challengeName": dataChallenge.Item.challengeName.S,
                    "challengeType": dataChallenge.Item.challengeType.S,
                    "isResultPublished":false,
                   
                  }];
                  chData=JSON.stringify(chData);
                  fetcher.updateUsersChallenges(req.cookies.email,chData,(errTask, succTask)=>{
                    if(err || errTask){
                      res.send("error");
                    }
                    else{
                      res.json("success");
                    }
                  })
                }
              })
            });
            })
          }