var fs = require('fs');
var express = require('express');
var app = express();
var os = require('os');
var path = require('path');
var http = require('http').Server(app);

var tessel = require('tessel');
var av = require('tessel-av');
var io = require('socket.io')(http);
var climatelib = require('climate-si7020');
var ambientlib = require('ambient-attx4');

var climate = climatelib.use(tessel.port.A);
var ambient = ambientlib.use(tessel.port.B);
var camera = new av.Camera();
var sound = new av.Speaker(mp3);

var port = 8888;
var mp3 = path.join(__dirname, 'meow.mp3');
var arrOnlineUsername = [];
var arrOnlineNickname = [];
var arrRegisteredUser = [];
var numGuest = 1;
var errClimate = 0;
var errAmbient = 0;
var ambientLightThreshold = 0.025;

app.use(express.static(path.join(__dirname, '/public')));

climate.on('ready', function () {
	console.log('Connected to climate module');
});

climate.on('error', function(err) {
  console.log('error connecting module', err);
  errClimate = 1;
});

ambient.on('ready', function () {
  console.log('Connected to ambient module');
});

ambient.on('error', function (err) {
  console.log('error connecting ambient module:\n', err);
  errAmbient = 1;
});

app.get('/stream', function(req, res) {
    res.redirect(camera.url);
    console.log("Camera is on.");
});

io.on('connection', function(socket) {
  if(!errClimate) {
    setInterval( function () {
		climate.readTemperature('c', function (err, temp) {
			climate.readHumidity(function (err, humid) {
				socket.emit('climate', { temp:temp, humid:humid } );
				setTimeout(loop, 1000);
			});
		});
	}, 1000);
  }
  
  if(!errAmbient) {
    var avoidRepeatingCall = 0;
    setInterval( function () {
      ambient.getLightLevel( function(err, lightdata) {
        if (err) throw err;
		  if(lightdata < ambientLightThreshold) {
          if(!avoidRepeatingCall) {
				 console.log("A paw has been detected.");
				 socket.emit('meow calling', {} );
			 }
			 if(avoidRepeatingCall < 5) {
				 avoidRepeatingCall ++;
			 } else {
				 avoidRepeatingCall = 0;
			 }
		  }
      });
    }, 1000);
  }
  
  socket.on('login attempt', function(data) {
    if(data.newUser===true) {
      var searchResult = searchUser(data);
      if(searchResult.accountFound) {
        socket.emit('register failed', {});
      } else {
        socket.username = data.account;
        socket.nickname = data.nickname;
        socket.emit('login successfully', socket.username);
		  arrOnlineUsername.push(socket.username);
        arrOnlineNickname.push(socket.nickname);
        socket.broadcast.emit('add user', { username:socket.username, nickname:socket.nickname,
                                                      usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname });
        socket.emit('update user list', { usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname } );
		  console.log("*new user: " + socket.username + " has registered and logged in.*"
			                 + "  (" + arrOnlineUsername.length + " online)");
        newUserRegister(data);
      }
    } else if(data.account === "guest") {
      socket.username = "guest" + numGuest;
      socket.nickname =  data.nickname;
      socket.emit('login successfully', socket.username);
      arrOnlineUsername.push(socket.username);
      arrOnlineNickname.push(socket.nickname);
		socket.broadcast.emit('add user', { username:socket.username, nickname:socket.nickname,
                                                      usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname });
      socket.emit('update user list', { usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname } );
		console.log("*new guest nicknamed: " + socket.nickname + 
		                  " has joined.*" + "  (" + arrOnlineUsername.length + " online)");
		numGuest = numGuest + 1;
    } else {
		var searchResult = searchUser(data);
		if(searchResult.login) {
        socket.username = data.account;
        socket.nickname = searchResult.nickname;
		  socket.emit('login successfully', socket.username);
        arrOnlineUsername.push(socket.username);
        arrOnlineNickname.push(socket.nickname);
        socket.broadcast.emit('add user', { username:socket.username, nickname:socket.nickname,
                                                      usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname });
        socket.emit('update user list', { usernameList:arrOnlineUsername, nicknameList:arrOnlineNickname } );
		  console.log("*user: " + socket.username + " has logged in.*"
			                 + "  (" + arrOnlineUsername.length + " online)");
      } else {
        socket.emit('login failed', { accountFound: searchResult.accountFound });
      }
    }
	 
 });
  
  socket.on('disconnect', function() {
    if(socket.username !== undefined) {
      io.emit('user left', { username: socket.username, nickname:socket.nickname,
                                    usernameList:arrOnlineUsername, ninameList:arrOnlineNickname });
	   arrOnlineUsername.splice(arrOnlineUsername.indexOf(socket.username), 1);
		arrOnlineNickname.splice(arrOnlineNickname.indexOf(socket.nickname), 1);
	   console.log("*user: " + socket.username + " has logged out.*  (" + arrOnlineUsername.length + " online)");
	 }
  });
  
  socket.on('chat message', function(msg) {
	 console.log(socket.username + " : " + msg);
	 var date = new Date();
    io.emit('chat message', { username:socket.username, nickname:socket.nickname, msg:msg,
	                                       year:date.getFullYear(), month:date.getMonth()+1, date:date.getDate(),
														hour:date.getHours(), minute:date.getMinutes() });
  });
  
  socket.on('call meow', function(data) {
    var sound = new av.Player(mp3);
    sound.play();
    console.log("A meow has been sent.");
  });
  
});

http.listen(port, function() {
  console.log('listening on *:', port);
  console.log(`http://${os.hostname()}.local:${port}`);
});

function searchUser(data) {
  for (var i=0; i < arrRegisteredUser.length; i++) {
    if (arrRegisteredUser[i].account === data.account) {
      if(arrRegisteredUser[i].password === data.password) {
        return { login:true, accountFound:undefined, nickname:arrRegisteredUser[i].nickname };
      } else {
        return { login:false, accountFound:true, nickname:undefined };
      }
    }
  }
  return { login:false, accountFound:false, nickname:undefined };
}

function newUserRegister(data) {
  arrRegisteredUser.push( { account:data.account, password:data.password, nickname:data.nickname } );
  console.log("*new user: " + data.account + " has registered into system.*");
  // TODO: write to JSON file 
}