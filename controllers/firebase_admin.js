const path = require('path');
const admin= require('firebase-admin');
const pathToServiceAccount=path.resolve('./controllers/fb_admin_sdk.json');
const serviceAccount = require(pathToServiceAccount);
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
moment().toString();
dotenv.config();


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://retosgamer-328be.firebaseio.com"
  });


let registrationTokens = [];


exports.sendPushNotification=(message, callback)=>{
  admin.messaging().send(message)
  .then((response)=>{
      console.log(response);
      callback();
  })
  .catch((err)=>{
      console.log(err);
      callback()
  })
}

exports.subscribe=(token, topic,callback)=> {
  registrationTokens.push(token);
  admin.messaging().subscribeToTopic(registrationTokens, topic)
  .then(function(response) {
    
    console.log('Successfully subscribed to topic:', response);
    callback(null,response);
  })
  .catch(function(error) {
    console.log('Error subscribing to topic:', error);
    callback(error,null);
  });
}

exports.sendToTopic=(challengeName,challengeId,callback)=>{

  const message = {
    
    webpush: {
      notification:{
        title:challengeName+" Challenge añadido",
        body:"¡Únete y entra a la sala para ganar!",
        icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//retos/rg.png',
        click_action: 'https://retosgamer.com/challenge?id='+challengeId  
    },
  },
    topic: 'all'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
    callback(null,response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
    callback(error,null);
  });
}



exports.sendToTopicResults=(challengeName,challengeId,callback)=>{

  const message = {
    
  webpush: {
    notification:{
      title:challengeName+" resultados anunciados",
      body:"Check standings now!",
      icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//retos/rg.png',
      click_action: 'https://retosgamer.com/leaderBoardChallenge?id='+challengeId
  },
},
  topic: 'all'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
    callback(null,response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
    callback(error,null);
  });
}

exports.challengeNotification=(action,resultTime,challengeId,challengeName,callback)=>{
  


    const message = {webpush: {},topic: 'all'};
    
    if(action==='PASSWORD_ANNOUNCED'){
      message.webpush.notification=
        {title:challengeName+" El código de la sala ha sido anunciado",
        body:"¡Únete y entra a la sala para ganar!",
        icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//retos/rg.png',
        click_action: 'https://retosgamer.com/challenge?id='+challengeId}  
    } 
    else if(action==='DETAILS_UPDATED'){
      message.webpush.notification=
      {title:'Se ha modificado el evento '+challengeName,
      body:"Mira los cambios ahora.",
      icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//retos/rg.png',
      click_action: 'https://retosgamer.com/challenge?id='+challengeId}  
      } 

    else if(action==='MATCH_ENDED'){

      message.webpush.notification=
      {title:challengeName+" encima",
      body:"",
      icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//retos/rg.png',
      click_action: 'https://retosgamer.com/challenge?id='+challengeId}  
    


      var now = moment(moment.tz(new Date(), "GMT")
                .utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"),'MM/DD/YYYY hh:mm:ss a')
                .valueOf()
      var distance = new Date(resultTime.S).getTime() - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    if(days<1){
      if(hours>0){
        message.webpush.notification.body="El resultado se anunciará en "+hours+" horas y "+minutes + " minutos";  
      }
      else{
        message.webpush.notification.body="El resultado se anunciará en "+minutes + "minutos ";
      }
    }
     
    else{
      message.webpush.notification.body="El resultado se anunciará en "+days+" day(s)";  
    }  
  }
     
  console.log('*-------------------------------------------------------------*');
console.log(message);
console.log('*-------------------------------------------------------------*');
  
  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      callback(null,response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      callback(error,null);
    });
}

