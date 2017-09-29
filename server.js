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

io.set("log level", 1);
// With Socket.io < 1.0 
io.set('authorization', passportSocketIo.authorize({
  cookieParser:cookieParser,
  key:         'express.sid',       // the name of the cookie where express/connect stores its session_id 
  secret:      'keyboard cat',    // the session_secret to parse the cookie 
  store:	   new sessionStore({ mongooseConnection: mongoose.connection }),        // we NEED to use a sessionstore. no memorystore please 
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
var user = {};
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

function purge(s, action) {
			var size  = '';
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
		
	    var players = room.getPeople();
		for (var i=0; i<players.length; i++) {
			if (players[i] !== s.id) {
				io.sockets.socket(players[i]).emit("redirect", "/room");
			} else {
				io.sockets.socket(players[i]).emit("redirect", "/login");
			}
		}
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
				delete chatHistory[room.name]; //delete the chat history
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
				updateAfterOwnerDisrupt(s, size);
				room.removePerson(s.id);
				delete people[s.id]; //delete user from people collection
			} else if (action === "removeRoom") { //room owner removes room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has removed the room. The room is removed and you have been disconnected from it as well.");
				io.sockets.in(s.room).emit("redirect", "/room");
				socketids = [];
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
				delete chatHistory[room.name]; //delete the chat history// sending to all clients except sender
				updateAfterOwnerDisrupt(s, size);
				room.removePerson(s.id);
			} else if (action === "leaveRoom") { //room owner leaves room
				io.sockets.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the room. The room is removed and you have been disconnected from it as well.");
				io.sockets.in(s.room).emit("redirect", "/room");
				socketids = [];
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
				delete chatHistory[room.name]; //delete the chat history// sending to all clients except sender
				updateAfterOwnerDisrupt(s, size);
				room.removePerson(s.id);
			}
		} else {//user in room but does not own room
			if (action === "disconnect") {
				io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
				room.returnRandomTile([people[s.id].tile, people[s.id].tileHex]);
				
				//if (room.getPeople().length < 2) {
					if (room.gameStarted) {
					    players = room.getPeople();
						for (var i=0; i<players.length; i++) {
							if (players[i] !== s.id) {
								io.sockets.socket(players[i]).emit("redirect", "/room");
							} else {
								io.sockets.socket(players[i]).emit("redirect", "/login");
							}
						}
					} else {
						for(var key in people) {
						    if(people[key].owns !== null & _.contains(room.getPeople(), people[key].id)) {
						      io.sockets.socket(key).emit("hideStartButton");
						    }
							s.emit("redirect", "/login");
						}
					}
					
				/*} else {
					s.emit("redirect", "/login");
				}*/
				if (_.contains((room.people), s.id)) {
					people[s.id].inroom = null;
					io.sockets.in(s.room).emit("disableBoard");
					s.leave(room.name);
					lobbyUpdate (true, false, size, s);
					s.emit("updateActive", {s: size});
				}
				updateAfterPlayerDisrupt(s, size);
				o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
				delete people[s.id];
				room.removePerson(s.id);
			} else if (action === "removeRoom") {
				s.emit("update", "Only the owner can remove a room.");
			} else if (action === "leaveRoom") {
				io.sockets.emit("update", people[s.id].name + " has left the room.");
				room.returnRandomTile([people[s.id].tile, people[s.id].tileHex]);
				
				//if (room.getPeople().length < 2) {
					if (room.gameStarted) {
						io.sockets.in(s.room).emit("redirect", "/room");
					} else {
						for(var key in people) {
						    if(people[key].owns !== null & _.contains(room.getPeople(), people[key].id)) {
						      io.sockets.socket(key).emit("hideStartButton");
						    }
							s.emit("redirect", "/room");
						}
					}
					
				/*} else {
					s.emit("redirect", "/room");
				}*/
				if (_.contains((room.people), s.id)) {
					people[s.id].inroom = null;
					io.sockets.in(s.room).emit("disableBoard");
					s.leave(room.name);
					lobbyUpdate (true, false, size, s);
					s.emit("updateActive", {s: size});
				}
					
				updateAfterPlayerDisrupt(s, size);
				room.removePerson(s.id);
			}
		}	
	} else {
		//The user isn't in a room, but maybe he just disconnected, handle the scenario:
		if (action === "disconnect") {
			io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
			s.emit("redirect", "/login");
			delete people[s.id];
			lobbyUpdate (true, false, size, s);
			s.emit("updateActive", {s: size});
			var o = _.findWhere(sockets, {'id': s.id});
			sockets = _.without(sockets, o);
		}		
	}
}
function getSizeRooms(rooms) {
	var sizeRooms = _.countBy(_.pluck(rooms, 's'), function(num) {
	    if (num === 4)return 'small';
	    else if (num === 6)return 'medium';
	    else if (num === 12)return 'large';
	    else return 'Wrong!';
	});
	return sizeRooms;
}

