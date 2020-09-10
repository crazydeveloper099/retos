//jshint esversion:6
const data = require('../data/dashboard_data.js');
const path = require('path');
const multer = require('multer');
const rootPath=require('../app.js');
let challengeName;
const fs = require('fs');
let unitChallenge;

exports.getResults = (req, res) => {
  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  
  if (isValidLogin) {
    unitChallenge = cookie.resultPublish;

      data.fetchSingleChallenge(unitChallenge, (userData, err) => {
        if (userData) {
          res.render('declareResult', {
            name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
            userData: userData.data,
            // userData:data.demoUser,
            unitChallenge: unitChallenge,
            end_date: null
          });
        } else res.send(err);
      });
  } else res.redirect('/admin');
};

exports.uploadMiddleWare = (req, res) => {
  const cookie = req.cookies;
  unitChallenge = cookie.resultPublish;
  const bufDataFile = new Buffer(req.files.screenshot.data, "utf-8");
  console.log('__dirname : ' + __dirname);
  data.fetchSingleChallenge(unitChallenge.competition_id, (errCh, dataCh)=>{
    if(errCh) res.send(errCh);
    else{
  fs.writeFile(rootPath.rootPath+"/public/uploads/"+unitChallenge.competition_id+'.jpg', bufDataFile, function(err) {
    if (err) {
      return console.error(err);
    } else {
      console.log("Data written successfully !");
    }
    console.log('done');

      data.createResult(unitChallenge.competition_id, req.body.jsonData, dataCh, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          res.cookie('resultPublished', true, {
            httpOnly: true
          });
          res.redirect('/adminPanel');
        }
      });
    });
  }
  });
};