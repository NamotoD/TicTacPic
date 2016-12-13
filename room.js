function Room(name, id, owner, boardSize) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.Board = [];
  this.s = boardSize;
  this.boardRange = boardSize*boardSize;
  this.colors = ['violet', 'red', 'yellow', 'green', 'blue'];
  this.peopleLimit = (boardSize === 12) ? 4 : 2;
  this.status = "available";
  this.private = false;
  this.buttonNames = ['b1',      'b2',       'b3',
                           'b4', 'b5', 'b6',
                      'b7','b8',       'b10','b11',
                           'b12','b13','b14',
                      'b15',     'b16',      'b17'];
  this.numOfPics =[];
  this.picsRange = 37;
  this.picNames = ["bear", "cat", "cheetah", "cow", "deer", "dog", "donkey", "duck", "elephant",
  "emu", "flamingo", "fox", "giraffe", "goat", "gorilla", "hamster", "horse", "hummingbird",
  "jellyfish", "lama", "leopard", "lion", "monkey", "otter", "owl",  "parrot", "peacock",
  "pelican", "rhyno", "seagull", "seal", "sloth", "squirrel", "swan", "tiger", "turtle", "wolf"];
  this.currentPic = "";
}

Room.prototype.sortColors = function() {
  this.colors.sort(function() { return 0.5 - Math.random();});
	console.log(this.colors);
};

Room.prototype.getRandomTile = function() {
  return this.colors.pop();
};

Room.prototype.setUpPlayingBoard = function() {
	for(var i = 0; i < this.boardRange; i++){
	  var line = Math.floor(i/this.s);
	  var position = i - (line * this.s);
	  this.Board[i] = { "id" : i,
	                    "owner" : "N",
                      "line": line, //line number
                      "position" : position //position on line
	                  };
	}
};

Room.prototype.setRandPic = function() {
  for(var i = 0; i < this.picsRange; i++){
		this.numOfPics.push(i);
	}
};

Room.prototype.getRandPic = function() {
	var rand = this.numOfPics[Math.floor(Math.random() * this.numOfPics.length)];
	this.numOfPics.splice(rand, 1);
	this.currentPic = this.picNames[rand];
	console.log(this.currentPic);
	return rand *=2.77778;
};

Room.prototype.addPerson = function(personID) {
  if (this.status === "available") {
    this.people.push(personID);
  }
};

Room.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i].id === person.id){
      personIndex = i;
      break;
    }
  }
  this.people.remove(personIndex);
};

Room.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};

Room.prototype.getPeople = function() {
  return this.people;
};

Room.prototype.isAvailable = function() {
  return this.status === "available";
};

Room.prototype.checkAvailability = function() {
  if ((this.people.length) >= this.peopleLimit) {
    this.status = "unavailable";
  }
};

Room.prototype.isPrivate = function() {
  return this.private;
};

Room.prototype.checkMove = function(data){
	data.winningSets = [];
  if(this.Board[data.clickedButtonId].owner == 'N'){
	  this.Board[data.clickedButtonId].owner = data.myPlayerTile;
  }
  this.checkEachDirection(data, true);
  for(var i = 0; i < data.winningSets.length; i++) {
    for(var j = 0; j < data.winningSets[i].length; j++) {
      this.Board[data.winningSets[i][j]].owner = 'X';
    }
  }
  return data;
};

Room.prototype.checkValidMoves = function(data){
  data.validMoves = false;
  for (var i = 0; i < this.Board.length; i++) {
  	if(this.Board[i].owner == "N"){
  	  data.clickedButtonId = i;
      this.checkEachDirection(data, false);
  	}
  }
  return data;
};

