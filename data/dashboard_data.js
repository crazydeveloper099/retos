//jshint esversion:8
const AWS = require("aws-sdk");
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');dotenv.config();
const delay = require('delay');
const { split } = require("lodash");
let awsConfig = {
  "region": process.env.region,
  "endpoint": "http://dynamodb.us-east-2.amazonaws.com",
  "accessKeyId": process.env.accessKeyId,
  "secretAccessKey": process.env.secretAccessKey
};
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
let db = new AWS.DynamoDB();
const firebaseFile=require('../controllers/firebase_admin');
const table = "challenges";

exports.createChallenge = (id, image, end_time, description, rules, challengeName, prize, type, spots, minLevel, createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,callback) => {
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
      isMatchEnded:'null'
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
  const params = {

    TableName: "results",
    Item: {
      "challengeId": id,
      "url":url,
      "resultData": resultData,
      "unitChallenge": unitChallenge
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
    ProjectionExpression: "challengeId, resultData, unitChallenge"
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
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeDescription, challengeRules,isResultPublished, spots, minLevel, createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded"
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
    ProjectionExpression: "challengeId, category, challengeDescription, challengeName, challengePrize, challengeRules, src, challengeType, end_time, start_time,isResultPublished,  createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded"
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
      "name":name
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

  console.log("Attempting a conditional delete...");
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
        'isMatchEnded':dataChallenge.Item.isMatchEnded.S
      }
    }
    docClient.put(params, function(err, data) {
      if (err) {
        console.log(err);
        callback(err, data);
      } else {
        console.log(data);
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


exports.updateUsersChallenges=(email,challenges, callback)=>{
var table = "users";
var params = {
    TableName:table,
    Key:{
        "email": email,
    },
    UpdateExpression: "set challenges = :r",
    ExpressionAttributeValues:{
        ":r":challenges,
    },
    ReturnValues:"UPDATED_NEW"
};
docClient.update(params, function(err, data) {
   callback(err,data);
});
}

exports.updateUsersChallengesWon=(email,challengesWon, callback)=>{
  var table = "users";
  var params = {
      TableName:table,
      Key:{
          "email": email,
      },
      UpdateExpression: "set challengesWon = :r",
      ExpressionAttributeValues:{
          ":r":challengesWon,
      },
      ReturnValues:"UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
     callback(err,data);
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
        
        console.log(dataChallenge)
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
          'isMatchEnded':dataChallenge.isMatchEnded.S
        }
      }
      docClient.put(params, function(err, data) {
        if (err) {
          console.log(err);
          callback(err, data);
        } else {

        firebaseFile.challengeNotification(action,dataChallenge.resultTimer,dataChallenge.challengeId.S,dataChallenge.challengeName.S,(resp,err)=>{
          if(err){
            console.log(resp);
          }
        })
        console.log(data);
        callback(err, data);
        }
      });
  });
};