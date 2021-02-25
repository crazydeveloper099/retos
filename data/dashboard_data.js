//jshint esversion:8
const AWS = require("aws-sdk");
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');dotenv.config();
const delay = require('delay');
const { split } = require("lodash");
const nodemailer = require('nodemailer');
let awsConfig = {
  "region": process.env.region,
  "endpoint": "http://dynamodb.us-east-2.amazonaws.com",
  "accessKeyId": process.env.accessKeyId,
  "secretAccessKey": process.env.secretAccessKey
};
//AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
let db = new AWS.DynamoDB();
const firebaseFile=require('../controllers/firebase_admin');
const table = "challenges";

//mongoDB
const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const  url  =  process.env.mongoURL;

const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });
const Schema = mongoose.Schema;
const moment_tz = require('moment-timezone');
moment_tz().toString();
const transactionSchema = new Schema({
    email: {type: String},
    timeStamp:{type:String},
    value:{type:String},
    status:{type:String},
    action:{type:String},
    transactionID:{type:String},
  },
  {timestamps: true});

const withdrawRequestSchema = new Schema({
    email: {type: String},
    name: {type: String},
    amount:{type:String},
    colID:{type:String},
    city:{type:String},
    dayName:{type:String},
    dateNumber:{type:String},
    month:{type:String},
    year:{type:String},
    phone:{type:String},
    newestChallengeDate:{type:String},
    status:{type:String},
    associatedTxnID:{type:String},

  },
  {timestamps: true});  


