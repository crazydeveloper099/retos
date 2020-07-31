//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('cross-fetch/polyfill');


const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

const authService = require('../Services/LoginService.js');


const userPoolId="us-east-2_ZziRfzq2R";
const region="us-east-2";
const clientId="50ai330m6l388tuj2rk0linfd";


const poolData = {
   UserPoolId: userPoolId,
   ClientId: clientId
};
const pool_region = region;
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



const loginHeading="Login / SignUp";

exports.getLogin=(req,res)=> {
  const cookie=req.cookies;
  if(typeof(cookie.username)  === 'undefined')res.render('login',{name:null});
  else res.redirect('/dashboard');
};


exports.Login = function(req, res){
  const data={
    username: req.body.email,
    password: req.body.password
  };
  authService.Login(data,function(result){
    console.log( result.idToken.payload.email);
    res.cookie('username', result.idToken.payload.email);
    res.redirect('/dashboard');
  },true);
};
