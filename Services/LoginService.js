//jshint esversion:8
const bodyParser = require("body-parser");
const validator = require("email-validator");
const request = require('request');
const util = require('util');

require('dotenv').config();
require('cross-fetch/polyfill');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

exports.Login = function (body, callback, user) {
let poolData=null;
if(user){
    poolData = {
       UserPoolId: "us-east-2_ZziRfzq2R",
       ClientId: "50ai330m6l388tuj2rk0linfd"
    };
  }
else{
  poolData = {
     UserPoolId: "us-east-2_dFYnNRbNz",
     ClientId: "6oq5otis5gnqimrb5r6jcppo40"
  };
}

const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



   const userName = body.username;
   const password = body.password;
   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password
    });
    const userData = {
        Username: userName,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          console.log(result);
           callback(result);
        },
        onFailure: (function (err) {
          console.log(err);
           //callback(err);
       })
   });
};
//admin500@gmail.com
//adminHere500
