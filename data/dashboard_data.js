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

AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
const table = "challenges";

exports.createChallenge = (id, image, time, description, rules, challengeName, challengeType, prize, code, callback) => {
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
      "challengeType": challengeType,
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

exports.deleteChallenge = (challengeId, callback) => {
  var fileItem = {
    Key: {
      challengeId: challengeId,
    },
    TableName: "challenges",
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
