var express = require('express')
, npid = require("npid")
, uuid = require('node-uuid')
, Room = require('./room.js')
, _ = require('underscore')._
, mongoose = require('mongoose')
, passport = require('passport')
, flash    = require('connect-flash')
, morgan       = require('morgan')
, methodOverride = require('method-override')
, session = require('express-session')
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')

, app = express()
, server = require('http').createServer(app)
, io = require("socket.io").listen(server)
,
    sessionStore     = require('connect-mongo')(session), // find a working session store (have a look at the readme)
    passportSocketIo = require("passport.socketio")
, configDB = require('./config/database.js');

app.set('socketio', io);

app.set('port', process.env.PORT || 8080);
app.set('ipaddr', process.env.IP || "127.0.0.1");

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
  key: 'express.sid',
  store: new sessionStore({ mongooseConnection: mongoose.connection }),
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(methodOverride());

app.use(express.static(__dirname + '/public'));
app.use('/components', express.static(__dirname + '/components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/icons', express.static(__dirname + '/icons'));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================

/* Store process-id (as priviledged user) */
try {
    npid.create('/var/run/advanced-chat.pid', true);
} catch (err) {
    console.log(err);
    //process.exit(1);
}

server.listen(app.get('port'),function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res) {
  	res.render('pages/index', {
	  	mainScreen:"../partials/welcomeScreen",
	  	active:"not-active",
	  	rows:12,
	  	boardSize: "large"
  	});
});

app.get('/:size', function(req, res) {
	var size  = parseInt(req.params.size),
		board ="";
		
    var io = req.app.get('socketio');
	var sizePeople = _.size(people);
	var sizeRooms = _.size(rooms);
	io.sockets.emit("update-people", {people: people, count: sizePeople});
	io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms, s: size});
	if ( size === 4){
		board = "small";
	} else if (size === 6){
		board = "medium";
	} else {
		board = "large";
	}
	
  	res.render('pages/index', {
	  	mainScreen:"../partials/gameScreen",
	  	active:"not-active",
	  	rows:12,
	  	boardSize: "large"
  	});
});

io.set("log level", 1);
// With Socket.io < 1.0 
io.set('authorization', passportSocketIo.authorize({
  cookieParser:cookieParser,
  key:         'express.sid',       // the name of the cookie where express/connect stores its session_id 
  secret:      'keyboard cat',    // the session_secret to parse the cookie 
  store: new sessionStore({ mongooseConnection: mongoose.connection }),        // we NEED to use a sessionstore. no memorystore please 
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below 
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below 
}));
 
function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
 
  // The accept-callback still allows us to decide whether to 
  // accept the connection or not. 
  accept(null, true);
}
 
function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);
 
  // We use this callback to log all of our failed connections. 
  accept(null, false);
}
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

function purge(s, action) {
	/*
	The action will determine how we deal with the room/user removal.
	These are the following scenarios:
	if the user is the owner and (s)he:
		1) disconnects (i.e. leaves the whole server)
			- advise users
		 	- delete user from people object
			- delete room from rooms object
			- delete chat history
			- remove all users from room that is owned by disconnecting user
		2) removes the room
			- same as above except except not removing user from the people object
		3) leaves the room
			- same as above
	if the user is not an owner and (s)he's in a room:
		1) disconnects
			- delete user from people object
			- remove user from room.people object
		2) removes the room
			- produce error message (only owners can remove rooms)
		3) leaves the room
			- same as point 1 except not removing user from the people object
	if the user is not an owner and not in a room:
		1) disconnects
			- same as above except not removing user from room.people object
		2) removes the room
			- produce error message (only owners can remove rooms)
		3) leaves the room
			- n/a
	*/
	if (people[s.id].inroom) { //user is in a room
		var room = rooms[people[s.id].inroom]; //check which room user is in.
		if (s.id === room.owner) { //user in room and owns room
			if (action === "disconnect") {
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the server. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete rooms[people[s.id].owns]; //delete the room
				delete people[s.id]; //delete user from people collection
				delete chatHistory[room.name]; //delete the chat history
				sizePeople = _.size(people);
				sizeRooms = _.size(rooms);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
				io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") { //room owner removes room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has removed the room. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			} else if (action === "leaveRoom") { //room owner leaves room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the room. The room is removed and you have been disconnected from it as well.");
				io.sockets.in(s.room).emit("somePlayerLeftRoom");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
			}
		} else {//user in room but does not own room
			if (action === "disconnect") {
				io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					s.leave(room.name);
				}
				delete people[s.id];
				sizePeople = _.size(people);
				io.sockets.emit("update-people", {people: people, count: sizePeople});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") {
				s.emit("update", "Only the owner can remove a room.");
			} else if (action === "leaveRoom") {
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					people[s.id].inroom = null;
					io.sockets.emit("update", people[s.id].name + " has left the room.");
					io.sockets.in(s.room).emit("disableBoard");
					s.leave(room.name);
				}
			}
		}	
	} else {
		//The user isn't in a room, but maybe he just disconnected, handle the scenario:
		if (action === "disconnect") {
			io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
			delete people[s.id];
			sizePeople = _.size(people);
			io.sockets.emit("update-people", {people: people, count: sizePeople});
			var o = _.findWhere(sockets, {'id': s.id});
			sockets = _.without(sockets, o);
		}		
	}
}