function lobbyUpdate(ppl, rms, size, sckt) {
	var sizePeople = _.size(people),
		sizeRooms = getSizeRooms(rooms);
		
	if (ppl & rms) {
		io.sockets.emit("update-people", {people: people, count: sizePeople});
		sckt.emit("roomList", {rooms: rooms, count: sizeRooms, s: size});
	} else if (ppl) {
		io.sockets.emit("update-people", {people: people, count: sizePeople});
	} else if (rms) {
		sckt.emit("roomList", {rooms: rooms, count: sizeRooms, s: size});
	} else {
	}
}

function updateAfterOwnerDisrupt(s, size){								
			// load up the user model
			var index = 0,
			User  = require('./app/models/user');// get the user
			User.findById(people[s.id].databaseID, function(err, user) {
				if (err) throw err;
					console.log(user); // show the one user
			  
				size  = user.local.size;
				index = getBadgeIndex(index, size);
				var sizeRooms = getSizeRooms(rooms);
				s.broadcast.emit("updateOwnerLeaveRoom", {rooms: rooms, count: sizeRooms, s: size, index: index});
				s.emit("updateActive", {s: size});
			});
}

function updateAfterPlayerDisrupt(s, size){								
			// load up the user model
			var User  = require('./app/models/user');// get the user
			User.findById(people[s.id].databaseID, function(err, user) {
				if (err) throw err;
					console.log(user); // show the one user
			  
				size  = user.local.size;
				var sizeRooms = getSizeRooms(rooms);
				s.broadcast.emit("updatePlayerJoinOrLeaveRoom", {rooms: rooms, count: sizeRooms, s: size});
				s.emit("updateActive", {s: size});
			});
}

function getBadgeIndex(index, size){
	
	if (size === 'Small')     	{
    	index = 2;      	} 
	else if (size === 'Medium')	{
    	index = 1;          }
	else                    {
    	index = 0;      }
    return index;
}

