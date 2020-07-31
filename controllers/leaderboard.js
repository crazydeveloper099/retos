//jshint esversion:6
const model = require('../models/UserModel.js');

exports.leaderboard=(req,res)=>{
  const cookie=req.cookies;
  console.log(cookie.name);
  res.render("leaderboards",
  {name:cookie.username,
  end_date:model.end_date,
  start_date:model.start_date,
  phone:cookie.phone,
  carrier:model.carrier});
};
