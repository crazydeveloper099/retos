//jshint esversion:8
const addChallenge =require('./addChallenge.js');
const dataFile = require('../data/dashboard_data.js');
let dataStore;
var dataMemory = [];
exports.getAdminPanel=(req,res)=>{
    const cookie=req.cookies;
    const isValidLogin = req.cookies.isValid;
    const publishSuccess =req.cookies.publishSuccess;
    const deleteChallenge =req.cookies.deleteChallenge;
    const resultPublish=req.cookies.resultPublished;

    let shouldShow=false;
    let showMessage;
  if(typeof(cookie.publishSuccess)  !== 'undefined'){
    res.clearCookie("publishSuccess", { httpOnly: true });
    showMessage="Published Challenge Successfully!";
    shouldShow=true;
  }
  if(typeof(cookie.deleteChallenge)  !== 'undefined'){
    res.clearCookie("deleteChallenge", { httpOnly: true });
    showMessage="Deleted Challenge Successfully!";
    shouldShow=true;
  }
  if(typeof(cookie.resultPublished)  !== 'undefined'){
    res.clearCookie("resultPublished", { httpOnly: true });
    showMessage="Result Published Successfully!";
    shouldShow=true;
  }
  if(typeof(cookie.deleteResult)  !== 'undefined'){
    res.clearCookie("deleteResult", { httpOnly: true });
    showMessage="Result Deleted Successfully!";
    shouldShow=true;
  }
    if(isValidLogin && typeof(cookie.adminUser)  !== 'undefined'){
      const challengeData=dataFile.challengeFetcher((data)=>{

        dataDashboard=cookie.dataDashboard;
        findPublishedChallenges(data,dataDashboard,function(err, dataAdminPanel){
          if(err){
            res.send(err);
          }
          else if(dataAdminPanel){
            dataMemory=dataAdminPanel.data;

            res.render('adminPanel',
            {
              name:typeof(cookie.adminUser)  === 'undefined'?null:cookie.adminUser,
              data:dataAdminPanel.data,
              end_date:null,
              successMessage:shouldShow,
              showMessage:showMessage
           });
         }
       });
     });
 }
 else res.redirect('/admin');
};

const findPublishedChallenges= async (dataAdmin,dataDashboard, callback)=>{
    const challengeData =  await dataFile.dbChallengeFetcher(function(err, dataDashboardNew) {

      if (err)
      {
        res.send(err);
      }
      else if (dataDashboardNew)
      {
        for(let i=0;i<dataAdmin.data.length;i++){
          dataAdmin.data[i].isPublished=false;
          for(let j=0;j<dataDashboardNew.Items.length;j++){
            if(dataAdmin.data[i].competition_id===dataDashboardNew.Items[j].challengeId){
              dataAdmin.data[i].isPublished=true;
              break;
            }
          }
        }
        findPublishedResults(dataAdmin, (err, resultData)=>{
            callback(err, resultData);
        });
      }
    });
};
const findPublishedResults= (dataAdmin, callback)=>{
    const challengeData =   dataFile.fetchResult(function(err, resultData) {

    if (resultData)
      {
        for(let i=0;i<dataAdmin.data.length;i++){
          dataAdmin.data[i].isResultPublished=false;
          for(let j=0;j<resultData.Items.length;j++){
            if(dataAdmin.data[i].competition_id===resultData.Items[j].challengeId){
              dataAdmin.data[i].isResultPublished=true;
              break;
            }
          }
        }
      }
      callback(err,dataAdmin);
    });
};

exports.postAdminPanel=(req,res)=>{

  const cookie=req.cookies;
  const data=cookie.dataAdminPanel;
    const id=req.body.id;
    const del=req.body.deleteButton;
    const result=req.body.publishResult;
    const deleteResult=req.body.deleteResult;
 if(req.body.publish==='true') {
    dataMemory.map((datai,i)=>{
      console.log(i);
      if(datai.competition_id===id){
          addChallenge.postAddChallenge(datai,req.body.prize,(err,data)=>{
              if(err){
                res.send(err);
              }
              else{
                datai.challengePrize=req.body.prize;
                dataMemory.splice(i, 1, datai);
                res.cookie('publishSuccess', true, { httpOnly: true });
                res.redirect('/adminPanel');
              }
          });
      }

    });

  }
  else if(del==='true'){
    dataMemory.map(datai=>{
      if(datai.competition_id===req.body.delete){
         dataFile.deleteChallenge("challenges", datai.competition_id, function(err,data){
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
  else if(result==='true'){
    dataMemory.map(datai=>{
      if(datai.competition_id===req.body.resultButton){
        console.log(data);
        res.cookie('resultPublish', datai, { httpOnly: true });
        res.redirect('/declareResult');
      }
    });
  }
  else if(deleteResult==='true'){
    dataFile.deleteChallenge("results", req.body.deleteResultId, function(err,data){
       if(err){
         res.cookie('deleteResult', false, { httpOnly: true });
         res.redirect('/adminPanel');
       }
       else if(data){
         res.cookie('deleteResult', true, { httpOnly: true });
         res.redirect('/adminPanel');
       }
    });
  }
};
