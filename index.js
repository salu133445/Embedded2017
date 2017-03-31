var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var arrOnlineUsername = [];
var arrOnlineNickname = [];
var arrRegisteredUser = [];
var numGuest = 1;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
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
    if(socket.username != undefined) {
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
});

http.listen(3000, function() {
  console.log('listening on *:3000');
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
  console.log("*new user: " + data.account + " has registered into system.*")
  // TODO: write to JSON file 
}