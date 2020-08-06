//jshint esversion:8
const fetcher=require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');

exports.leaderboardChallenge=(req,res)=>{
  const cookie=req.cookies;
  const id=cookie.leaderBoardChallengeClickedID;

  fetcher.fetchUnitResult(id,(errResult,errChallenge,dataResult,dataChallenge)=>{
      if(errResult|| errChallenge){
        res.send('error occured');
      }
      else if(dataResult && dataChallenge){
        console.log(dataChallenge);
        res.render("leaderBoardChallenge",
        {
        name:typeof(cookie.username) === 'undefined' ? null : cookie.username,
        // userData:userData.data,
        userData:dataResult.Item.resultData.L,
        unitChallenge:dataChallenge.Item,
        end_date:null
      });
      }
  });
};

exports.postLeaderBoard=(req,res)=>{
    res.cookie("leaderBoardChallengeClickedID", req.body.id,{ httpOnly: true, secure: false, overwrite: true});
    res.redirect('/leaderBoardChallenge');
};
