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

exports.createChallenge = (id, image, start_time, end_time, description, rules, challengeName, prize, type, category, callback) => {
  const params = {
    TableName: table,
    Item: {
      "challengeId": id,
      "src": image,
      "start_time": start_time,
      "end_time": end_time,
      "challengeTime":end_time,
      "challengeDescription": description,
      "challengeRules": rules,
      "challengeName": challengeName,
      "challengePrize": prize,
      "challengeType": type,
      "category": category,
      "isResultPublished":false,
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

exports.createResult = (id, resultData, unitChallenge, callback) => {
  const params = {

    TableName: "results",
    Item: {
      "challengeId": id,
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
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeCode, challengeDescription, challengeRules, category"
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
    ProjectionExpression: "challengeId, category, challengeDescription, challengeName, challengePrize, challengeRules, src, challengeType, end_time, start_time"
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
    console.log("------------------");
      console.log(dataResult);
    if (dataResult) {
      db.getItem(paramsUnitChallenge, function(errChallenge, dataChallenge) {
        callback(errResult, errChallenge, dataResult, dataChallenge);
      });
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


exports.writeUser = (email, name, phone, isBlocked, callback) => {
  const params = {

    TableName: "users",
    Item: {
      "email": email,
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
        S: id
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