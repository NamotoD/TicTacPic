/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var recognizing = false;
var last10messages = []; //to be populated later

if (!('webkitSpeechRecognition' in window)) {
  console.log("webkitSpeechRecognition is not available");
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        $('#msg').addClass("final");
        $('#msg').removeClass("interim");
      } else {
        interim_transcript += event.results[i][0].transcript;
        $("#msg").val(interim_transcript);
        $('#msg').addClass("interim");
        $('#msg').removeClass("final");
      }
    }
    $("#msg").val(final_transcript);
    };
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      recognizing = false;
      $("#start_button").prop("value", "Record");
      return;
    }
    final_transcript = '';
    recognition.lang = "en-GB";
    recognition.start();
    $("#start_button").prop("value", "Recording ... Click to stop.");
    $("#msg").val();
  }
//end of WebSpeech

/*
Functions
*/

// Pad n to specified size by prepending a zeros
function zeroPad(num, size) {
  var s = num + "";
  while (s.length < size)
    s = "0" + s;
  return s;
}

// Format the time specified in ms from 1970 into local HH:MM:SS
function timeFormat(msTime) {
  var d = new Date(msTime);
  return zeroPad(d.getHours(), 2) + ":" +
    zeroPad(d.getMinutes(), 2) + ":" +
    zeroPad(d.getSeconds(), 2) + " ";
}

