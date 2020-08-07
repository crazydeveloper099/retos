//jshint esversion:6
const data = require('../data/dashboard_data.js');


// exports.getAddChallenge=(req,res)=>{
//   const cookie=req.cookies;
//   const isValidLogin = req.cookies.isValid;
//   // res.clearCookie("isValid", { httpOnly: true });
//   console.log(isValidLogin);
//
//   if(isValidLogin){
//   res.cookie('dataPublish', req.cookies.dataPublish, { httpOnly: true });
//   res.render('addChallenge',
//   {
//     name:typeof(cookie.username)  === 'undefined'?null:cookie.username,
//     data:data.data,
//     end_date:null
//  });
// }
//
// else res.redirect('/admin');
// };

exports.postAddChallenge=(dataStore, prize, callback)=>{
  console.log(dataStore);
  const challengeName=dataStore.title;
  const time=dataStore.end_time;
  const image=dataStore.image_loc;
  const id=dataStore.competition_id;
  const description=dataStore.description;
  const rules=dataStore.rules;
  const challengePrize=prize;
  const code=dataStore.giveaway_embed_code;

  data.createChallenge(
    id,
    image,
    time,
    description,
    rules,
    challengeName,
    challengePrize,
    code,
    (err,data)=>{
    if(err)
    {
      callback(err, data);
    }
    else if(data){

      callback(err, data);
    }

  });
};