io.sockets.on("connection", function (socket) {
	var userId = socket.handshake.user._id;
	console.log(socket.handshake.user.local.size);
	sizePeople = _.size(people);
	sizeRooms = _.countBy(_.pluck(rooms, 's'), function(num) {
  if (num === 4)return 'small';
  else if (num === 8)return 'medium';
  else return 'large';
});
	io.sockets.emit("update-people", {people: people, count: sizePeople});
	socket.emit("roomList", {rooms: rooms, count: sizeRooms});

	socket.on("joinserver", function(name, device) {
		var ownerRoomID = inRoomID = myPlayerTile = null;
			people[socket.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID, "device": device, "tile": myPlayerTile};
			socket.emit("update", "You have connected to the server.");
			io.sockets.emit("update", people[socket.id].name + " is online.");
			sizePeople = _.size(people);
			sizeRooms = _.size(rooms);
			io.sockets.emit("update-people", {people: people, count: sizePeople});
			socket.emit("roomList", {rooms: rooms, count: sizeRooms});
			socket.emit("joined"); //extra emit for GeoLocation
			sockets.push(socket);
	});

	socket.on("getOnlinePeople", function(fn) {
                fn({people: people});
        });

	socket.on("countryUpdate", function(data) { //we know which country the user is from
		country = data.country.toLowerCase();
		people[socket.id].country = country;
		io.sockets.emit("update-people", {people: people, count: sizePeople});
	});

	socket.on("typing", function(data) {
		if (typeof people[socket.id] !== "undefined")
			io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
	});
	
	socket.on("send", function(msTime, msg) {
		//process.exit(1);
		var re = /^[w]:.*:/;
		var whisper = re.test(msg);
		var whisperStr = msg.split(":");
		var found = false;
		if (whisper) {
			var whisperTo = whisperStr[1];
			var keys = Object.keys(people);
			if (keys.length != 0) {
				for (var i = 0; i<keys.length; i++) {
					if (people[keys[i]].name === whisperTo) {
						var whisperId = keys[i];
						found = true;
						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "You can't whisper to yourself.");
						}
						break;
					} 
				}
			}
			if (found && socket.id !== whisperId) {
				whisperTo = whisperStr[1];
				var whisperMsg = whisperStr[2];
				socket.emit("whisper", {name: "You"}, whisperMsg);
				io.sockets.socket(whisperId).emit("whisper", msTime, people[socket.id], whisperMsg);
			} else {
				socket.emit("update", "Can't find " + whisperTo);
			}
		} else {
			if (io.sockets.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
				io.sockets.in(socket.room).emit("chat", msTime, people[socket.id], msg);
				socket.emit("isTyping", false);
				if (_.size(chatHistory[socket.room]) > 10) {
					chatHistory[socket.room].splice(0,1);
				} else {
					chatHistory[socket.room].push(people[socket.id].name + ": " + msg);
				}
		    	} else {
				socket.emit("update", "Please connect to a room.");
		    	}
		}
	});

	socket.on("disconnect", function() {
		if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
			purge(socket, "disconnect");
		}
	});

	//Room functions
	socket.on("createRoom", function(name, boardSize) {
		if (people[socket.id].inroom) {
			socket.emit("update", "You are in a room. Please leave it first to create your own.");
		} else if (!people[socket.id].owns) {
			socket.emit("hideCreateRoomButton");
			socket.emit("showLeaveButton");  
			var id = uuid.v4();
			var room = new Room(name, id, socket.id, boardSize);
			rooms[id] = room;
			socket.emit("sendRoomID", {id: id,
									   active: true}
						);
			
			//var myRooms = {};
			//for(var prop in rooms) {
				//if (rooms[prop].s === boardSize)
			//	myRooms[prop] = rooms[prop];
    // `prop` contains the name of each property, i.e. `'code'` or `'items'`
    // consequently, `data[prop]` refers to the value of each property, i.e.
    // either `42` or the array
//}
			sizeRooms = _.size(rooms);
			io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms, s: boardSize});
			//add room to socket, and auto join the creator of the room
			people[socket.id].owns = id;
			playerSetup(room, socket.id, id, 'Z', name);
			room.setRandPic();
			socket.emit("update", "Welcome to " + room.name + ".");
			chatHistory[socket.room] = [];
		} else {
			socket.emit("update", "You have already created a room.");
		}
	});

	socket.on("checkNames", function(roomname, username, fn) {
		var roomExists = userExists = false;
		_.find(rooms, function(key,value) {
			if (key.name === roomname)
				return roomExists = true;
		});

		_.find(people, function(key,value) {
			if (key.name.toLowerCase() === username.toLowerCase())
				return userExists = true;
		});
		
		if (userExists) {//provide unique username:
			var randomNumber=Math.floor(Math.random()*1001);
			do {
				var proposedName = username+randomNumber;
				_.find(people, function(key,value) {
					if (key.name.toLowerCase() === proposedName.toLowerCase())
						return userExists = true;
				});
			} while (!userExists);
		}
		fn({roomExists: roomExists,
			userExists: userExists,
			proposedName: proposedName,
		});
		
	});

	
	socket.on("checkAnswer", function(answer, fn) {
		socket.emit("disableCheckAnswerButton");
		var match = false;
		var room = getRoom();
		if (room.currentPic === answer)
			match = true;
		fn({result: match,
			attempts: people[socket.id].attempts -1
		});
	});
	
	socket.on("adjustScore", function(data) {
		var room = getRoom();
			people[socket.id].score += data.score;
			if (data.decreaseAttempts) {
				people[socket.id].attempts -= 1;
			}
			data.myCreatorScore = people[room.people[0]].score;
			data.myJoinerScore = people[room.people[1]].score;
		    io.sockets.in(socket.room).emit('sendScoresToClients', data);
	});	

	socket.on("removeRoom", function(id) {
		 var room = rooms[id];
		 if (socket.id === room.owner) {
			purge(socket, "removeRoom");
		} else {
         	socket.emit("update", "Only the owner can remove a room.");
		}
	});

	socket.on("joinRoom", function(id) {
		if (typeof people[socket.id] !== "undefined") {
			var room = rooms[id];
			if (socket.id === room.owner) {
				socket.emit("update", "You are the owner of this room and you have already been joined.");
			} else {
				if (_.contains((room.people), socket.id)) {
					socket.emit("update", "You have already joined this room.");
				} else {
					if (people[socket.id].inroom !== null) {
				    		socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
				    	} else {
						socket.emit("hideCreateRoomButton");
						socket.emit("showLeaveButton"); 
						playerSetup(room, socket.id, id, 'O');
						io.sockets.in(socket.room).emit("update", people[socket.id].name + " has connected to " + room.name + " room.");
						socket.emit("update", "Welcome to " + room.name + ".");
						socket.emit("sendRoomID", {id: id});
						io.sockets.in(socket.room).emit("showStartButton");
						var keys = _.keys(chatHistory);
						if (_.contains(keys, socket.room)) {
							socket.emit("history", chatHistory[socket.room]);
						}
					}
				}
			}
		} else {
			socket.emit("update", "Please enter a valid name first.");
		}
	});

	socket.on("startGame", function(id) {
		var room = getRoom();
		room.setUpPlayingBoard();
		people[room.people[0]].score = 0;
		people[room.people[1]].score = 0;
		var data= {
			creatorName:	people[room.people[0]].name, 
			joinerName:		people[room.people[1]].name,
			randPic:		room.getRandPic()
		};
		io.sockets.in(socket.room).emit("showBoard", data);
    	io.sockets.in(socket.room).emit('update', 'New game started!');
	});

	socket.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room)
			purge(socket, "leaveRoom");
	});
	
	socket.on("sendClickedButton", function(data) {
		var room = getRoom();
		getScores(room, data, people[socket.id]);
		adjustScreens(data, people[socket.id]);
		validateMoves(room, data);
			
	});
	
