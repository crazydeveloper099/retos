// $(document).ready(function () {
/***
 *  let socket = io('/', {
  secure: true,
  rejectUnauthorized: false,
  path: 'mysocket/socket.io'
});
 */
$(document).ready(function () {
    let socket = io.connect('/',{"transports": ['websocket'],upgrade: false});
    var buttonIdCount=0;
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'https://proxy.notificationsounds.com/notification-sounds/sharp-592/download/file-sounds-1139-sharp.mp3');    
    var isBlocked;   
    var messageCounter=0;
    const messageTimer=1000;
    var spamTimer=null;
    var spamTimeout=null;
    let isLoaded=false;
    // -------------------------------------------------
    //ask the user for their name:
    (async function () {

        let username = $('#userGameName').val();
        if (!username) { username = "Anonymous_User"; }

        //save username also on the client's socket.
        socket.username = username;
        


        //Let the socket at the server "know" the value of the username. Each client will have their own username.
        socket.emit('username', socket.username);
        const checkBlocked=async()=>{
            let opts={'userName':socket.username,'ID':$("#challengeID").val()}
            $.ajax({
                url: window.location.origin+"/checkIfBlocked",  
                type: 'POST',
                data: opts,
                success:(isBlockedResponse)=>{
                    if(isBlockedResponse){
                       isBlocked=true;
                    }
                    else{
                        isBlocked=false;
                    }
                }
            });    
        }
       await checkBlocked();

    })();

    // -------------------------------------------------
    //SOCKET.ON FUNCTIONS:
    socket.on('userConnected', (usernameThatJustConnected) => { 
        if(!isLoaded){
            const username_no_white_space = removeWhiteSpaceFromUsername(usernameThatJustConnected)
            let opts={'ID':$("#challengeID").val()}
            $.ajax({
                url: window.location.origin+"/loadChat",  
                type: 'POST',
                data: opts,
                success:function(response){
                    isLoaded=true;
                    // response.length>10?response.slice()
                    response.map(data  =>  {
    
                        var name = data.sender;
                        var date= data.timeStamp;
                        var diffDays=0;
                        if(typeof(date)!=='undefined'){
                            let now=new Date (moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"));
                            let chatDate=new Date(date);
                            const diffTime = Math.abs(now - chatDate);
                            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        }
                        if(diffDays>0){
                            // var li = `<div id="parentCenter">
                            // <div id="childCenter">` 
                            // +diffDays>1?'<li class="blockNotification"> <strong>'+diffDays+' ago</strong> <li>': '<li class="blockNotification"> <strong>Yesterday</strong> <li>'
                            // + `</div></div>`;
                            // $('#messages').append(li);
                        }
                        var initials='#'
                        if(typeof(name)!=='undefined'){
                            initials= name.charAt(0).toUpperCase()
                        }
                        let msg_with_style="";
                        let automated_response="";
                        if(data.sender === socket.username){
                                msg_with_style = `<div id="parentRight">
                                <div id="childRight">` 
                                + data.message 
                                + `</div> 
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div></div>`;
    
                            if(data.automatedRes!=null)
                                automated_response = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon" class='chatIconAdmin' >R</div></div><div id="childLeft">` +  data.automatedRes  + `</div></div>`;       
                        }  
                        else{
                            if(socket.username=='Admin'){
                                msg_with_style = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div>
                                <div id="childLeft">
                                <button type="button" class="btn btn-warning loda" id="blockButton`+buttonIdCount+`" value=${name} >BLOCK</button>` + 
                                data.message + 
                                `</div></div>`;
                                
                                $(document).on('click',"#blockButton"+buttonIdCount,function(){
                                    let blockUserObj={'userName':$(this).val(),'ID':$("#challengeID").val()}
                                    socket.emit('blockUser(client->server)', JSON.stringify(blockUserObj));
                                })
    
                            
    
                                buttonIdCount+=1;
                            }
                            else{
                                msg_with_style = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div><div id="childLeft">` + data.message + `</div></div>`; 
                            }  
                        }    
                        $('#messages').append(msg_with_style);
                        if(!data.automatedRes!=null && automated_response!=""){$('#messages').append(automated_response);}
    
                        document.getElementById('messages_center').scrollTo(0, document.getElementById('messages_center').scrollHeight);
                        
                    });
    
                },
                error:function (error) {
                }
            })
        }

        //add to username_is_typing_board the user's div
        // $('#username_is_typing_board').append( username_no_white_space + "is typing...");
    });
    socket.on('userDisconnected', (usernameThatJustDisonnected) => { //() => {} is a nameless function   
        // var spamMsg=`<div id="parentCenter">
        //                 <div id="childCenter">` 
        //                 +'<li id="disconnectedNotif" ><a><i class="fas fa-redo"></i> Reload</a>you are disconnected from server<li>'
        //                 + `</div></div>`;
                        
        // $('#message_form_input').prop( "disabled", true );

        // $('#messages').append(spamMsg);

        
        // $('#username_is_typing_board').css('display', 'invisible');
        // $('#username_is_typing_board').html('typing..')
    });
    socket.on('updateNumUsersOnline', (num_users_online) => {
        $('#num_users_online_number').html('<h3>' + num_users_online + ' Users Online</h3>');
    });


    //on socket event of "addChatMessage(server->clients)", do the following: (add the value to the messages list)
    socket.on('addChatMessage(server->clients)', function (usernameAndMsg) {
        if(usernameAndMsg[2]===$("#challengeID").val()){
            let username_adding_msg = usernameAndMsg[0];
            let msg = usernameAndMsg[1];

            var name = username_adding_msg;
            var initials = name.charAt(0).toUpperCase();
            //set different backgroud for the user that sent the message:
            let msg_with_style="";
            let automated_response="";
            if(username_adding_msg === socket.username) {
                msg_with_style = `<div id="parentRight"><div id="childRight">` 
                + msg + `</div> 
                <div id="chatIconContainer">
                <div id="chatIcon">`+initials+`</div></div></div>`;
                if(usernameAndMsg[3]!=null)
                automated_response = `<div id='parentLeft'>
                <div id="chatIconContainer">
                <div id="chatIcon" class='chatIconAdmin' >R</div></div><div id="childLeft">` +  usernameAndMsg[3]  + `</div></div>`;
            }
          
            
            else{ 
                audioElement.play();
                if(socket.username==='Admin'){
                    msg_with_style = `<div id='parentLeft'>
                            <div id="chatIconContainer">
                            <div id="chatIcon">`+initials+`</div></div><div id="childLeft">
                            <button type="button" id="blockButton`+buttonIdCount+`" value=${name} class="btn btn-warning loda" >BLOCK</button>` + 
                            msg + 
                            `</div></div>`;

                            $(document).on('click',"#blockButton"+buttonIdCount,function(){
                                let blockUserObj={'userName':$(this).val(),'ID':$("#challengeID").val()}
                                socket.emit('blockUser(client->server)', JSON.stringify(blockUserObj));
                            })

                            buttonIdCount+=1;
                }
                else{
                msg_with_style = `<div id='parentLeft'>
                <div id="chatIconContainer">
                <div id="chatIcon">`+initials+`</div></div><div id="childLeft">` +  msg  + `</div></div>`;
                }
            }
            $('#messages').append(msg_with_style);
            
            if(!usernameAndMsg[3]!=null && automated_response!=""){
                setTimeout(()=>{
                    audioElement.play();
                    $('#messages').append(automated_response);
                },2000);
            } 
            document.getElementById('messages_center').scrollTo(0, document.getElementById('messages_center').scrollHeight);
       }
    });

    // -------------------------------------------------
    //add to our form a submit attribue (with the following function):
    // sending a message to the chat:
    $('#message_form').submit((e)=> {
        var idClicked=$(document.activeElement).attr('id');
        var msg= $('#'+$(document.activeElement).attr('id')).html()
                e.preventDefault();
                if(isBlocked){
                    var li = `<div id="parentCenter">
                    <div id="childCenter">` 
                    + '<li class="blockNotification"> <strong>You are currently blocked from this chat</strong> <li>'
                    + `</div></div>`;
                    $('#messages').append(li);
                }
                else{
                        
                    if(messageCounter>3){
                          
                        var randomizedId=Math.floor(Math.random() * 1000);  
                        if(this.spamTimer==null){
                            var messageCounterTimer=30;
                            var spamMsg=`<div id="parentCenter">
                        <div id="childCenter">` 
                        +'<li id="spamTimer'+randomizedId+'" >  <li>'
                        + `</div></div>`;
                            this.spamTimer=window.setInterval(()=>{
                                messageCounterTimer-=1;
                                $('#spamTimer'+randomizedId).html('Please try again in '+messageCounterTimer+' seconds');
                                $('#username_is_typing_board').css('visibility', 'hidden');
                                $('#username_is_typing_board').html('typing..')
                            },messageTimer)
                            $('#messages').append(spamMsg);
                        }
                        if(this.spamTimeout==null){
                            this.spamTimeout=window.setTimeout((e) => {
                                clearTimeout(this.spamTimer)

                                messageCounter=0;   
                                this.spamTimer=null;
                                this.spamTimeout=null
                                $('#spamTimer'+randomizedId).html('You can start typing now!');
                                
                            }, 30000);  
                        } 
                           
                                      
                    }
                    else{
                        messageCounter+=1
                        let user_message = msg;
                        if (user_message === "") {
                            return false; 
                        }
                        let msgObject={'msg':msg,'ID':$("#challengeID").val()}
                        if(idClicked=='chatMsg14')
                            msgObject['automatedRes']='¡Por supuesto!, utiliza el siguiente formulario: https://forms.gle/MY96YTD1Gv8EZt5g8';
                        
                        else if(idClicked=='chatMsg12')
                            msgObject['automatedRes']=`¡Felicidades, ${socket.username}! Deberás aguardar a que tu balance se actualice con las Retos Coins ganadas en este evento. Luego, podrás retirar tu saldo en la sección de "Mi cuenta".`;
                        
                        else if(idClicked=='chatMsg11')
                            msgObject['automatedRes']='🎉🎊';
                        
                        else if(idClicked=='chatMsg10')
                            msgObject['automatedRes']='Dirígete al chat que encontrarás en la parte inferior derecha del sitio web, para recibir la atención de un administrador. '; 
                        
                        else if(idClicked=='chatMsg9')
                            msgObject['automatedRes']='Dirígete al chat que encontrarás en la parte inferior derecha del sitio web, para recibir la atención de un administrador. ';
                        
                        else if(idClicked=='chatMsg5')
                            msgObject['automatedRes']=`¡Bienvenido, ${socket.username}, suerte en tus partidas!`;
                           
                            
                            
                        socket.emit('addChatMessage(client->server)', JSON.stringify(msgObject));                          
                        return false; 
                    }
                   
                }
    });
        

 
    var typingTimer=null; //setTimeOut() identifier;
    var doneTypingInterval = 2000;
    //notify server on keydown
    $('#message_form_input').on("keydown", function (e) {
        //log 'is typing...' only if the key is printable
        if (isPrintableKey(e) && !(isBlocked)) socket.emit('userIsTypingKeyDown(client->server)', $("#challengeID").val());
    });

    //notify server on keyup
    $('#message_form_input').on("keyup", function (e) {
        if (isPrintableKey(e) && !(isBlocked)) socket.emit('userIsTypingKeyUp(client->server)', $("#challengeID").val());
    });

    //handle keydown by some user
    socket.on('userIsTypingKeyDown(server->clients)', function (usernameAndIsTyping) {
        const usernameTyping_no_white_space = removeWhiteSpaceFromUsername(usernameAndIsTyping[0]);
        //new pressing of a key, don't want to remove is_typing notification from previous keyup event.
        if($("#challengeID").val()===usernameAndIsTyping[2]){
            if (typingTimer) {
                clearTimeout(typingTimer); //cancel the previous timer.
                typingTimer = null;
            }        
    
            //check if the username that is typing has a li in the board of is_typing. if not, add one.
            if ($.trim($("#username_is_typing_board").html())=='typing..') {
                $('#username_is_typing_board').css('visibility', 'visible');
                $('#username_is_typing_board').html(usernameTyping_no_white_space + ' is typing '+'  <span class="dots-cont"> <span class="dot dot-1"></span> <span class="dot dot-2"></span> <span class="dot dot-3"></span> </span>');
            }
            else if($.trim($("#username_is_typing_board").html()).includes('is typing') && !$.trim($("#username_is_typing_board").html()).includes(usernameTyping_no_white_space)){
                $('#username_is_typing_board').css('visibility', 'visible');
                $('#username_is_typing_board').html('Multiple users are typing '+'  <span class="dots-cont"> <span class="dot dot-1"></span> <span class="dot dot-2"></span> <span class="dot dot-3"></span> </span>');
            }
        }
        //if this is the first time typing in the current typing session, edit the notification:
    });

    //handle keyup by some user
    socket.on('userIsTypingKeyUp(server->clients)', function (usernameTyping) {
        //start count down (again?) to disappear the is_typing notification.
        if($("#challengeID").val()===usernameTyping[1]){
            typingTimer = window.setTimeout(() => {
                $('#username_is_typing_board').css('visibility', 'hidden');
                $('#username_is_typing_board').html('typing..')
            }, doneTypingInterval);
        }
    });
    socket.on('blockUser(server->clients)', function (response) {
        if(response[0]==='success'){
            audioElement.play();
            var li = `<div id="parentCenter">
            <div id="childCenter">` 
            + '<li class="blockNotification"> <strong>Admin Blocked '+response[1]+' </strong> <li>'
            + `</div></div>`;
            $('#messages').append(li);
        }
    });
});

//remove white spaces from username FOR THE ID, if there's any
function removeWhiteSpaceFromUsername(username) {
    return username.replace(/\s/g, "")
}

function isPrintableKey(key_event) {
    if (key_event.key.length === 1) return true;
    return false;
}





// ///
// const https = require('https');
//  const path=require('path');
// const fs = require('fs');


// const app=express();

// const httpsServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname,'cert','key.pem')), 
//     cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
//   }, app);
// const io = require('socket.io')(httpsServer);


// // const https = require('https').createServer(options);
// // const io = require('socket.io')(https);

// //
// const app=express();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);




     