//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
const functionFile = require("../data/dashboard_data.js");
require('dotenv').config();
require('cross-fetch/polyfill');
const authService = require('../Services/SignUpService');


exports.register = (req, res)=>{
  functionFile.scanUserTable((err, data)=>{
    
    for (i=0;i<data.Items.length;i++){
      if((data.Items[i].phone).toString().trim()===(req.body.phone).trim()){
        res.send("NumberExistException");
        break;
      }
      else if(i==data.Items.length-1){

              let register = authService.Register(req.body, function(err, result){
              if(err)
                  res.send(err);
              else{
                res.cookie('unConfirmedUsername', req.body.name,{ httpOnly: true,  overwrite: true});
                res.cookie('unConfirmedemail', req.body.email,{ httpOnly: true,  overwrite: true});
                res.cookie('unConfirmedphone', req.body.phone,{ httpOnly: true,  overwrite: true});
                res.send('success');
                
              }
            });

      }
    }
    
  });
}
