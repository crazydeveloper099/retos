//jshint esversion:6
const authService = require('../Services/SignUpService');
const functionFile=require('../data/dashboard_data.js');

exports.getVerifyUser = function(req, res){
    res.render('verifyUser',{name:null});
};

exports.resendCode= (req,res)=>{
  const cookie = req.cookies;
  const email =cookie.unConfirmedemail;
   authService.verifyUserFunction(email,null,true, (err, result)=>{
     res.render('verifyUser',{name:null});
   });
};


exports.postVerifyUser = function(req, res){
  const cookie = req.cookies;
  const email =cookie.unConfirmedemail;
  const verificationCode=req.body.verificationCode;
    let register = authService.verifyUserFunction(email,verificationCode,false, function(err, result){
    if(err){
        console.log(err);
        res.send(err);
        return;
      }
    else{
      functionFile.writeUser(cookie.unConfirmedemail, cookie.unConfirmedUsername, cookie.phone_number,false,(errVer,dataVer)=>{
      if(errVer){
        res.send('Error Occured');
      }
      console.log( cookie.unConfirmedphone+"2222");
      console.log("done");
      res.cookie('username', cookie.unConfirmedUsername,{ httpOnly: true,  overwrite: true});
      res.cookie('email', cookie.unConfirmedemail,{ httpOnly: true,  overwrite: true});
      res.cookie('phone', cookie.unConfirmedphone,{ httpOnly: true,  overwrite: true});
      res.clearCookie('unConfirmedUsername');
      res.clearCookie('unConfirmedemail');
      res.clearCookie('unConfirmedphone');
      console.log("done2");
      res.redirect('/dashboard');
      });
    }
  });
};
