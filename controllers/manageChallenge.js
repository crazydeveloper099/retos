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
const moment = require('moment-timezone');
moment().toString();

let challengeData="";
exports.getManageScreen=(req,res)=>{
    const cookie = req.cookies;
    const isValidLogin = req.cookies.isValid;
    if (isValidLogin) {
      unitChallenge = cookie.manageChallenge;
      data.fetchVideoPresetsData((errFetching, videoPresetsData) => {
        data.fetchSingleChallenge(unitChallenge, (err, userData) => {   
          if (userData) {  
            global.challengeData=userData.Item;  
              res.render('manageChallenge', {
                name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
                unitChallenge: userData.Item,
                userDataNew: userData,
                end_date: null,
                isPasswordPublished:userData.Item.passwordTimer.S!='null'?true:false,
                videoPresetsData
            });
          } else res.send(err);
        });
      });
  } else res.redirect('/admin');    
}

exports.postManage=(req,res)=>{

  let postData=JSON.parse(req.body.jsonData);
  let challengeData1=global.challengeData;


  let tokenArr=[];
  let action="DETAILS_UPDATED"
  challengeData1.challengeName.S=postData[0];
  challengeData1.challengeTime.S=postData[1];
  challengeData1.end_time.S=postData[1];
  challengeData1.challengeDescription.S=postData[2];
  challengeData1.spots.S=postData[3];
  challengeData1.challengeRules.S=postData[4];
  challengeData1.challengePrize=postData[5];
  
  if(postData[6].length>0){
    challengeData1.password=JSON.stringify(postData[6])
    let d1 = moment(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"),'MM/DD/YYYY hh:mm:ss a').add(10, 'minutes');
    challengeData1.passwordTimer=String(d1);
    if("usersData" in challengeData1){
      for(i=0;i<JSON.parse(challengeData1.usersData.S).length;i++){
        if(JSON.parse(challengeData1.usersData.S)[i].fcmToken!=='null'){
          tokenArr.push(JSON.parse(challengeData1.usersData.S)[i].fcmToken);
        }
      }
    }
    action="PASSWORD_ANNOUNCED"
  }
  else if(challengeData1.passwordTimer.S=='null'){
      challengeData1.password='[]';
      challengeData1.passwordTimer='null';
  }
  else{
    challengeData1.passwordTimer=challengeData1.passwordTimer.S
    challengeData1.password=challengeData1.password.S
  }
  if(postData[9]==true && postData[8]!=null){
    action="MATCH_ENDED"
    challengeData1.resultTimer={S:postData[8]};
    challengeData1.isMatchEnded={S:'true'}
  }
 
  if(postData[7]!=='Choose'){ challengeData1.ytLinkLobbyTutorial={S:postData[7]}}
 
  data.updateChallenge( challengeData1,tokenArr,action,(err,resp)=>{
    if(resp){
        res.cookie('updatedChallenge', true, {
            httpOnly: true
        });
      res.redirect('/adminPanel');
    }    
  })  
}