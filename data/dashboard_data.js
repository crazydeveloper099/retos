//jshint esversion:8
const AWS = require("aws-sdk");
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');
dotenv.config();


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

const table = "challenges";

exports.createChallenge = (id, image, time, description, rules, challengeName, prize, code, callback) => {
  const params = {
    TableName: table,
    Item: {
      "challengeId": id,
      "src": image,
      "challengeTime": time,
      "challengeDescription": description,
      "challengeRules": rules,
      "challengeName": challengeName,
      "challengePrize": prize,
      "challengeCode": code,
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


exports.createResult=(id, resultData, unitChallenge, callback)=>{
  const params = {

    TableName: "results",
    Item: {
      "challengeId": id,
      "resultData":resultData,
      "unitChallenge":unitChallenge
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

exports.fetchResult=(callback)=>{
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




exports.challengeFetcher = (callback) => {

  const url = "https://sweepwidget.com/sw_api/giveaways.php?api_key=" + process.env.SWEEP_API_KEY + "&type=live&page_start=1";

  axios.get(url).then(resp => {
      callback(resp.data);
    })
    .catch(error => {
      console.log(error);
    }).
  finally(() => {

  });
};

exports.deleteChallenge = (tableName, challengeId, callback) => {
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

exports.getUsers=(id,callback)=>{
  const url = "https://sweepwidget.com/sw_api/entries.php?api_key=" + process.env.SWEEP_API_KEY + "&page_start=1&competition_id="+id;
  axios.get(url).then(resp => {
      callback(resp.data, null);
    })
    .catch(error => {
      callback(null, error);
      console.log(null, error);
    }).
  finally(() => {

  });
};

exports.fetchUnitResult=(id,callback)=>{

var params = {
  Key: {
   "challengeId": {
     S: id
    },
  },
  TableName:  'results'
 };
 var paramsUnitChallenge = {
   Key: {
    "challengeId": {
      S: id
     },
   },
   TableName:  'challenges'
  };
db.getItem(params, function(errResult, dataResult) {
  if(dataResult){
    db.getItem(paramsUnitChallenge, function(errChallenge, dataChallenge){
        callback(errResult,errChallenge,dataResult,dataChallenge);
    });
  }
 });
};

exports.fetchSingleChallenge=(id, callback)=>{
  var paramsUnitChallenge = {
    Key: {
     "challengeId": {
       S: id
      },
    },
    TableName:  'challenges'
   };
   db.getItem(paramsUnitChallenge, function(errChallenge, dataChallenge){
       callback(errChallenge,dataChallenge);
   });
};

exports.uploadResultFile = (challengeId,filename,callback) => {
  fs.readFile(fileName, (err, data) => {
     if (err) console.log(err);
     const params = {
         Bucket: 'retos-bucket', // pass your bucket name
         Key: "ResultImages/"+challengeId, // file will be saved as testBucket/contacts.csv
         Body: JSON.stringify(data, null, 2)
     };
     s3.upload(params, function(s3Err, data) {
       console.log(s3Err);
       console.log(data);
         callback(s3Err, data.Location);
     });
  });
};


exports.demoData=[
  {
    src:'https://media-private.canva.com/tend0/MAECjgtend0/1/s.jpg?response-expires=Sat%2C%2001%20Aug%202020%2013%3A32%3A15%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200801T104502Z&X-Amz-SignedHeaders=host&X-Amz-Expires=10032&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200801%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=fd0a93cad11c019bbfe3846fa7ca82363b68fdcea6f4bae0f7a95908ae896433',
    challengeName:'FORTNITE',
    challengeId:'154',
    challengeType:'Global • MJ• 20 CUPOS',
    challengeTime:"HOY A LAS 09:00",
  },
  {
    src:'https://media-private.canva.com/jW8s4/MAD_eGjW8s4/1/s2.jpg?response-expires=Sat%2C%2001%20Aug%202020%2013%3A13%3A12%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200801T104502Z&X-Amz-SignedHeaders=host&X-Amz-Expires=8889&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200801%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e2d7c2dcb361925b14a698c85fe9919a9c5f78ae75171392d0cb62415e576a7e',
      challengeName:'LEAGUE OF LEGENDS',
    challengeId:'155',
    challengeType:'Global • 1v1 • 50 CUPOS',
    challengeTime:"VIERNES A LAS 14:30",
  },
  {
    src:'https://media-private.canva.com/qty7U/MAD_ecqty7U/1/s3.jpg?response-expires=Sat%2C%2001%20Aug%202020%2013%3A27%3A41%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200801T104502Z&X-Amz-SignedHeaders=host&X-Amz-Expires=9758&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200801%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ede6d948a96816b7b19d3c083ebcb368b1b165f0be7a52e564be077d51678607',
      challengeName:'CALL OF DUTY',
    challengeId:'156',
    challengeType:'Global • 5v5 • 90 CUPOS',
    challengeTime:"MAÑANA A LAS 15:15",
  },
  {
    src:'https://media-private.canva.com/tend0/MAECjgtend0/1/s.jpg?response-expires=Fri%2C%2031%20Jul%202020%2022%3A32%3A15%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200731T200941Z&X-Amz-SignedHeaders=host&X-Amz-Expires=8553&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=655e32818a22c7b2e2529f2dc1c345ccfec505a22bc38f1379783eb4eccd64e5',
    challengeName:'FORTNITE',
    challengeId:'154',
    challengeType:'Global • MJ• 20 CUPOS',
    challengeTime:"HOY A LAS 09:00",
  },
  {
    src:'https://media-private.canva.com/tend0/MAECjgtend0/1/s.jpg?response-expires=Fri%2C%2031%20Jul%202020%2022%3A32%3A15%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200731T200941Z&X-Amz-SignedHeaders=host&X-Amz-Expires=8553&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=655e32818a22c7b2e2529f2dc1c345ccfec505a22bc38f1379783eb4eccd64e5',
    challengeName:'FORTNITE',
    challengeId:'154',
    challengeType:'Global • MJ• 20 CUPOS',
    challengeTime:"HOY A LAS 09:00",
  },
  {
    src:'https://media-private.canva.com/tend0/MAECjgtend0/1/s.jpg?response-expires=Fri%2C%2031%20Jul%202020%2022%3A32%3A15%20GMT&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200731T200941Z&X-Amz-SignedHeaders=host&X-Amz-Expires=8553&X-Amz-Credential=AKIAJJATJK7JCUD446NA%2F20200731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=655e32818a22c7b2e2529f2dc1c345ccfec505a22bc38f1379783eb4eccd64e5',
    challengeName:'FORTNITE',
    challengeId:'154',
    challengeType:'Global • MJ• 20 CUPOS',
    challengeTime:"HOY A LAS 09:00",
  },

];
exports.demoUser=[
  {
      user_id: '530689',
      user_name: 'dsd1',
      user_email: 'dcdv@dd1.com',
      birthday: 'NULL',
      entry_type: 'User Details',
      action: 'Login',
      value: 'Auto Verified',
      entry_amount: '1',
      timestamp: '2020-08-01 06:40:18',
      country: 'India',
      id: 'myDIV0'
    },
    {
      user_id: '530688',
      user_name: 'dsd2',
      user_email: 'dcdv@dd2.com',
      birthday: 'NULL',
      entry_type: 'User Details',
      action: 'Login',
      value: 'Auto Verified',
      entry_amount: '1',
      timestamp: '2020-08-01 06:40:18',
      country: 'India',
      id: 'myDIV1'
    },
    {
      user_id: '530687',
      user_name: 'dsd3',
      user_email: 'dcdv@dd3.com',
      birthday: 'NULL',
      entry_type: 'User Details',
      action: 'Login',
      value: 'Auto Verified',
      entry_amount: '1',
      timestamp: '2020-08-01 06:40:18',
      country: 'India',
      id: 'myDIV2'
    },
    {
      user_id: '530684',
      user_name: 'dsd4',
      user_email: 'dcdv@dd4.com',
      birthday: 'NULL',
      entry_type: 'User Details',
      action: 'Login',
      value: 'Auto Verified',
      entry_amount: '1',
      timestamp: '2020-08-01 06:40:18',
      country: 'India',
      id: 'myDIV3'
    },
    {
      user_id: '530681',
      user_name: 'dsd5',
      user_email: 'dcdv@dd5.com',
      birthday: 'NULL',
      entry_type: 'User Details',
      action: 'Login',
      value: 'Auto Verified',
      entry_amount: '1',
      timestamp: '2020-08-01 06:40:18',
      country: 'India',
      id: 'myDIV4'
    }
];
