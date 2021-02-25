//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
require('cross-fetch/polyfill');
const model = require('../models/UserModel.js');
const moment = require('moment');
moment().format();
const axios = require('axios');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

const authService = require('../Services/LoginService.js');
const dashboardData=require('../data/dashboard_data.js');
const userPoolId=process.env.UserPoolId;
const region="us-east-2";
const clientId=process.env.ClientId;


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

let subscriptionData;
const subscriptionFetcher = (phone,res , callback) => {
  const url = process.env.fetch_userData+phone;
  axios.get(url).then(resp => {

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;

      res.cookie('subscriptionData', subscriptionData, { httpOnly: true,  overwrite: true});
    })
    .catch(error => {
    })
    .then(() => {
      callback();
    });
};


exports.Login = function(req, res){
  const data={
    username: req.body.email,
    password: req.body.password,
    token: req.body.token
  };
  authService.Login(data,function(err,result){

    if(err){ res.send(err);}
    else if(result){
    dashboardData.fetchSingleUser( result.idToken.payload.email,(errFetch, sucFetch)=>{
    if(errFetch){res.send(errFetch);}
    else{
      dashboardData.updateUserFBToken(result.idToken.payload.email,req.body.token,()=>{

     
      console.log(sucFetch);
    subscriptionFetcher(sucFetch.Item.phone.S,res, ()=>{
      console.log(model.end_date);
      console.log(sucFetch.Item.phone.S);
      if(moment().isAfter(model.end_date)){
        res.cookie('username', result.idToken.payload.name,{ httpOnly: true,  overwrite: true});
        res.cookie('email',result.idToken.payload.email,{ httpOnly: true,  overwrite: true});
        res.cookie('phone',result.idToken.payload.phone_number,{ httpOnly: true,  overwrite: true});
        res.send('successA');
      }
      else{
        res.cookie('username', result.idToken.payload.name,{ httpOnly: true,  overwrite: true});
        res.cookie('email',result.idToken.payload.email,{ httpOnly: true,  overwrite: true});
        res.cookie('phone',result.idToken.payload.phone_number,{ httpOnly: true,  overwrite: true});
        res.send('successD');
      }
   
  })
})
  }
      })  
    }
  },true);

};
