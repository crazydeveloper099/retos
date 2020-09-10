//jshint esversion:6

const authService = require('../Services/SignUpService.js');
const functionFile=require('../data/dashboard_data.js');

exports.getNewPassword = function(req, res){
    res.render('newPassword',{name:null});
};

exports.postNewPassword=(req,res)=>{
  const cookie = req.cookies;
  const email =cookie.tempEmail;

    authService.confirmPassword(email, req.body.code, req.body.password ,(err, data)=>{
      if(err){
        res.send(err);
      }
      else if(data){
        res.clearCookie('tempEmail');
        res.redirect('/login');
      }
    });
};
