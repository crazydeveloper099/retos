//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
const dotenv = require('dotenv');
dotenv.config();
require('cross-fetch/polyfill');

global.navigator = () => null;
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: process.env.UserPoolId,
  ClientId:  process.env.ClientId
};
const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


exports.Register = function (body, callback) {
  const name=body.name;
   const email = body.email;
   const password = body.password;
   const phone = body.phone;
   const attributeList = [];

   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }));
   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: phone }));

   userPool.signUp(email, password, attributeList, null, function (err, result) {
     if (err)
         callback(err);
     const cognitoUser = result.user;
     callback(null, cognitoUser);
   });
};
