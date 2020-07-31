//jshint esversion:8
var session = require('express-session');

const dataFile = require('../data/dashboard_data.js');
let dataStore;
exports.getAdminPanel=(req,res)=>{
    const cookie=req.cookies;
    const isValidLogin = req.cookies.isValid;
    const publishSuccess =req.cookies.publishSuccess;
    const deleteChallenge =req.cookies.deleteChallenge;

    let shouldShow=false;
  if(typeof(cookie.publishSuccess)  !== 'undefined'){
    res.clearCookie("publishSuccess", { httpOnly: true });
    shouldShow=true;
  }
  if(typeof(cookie.deleteChallenge)  !== 'undefined'){
    res.clearCookie("deleteChallenge", { httpOnly: true });
    shouldShow=true;
  }
    if(isValidLogin){
      const challengeData=dataFile.challengeFetcher((data)=>{

        dataDashboard=cookie.dataDashboard;
        findPublishedChallenges(data,dataDashboard,function(data){
          res.cookie('data', data.data, { httpOnly: true });
          res.render('adminPanel',
          {
            name:typeof(cookie.username)  === 'undefined'?null:cookie.username,
            data:data.data,
            end_date:null,
            successMessage:shouldShow
         });
       });
     });
 }
 else res.redirect('/admin');
};

const findPublishedChallenges= async (dataAdmin,dataDashboard, callback)=>{
    console.log("reached here");
    const challengeData =  await dataFile.dbChallengeFetcher(function(err, dataDashboardNew) {

      if (err)
      {
        console.log("reached here erroe");
        res.send(err);
      }
      else if (dataDashboardNew)
      {
        console.log("reached here data");
        for(let i=0;i<dataAdmin.data.length;i++){
          dataAdmin.data[i].isPublished=false;
          for(let j=0;j<dataDashboardNew.Items.length;j++){
            console.log(dataAdmin.data[i].competition_id+"==="+dataDashboardNew.Items[j].challengeId);
            if(dataAdmin.data[i].competition_id===dataDashboardNew.Items[j].challengeId){
              dataAdmin.data[i].isPublished=true;
              break;
            }
          }
        }
        callback(dataAdmin);
      }
    });
};

exports.postAdminPanel=(req,res)=>{
  console.log("started");

  const cookie=req.cookies;
  const data=cookie.data;
    const id=req.body.id;
    const del=req.body.deleteButton;
console.log(data);
 if(req.body.publish==='true') {
    data.map(datai=>{
      if(datai.competition_id===id){
        console.log("yes");
          res.cookie('dataPublish', datai, { httpOnly: true });
          res.redirect('/addChallenge');
      }
    });
  }
  else if(del==='true'){
    console.log('here');
    data.map(datai=>{
      if(datai.competition_id===req.body.delete){
         dataFile.deleteChallenge(datai.competition_id, function(err,data){
            if(err){
              res.cookie('deleteChallenge', false, { httpOnly: true });
              res.redirect('/adminPanel');
            }
            else if(data){
              res.cookie('deleteChallenge', true, { httpOnly: true });
              res.redirect('/adminPanel');
            }
         });
      }
    });
  }
};
