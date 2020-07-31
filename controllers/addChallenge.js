//jshint esversion:6
const data = require('../data/dashboard_data.js');


exports.getAddChallenge=(req,res)=>{
  const cookie=req.cookies;
  const isValidLogin = req.cookies.isValid;
  // res.clearCookie("isValid", { httpOnly: true });
  console.log(isValidLogin);

  if(isValidLogin){
    res.cookie('dataPublish', req.cookies.dataPublish, { httpOnly: true });
  res.render('addChallenge',
  {
    name:typeof(cookie.username)  === 'undefined'?null:cookie.username,
    data:data.data,
    end_date:null
 });
}

else res.redirect('/admin');
};

exports.postAddChallenge=(req,res)=>{
  console.log(req.data);
  const dataStore = req.cookies.dataPublish;
  const time=dataStore.start_time;
  const image=dataStore.image_loc;
  const id=dataStore.competition_id;
  const description=dataStore.description;
  const rules=dataStore.rules;
  const challengeName=req.body.challengeName;
  const challengeType=req.body.challengeType;
  const challengePrize=req.body.prize;
  const code=req.body.code;

  data.createChallenge(
    id,
    image,
    time,
    description,
    rules,
    challengeName,
    challengeType,
    challengePrize,
    code,
    (err,data)=>{
    if(err)
    {
      req.flash('notify', 'This is a test notification.');
      console.log("no");
    }
    else if(data){
      res.cookie('publishSuccess', true, { httpOnly: true });
      res.clearCookie("dataPublish", { httpOnly: true });
      res.redirect('/adminPanel');

      console.log("yes");
    }

  });
};
