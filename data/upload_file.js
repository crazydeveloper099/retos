//jshint esversion:8
const AWS = require("aws-sdk");
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');
dotenv.config();

let awsConfig = {
    "region": 'us-east-2',
    "endpoint": "https://s3.amazonaws.com",
    s3BucketEndpoint: false,
    accessKeyId: process.env.accessKeyS3,
    secretAccessKey: process.env.secretAccessS3ID
  };

const s3 = new AWS.S3({
    accessKeyId: process.env.accessKeyS3,
    secretAccessKey: process.env.secretAccessS3ID
  });


 
  AWS.config.update(awsConfig);

exports.uploadFile = (fileName, uid, loc, callback) => {
    console.log("dont worry");
    const fileContent = fs.readFileSync(fileName);
  
    const params = {
        Bucket: "retos-bucket",
        Key: "/"+loc+"/"+uid+".jpg", 
        Body: fileContent
    };
  
    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(data.Location);
        callback(data.Location);
    });
  };
