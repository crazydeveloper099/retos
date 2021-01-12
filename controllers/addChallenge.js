//jshint esversion:6
const dataFile = require('../data/dashboard_data.js');
const data = require('../data/upload_file.js');
const rootPath=require('../app.js');
const fs = require('fs');
const fb=require('./firebase_admin.js');

exports.getAddChallenge=(req,res)=>{
  dataFile.getCategory((errCategory, dataCategory) => {
    console.log(dataCategory);
  res.render('addChallenge',{name:null,end_date:null, dataCategory:dataCategory.Items});
  });
};

exports.postAddChallenges=(req,res)=>{
  const jData= JSON.parse(req.body.jsonData);
  console.log(jData);
 const bufDataFile = new Buffer(req.files.screenshot.data, "utf-8");
 const fname=String(Math.random()*Math.pow(10,17));
  fs.writeFile(rootPath.rootPath+"/"+fname+'.jpg', bufDataFile, function(err) {
    data.uploadFile(rootPath.rootPath+"/"+fname+'.jpg',fname , 'challenges', (url)=>{
      fs.unlinkSync(rootPath.rootPath+"/"+fname+'.jpg');
      const challengeName=jData.challengeName;
      const challengeType= jData.challengeType;
      const end_time=jData.end_time;
      const image=url;
      const id=fname;
      const description=jData.desc;
      const rules=jData.rules;
      const challengePrize=jData.prize;
      const spots=jData.spots;
      const minLevel=jData.minLevel;
      const createdAt=jData.createdAt;
      const ytLinkParticipation=jData.ytLinkParticipation;
       dataFile.createChallenge(
            id,
            image,
            end_time,
            description,
            rules,
            challengeName,
            challengePrize,
            challengeType,
            spots,
            minLevel,
            createdAt,
            ytLinkParticipation,
            "null",
            (err,data)=>{
            if(err)
            {
              res.render(err);
            }
            else if(data){
              fb.sendToTopic(challengeName,id, (errFcm, resFcm)=>{
                if(errFcm){
                  res.send(errFcm);
                }
                else{
                  res.cookie('publishSuccess', true, {
                    httpOnly: true
                  });
                  res.redirect('/adminPanel');  
                }
             });   
            }
          });
  });
});
};