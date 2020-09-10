//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const flash = require('express-flash-messages');
const functionFile=require('./data/dashboard_data.js');
require('dotenv').config();

const app=express();



const login = require('./controllers/login.js');
const signup = require('./controllers/Signup.js');
const dashboard = require('./controllers/dashboard.js');
const leaderboard = require('./controllers/leaderboard.js');
const subscription = require('./controllers/subscription.js');
const admin = require('./controllers/admin.js');
const challenges = require('./controllers/Challenges.js');
const adminPanel = require('./controllers/adminPanel.js');
const declareResult =require('./controllers/declareResult.js');
const leaderBoardChallenge =require('./controllers/leaderBoardChallenge.js');
const myProfile =require('./controllers/myProfile.js');
const challengeList =require('./controllers/ChallengeList.js');
const getCategories=require('./Api/getCategories.js');
const adminUserOperations=require('./controllers/adminUserOperation.js');
const blockedUser=require('./controllers/blockedAccount.js');
const verifyUser=require('./controllers/VerifyUser.js');
const forgetPassword=require('./controllers/forgetPassword.js');
const newPassword=require('./controllers/newPassword.js');
const logout = require('./controllers/logout.js');
const aboutUs = require('./controllers/aboutUs.js');
const getAddChallenge = require('./controllers/addChallenge.js');
const getPosterConsole = require('./controllers/posterConsole.js');

exports.rootPath=__dirname;
app.use(fileUpload());
app.use(cookieParser('secret'));
app.use(express.static(__dirname + '/public'));
app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.json()).use(bodyParser.urlencoded());
app.set('view engine', 'ejs');



app.get('/',function(req, res) {
  res.redirect('/dashboard');
});
app.get('/login',login.getLogin);
app.post('/login',login.Login);
app.post('/signup',signup.register);
app.get('/dashboard',dashboard.dashboard);
app.post('/dashboard',dashboard.postDashboard);
app.get('/leaderboard',leaderboard.leaderboard);
app.post('/leaderboard',leaderboard.postLeaderBoard);
app.get('/subscription',subscription.subscription);
app.get('/admin',admin.loginModal);
app.get('/challenge',challenges.challenges);
app.post('/admin',admin.postAdmin);
app.get('/adminPanel',adminPanel.getAdminPanel);
app.post('/adminPanel',adminPanel.postAdminPanel);
app.get('/declareResult',declareResult.getResults);
app.get('/leaderBoardChallenge', leaderBoardChallenge.leaderboardChallenge);
app.get('/myProfile', myProfile.getMyProfile);
app.post('/declareResult',declareResult.uploadMiddleWare);
app.get('/challengeList', challengeList.getChallengeList);
app.get('/getCategories',getCategories.getCaregoriesApi);
app.get('/userConsole',adminUserOperations.getUserConsole);
app.post('/userConsole',adminUserOperations.postUserConsole);
app.get('/blockedUser', blockedUser.getBlockedUser);
app.get('/verifyUser', verifyUser.getVerifyUser);
app.post('/verifyUser', verifyUser.postVerifyUser);
app.get('/resendCode', verifyUser.resendCode);
app.get('/forgetPassword', forgetPassword.forgetPassword);
app.post('/forgetPassword', forgetPassword.postForgetPassword);
app.get('/newPassword', newPassword.getNewPassword);
app.post('/newPassword', newPassword.postNewPassword);
app.get('/aboutUs',aboutUs.getAboutUs);
app.get('/logout', logout.getLogout);
app.get('/subscribe',(req,res)=>{res.render("chooseSubscriber",{"name":null})});
app.get('/addChallenge',getAddChallenge.getAddChallenge);
app.post('/addChallenge',getAddChallenge.postAddChallenges);
app.get('/posterConsole',getPosterConsole.get);
app.post('/posterConsole',getPosterConsole.post);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
