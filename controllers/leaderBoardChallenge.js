//jshint esversion:8
const fetcher=require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');

exports.leaderboardChallenge=(req,res)=>{
  const cookie=req.cookies;
  const id=cookie.leaderBoardChallengeClickedID;
  console.log(id+"**-*-*--");
  fetcher.fetchUnitResult(id,(resultDataNew)=>{
       
        res.render("leaderBoardChallenge",
        {
        name:typeof(cookie.username) === 'undefined' ? null : cookie.username,
        // userData:userData.data,
        userData:JSON.parse(resultDataNew.Item.resultData.S.replace("'","")),
        unitChallenge:resultDataNew.Item.unitChallenge.M.Item.M,
        end_date:null,
        url:resultDataNew.Item.url.S
      });
      
  });
};

exports.postLeaderBoard=(req,res)=>{
    res.cookie("leaderBoardChallengeClickedID", req.body.id,{ httpOnly: true, secure: false, overwrite: true});
    res.redirect('/leaderBoardChallenge');
};
