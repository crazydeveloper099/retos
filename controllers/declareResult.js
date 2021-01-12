//jshint esversion:6
const data = require('../data/dashboard_data.js');
const path = require('path');
const multer = require('multer');
const rootPath=require('../app.js');
let challengeName;
const fs = require('fs');
const uploadFile= require('../data/upload_file.js');
const fb=require('./firebase_admin.js');

let unitChallenge;

exports.getResults = (req, res) => {
  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  
  if (isValidLogin) {

    unitChallenge = cookie.resultPublish;
    console.log(unitChallenge);
      
      data.fetchSingleChallenge(unitChallenge, (err, userData) => {
        if (userData) {
          sort(userData.Item.userImg.L,(array)=>{
          res.render('declareResult', {
            name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
            userData: userData.Item.users.L,
            unitChallenge: userData.Item,
            userDataNew: array,

            end_date: null
          });
        });
        } else res.send(err);
      });
  } else res.redirect('/admin');
};

const sort=(array, callback)=>{
  setTimeout(()=>{
  array.sort((a, b) => {
    return parseInt(a.M.score.S) == (parseInt(b.M.score.S)) ? 0 : -((parseInt(a.M.score.S)) > (parseInt(b.M.score.S))) || 1;
    });
  callback(array);
},3000);
}

exports.uploadMiddleWare = (req, res) => {
  const cookie = req.cookies;
  unitChallenge = cookie.resultPublish;
  const bufDataFile = Buffer.from(req.files.screenshot.data, "utf-8");
    const fname = unitChallenge;
    
  data.fetchSingleChallenge(unitChallenge, (errCh, dataCh)=>{
    if(errCh) {console.log(errCh); res.send(errCh);}
    else{
    fs.writeFile(
      rootPath.rootPath+"/public/uploads/"+unitChallenge+'.jpg',
      bufDataFile,
      function (err) {
        uploadFile.uploadFile(
          rootPath.rootPath+"/public/uploads/"+unitChallenge+'.jpg',
          fname,
          "results/"+req.cookies.challengeIdChallengeClicked,
          (url) => {
            fs.unlinkSync(rootPath.rootPath+"/public/uploads/"+unitChallenge+'.jpg');
            fb.sendToTopic(dataCh.Item.challengeName.S,unitChallenge, (errFcm, resFcm)=>{
              if(errFcm)
              {res.send(errFcm);}
              else{
            data.createResult(unitChallenge, req.body.jsonData, dataCh,url ,(err, dataVal) => {
              data.updateResultPublished(unitChallenge, true,(errUpdate, dataUpdate)=>{
                let arrData=JSON.parse(req.body.jsonData);
                arrData.map((datai,x)=>{
               
                  data.fetchSingleUser(datai.email,(errUser,dataUser)=>{
                    if(x<arrData.length-1){
                      if(errUser){
                        res.send(errUser+" Please Try again!");
                      }
                      else{
                     
                          if(dataUser.Item.challengesWon){
                            console.log(dataCh.Item.challengePrize);
                             let updateArr=JSON.parse(dataUser.Item.challengesWon.S);
                             let newArr={
                            "challengeName":dataCh.Item.challengeName.S,
                             "img":datai.url,
                             "pos":x+1,
                             "prize":dataCh.Item.challengePrize.L
                            };
                           
                            updateArr=updateArr.filter(x=>{
                              return x.challengeName!=dataCh.Item.challengeName.S});
                              updateArr.unshift(newArr);
                             updateArr=JSON.stringify(updateArr);
                             data.updateUsersChallengesWon(datai.email,updateArr,(errUpdation, succUpdation)=>{
                              if(errUpdation){
                                res.send(errUpdation+" Please Try again!");
                              }
                          });
                          }else{
                            let newArr=[{
                              "challengeName":dataCh.Item.challengeName.S,
                              "img":datai.url,
                              "prize":dataCh.Item.challengePrize.L,
                            "pos":x+1}];
                            newArr=JSON.stringify(newArr);
                            data.updateUsersChallengesWon(datai.email,newArr,(errUpdation, succUpdation)=>{
                                if(errUpdation){
                                  res.send(errUpdation+" Please Try again!");
                                }
                            });
                          }
                      }
                    }
                    else{
                      if(errUser){
                        res.send(errUser+" Please Try again!");
                      }
                      else{
                          if(dataUser.Item.challengesWon){
                            console.log(dataCh.Item.challengePrize);
                            let updateArr=JSON.parse(dataUser.Item.challengesWon.S);
                             let newArr={
                              "challengeName":dataCh.Item.challengeName.S,
                              "img":datai.url,
                              "prize":dataCh.Item.challengePrize.L,
                            "pos":x+1
                            };
                             updateArr=updateArr.filter(x=>{
                               return x.challengeName!=dataCh.Item.challengeName.S});
                              console.log(updateArr);
                             updateArr.unshift(newArr);
                             updateArr=JSON.stringify(updateArr);
                             data.updateUsersChallengesWon(datai.email,updateArr,(errUpdation, succUpdation)=>{
                              if(errUpdation){
                                res.send(errUpdation+" Please Try again!");
                              }
                              if (err) {
                                res.send(err);
                              } 
                              else if(errUpdate){
                                res.send(errUpdate);
                              }
                              else {
                                res.cookie('resultPublished', true, {
                                  httpOnly: true
                                });
                                res.redirect('/adminPanel');
                              }
                          });
                          }else{
                            let newArr=[{ "challengeName":dataCh.Item.challengeName.S,
                            "img":datai.url,
                            "prize":dataCh.Item.challengePrize.L,
                          "pos":x+1}];
                            newArr=JSON.stringify(newArr);
                            data.updateUsersChallengesWon(datai.email,newArr,(errUpdation, succUpdation)=>{
                                if(errUpdation){
                                  res.send(errUpdation+" Please Try again!");
                                }
                                if (err) {
                                  res.send(err);
                                } 
                                else if(errUpdate){
                                  res.send(errUpdate);
                                }
                                else {
                                  res.cookie('resultPublished', true, {
                                    httpOnly: true
                                  });
                                  res.redirect('/adminPanel');
                                }
                            });
                          }
                      }
                    }
                  })
                })
            });
          }) 
          }
          });
          }
        );
     });
   };
  });
};