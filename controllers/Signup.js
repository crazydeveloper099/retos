//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
require('dotenv').config();
require('cross-fetch/polyfill');

const authService = require('../Services/SignUpService');
exports.register = function(req, res){

    let register = authService.Register(req.body, function(err, result){
    if(err)
        res.end(err);
    else{
      res.cookie('unConfirmedUsername', req.body.name,{ httpOnly: true,  overwrite: true});
      res.cookie('unConfirmedemail', req.body.email,{ httpOnly: true,  overwrite: true});
      res.cookie('unConfirmedphone', req.body.phone,{ httpOnly: true,  overwrite: true});
      console.log(req.body.phone);
      res.redirect('/verifyUser');

    }
  });
};