Room.prototype.checkEachDirection = function(data, getScore) {
  var clickedButtonLine = this.Board[data.clickedButtonId].line, //get line number
      idPositionOnLine = this.Board[data.clickedButtonId].position, //position of id on the line
      button = this.getButtons(data),
      crossLeftToRight = [button['b1'], button['b4'], button['b14'], button['b17']],
      vertical = [button['b2'], button['b5'], button['b13'], button['b16']],
      crossRightToLeft = [button['b3'], button['b6'], button['b12'], button['b15']],
      horizontal = [button['b7'], button['b8'], button['b10'], button['b11']];
  //check wrapping in each direction
      for (i = 0, j = -2; i < crossLeftToRight.length; i++, j++) {
        if (i == 2) j++;
        crossLeftToRight[i].check = (crossLeftToRight[i].position == idPositionOnLine + j);
      }
      this.getScoreOrValidMoves(data, crossLeftToRight, getScore);
      
      for (i = 0; i < vertical.length; i++) {
        vertical[i].check = (vertical[i].position == idPositionOnLine);
      }
      this.getScoreOrValidMoves(data, vertical, getScore);
      
      for (var i = 0, j = 2; i < crossRightToLeft.length; i++, j--) {
        if (i == 2) j--;
        crossRightToLeft[i].check = (crossRightToLeft[i].position == idPositionOnLine + j);
      }
      this.getScoreOrValidMoves(data, crossRightToLeft, getScore);
      
      for (var i = 0; i < horizontal.length; i++) {
        horizontal[i].check = (horizontal[i].line == clickedButtonLine);
      }
      this.getScoreOrValidMoves(data, horizontal, getScore);
};

Room.prototype.getButtons = function(data){
  var surroundingButtons = [-((2*this.s)+2),-(2*this.s),-((2*this.s)-2),-(this.s+1),-this.s,-(this.s-1),-2,-1,1,2,(this.s-1),this.s,(this.s+1),((2*this.s)-2),(2*this.s),((2*this.s)+2)],
      buttons = {};
  //check if surrounding buttons belong to the same owner
  for (var i = 0; i < surroundingButtons.length; i++) {
    var ButtonToCheckId = data.clickedButtonId + surroundingButtons[i];
    if(typeof this.Board[ButtonToCheckId] !== 'undefined') {
      buttons[this.buttonNames[i]] =  {"id"      : ButtonToCheckId,
                                       "owner"   : this.Board[ButtonToCheckId].owner,
                                       "iOwn"    : this.Board[ButtonToCheckId].owner == data.myPlayerTile,
                                       "line"    : this.Board[ButtonToCheckId].line,
                                       "position": this.Board[ButtonToCheckId].position
                                      };
    } else {
      buttons[this.buttonNames[i]] =  {"id"      : ButtonToCheckId,
                                       "owner"   : false
                                      };
    }
  }
  return buttons;
};

Room.prototype.getScoreOrValidMoves = function(data, buttons, getScore){ // decide which function to call
      if (getScore) {
        this.getScores(buttons, data);
      } else {
        if (data.validMoves) {
          return data;
        } else {
          this.getValidMoves(buttons, data);
        }
      }
};

Room.prototype.getScores = function(b, data){//b = 4 buttons surrounding clicked button - each direction
	if (b[1].iOwn & b[1].check) {
		if ((b[0].iOwn & b[0].check) & (b[2].iOwn & b[2].check)) {
		  if (b[3].iOwn & b[3].check) {
		    data.score += 100,
			  data.winningSets.push([b[0].id, b[1].id, data.clickedButtonId, b[2].id, b[3].id]);
		  } else {
			  data.score += 50,
			  data.winningSets.push([b[0].id, b[1].id, data.clickedButtonId, b[2].id]);
		  }
		} else if (b[2].iOwn & b[2].check) {
		  if (b[3].iOwn & b[3].check) {
	      data.score += 50,
			  data.winningSets.push([b[1].id, data.clickedButtonId, b[2].id, b[3].id]);
		  } else {
			  data.score += 20,
			  data.winningSets.push([b[1].id, data.clickedButtonId, b[2].id]);
		  }
		} else if (b[0].iOwn & b[0].check) {
	    data.score += 20;
      data.winningSets.push([b[0].id, b[1].id, data.clickedButtonId]);
		}
	} else if((b[2].iOwn & b[2].check) & (b[3].iOwn & b[3].check)) {
	  data.score += 20;
    data.winningSets.push([data.clickedButtonId, b[2].id, b[3].id]);
	}
};

Room.prototype.getValidMoves = function(b, data){ //check if at least 3 buttons in a row are  still available
  if (this.available(b[0], b[1], data) || this.available(b[2], b[3], data) || this.available(b[1], b[2], data)){
    return data.validMoves = true;
  }
};

Room.prototype.available = function(b1, b2, data){//check three in a row(each direction)
  if(((b1.iOwn || b1.owner == "N") & b1.check) & ((b2.iOwn || b2.owner == "N") & b2.check)) {
    return true;
  }
};

module.exports = Room;
