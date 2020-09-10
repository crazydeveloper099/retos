//jshint esversion:8
const model = require('../models/UserModel.js');
const fetcher=require('../data/dashboard_data.js');
exports.leaderboard=(req,res)=>{
  const cookie=req.cookies;
  console.log(cookie.name);
  fetcher.fetchResult((err,data)=>{
      if(err){

      }
      else if(data){
        console.log("-------");
        console.log(data);
        res.render("leaderboards",
        {name:typeof(cookie.username) === 'undefined' ? null : cookie.username,
        data: data.Items,
        end_date:model.end_date,
        start_date:model.start_date,
        phone:cookie.phone,
        carrier:model.carrier});
      }
  });
};

exports.postLeaderBoard=(req,res)=>{
  console.log(req.body.id);
  res.cookie("leaderBoardChallengeClickedID", req.body.id,{ httpOnly: true, secure: false, overwrite: true});
    res.redirect('/leaderBoardChallenge');
};
