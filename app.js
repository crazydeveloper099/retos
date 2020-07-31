//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const flash = require('express-flash-messages');

require('dotenv').config();

const app=express();

const login = require('./controllers/login.js');
const signup = require('./controllers/Signup.js');
const dashboard = require('./controllers/dashboard.js');
const leaderboard = require('./controllers/leaderboard.js');
const subscription = require('./controllers/subscription.js');
const admin = require('./controllers/admin.js');
const challenges = require('./controllers/challenges.js');
const adminPanel = require('./controllers/adminPanel.js');
const addChallenge =require('./controllers/addChallenge.js');

app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(session({cookie: { maxAge:10}}));
app.use(flash());
app.use(fileUpload());


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
app.get('/subscription',subscription.subscription);
app.get('/admin',admin.loginModal);
app.get('/challenge',challenges.challenges);
app.post('/admin',admin.postAdmin);
app.get('/adminPanel',adminPanel.getAdminPanel);
app.get('/addChallenge',addChallenge.getAddChallenge);
app.post('/addChallenge',addChallenge.postAddChallenge);
app.post('/adminPanel',adminPanel.postAdminPanel);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
