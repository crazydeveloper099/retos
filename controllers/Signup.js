//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
require('dotenv').config();
require('cross-fetch/polyfill');

const authService = require('../Services/SignUpService');
exports.register = function(req, res){

    let register = authService.Register(req.body, function(err, result){
    if(err)
        res.send(err);
    else{
      res.cookie('username', req.body.name);
      res.cookie('email', req.body.email);
      res.cookie('phone', result.phone);
      res.redirect('/dashboard');
    }
  });
};
