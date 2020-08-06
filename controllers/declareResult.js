//jshint esversion:6
const data = require('../data/dashboard_data.js');
const fileUpload = require('express-fileupload');
var formidable = require('formidable');


exports.getResults=(req,res)=>{
  const cookie=req.cookies;
  const isValidLogin = req.cookies.isValid;
  // res.clearCookie("isValid", { httpOnly: true });
  if(isValidLogin){
    const unitChallenge=cookie.resultPublish;
    data.getUsers(unitChallenge.competition_id,(userData,err)=>{
      if(userData){
        console.log(userData.data);
        res.render('declareResult',
        {
          name:typeof(cookie.adminUser)  === 'undefined'?null:cookie.adminUser,
          userData:userData.data,
          // userData:data.demoUser,
          unitChallenge:unitChallenge,
          end_date:null
       });
      }
      else res.send(err);
    });
}

else res.redirect('/admin');
};

exports.uploadMiddleWare=(req,res)=>{
//   console.log('now reading---1');
//
//   const form = new formidable.IncomingForm();
//
//    form.parse(req);
//
//     form.on('file', function (name, file){
//         console.log('Uploaded ' + file.name);
//         res.send('done');
// });

    // const unitChallenge=req.cookies.resultPublish;
    // data.uploadResultFile(unitChallenge.competition_id,files.screenshot.name,(errFile,dataFile)=>{
    //   if(errFile){
    //     res.send(errFile);
    //   }
    //   else if(dataFile){
    //     console.log(dataFile);
    const unitChallenge=req.cookies.resultPublish;
        data.createResult(unitChallenge.competition_id,req.body.myData,unitChallenge,(err,data)=>{
          if(err){
             res.send(err);
          }
          else{
            res.cookie('resultPublished', true,{ httpOnly: true });
            // res.contentType('application/json');
            // const redirectURL = JSON.stringify('http://localhost:3000/adminPanel');
            // res.header('Content-Length', redirectURL.length);
            res.redirect('/adminPanel');
          }
        });
      // }
  //  });
  };