/*
		socket.on("validMoves", function(data) {
	var room = getRoom();
	data.myPlayerTile = people[socket.id].tile;
	data.myPlayerTile == "Z" ? data.secondPlayerTile = "O" : data.secondPlayerTile = "Z";
		console.log("my player "+ data.myPlayerTile + "second player "+ data.secondPlayerTile);
	if(people[socket.id].name == people[room.people[0]].name) {
		data.myPlayerName = people[room.people[0]].name;
		data.secondPlayerName = people[room.people[1]].name;
	} else {
		data.myPlayerName = people[room.people[1]].name;
		data.secondPlayerName = people[room.people[0]].name;		
	}
	var validMoves = room.checkValidMoves(data);
	data.message = "";
	if(!validMoves.myPlayerHasValidMoves || !validMoves.secondPlayerHasValidMoves) {
			data.message = "Game Over \n";
		if(!validMoves.myPlayerHasValidMoves & !validMoves.secondPlayerHasValidMoves) {
			data.message += "Neither of players have any more valid moves left";
		} else if (!validMoves.myPlayerHasValidMoves){
			data.message += "Player" +data.myPlayerName+ "has no more valid moves";
		} else {
			data.message += "Player" +data.secondPlayerName+ "has no more valid moves";
		}
		io.sockets.in(socket.room).emit('endGame', data);
		console.log("Somebody has no more valid moves");
	} else {
		console.log("Both players have still valid moves");
	}
	});*/
	
	//HELPER FUNCTIONS
	
	var getRoom = function (){
		var roomID = people[socket.id].inroom;
		var room = rooms[roomID];
		return room;
	};
	
	var playerSetup = function (room, socketId, id, tile, name){
		people[socketId].id = socketId;
		people[socketId].inroom = id;
		people[socketId].tile = tile;
		people[socketId].score = 0;
		people[socketId].attempts = 3;
		people[socketId].canAnswer = false;
		people[socketId].active = false;
		room.addPerson(socketId);
		socket.room = name || room.name;
		socket.join(socket.room);
	};
	
	var validateMoves = function (room, data){
	    var peoples = room.getPeople();
  		var playersWithValidMoves = peoples.length;
		var highestScore = 0;
  		var winnersId = '';
		for(var i = 0; i < peoples.length; i++) {
		  data.myPlayerTile = people[peoples[i]].tile;   
		  room.checkValidMoves(data);
		  if(!data.validMoves) {
		    playersWithValidMoves -= 1;
		  }
		  data.myPlayerScore = people[peoples[i]].score; 
		  if(data.myPlayerScore > highestScore) {
		  	winnersId = people[peoples[i]].id;
		  	highestScore = data.myPlayerScore;
		  }
		}
		if (playersWithValidMoves === 0) {
			for(i = 0; i < peoples.length; i++) {
				if (peoples[i] == winnersId) {
    				io.sockets.socket(peoples[i]).emit('update', 'You won!');
				} else {
    				io.sockets.socket(peoples[i]).emit('update', people[winnersId].name + ' won, you lost!');
				}
			}
			io.sockets.in(socket.room).emit('endGame', data, 'Press Start button for a new game!');
			io.sockets.in(socket.room).emit("showStartButton");
		}
	};
	
	var getScores = function (room, data, socketId){
		data.myPlayerTile = socketId.tile;
		data.score = 0;
		room.checkMove(data);
		socketId.score += data.score;
		if(data.score > 0) {
			socketId.canAnswer = true;
		}
		data.myCreatorScore = people[room.people[0]].score;
		data.myJoinerScore = people[room.people[1]].score;
	};
	
	var adjustScreens = function (data, socketId){
		socket.broadcast.to(socket.room).emit("toggleActive");
		if(socketId.canAnswer) {
			socket.emit("enableCheckAnswerButton");	
		}
		if(socketId.attempts<1) {
			socket.emit("disableCheckAnswerButton");
		}
	    io.sockets.in(socket.room).emit('sendScoresToClients', data);
	    socket.emit("setTransparent", data);
	    socket.broadcast.to(socket.room).emit("setUncovered", data);
	};
});