$(document).ready(function() {
  //setup "global" variables first
  var socket = io.connect();
  var myRoomID = active = null;
  $("#checkAnswer").hide();
  $("#leave").hide();
  $("#start_game_button").hide();
  

  $("form").submit(function(event) {
    event.preventDefault();
  });

  $("#conversation").bind("DOMSubtreeModified",function() {
    $("#conversation").animate({
        scrollTop: $("#conversation")[0].scrollHeight
      });
  });

  //$("#main-chat-screen").hide();
  $("#name").focus();
  $("#join").attr('disabled', 'disabled'); 
  
  if ($("#name").val() === "") {
    $("#join").attr('disabled', 'disabled');
  }

  $("#name").keypress(function(e){
    var name = $("#name").val();
    if(name.length < 2) {
      $("#join").attr('disabled', 'disabled'); 
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#join").removeAttr('disabled');
    }
  });
  $("#errors").hide();
  $("#errorsUserName").hide();

  //main chat screen
  $("#chatForm").submit(function() {
    var msg = $("#msg").val();
    if (msg !== "") {
      socket.emit("send", new Date().getTime(), msg);
      $("#msg").val("");
    }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
  }

  $("#msg").keypress(function(e){
    if (e.which !== 13) {
      if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
        typing = true;
        socket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }
  });

  socket.on("isTyping", function(data) {
    if (data.isTyping) {
      if ($("#"+data.person+"").length === 0) {
        $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
        timeout = setTimeout(timeoutFunction, 5000);
      }
    } else {
      $("#"+data.person+"").remove();
    }
  });
  
  
	socket.on("toggleActive", function() {
	  $("#board").toggleClass("not-active");
	});

/*
  $("#msg").keypress(function(){
    if ($("#msg").is(":focus")) {
      if (myRoomID !== null) {
        socket.emit("isTyping");
      }
    } else {
      $("#keyboard").remove();
    }
  });

  socket.on("isTyping", function(data) {
    if (data.typing) {
      if ($("#keyboard").length === 0)
        $("#updates").append("<li id='keyboard'><span class='text-muted'><i class='fa fa-keyboard-o'></i>" + data.person + " is typing.</li>");
    } else {
      socket.emit("clearMessage");
      $("#keyboard").remove();
    }
    console.log(data);
  });
*/ 
  var boardSize = 0;
  $('#roomModal').on('show.bs.modal', function (e) {
    boardSize = parseInt(e.relatedTarget.dataset.size);
  });

  $("#createRoomBtn").click(function() {
    var userName = $("#createNickName").val(),
        roomName = $("#createRoomName").val(),
        device = "desktop",
        roomExists = userExists = false;
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    socket.emit("checkNames", roomName, userName, function(data) {
          roomExists = data.roomExists,
          userExists = data.userExists;
       if (!roomExists & !userExists & roomName.length > 0 & userName.length > 2) {
          socket.emit("joinserver", userName, device);
          socket.emit("createRoom", roomName, boardSize);
          $("#roomModal").modal('hide');
          $("#msg").focus();
        }else{
            $("#errors").empty();
            $("#errors").show();
            if (roomExists) {
              $("#errors").append("Room <i>" + roomName + "</i> already exists");
            }
            if (userExists) {
              $("#errors").append("User <i>" + userName + "</i> already exists!! Try " +data.proposedName);
            }
            if (roomName.length < 1) {
              $("#errors").append("Enter room name");
            }
            if (userName.length < 3) {
              $("#errors").append("Your name must be at least 3 characters");
            }
        }
    });
  });
  
  var userModalID = 0;
  $('#userModal').on('show.bs.modal', function (e) {
    userModalID = e.relatedTarget.id;
  });
  
  $("#joinRoomBtn").click(function() {
    var userName = $("#createNick").val(),
        device = "desktop",
        userExists = false;
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    socket.emit("checkNames", null, userName, function(data) {
      userExists = data.userExists;
       if (!userExists & userName.length > 2) {
          socket.emit("joinserver", userName, device);
          socket.emit("joinRoom", userModalID);
          $("#userModal").modal('hide');
          $("#msg").focus();
        }else{
            $("#errorsUserName").empty();
            $("#errorsUserName").show();
            if (userExists) {
              $("#errorsUserName").append("User <i>" + userName + "</i> already exists!! Try " +data.proposedName);
            }
            if (userName.length < 3) {
              $("#errorsUserName").append("Your name must be at least 3 characters");
            }
        }
    });
  });
  
  $("#checkAnswerBtn").click(function() {
    var correctAnswer = false;
    var answer = $("#answerToCheck").val();
    socket.emit("checkAnswer", answer, function(data) {
      correctAnswer = data.result;
      data.score = 0;
      data.decreaseAttempts = true;

       if (correctAnswer) {
          data.score += 100;
          data.decreaseAttempts = false;
          $("#errors").empty();
          $("#errors").hide();
          
        } else {data.score -= 50;
          $("#errors").empty();
          $("#errors").show();
          $("#errors").append("<i>" + answer + "</i> is a wrong answer. You re losing 50 points." +data.attempts+ "attempts left!"); 

        }
        socket.emit("adjustScore", data);
    });
  });
  
  $("#start_game_button").click(function() {
    socket.emit("startGame");
  });

  $("#rooms").on('click', '.removeRoomBtn', function() {
    alert("remove button works!");
    var roomID = $(this).attr("id");
    socket.emit("removeRoom", roomID);
    $("#createRoom").show();
  }); 

  $("#leave").click(function() {
    var roomID = myRoomID;
    socket.emit("leaveRoom", roomID);
    $("#leave").hide();
    $("#createRoom").show();
  });

  $("#people").on('click', '.whisper', function() {
    var name = $(this).siblings("span").text();
    $("#msg").val("w:"+name+":");
    $("#msg").focus();
  });
  
  $(document).on('click', '.col', function() {
    // the tapped button id
    var clickedButtonId = parseInt(this.id);
    if($("#" + clickedButtonId).parent('div').hasClass("Default")) {
      var data = {
        clickedButtonId: clickedButtonId,
        myRoomID: myRoomID
      };
      socket.emit('sendClickedButton', data);
      $("#board").addClass("not-active");
            $("#errors").empty();
            $("#errors").hide();
    } else {
      alert("Choose another button!");
    }
  });
  
  socket.on("sendScoresToClients", function(data) {
    $(".player-score:eq( 0 )").find('.badge').text( data.myCreatorScore );
    $(".player-score:eq( 1 )").find('.badge').text( data.myJoinerScore );
    $("#" + data.clickedButtonId).parent('div').removeClass("Default").addClass(data.myPlayerTile);
  });
  
  socket.on("setTransparent", function(data) {
    $.each(data.winningSets, function (i, set) {
      $.each(set, function (j, field) {
        $("#" + this).parent('div').addClass('transparent');
      });
    });
  });  
  
  socket.on("setUncovered", function(data) {
    $.each(data.winningSets, function (i, set) {
      $.each(set, function (j, field) {
        $("#" + this).parent('div').addClass('uncovered');
      });
    });
  });
            

/*
  $("#whisper").change(function() {
    var peopleOnline = [];
    if ($("#whisper").prop('checked')) {
      console.log("checked, going to get the peeps");
      //peopleOnline = ["Tamas", "Steve", "George"];
      socket.emit("getOnlinePeople", function(data) {
        $.each(data.people, function(clientid, obj) {
          console.log(obj.name);
          peopleOnline.push(obj.name);
        });
        console.log("adding typeahead")
        $("#msg").typeahead({
            local: peopleOnline
          }).each(function() {
            if ($(this).hasClass('input-lg'))
              $(this).prev('.tt-hint').addClass('hint-lg');
        });
      });
      
      console.log(peopleOnline);
    } else {
      console.log('remove typeahead');
      $('#msg').typeahead('destroy');
    }
  });
  // $( "#whisper" ).change(function() {
  //   var peopleOnline = [];
  //   console.log($("#whisper").prop('checked'));
  //   if ($("#whisper").prop('checked')) {
  //     console.log("checked, going to get the peeps");
  //     peopleOnline = ["Tamas", "Steve", "George"];
  //     // socket.emit("getOnlinePeople", function(data) {
  //     //   $.each(data.people, function(clientid, obj) {
  //     //     console.log(obj.name);
  //     //     peopleOnline.push(obj.name);
  //     //   });
  //     // });
  //     //console.log(peopleOnline);
  //   }
  //   $("#msg").typeahead({
  //         local: peopleOnline
  //       }).each(function() {
  //         if ($(this).hasClass('input-lg'))
  //           $(this).prev('.tt-hint').addClass('hint-lg');
  //       });
  // });
*/

//socket-y stuff
  socket.on("exists", function(data) {
    $("#errors").empty();
    $("#errors").show();
    $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
  });

  socket.on("joined", function() {
    $("#errors").hide();
    if (navigator.geolocation) { //get lat lon of user
      navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
    } else {
      $("#errors").show();
      $("#errors").append("Your browser is ancient and it doesn't support GeoLocation.");
    }
    function positionError(e) {
      console.log(e);
    }
  
    function positionSuccess(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      //consult the yahoo service
      $.ajax({
        type: "GET",
        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22"+lat+"%2C"+lon+"%22%20and%20gflags%3D%22R%22&format=json",
        dataType: "json",
         success: function(data) {
          socket.emit("countryUpdate", {country: data.query.results.Result.countrycode});
        }
      });
    }
  });

  socket.on("history", function(data) {
    if (data.length !== 0) {
      $("#msgs").append("<li><strong><span class='text-warning'>Last 10 messages:</li>");
      $.each(data, function(data, msg) {
        $("#msgs").append("<li><span class='text-warning'>" + msg + "</span></li>");
      });
    } else {
      $("#msgs").append("<li><strong><span class='text-warning'>No past messages in this room.</li>");
    }
  });

  socket.on("update", function(msg) {
    $("#msgs").append("<li>" + msg + "</li>");
  });
  
  socket.on("showBoard", function(data) {
    $("#msgs").empty();
    $("#start_game_button").hide();
    var boardTemplate = document.getElementById('gameBoard'),
        gameArea = document.getElementById('game-area'),
        groups = document.getElementById('groups'),
        boardClone = boardTemplate.content.cloneNode(true);
        //clear game-area
    while (gameArea.firstChild) {
      gameArea.removeChild(gameArea.firstChild);
    }
    gameArea.appendChild(boardClone);
    $(".player-score:eq( 0 )").find('.glyphicon').append( data.creatorName );
    $(".player-score:eq( 1 )").find('.glyphicon').append( data.joinerName );
    if(active)  $("#board").removeClass("not-active").addClass("active");
    $("#board").css('background-position', data.randPic+ '% 0');
    
      while (groups.firstChild) {
      groups.removeChild(groups.firstChild);
    }
  });
  
  socket.on("enableCheckAnswerButton", function() {
    $("#checkAnswer").show();
  });
  
  socket.on("disableCheckAnswerButton", function() {
    $("#checkAnswer").hide();
  });
  
  socket.on("update-people", function(data){
    //var peopleOnline = [];
    $("#people").empty();
    $("#listOfPeople").empty();
    $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");
    $.each(data.people, function(a, obj) {
      if (!("country" in obj)) {
        html = "";
      } else {
        html = "<img class=\"flag flag-"+obj.country+"\"/>";
      }
      $('#listOfPeople').append("<li class=\"list-group-item\"><span>" + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");
      //peopleOnline.push(obj.name);
  });

    /*var whisper = $("#whisper").prop('checked');
    if (whisper) {
      $("#msg").typeahead({
          local: peopleOnline
      }).each(function() {
         if ($(this).hasClass('input-lg'))
              $(this).prev('.tt-hint').addClass('hint-lg');
      });
    }*/
  });

  socket.on("chat", function(msTime, person, msg) {
    $("#msgs").append("<li><strong><span class='text-success'>" + timeFormat(msTime) + person.name + "</span></strong>: " + msg + "</li>");
    //scroll messages
    var height = 0;
    $('#msgs li').each(function(i, value){
      height += parseInt($(this).height());
    });
    height += '';
    $('#msgs').animate({scrollTop: height});
    
    //clear typing field
     $("#"+person.name+"").remove();
     clearTimeout(timeout);
     timeout = setTimeout(timeoutFunction, 0);
  });

  socket.on("whisper", function(msTime, person, msg) {
    if (person.name === "You") {
      s = "whisper"
    } else {
      s = "whispers"
    }
    $("#msgs").append("<li><strong><span class='text-muted'>" + timeFormat(msTime) + person.name + "</span></strong> "+s+": " + msg + "</li>");
  });

  socket.on("roomList", function(data) {
    $("#rooms").text("");
    $("#listOfRooms").text("");
    $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+data.count+"</span></li>");
    if (!jQuery.isEmptyObject(data.rooms)) { 
      $.each(data.rooms, function(id, room) {
        if (room.s === data.s) {
          var html = "<button id="+id+" data-roomName="+room.name+" class='btn btn-default btn-xs' data-toggle='modal' data-target='#userModal' >Join</button>" + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
          $('#listOfRooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span><span>" + room.s + "</span> " + html + "</li>");
        }
      });
    } else {
      $("#listOfRooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
    }
  });

  socket.on("sendRoomID", function(data) {
    myRoomID = data.id;
    active = data.active;
  });
  
  socket.on("showStartButton", function(data) {
    $("#start_game_button").show();
  });
  
  socket.on("hideCreateRoomButton", function(data) {
    $("#createRoom").hide();
  });
  
  socket.on("showLeaveButton", function(data) {
    $("#leave").show();
  }); 
      
  socket.on("disableBoard", function(data) {
    $("#board").addClass("not-active"); 
  });

  socket.on("endGame", function(data, msg){
    $("#msgs").append("<li><strong><span class='text-warning'>" + msg + "</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
    $("#checkAnswer").hide();
    $("#board").addClass("not-active");
  });

  socket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
  });

});