exports.createChallenge = (id, image, end_time, description, rules, challengeName, prize, type, spots, minLevel, createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,challengeBase,callback) => {
  const params = {
    TableName: table,
    Item: {
      "challengeId": id,
      "src": image,
      end_time,
      "challengeTime":end_time,
      "challengeDescription": description,
      "challengeRules": rules,
      challengeName,
      "challengePrize": prize,
      "challengeType": type,
      "spots": "0/"+spots,
      minLevel,
      "isResultPublished":false,
      "password":'null',
      "passwordTimer":'null',
      createdAt,
      ytLinkParticipationInfo,
      ytLinkLobbyTutorial:'null',
      resultTimer:'null',
      isMatchEnded:'null',
      challengeBase
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.createResult = (id, resultData, unitChallenge, url,callback) => {
  let createdAt=new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const params = {

    TableName: "results",
    Item: {
      "challengeId": id,
      "url":url,
      "resultData": resultData,
      "unitChallenge": unitChallenge,
      createdAt
    }
  };
  
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.fetchResult = (callback) => {
  const params = {
    TableName: "results",
    ProjectionExpression: "challengeId, resultData, unitChallenge, createdAt"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};
exports.dbChallengeFetcher = (callback) => {
  const params = {
    TableName: "challenges",
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeDescription, challengeRules,isResultPublished, spots, minLevel, createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded,passwordTimer,challengeBase"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.challengeFetcher = (callback) =>{
  const params = {
    TableName: "challenges",
    ProjectionExpression: "challengeId, category, challengeDescription, challengeName, challengePrize, challengeRules, src, challengeType, end_time, start_time,isResultPublished,  createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded,passwordTimer,challengeBase"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, null);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(null, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.deleteChallenge = (tableName, challengeId, callback) => {
  console.log(typeof challengeId);
  var fileItem = {
    Key: {
      challengeId: challengeId,
    },
    TableName: tableName,
  };

  console.log("Attempting a conditional delete...");
  docClient.delete(fileItem, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.getUsers = (id, callback) => {
  axios.get(url).then(resp => {
      callback(resp.data, null);
    })
    .catch(error => {
      callback(null, error);
      console.log(null, error);
    }).then(() => {
  });
};

exports.fetchUnitResult = (id, callback) => {
  console.log(id);
  var params = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: 'results'
  };
  var paramsUnitChallenge = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: 'challenges'
  };
  db.getItem(params, function(errResult, dataResult) {
    if (dataResult) {
      callback(dataResult);
    }
    else{
      callback('error');
    }
  });
};

exports.fetchSingleChallenge = (id, callback) => {
  var paramsUnitChallenge = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: 'challenges'
  };
  db.getItem(paramsUnitChallenge, function(errChallenge, dataChallenge) {
    callback(errChallenge, dataChallenge);
  });
};

exports.createCategory = (categoryName, callback) => {
  const params = {

    TableName: "Categories",
    Item: {
      "categoryId": categoryName
    }
  };


  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};


// const createCategoryTable=(tableName,callback)=>{
//   var params = {
//      TableName : tableName,
//      KeySchema: [
//      { AttributeName: "challengeId", KeyType: "HASH"}
//  ],
//  AttributeDefinitions: [
//      { AttributeName: "challengeId", AttributeType: "S" }
//  ],
//  ProvisionedThroughput: {
//      ReadCapacityUnits: 5,
//      WriteCapacityUnits: 5
// }
// };
// db.createTable(params, (err,data)=>{
//   callback(err,data);
// });
// };





exports.getCategory = (callback) => {
  const params = {
    TableName: "Categories",
    ProjectionExpression: "categoryId"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.fetchCategoriesData = (table, callback) => {
  const params = {
    TableName: table,
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeCode, challengeDescription, challengeRules"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.fetchUserChallenges = (email, callback) => {
  let arr = [];
  const urlChallenges = "https://sweepwidget.com/sw_api/giveaways.php?api_key=" + process.env.SWEEP_API_KEY + "&type=expired&page_start=1";
  const urlUserChallenges = "https://sweepwidget.com/sw_api/user-entered-giveaways?api_key=" + process.env.SWEEP_API_KEY + "&user_email=" + "dcdv@dd.com" + "&search_key=user_email";
  axios.get(urlChallenges).then(challengeData => {
      axios.get(urlUserChallenges).then(userData => {
          callback(userData, challengeData, null);
        })
        .catch(error => {
          callback(null, null, error);
        });
    })
    .catch(error => {
      callback(null, null, error);
    });

};


exports.scanSubscriptionTable = (callback) => {
  const params = {
    TableName: "claroTable",
    ProjectionExpression: "msisdn, carrier, end_date, service, susc_date"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};


exports.writeUser = (email, name, phone, isBlocked,token, callback) => {  
  const params = {
    TableName: "users",
    Item: {
      "email": email,
      "isBlocked": isBlocked,
      "fcmToken":token,
      "phone":phone,
      "name":name,
      "wallet_amount":'0',
      "total_participated":'0',
      "total_challenges_won":'0',
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.scanUserTable = (callback) => {
  const params = {
    TableName: "users",
    ProjectionExpression: "email,phone,isBlocked,user_name"
  };
  docClient.scan(params, (err, data) => {
    console.log(data);

    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.userConsoleOperation = (email, isBlocked, callback) => {
  const params = {

    TableName: "users",
    Item: {
      "email": String(email),
      "isBlocked": isBlocked
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};
exports.batchWriteItem = (array, callback) => {


  var params = {
    RequestItems: {
      "users": array
    }
  };

  db.batchWriteItem(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      callback(err, data);
    } else {
      console.log("Success", data);
      callback(err, data);
    }
  });
};

exports.fetchSingleUser = (email, callback) => {
  const params = {
    Key: {
      "email": {
        S: email
      },
    },
    TableName: 'users'
  };
  db.getItem(params, function(errUser, dataUser) {
    callback(errUser, dataUser);
  });
};


exports.getPosterData=(callback)=>{
  const params = {
    TableName: "challenge_banner",
    ProjectionExpression: "id, image_url"
  };
  docClient.scan(params, (err, data) => {
    console.log(data);
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
}

exports.putPosterData=(id,url, callback)=>{
  const params = {

    TableName: "challenge_banner",
    Item: {
      "id": id,
      "image_url":url
    }
  };
  docClient.put(params, function(err, data) {
    callback(err,data);
  });
};
exports.deletePoster = (id, callback) => {
  var fileItem = {
    Key: {
      id: id,
    },
    TableName: "challenge_banner",
  };

  docClient.delete(fileItem, function(err, data) {
    callback(err,data);
  });
};

exports.participate=(email,id,url,score,userData,callback)=>{
  var paramsUnitChallenge = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: 'challenges'
  };
  db.getItem(paramsUnitChallenge, function(errChallenge, dataChallenge) {
    let arr=[];
    let arrImg=[];
    let userDataArr=[];
    let spots=String(parseInt(dataChallenge.Item.spots.S.split('/')[0])+1)+"/"+dataChallenge.Item.spots.S.split('/')[1];
    if(!dataChallenge.Item.users || dataChallenge.Item.users.L.length===0){
      arr.push(email);
    }
    else{
      for(var i=0;i<=dataChallenge.Item.users.L.length-1;i++){
            arr.push(dataChallenge.Item.users.L[i].S);      
      }
      arr.push(email);
    }
    if(!dataChallenge.Item.userImg || dataChallenge.Item.userImg.L.length===0){
      let obj={"email":email, "url":url, "score":score};
      arrImg.push(obj);
    }
    else{
      for(var i=0;i<=dataChallenge.Item.userImg.L.length-1;i++){
            var obj={"email":dataChallenge.Item.userImg.L[i].M.email.S,
                      "url":dataChallenge.Item.userImg.L[i].M.url.S,
                      "score":dataChallenge.Item.userImg.L[i].M.score.S,}
            arrImg.push(obj);      
      }
      let obj1={"email":email, "url":url, "score":score};
      arrImg.push(obj1);
    }
   
    if(!dataChallenge.Item.usersData || dataChallenge.Item.usersData.S===""){
      userDataArr.push(JSON.parse(userData));
    }
    else{
      userDataArr=JSON.parse(dataChallenge.Item.usersData.S);
      userDataArr.push(JSON.parse(userData));
    }
    var prize_arr=[];
    for(var i=0;i<dataChallenge.Item.challengePrize.L.length;i++){
      prize_arr.push(dataChallenge.Item.challengePrize.L[i].S);
    }

      const params = {
      TableName: "challenges",
      Item: {
        "challengeId": dataChallenge.Item.challengeId.S,
        "users":arr,
        "src": dataChallenge.Item.src.S,
        "end_time": dataChallenge.Item.end_time.S,
        "challengeTime":dataChallenge.Item.end_time.S,
        "challengeDescription": dataChallenge.Item.challengeDescription.S,
        "challengeRules": dataChallenge.Item.challengeRules.S,
        "challengeName": dataChallenge.Item.challengeName.S,
        "challengeType": dataChallenge.Item.challengeType.S,
        "isResultPublished":false,
        "challengePrize": prize_arr,
        "userImg":arrImg,
        "spots":spots,
        "usersData":JSON.stringify(userDataArr),
        "password":dataChallenge.Item.password.S,
        "passwordTimer":dataChallenge.Item.passwordTimer.S,
        "createdAt":dataChallenge.Item.createdAt.S,
        "ytLinkParticipationInfo":dataChallenge.Item.ytLinkParticipationInfo.S,
        "ytLinkLobbyTutorial":dataChallenge.Item.ytLinkLobbyTutorial.S,
        'resultTimer':dataChallenge.Item.resultTimer.S,
        'isMatchEnded':dataChallenge.Item.isMatchEnded.S,
        'challengeBase':dataChallenge.Item.challengeBase.S
      }
    }
   
    docClient.put(params, function(err, data) {
      if (err) {
        callback(err, data);
      } else {
        callback(err, data,dataChallenge);
      }
    });
  });
};

exports.updateResultPublished=(id,boolVal, callback)=>{
  var table = "challenges";



// Update the item, unconditionally,

var params = {
    TableName:table,
    Key:{
        "challengeId": id,
    },
    UpdateExpression: "set isResultPublished = :r",
    ExpressionAttributeValues:{
        ":r":boolVal,
    },
    ReturnValues:"UPDATED_NEW"
};

docClient.update(params, function(err, data) {
   callback(err,data);
});

}


exports.updateUsersChallenges=(email,challenges, total_participated,callback)=>{
var table = "users";
var params = {
    TableName:table,
    Key:{
        "email": email,
    },
    UpdateExpression: "set challenges = :c, total_participated= :tp",
    ExpressionAttributeValues:{
        ":c":challenges,
        ":tp":(parseInt(total_participated)+1).toString(),
    },
    ReturnValues:"UPDATED_NEW"
};
docClient.update(params, function(err, data) {
   callback(err,data);
});
}

exports.updateUsersChallengesWon=(email,challengesWon,wallet_amount,differenceAmount, total_challenges_won,callback)=>{
  var table = "users";
  var params = {
      TableName:table,
      Key:{
          "email": email,
      },
      UpdateExpression: "set challengesWon = :cw, wallet_amount= :wa, total_challenges_won = :tcw ",
      ExpressionAttributeValues:{
          ":cw":challengesWon,
          ":wa":wallet_amount,
          ":tcw":(parseInt(total_challenges_won)+1).toString()
      },
      ReturnValues:"UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    if(data ){
      if(parseInt(differenceAmount)>0){
        let Transaction = mongoose.model('userWalletTransactions', transactionSchema);
        connect.then(db  =>  {
          new Transaction({ email, 
                            value:'+'+differenceAmount,
                            status:'successful',
                            timeStamp:new Date (moment_tz.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")),
                            action:'acreditado',
                            transactionID:'#'+(Math.floor(Math.random() * 1000000000)).toString(),
        }).save((err, doc)=> {
            if (err) callback(err,null);
            else callback(null,data);
          });     
       });
      }
      else{
        callback(null,data);
      }
    }
    else{
      callback(err,null);
    }
  });
}
  exports.updateChallenge=(dataChallenge,tokenArr,action,callback)=>{
    var paramsUnitChallenge = {
      Key: {
        "challengeId": {
          S: dataChallenge.challengeId.S
        },
      },
      TableName: 'challenges'
    };
    db.getItem(paramsUnitChallenge, function(errChallenge, dataChallengeGet) {
      let arrImg=[];
      if(dataChallenge.userImg && dataChallenge.userImg.L.length!=0){

      for(var i=0;i<=dataChallenge.userImg.L.length-1;i++){
              var obj={"email":dataChallenge.userImg.L[i].M.email.S,
                        "url":dataChallenge.userImg.L[i].M.url.S,
                        "score":dataChallenge.userImg.L[i].M.score.S,}
              arrImg.push(obj);      
        }
      }
      let arr=[];
        if(dataChallenge.users && dataChallenge.users.L.length!=0){
          for(var i=0;i<=dataChallenge.users.L.length-1;i++){
            arr.push(dataChallenge.users.L[i].S);      
          } 
        }
        let userDataArr=[];
        if(dataChallenge.usersData && dataChallenge.usersData.S!=""){
          userDataArr=JSON.parse(dataChallenge.usersData.S);
        }
        
        const params = {
        TableName: "challenges",
        Item: {
          "challengeId": dataChallenge.challengeId.S,
          "users":arr,
          "src": dataChallenge.src.S,
          "end_time": dataChallenge.end_time.S,
          "challengeTime":dataChallenge.end_time.S,
          "challengeDescription": dataChallenge.challengeDescription.S,
          "challengeRules": dataChallenge.challengeRules.S,
          "challengeName": dataChallenge.challengeName.S,
          "challengeType": dataChallenge.challengeType.S,
          "isResultPublished":false,
          "challengePrize": dataChallenge.challengePrize,
          "userImg":arrImg,
          "spots":dataChallenge.spots.S,
          "usersData":JSON.stringify(userDataArr),
          "password":dataChallenge.password=='[]'?'null':dataChallenge.password,
          "passwordTimer":dataChallenge.passwordTimer,
          "createdAt":dataChallenge.createdAt.S,
          "ytLinkParticipationInfo":dataChallenge.ytLinkParticipationInfo.S,
          "ytLinkLobbyTutorial":dataChallenge.ytLinkLobbyTutorial.S,
          'resultTimer':dataChallenge.resultTimer.S,
          'isMatchEnded':dataChallenge.isMatchEnded.S,
          'challengeBase':dataChallenge.challengeBase.S
        }
      }
      docClient.put(params, function(err, data) {
        if (err) {
          callback(err, data);
        } else {

        firebaseFile.challengeNotification(action,dataChallenge.resultTimer,dataChallenge.challengeId.S,dataChallenge.challengeName.S,(resp,err)=>{
          if(err){
            console.log(resp);
          }
        })
        callback(err, data);

        }
      });
  });
};

exports.checkParticipation=(challengeId,email,userName,callback)=>{
  var paramsUnitChallenge = {
    Key: {
      "challengeId": {
        S: challengeId
      },
    },
    TableName: 'challenges'
  };
  db.getItem(paramsUnitChallenge, (errFetching, response)=> {
    if(errFetching){
      return callback(null,null)
    }
    else{
      if("users" in (response.Item) && "userImg" in (response.Item) && response.Item.users.L.length>0 && response.Item.userImg.L.length>0){
        for(i=0; i<response.Item.users.L.length;i++ ){
          if(i<response.Item.users.L.length-1 && email===response.Item.users.L[i].S || response.Item.userImg.L[i].M.score.S.trim().toUpperCase()===userName.toUpperCase()){
            return callback(true,response.Item.spots.S)
          }
          else if(i===response.Item.users.L.length-1 ){
            if(email!==response.Item.users.L[i].S && response.Item.userImg.L[i].M.score.S.trim().toUpperCase()!==userName.toUpperCase()){
              return callback(false,response.Item.spots.S)
            }
            else{
              return callback(true,response.Item.spots.S)
            }
          }
        }
      }
      else{
        return callback(false,response.Item.spots.S)
      }
    }
  });
}

exports.fetchVideoPresetsData = ( callback) => {
  const params = {
    TableName: 'tutorial_presets',
    ProjectionExpression: "video_id,iframeCode"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};
exports.updateUserFBToken=(email, token, callback)=>{
  var table = "users";
  var params = {
      TableName:table,
      Key:{
          "email": email,
      },
      UpdateExpression: "set fcmToken = :tk",
      ExpressionAttributeValues:{
          ":tk":token,
      },
      ReturnValues:"UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    console.log(err);
    console.log(data);
    callback();
  });
}




exports.createWithdrawRequest=(payload,callback)=>{
  
    var table = "users";
  
  var params = {
      TableName:table,
      Key:{
          "email": payload.email,
      },
      UpdateExpression: "set wallet_amount = :wa",
      ExpressionAttributeValues:{
          ":wa":(parseInt(payload.oldWalletAmt)-parseInt(payload.amount)).toString(),
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  docClient.update(params, function(err, data) {
    if (err) callback(null);
    else{
      let WithdrawRequest = mongoose.model('withdrawRequests', withdrawRequestSchema);
      let transcationID='#'+(Math.floor(Math.random() * 1000000000)).toString();
      connect.then(db  =>  {
        new WithdrawRequest({
          email:payload.email,
          name: payload.name ,
          amount:payload.amount,
          colID:payload.colID,
          city:payload.city,
          dayName:payload.dayName,
          dateNumber:payload.dateNumber,
          month:payload.month,
          year: payload.year,
          phone:payload.phone,
          newestChallengeDate:payload.newestChallengeDate,
          status:'pending',
          associatedTxnID:transcationID   
          }).save((err, doc)=> {
            if (err) callback(null);
            else {
              let Transaction = mongoose.model('userWalletTransactions', transactionSchema);
              connect.then(db  =>  {
              new Transaction({ email:payload.email, 
                          value:'-'+payload.amount,
                          status:'pending',
                          timeStamp:payload.timeStamp,
                          action:'debit',
                          transactionID:transcationID,
              }).save((err, doc)=> {
                callback(transcationID)
              });     
          });
          }
        });     
      });


    }
  });
}

exports.getWithdrawalRequests=(callback)=>{

  let WithdrawRequest = mongoose.model('withdrawrequests', withdrawRequestSchema);
  connect.then(db  =>  {
    WithdrawRequest.find({status:"pending"}).then(WithdrawRequests  =>  {
      console.log(WithdrawRequests);
      callback(WithdrawRequests)
    });
  });
}

exports.updateMultipleWithdrawalReq=(idArr, emailArr,callback)=>{
  let WithdrawRequest = mongoose.model('withdrawRequests', withdrawRequestSchema);
  let Transaction = mongoose.model('userWalletTransactions', transactionSchema);
  Transaction.updateMany({transactionID: {$in: idArr}}, {$set: {status:'successful'}},  
  async(errUpdate, result)=> {
    if (errUpdate) callback(errUpdate); 
    else {
      await WithdrawRequest.deleteMany({ associatedTxnID: { $in: idArr}}, async (errDelete)=> {
        if(errDelete) callback(errDelete);
        else{
          sendStatusSuccMail(emailArr,()=>{
            callback(null);
          });
        } 
      })
    }
  });
}




const sendStatusSuccMail=(emailArr, cb)=>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'retos.test'
    }
  });

let promises = [];
for (let i = 0; i < emailArr.length; i++) {

  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: emailArr[i].email,
    subject: 'Tu retiro en Retosgamer ha sido completado',
    text: 'We are happy to inform that your withdrawal request is completed agains your transaction id '+
          emailArr[i].txnID+
          ' for amount '+emailArr[i].amt+' is successful.'
  };

    promises.push(new Promise(function(resolve, reject) {
      transporter.sendMail(mailOptions, (err, info)=> {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        });
    }));
}
Promise.all(promises).then((infos)=> { cb(null, infos) }, (err)=> {console.log(err); cb(err) });
}


exports.sendWithdrawalMailTo3DM=(pdfName, withdrawalID, mailBody,callback)=>{
  const path = require('path');
  let filePath=path.join(require('../app.js').rootPath, pdfName);
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'retos.test'
    }
  });
  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: 'mehrotraanubhav6@gmail.com',
    subject: `Nueva solicitud de retiro de fondos (ID: ${withdrawalID}) - Retos Gamer `,
    text:mailBody,
    attachments: [
      {
          filename: pdfName, 
          path: filePath, 
          contentType: 'application/pdf'
      }]
  };
  transporter.sendMail(mailOptions, (err, succ)=> {
    if (err) {console.log(err);callback(err);}
    else {
      try {
        fs.unlinkSync(filePath);
        callback(null);
      } catch(err) {
        console.error(errDeletion);
        callback(errDeletion);
      }
    }
  });
}

exports.sendWithdrawalMailToUser=(amount,withdrawalID,timestamp, email,callback)=>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'retos.test'
    }
  });
  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: email,
    subject: `Nueva solicitud de retiro de fondos (ID: ${withdrawalID}) - Retos Gamer `,
    html:require('./utility.js').getHtmlEmailText(amount,withdrawalID,timestamp),
  };
  transporter.sendMail(mailOptions, (err, succ)=> {
    if (err) {console.log(err);callback(err);}
    else  callback(null);
  });
}