//jshint esversion:6
const model = require('../models/UserModel.js');
const fetcher=require('../data/dashboard_data.js');
const moment = require('moment');
moment().format();
const fs = require("fs");
const fb=require('./firebase_admin.js');

let io = require("../app.js");
io=io.io;
const axios = require('axios');
const dotenv = require('dotenv');
const uploadFile= require('../data/upload_file.js');
const fileUpload = require('express-fileupload');
dotenv.config();

const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const  url  =  process.env.mongoURL;
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });
const Schema = mongoose.Schema;
const moment_tz = require('moment-timezone');
moment_tz().toString();
const chatSchema = new Schema({
    message: {type: String},
    sender: {type: String},
    timeStamp:{type:String},
    automatedRes:{type:String}
  },
  {timestamps: true});

  const blockUserSchema = new Schema({
    sender: {type: String}
  },
  {timestamps: true});

let subscriptionData;

const subscriptionFetcher = (phone, callback) => {

  const url = process.env.fetch_userData+phone;
  axios.get(url).then(resp => {
    console.log(resp);
      if(resp.data!=''){
      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
      return callback(subscriptionData);
    }
    else{
      return callback(null);
    }
    })
    .catch(error => {
      console.log(error);
      return;
    });
};

exports.challenges=(req,res)=>{

  const cookie=req.cookies;
  // const id=cookie.challengeIdChallengeClicked;
  const id=req.query.id;

  const phone=cookie.phone;

  fetcher.fetchSingleChallenge(id,(err,data)=>{
    let isFull=parseInt(data.Item.spots.S.split('/')[0])/parseInt(data.Item.spots.S.split('/')[1])
    checkParticipation(data,cookie.email,(isParticipated)=>{
      fetcher.fetchUnitResult(data.Item.challengeId.S,(resultData)=>{
  if(typeof(phone)==='undefined'){
      res.render("Challenge",
      {
      name:cookie.email,
      end_date:null,
      start_date:null,
      phone:null,
      carrier:null,
      challengeId:data.Item.challengeId.S,
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
      isEnded:data.Item.isMatchEnded.S,
      resultData:Object.keys(resultData).length === 0?'null':resultData,
      isAdmin:cookie.username==='RG Admin'?true:false,
      isChallengeHeader:true
    });
  }
    else{
    subscriptionFetcher(phone,(dataRecieved)=>{
      console.log(dataRecieved);

      if(dataRecieved===null){
          res.render("Challenge",
          {
          name:cookie.email,
          end_date:null,
          start_date:null,
          phone:null,
          carrier:null,
          challengeId:data.Item.challengeId.S,
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
          isEnded:data.Item.isMatchEnded.S,
          resultData:Object.keys(resultData).length === 0?'null':resultData
          ,isAdmin:cookie.username==='RG Admin'?true:false,
          isChallengeHeader:true
               });
      }
      else{
        if(moment().isAfter(model.end_date)){
          res.render("Challenge",
          {name:cookie.email,
          end_date:subscriptionData.end_date.S,
          start_date:subscriptionData.susc_date.S,
          phone:cookie.phone,
          carrier:subscriptionData.carrier.S,
          challengeId:data.Item.challengeId.S,
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
        isEnded:data.Item.isMatchEnded.S,
        resultData:Object.keys(resultData).length === 0?'null':resultData
        ,isAdmin:cookie.username==='RG Admin'?true:false,
        isChallengeHeader:true

        });
        }
        else{
        res.render("Challenge",
        {name:cookie.email,
        end_date:subscriptionData.end_date.S,
        start_date:subscriptionData.susc_date.S,
        phone:cookie.phone,
        carrier:subscriptionData.carrier.S,
        challengeId:data.Item.challengeId.S,
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
        isEnded:data.Item.isMatchEnded.S,
        resultData:Object.keys(resultData).length === 0?'null':resultData
        ,isAdmin:cookie.username==='RG Admin'?true:false,
        isChallengeHeader:true
           });
      }
    }
   });
  }
});
})

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

              let total_participated=typeof(dataUser.Item.total_participated)==='undefined'?'0' :dataUser.Item.total_participated.S
              let total_challenges_won=typeof(dataUser.Item.total_challenges_won) === 'undefined'?'0':dataUser.Item.total_challenges_won.S;

                let userData={
                  "win_count":total_challenges_won==='0'?'-':total_challenges_won,
                  "total_count":total_participated==='0'?'-':total_participated,
                  "fcmToken":dataUser.Item.fcmToken.S!=''?dataUser.Item.fcmToken.S:'null',
                  "name":dataUser.Item.name.S,
                }
            userData=JSON.stringify(userData);
            fetcher.checkParticipation(req.body.data[1],req.cookies.email,req.body.data[0],(isParticipated,spots)=>{
              if(isParticipated || req.body.data[0]==='admin'){
                return res.json({status:"PARTICIPATED",result:null});
              }
              else if(spots!=null && parseInt(spots.split('/')[0])===parseInt(spots.split('/')[1])){
                return res.json({status:"SPOTS_FULL",result:null});
              }
              else{
                fetcher.participate(req.cookies.email,req.body.data[1],"url",req.body.data[0],userData,(err,data, dataChallenge)=>{
               
                  fetcher.fetchSingleChallenge(req.body.data[1],(errChallengeResp,dataChallengeResp)=>{
    
                    if(dataUser.Item.challenges){
    
                      var jData=JSON.parse(dataUser.Item.challenges.S);
                    
    
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
                        fetcher.updateUsersChallenges(req.cookies.email,jData,total_participated,(errTask, succTask)=>{

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
                        fetcher.updateUsersChallenges(req.cookies.email,jData,total_participated,(errTask, succTask)=>{

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
                      fetcher.updateUsersChallenges(req.cookies.email,chData,total_participated,(errTask, succTask)=>{

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
              }
            })
      })
}

exports.loadChat=(req, res) =>  {
  let roomID=req.body.ID
  roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID
  let Chat = mongoose.model(roomID, chatSchema);
  res.setHeader("Content-Type", "application/json");
  res.statusCode  =  200;
  connect.then(db  =>  {
      Chat.find({}).then(chat  =>  {
      res.send(chat);
  });
});
};

exports.checkIfBlocked=async(req,res)=>{
  let roomID=req.body.ID
  roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID

  let BlockedUserDB = mongoose.model(roomID+"_blocked", blockUserSchema);
  res.setHeader("Content-Type", "application/json");
  res.statusCode  =  200;
  res.send(await BlockedUserDB.exists({ sender: req.body.userName }));
}

exports.socketFunctions=(socket)=>{
   //each socket is unique to each client that connects:
   console.log("socket.id--------Server: " + socket.id);

   //let the clients know how many online users are there:
 
   socket.on('username', function (username_from_client) {
     socket.username = username_from_client;
 
     //let all users know that this user has connected:
     io.emit('userConnected', socket.username);
   });
 
   //handle adding a message to the chat.
   socket.on('addChatMessage(client->server)', function (msgObj) {
     msgObj=JSON.parse(msgObj)
     let roomID=msgObj.ID
     roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID
     let automatedRes=null;
     if('automatedRes' in msgObj){
      automatedRes=msgObj.automatedRes;
     }
     let Chat = mongoose.model(roomID, chatSchema);
     var message=prepareMessageToClients(socket, msgObj.msg)
     let automated_response=prepareAutomatedResponseToClients( automatedRes)
     connect.then(db  =>  {
      new Chat({ message, 
                sender: socket.username, 
                timeStamp:new Date (moment_tz.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")),
                automatedRes:automated_response
    }).save((err, doc)=> {
        if (err) return console.error(err);
        else io.emit('addChatMessage(server->clients)', [socket.username, message,msgObj.ID,automated_response]);
      });     
   });
  });
 
  socket.on('blockUser(client->server)', function (blockUserObj) {
    blockUserObj=JSON.parse(blockUserObj)
    let roomID=blockUserObj.ID
    roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID

    let BlockedUserDB = mongoose.model(roomID+"_blocked", blockUserSchema);
    connect.then(db  =>  {
     new BlockedUserDB({ sender: blockUserObj.userName}).save((err, doc)=> {
       if (err) io.emit('blockUser(server->clients)', ['failure',blockUserObj.userName]);
       else io.emit('blockUser(server->clients)', ['success',blockUserObj.userName]);
     });     
  });
 });
 
   //handle isTyping feature
   //istyping - key down
   socket.on('userIsTypingKeyDown(client->server)', function (challengeId) {
     io.emit('userIsTypingKeyDown(server->clients)', [socket.username, prepareIsTypingToClients(socket),challengeId]);
   });
   //istyping - key up
   socket.on('userIsTypingKeyUp(client->server)', function (challengeId) {
     io.emit('userIsTypingKeyUp(server->clients)', [socket.username,challengeId]);
   });
 
   socket.on('disconnect', function () {
     io.emit('userDisconnected', socket.username);
     console.log('disconnected...');
   });
}



function getParsedTime() {
  
  const date = new Date (moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"));
  let hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  let min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  return (hour + ":" + min);
}

// Prepare the message that will be sent to all of the clients
function prepareMessageToClients(socket, msg) {
  return ('<li id="subMessage"> <strong>' +socket.username + ' </strong> <div  class="subMessageBody" > at ' + getParsedTime()  + '<div/> <br/>' + msg + '</li>');
}

function prepareAutomatedResponseToClients(msg) {
  if(msg===null) return null;
  else return ('<li id="subMessage"> <strong>Admin </strong> <div class="subMessageBody" > at ' + getParsedTime()  + '<div/> <br/>' + msg + '</li>');
}

//prepare the '___ is typing...' message
function prepareIsTypingToClients(socket) {
  return ('<li><strong>' + socket.username + '</strong> is typing...</li>')
}