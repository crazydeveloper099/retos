//jshint esversion:6
const model = require('../models/UserModel.js');


exports.challenges=(req,res)=>{
  const cookie=req.cookies;
  console.log(cookie);
  res.render("Challenge",
  {name:cookie.username,
  end_date:model.end_date,
  start_date:model.start_date,
  phone:cookie.phone,
  carrier:model.carrier
});
};