io.sockets.on("connection", function (socket) {
	user = socket.handshake.user; // get user info from passport
	console.log("User ID: " + user._id);
	var size = socket.handshake.user.local.size;
	var ownerRoomID = inRoomID = myPlayerTile = null;
	socket.on("sendDevice", function(device) {
		people[socket.id] = {"databaseID" : user._id, "name" : user.local.userName, "owns" : ownerRoomID, "inroom": inRoomID, "device": device, "tile": myPlayerTile};
		lobbyUpdate (true, true, size, socket);
		socket.emit("updateActive", {s: size});
	});
	socket.emit("update", "You have connected to the server.");
	io.sockets.emit("update", user.local.userName + " is online.");
	socket.emit("joined"); //extra emit for GeoLocation
	sockets.push(socket);
	console.log("sockets: " + sockets);
	for (var i= 0; i < sockets.length; i++) {
	console.log("socket ID is in room: " + sockets[i].id);
	}
	for (var i= 0; i < people.length; i++) {
	console.log("people: " + people[i].id);
	}
	
	//Room functions
	socket.on("createRoom", function() {
		var name = people[socket.id].name;
		if (people[socket.id].inroom) {
			socket.emit("update", "You are in a room. Please leave it first to create your own.");
		} else if (!people[socket.id].owns) {
			socket.emit("updateOnCreateOrJoin");  
			var id = uuid.v4();
			socket.emit("sendRoomID", {id: id, active: true});
							
			// load up the user model
			var size  = '',
			index = 0,
			User  = require('./app/models/user');// get the user
			User.findById(people[socket.id].databaseID, function(err, user) {
				if (err) throw err;
					console.log(user); // show the one user
			  
				size  = user.local.size;
				var room = new Room(name, id, socket.id, size);
				rooms[id] = room;
					console.log(rooms[id]);
				people[socket.id].owns = id;
				room.shuffleColors();
				var tile = room.getRandomTile();
				playerSetup(room, socket.id, id, tile, name);
				room.setRandPic();
				socket.emit("update", "Welcome to " + room.name + ".");
				chatHistory[socket.room] = [];
				
				index = getBadgeIndex(index, size);
				var sizeRooms = getSizeRooms(rooms);
				io.sockets.emit("updateCreateRoom", {rooms: rooms, count: sizeRooms, s: size, index: index});
				console.log("socket room: " + socket.room);
		console.log("New room id" + people[socket.id].inroom);
			});
		} else {
			socket.emit("update", "You have already created a room.");
		}
	});

	socket.on("joinRoom", function(data) {
		console.log(data.id);
		console.log(people[socket.id].inroom);
		var room = rooms[data.id];
		if (room.isAvailable()) {
			if (typeof people[socket.id] !== "undefined") {
				if (socket.id === room.owner) {
					socket.emit("update", "You are the owner of this room and you have already been joined.");
				} else {
					if (_.contains((room.people), socket.id)) {
						socket.emit("update", "You have already joined this room.");
					} else {
						if (people[socket.id].inroom !== null) {
					    		socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
					    	} else {
							socket.emit("updateOnCreateOrJoin");
							var tile = room.getRandomTile();
							playerSetup(room, socket.id, data.id, tile, null);
							room.checkAvailability();
							io.sockets.in(socket.room).emit("update", people[socket.id].name + " has connected to " + room.name + " room.");
							socket.emit("update", "Welcome to " + room.name + ". You can start chatting now(note: Only the room owner can start the game!).");
							socket.emit("sendRoomID", {id: data.id});
							for(var key in people) {
							    if(people[key].owns !== null & _.contains(room.getPeople(), people[key].id)) {
							      io.sockets.socket(key).emit("showStartButton");
							    }
							}
							var keys = _.keys(chatHistory);
							if (_.contains(keys, socket.room)) {
								socket.emit("history", chatHistory[socket.room]);
							}
											
							// load up the user model
							var size  = '',
							User  = require('./app/models/user');// get the user
							User.findById(people[socket.id].databaseID, function(err, user) {
								if (err) throw err;
									console.log(user); // show the one user
							  
								size  = user.local.size;
								var sizeRooms = getSizeRooms(rooms);
								io.sockets.emit("updatePlayerJoinOrLeaveRoom", {rooms: rooms, count: sizeRooms, s: size});
							});
						}
					}
				}
			} else {
				socket.emit("update", "Please enter a valid name first.");
			}
		} else {
			socket.emit("update", "This room is already full.");
		}
	});

	socket.on("startGame", function(id) {
		var room = getRoom();
		room.setUpPlayingBoard();
		room.gameStarted = true;
    	room.disableRoom();
		var playersInRoom = [];
		for (var i = 0; i < room.people.length; i++) {
			people[room.people[i]].score = 0; //set to 0 on restart
			people[room.people[i]].attempts = 3;
			playersInRoom.push(people[room.people[i]]); //pass object with players in a room
		}
		var data = {
			playersInRoom:	playersInRoom,
			randPic:		room.getRandPic(),
			picNames:		room.getPicNames()
		};
		io.sockets.in(socket.room).emit("showBoard", data);
    	io.sockets.in(socket.room).emit('update', 'New game started!');
	});

	socket.on("leaveRoom", function(data) {
		var room = rooms[data.roomID];
		if (room)
			purge(socket, "leaveRoom");
	});

	socket.on("getOnlinePeople", function(fn) {
        fn({people: people});
    });

	socket.on("countryUpdate", function(data) { //we know which country the user is from
	// load up the user model
	var size = '';
	var User            = require('./app/models/user');// get the user
	User.findById(people[socket.id].databaseID, function(err, user) {
	  if (err) throw err;
	size  = user.local.size
	});
		country = data.country.toLowerCase();
		people[socket.id].country = country;
		lobbyUpdate (true, false, size, socket);
		socket.emit("updateActive", {s: size});
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

	socket.on("logout", function() {
		if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
			purge(socket, "disconnect");
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
		
	socket.on("sendRoomSize", function(roomSize) {							
			// load up the user model
			var size  = '',
			User  = require('./app/models/user');// get the user
			User.findById(people[socket.id].databaseID, function(err, user) {
				if (err) throw err;
					console.log(user); // show the one user
			  
				size  = user.local.size;
				if(roomSize !== size) {
					
					  // change the users location
					  user.local.size = roomSize;
					
					  // save the user
					  user.save(function(err) {
					    if (err) throw err;
					
					    console.log('User successfully updated!');
					  });
					  socket.emit("reloadPage");
				} else {
					var sizeRooms = getSizeRooms(rooms);
					socket.emit("roomList", {rooms: rooms, count: sizeRooms, s: roomSize});
				}
			});
	});

	socket.on("adjustScore", function(data) {
        var correctAnswer = false;
		var room = getRoom();
		people[socket.id].score += data.score;
		people[socket.id].attempts -= 1;
		data.index = room.people.indexOf(socket.id);
		data.score = people[socket.id].score;
	    io.sockets.in(socket.room).emit('sendScoresToClients', data);
        correctAnswer = data.result;
		getValidMoves(room, data, correctAnswer);
	});	

	socket.on("removeRoom", function(id) {
		 var room = rooms[id];
		 if (socket.id === room.owner) {
			purge(socket, "removeRoom");
		} else {
         	socket.emit("update", "Only the owner can remove a room.");
		}
	});
	/*
	socket.on("sendClickedButton", function(data) {
		var propValue;
		   console.log("DATA initial: ");
		for(var propName in data) {
		    propValue = data[propName];
		    console.log("                          " + propName,propValue);
		}
		
		var room = getRoom();
		getScores(room, data);
		var propValue;
		   console.log("DATA after getScores(): ");
		for(var propName in data) {
		    propValue = data[propName];
		    console.log("                          " + propName,propValue);
		}
		
		adjustScreens(room,data);
		var propValue;
		   console.log("DATA after adjustScreens(): ");
		for(var propName in data) {
		    propValue = data[propName];
		    console.log("                          " + propName,propValue);
		}
		
		validateMoves(room, data);
		var propValue;
		   console.log("DATA after adjustScreens(): ");
		for(var propName in data) {
		    propValue = data[propName];
		    console.log("                          " + propName,propValue);
		}
	});*/
	
	socket.on("sendClickedButton", function(data) {
	var room = getRoom();
	data.index = room.people.indexOf(socket.id);
	getScores(room, data);
	io.sockets.in(socket.room).emit('changeTileOnClick', data);
	if (data.winningSets.length > 0) {
		data.index = room.people.indexOf(socket.id);
	    io.sockets.in(socket.room).emit('removeBlinking');
	    var players = room.getPeople();
		if (socket.id === players[players.length - 1]) { // start new cycle if last player..
			data.socketID = players[0];
			data.NextPlayerToMove = 1;
		} else {
			data.socketID = players[data.index + 1]; // .. or chose next player
			data.NextPlayerToMove = data.index + 2;
		}
	    io.sockets.in(socket.room).emit('sendScoresToClients', data);
	    socket.emit("setTransparent", data);
	    socket.broadcast.to(socket.room).emit("setUncovered", data);
					
		if(room.canAnswer & people[socket.id].attempts > 0) {
			socket.emit("enableCheckAnswerButton", data);
		} else {
			getValidMoves(room, data, false);
		}
		room.canAnswer = false;
	} else {
		getValidMoves(room, data, false);// resolve next turn
	}
	});
	
	var getValidMoves = function (room, data, correctAnswer){
	    var peoples = room.getPeople();
  		var playersWithValidMoves = peoples.length;
		for(var i = 0; i < peoples.length; i++) {  
			room.checkValidMoves(data);
			if(!data.validMoves) {
				playersWithValidMoves -= 1;
			}
		}
		if (playersWithValidMoves > 0 & !correctAnswer) {
			getNextPlayerToMove(room, data);
			io.sockets.socket(data.socketID).emit("toggleActive");
		} else {
			var highestScore = 0;
	  		var winnersId = people[peoples[0]].id;
			for(var i = 0; i < peoples.length; i++) { 
				if(people[peoples[i]].score > highestScore) {
					winnersId = people[peoples[i]].id;
					highestScore = people[peoples[i]].score;
				}
			}
			io.sockets.in(socket.room).emit("disableBoard");
			io.sockets.in(socket.room).emit("showImage");
			for(i = 0; i < peoples.length; i++) {
				if (peoples[i] == winnersId) {
					io.sockets.socket(peoples[i]).emit("changeActiveBoard", {active: true});
    				io.sockets.socket(peoples[i]).emit('update', 'You won!');
					io.sockets.socket(peoples[i]).emit('endGame', data, 'Press Start button for a new game!');
					io.sockets.socket(peoples[i]).emit("showStartButton");
				} else {
					io.sockets.socket(peoples[i]).emit("changeActiveBoard", {active: false});
    				io.sockets.socket(peoples[i]).emit('update', people[winnersId].name + ' won, you lost!');
				}
			}
		}
	};
	
	var getNextPlayerToMove = function (room, data){
		data.index = room.people.indexOf(socket.id);
	    io.sockets.in(socket.room).emit('removeBlinking');
	    var players = room.getPeople();
		if (socket.id === players[players.length - 1]) { // start new cycle if last player..
			data.socketID = players[0];
			data.NextPlayerToMove = 1;
		} else {
			data.socketID = players[data.index + 1]; // .. or chose next player
			data.NextPlayerToMove = data.index + 2;
		}
		
		for (var i=0; i<players.length; i++) {
			if (players[i] !== data.socketID) {
				io.sockets.socket(players[i]).emit("showActiveToOthers", data);
			} else {
				io.sockets.socket(players[i]).emit("showActiveToActive", data);
			}
		}
		
	};
	
	socket.on("ChangeToNextPlayer", function() {
		var room = getRoom();
		var data = {};
		getValidMoves(room, data, false);
	});
	
	//HELPER FUNCTIONS
	
	var getRoom = function (){
		if (typeof people[socket.id] !== "undefined") {
			var roomID = people[socket.id].inroom;
		}
		var room = rooms[roomID];
		return room;
	};
	
	var playerSetup = function (room, socketId, id, tile, name){
		people[socketId].id = socketId;
		people[socketId].inroom = id;
		people[socketId].tile = tile[0];
		people[socketId].tileHex = tile[1];
		people[socketId].score = 0;
		people[socketId].attempts = 3;
		people[socketId].active = false;
		room.addPerson(socketId);
		socket.room = name || room.name;
		socket.join(socket.room);
	};
	
	var getScores = function (room, data){
		data.myPlayerTile = people[socket.id].tile;
		data.score = 0;
		var visibleBackground = false;
		room.checkMove(data);
		if (!visibleBackground & data.winningSets.length > 0) {//unhide background image if there is a winning set, unless already shown
			visibleBackground = true;
			io.sockets.in(socket.room).emit("unhideBackground");
		}
		people[socket.id].score += data.score;
		data.score = people[socket.id].score;
	};
	
	/*
	var adjustScreens = function (room,data){
		data.index = room.people.indexOf(socket.id);
	    io.sockets.in(socket.room).emit('removeBlinking');
	    var players = room.getPeople();
		if (socket.id === players[players.length - 1]) { // start new cycle if last player..
			data.socketID = players[0];
			data.NextPlayerToMove = 1;
		} else {
			data.socketID = players[data.index + 1]; // .. or chose next player
			data.NextPlayerToMove = data.index + 2;
		}
					
		if(room.canAnswer & people[socket.id].attempts > 0) {
			socket.emit("enableCheckAnswerButton", data);
		} else {
			getNextPlayerToMove(room, data);
			io.sockets.socket(data.socketID).emit("toggleActive");
		}
		room.canAnswer = false;
	    io.sockets.in(socket.room).emit('sendScoresToClients', data);
	    socket.emit("setTransparent", data);
	    socket.broadcast.to(socket.room).emit("setUncovered", data);
	};
	var validateMoves = function (room, data, correctAnswer){
	    var peoples = room.getPeople();
  		var playersWithValidMoves = peoples.length;
		var highestScore = 0;
  		var winnersId = people[peoples[0]].id;
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
		if (playersWithValidMoves === 0 || correctAnswer) {
			io.sockets.in(socket.room).emit("disableBoard");
			io.sockets.in(socket.room).emit("showImage");
			for(i = 0; i < peoples.length; i++) {
				if (peoples[i] == winnersId) {
					io.sockets.socket(peoples[i]).emit("changeActiveBoard", {active: true});
    				io.sockets.socket(peoples[i]).emit('update', 'You won!');
					io.sockets.socket(peoples[i]).emit('endGame', data, 'Press Start button for a new game!');
					io.sockets.socket(peoples[i]).emit("showStartButton");
				} else {
					io.sockets.socket(peoples[i]).emit("changeActiveBoard", {active: false});
    				io.sockets.socket(peoples[i]).emit('update', people[winnersId].name + ' won, you lost!');
				}
			}
		}
	};*/
});
