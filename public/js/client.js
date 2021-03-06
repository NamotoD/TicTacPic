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

var clock1,
clock2,
countdownToHideTurn,
countdownToChangeToNextPlayer1,
countdownToChangeToNextPlayer2,
countdownToHideGuessButton,
setTimeout4,
countdownToShowClock,
countdown2;

var activateAutoLogout = function () {
    var countDown;
    window.onload = restartCoundDown;
    document.onmousemove = restartCoundDown;
    document.onkeypress = restartCoundDown;
    document.onmousedown = restartCoundDown;
    document.ontouchstart = restartCoundDown;
    document.onclick = restartCoundDown;

    function autoLogout() {
      window.location.href = "/login";
    }

    function restartCoundDown() {
        clearTimeout(countDown);
        countDown = setTimeout(autoLogout, 120000); // logout players after 2 mins inactivity
    }
};

$(document).ready(function() {
    activateAutoLogout();
    $('.dropup').on('show.bs.dropdown', function(){
    clearTimeout(countdownToHideGuessButton);
    setTimeout4 = setTimeout(function() { $("#warningBoard").hide();
                            $("#guessPar").hide();
                            $("#checkAnswer").hide();
                            socket.emit('ChangeToNextPlayer');
    }, 10000);// show "Guess list!" button for 10 seconds
    });
  
  $('#overviewPager').bootpag({
    total: 4,
    page: 1,
    maxVisible: 4,
    leaps: true,
    firstLastUse: true,
    first: '←',
    last: '→',
    wrapClass: 'pagination',
    activeClass: 'active',
    disabledClass: 'disabled',
    nextClass: 'next',
    prevClass: 'prev',
    lastClass: 'last',
    firstClass: 'first'
}).on("page", function(event, num){
    $("#overviewContent").html($("#overview" + num).text()); // or some ajax content loading...
});
  $('#rulesPager').bootpag({
    total: 4,
    page: 1,
    maxVisible: 4,
    leaps: true,
    firstLastUse: true,
    first: '←',
    last: '→',
    wrapClass: 'pagination',
    activeClass: 'active',
    disabledClass: 'disabled',
    nextClass: 'next',
    prevClass: 'prev',
    lastClass: 'last',
    firstClass: 'first'
}).on("page", function(event, num){
    $("#rulesContent").html($("#rule" + num).text()); // or some ajax content loading...
});
  var socket = io.connect();
  //tell socket.io to never give up :)
socket.on('error', function(){
  socket.socket.reconnect();
});
  var myRoomID = active = null;
  $("#score").hide();
  $("#checkAnswer").hide();
  $("#leave").hide();
  $("#leave").removeClass("buttonEnabled").addClass("buttonDisabled");
  $("#start_game_button").hide();
  $("#start_game_button").removeClass("buttonEnabled").addClass("buttonDisabled");
  $("#listOfRooms").show();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    socket.emit("sendDevice", device);
  

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
	
	socket.on("updateOnCreateOrJoin", function() {
    $("#logout").show();
    $("#logout").removeClass("buttonDisabled").addClass("buttonEnabled");
    $("#createRoom").hide();
    $("#leave").removeClass("buttonEnabled").addClass("buttonDisabled");
    $("#listOfRooms").hide();
    $("#leave").show();
    $("#leave").removeClass("buttonDisabled").addClass("buttonEnabled");
	  $('.collapse').collapse("hide");
	  $('#rooms li').addClass('disabled');
    $("#rooms li.disabled a").click(function() {
      return false;
    });
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

  $("#createRoom").click(function() {
    $(this).hide();
    $(this).removeClass("buttonEnabled").addClass("buttonDisabled");
    $("#logout").hide();
    $("#logout").removeClass("buttonEnabled").addClass("buttonDisabled");
    socket.emit("createRoom");
  });
  
  socket.on("updateCreateRoom", function(data) {
    var $badge = $('#rooms li').find('.badge'),
    count = Number($badge.eq(data.index).text());
    $badge.eq(Number(data.index)).text(count + 1);
    if ($(".list-group-item.active").attr("id") === data.s) {
      $("#listOfRooms").text("");
      if (!jQuery.isEmptyObject(data.rooms)) { 
        var displayNoRooms = 0;
        $.each(data.rooms, function(id, room) {
          if (room.size === data.s) {
            var html = "<button id="+id+" data-roomName="+room.name+" class='btn btn-default btn-xs' >Join</button>"/* + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>"*/;
            $('#listOfRooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span><span></span> " + html + " " + room.status + "</li>");
          } else {
            if (displayNoRooms < 1) {
                $("#listOfRooms").append("<li class=\"list-group-item\">There are other room sizes available!</li>");
                displayNoRooms++; 
            }     
          }
        });
      } else {
          $("#listOfRooms").append("<li class=\"list-group-item text-danger\">There are no rooms yet. Press create room button to create your own!</li>");
      }
    }
	});
  
  socket.on("updateOwnerLeaveRoom", function(data) {
    var $badge = $('#rooms li').find('.badge'),
    count = Number($badge.eq(data.index).text());
    $badge.eq(Number(data.index)).text(count - 1);
    if ($(".list-group-item.active").attr("id") === data.s) {
      $("#listOfRooms").text("");
      if (!jQuery.isEmptyObject(data.rooms)) { 
        var displayNoRooms = 0;
        $.each(data.rooms, function(id, room) {
          if (room.size === data.s) {
            var html = "<button id="+id+" data-roomName="+room.name+" class='btn btn-default btn-xs' >Join</button>"/* + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>"*/;
            $('#listOfRooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span><span></span> " + html + " " + room.status + "</li>");
          } else {
            if (displayNoRooms < 1) {
                $("#listOfRooms").append("<li class=\"list-group-item\">There are other room sizes available!</li>");
                displayNoRooms++; 
            }     
          }
        });
      } else {
          $("#listOfRooms").append("<li class=\"list-group-item text-danger\">There are no rooms yet. Press create room button to create your own!</li>");
      }
    }
	});
  
  socket.on("updatePlayerJoinOrLeaveRoom", function(data) {
    if ($(".list-group-item.active").attr("id") === data.s) {
      $("#listOfRooms").text("");
      if (!jQuery.isEmptyObject(data.rooms)) { 
        var displayNoRooms = 0;
        $.each(data.rooms, function(id, room) {
          if (room.size === data.s) {
            var html = "<button id="+id+" data-roomName="+room.name+" class='btn btn-default btn-xs' >Join</button>"/* + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>"*/;
            $('#listOfRooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span><span></span> " + html + " " + room.status + "</li>");
          } else {
            if (displayNoRooms < 1) {
                $("#listOfRooms").append("<li class=\"list-group-item\">There are other room sizes available!</li>");
                displayNoRooms++; 
            }     
          }
        });
      } else {
          $("#listOfRooms").append("<li class=\"list-group-item text-danger\">There are no rooms yet. Press create room button to create your own!</li>");
      }
    }
	});
  
  $("#start_game_button").click(function() {
    $(this).hide();
    $(this).removeClass("buttonEnabled").addClass("buttonDisabled");
    socket.emit("startGame");
  });

  $("#rooms").on('click', '.removeRoomBtn', function() {
    alert("remove button works!");
    var roomID = $(this).attr("id");
    socket.emit("removeRoom", roomID);
    $("#createRoom").show();
    $("#leave").removeClass("buttonDisabled").addClass("buttonEnabled");
  }); 

  $("#leave").click(function() {
    var roomID = myRoomID,
    roomSize = $(".list-group-item.active").attr("id");
    socket.emit("leaveRoom", {roomID: roomID, roomSize: roomSize});
    $(this).hide();
    $(this).removeClass("buttonEnabled").addClass("buttonDisabled");
    //$("#createRoom").show();
  }); 

  $("#logout").click(function() {
    socket.emit("logout");
    $("#logout").hide();
  });
  
socket.on('redirect', function(destination) {
    window.location.href = destination;
});

  $("#people").on('click', '.whisper', function() {
    var name = $(this).siblings("span").text();
    $("#msg").val("w:"+name+":");
    $("#msg").focus();
  });
  
  $(document).on('click', '.col', function() {
  	$("#turnPar").hide();
    $(".clock").hide();
  	$("#guessPar").hide();
    $("#warningBoard").hide();
    clearTimeout(countdownToChangeToNextPlayer1);
    clearTimeout(countdownToChangeToNextPlayer2);
    clearTimeout(countdownToShowClock);
    clearTimeout(countdown2);
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
  $(document).on('click', '#checkAnswerDropBtn', function() {
    $("#checkAnswerDropBtn").removeClass("buttonEnabled").addClass("buttonDisabled");
  });
  
  socket.on("removeBlinking", function() {
    $('*[data-index=1]').removeClass('blink_me');
    $('*[data-index=2]').removeClass('blink_me');
    $('*[data-index=3]').removeClass('blink_me');
    $('*[data-index=4]').removeClass('blink_me');
  });
  
  socket.on("showActiveToOthers", function(data) {
    $('*[data-index=' + (data.NextPlayerToMove).toString() + ']').addClass('blink_me');
  });
  
  socket.on("showActiveToActive", function(data) { // player on turn
    $("#warningBoard").show();
  	$("#turnPar").show();
    $("#checkAnswerDropBtn").removeClass("buttonDisabled").addClass("buttonEnabled");
      setTimeout(function() { $("#warningBoard").hide();
  	                          $("#turnPar").hide();}, 2000);// show your turn! for 2 seconds
    		
      countdown2 = setTimeout(function(){  $("#warningBoard").show(); 
                              $(".clock").show();
        clock2 = $('.clock').FlipClock(5, {
      		        clockFace: 'MinuteCounter',
      		        countdown: true
      	});
        setTimeout(function() {
      		setInterval(function() {
      			clock2.increment();
      		}, 1000);
      	});
      }, 11000);
      
      countdownToChangeToNextPlayer2 = setTimeout(function() { $("#board").addClass("not-active"); 
      		        		        $('.clock').css("display", "none");
                              socket.emit('ChangeToNextPlayer');
        
      }, 16000);// show "Change players!"
  });
  
  socket.on("sendScoresToClients", function(data) {
    $(".player-score:eq(" + data.index + ")").find('.badge').text( data.score );
  });
  
  socket.on("changeTileOnClick", function(data) {
    $("#" + data.clickedButtonId).parent('div').removeClass("Default").addClass(data.myPlayerTile);
  });
  
  
  socket.on("setTransparent", function(data) {
    $.each(data.winningSets, function (i, set) {
      $.each(set, function (j, field) {
        $("#" + this).parent('div').addClass('transparent');
      });
    });
  }); 
  
  socket.on("showImage", function() {
      $("#board > div").css("opacity", "0");
  });  
  
  socket.on("setUncovered", function(data) {
    $.each(data.winningSets, function (i, set) {
      $.each(set, function (j, field) {
        $("#" + this).parent('div').addClass(data.myPlayerTile + 'Uncovered');
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
    $("#start_game_button").removeClass("buttonEnabled").addClass("buttonDisabled");
    $("#logout").hide();
    $("#checkAnswerDropBtn").removeClass("buttonDisabled").addClass("buttonEnabled");
    var boardTemplate = document.getElementById('gameBoard'),
        gameArea = document.getElementById('game-area'),
        boardClone = boardTemplate.content.cloneNode(true);
        //clear game-area
    while (gameArea.firstChild) {
      gameArea.removeChild(gameArea.firstChild);
    }
    gameArea.appendChild(boardClone);
		for (var i = 0; i < data.playersInRoom.length; i++) {
      $(".player-score:eq(" + i + ")").find('.glyphicon').append(data.playersInRoom[i].name.substring(0, 6));
      $(".player-score:eq(" + i + ")").find('.glyphicon').css("color", data.playersInRoom[i].tileHex);
		}
    if(active)  {
      $("#board").removeClass("not-active").addClass("active");
      
      $("#warningBoard").show();
      $("#turnPar").show();
      countdownToHideTurn = setTimeout(function() { $("#warningBoard").hide();
  	                          $("#turnPar").hide();}, 2000);// show "your turn!" for 2 seconds
    		
      countdownToShowClock = setTimeout(function(){  $("#warningBoard").show(); 
                              $(".clock").show();
        clock1 = $('.clock').FlipClock(5, {
      		        clockFace: 'MinuteCounter',
      		        countdown: true
      	});
        setTimeout(function() {
      		setInterval(function() {
      			clock1.increment();
      		}, 1000);
      	});
      }, 11000);
      
      countdownToChangeToNextPlayer1 = setTimeout(function() { $("#board").addClass("not-active"); 
                              $("#warningBoard").hide();
  	                          $("#cloc").hide();
                              socket.emit('ChangeToNextPlayer');
        
      }, 16000);// show "Change players!"
    } else {
      $('#first').addClass('blink_me');
    }
    
    $("#board").css('background-position', data.randPic+ '% 0');
    
    /*  while (lobby.firstChild) {
      lobby.removeChild(lobby.firstChild);
    }*/
    
    if (data.playersInRoom.length === 2) {
      $("#first, #second").removeClass("col-md-3");
      $("#score").addClass("verticalMiddle");
    }
    
    if (data.playersInRoom.length === 3) {
      $("#score").addClass("verticalMiddle");
      $("#first").removeClass("col-xs-6 col-md-3").addClass("col-xs-4");
      $("#second").removeClass("text-right col-xs-6 col-md-3").addClass("col-xs-4 text-center");
      $("#third").removeClass("text-left col-xs-6 col-md-3 hidden").addClass("col-xs-4 text-right");
    }
    if (data.playersInRoom.length === 4) {
      $("#third, #fourth, #nextLine").removeClass("hidden");
      $("#nextLine").addClass("clearfix visible-xs-block");
    }
    $("#lobby").hide();
    $("#score").show();
    $("#game-area").removeClass("before").addClass("after");
    $("#chat").removeClass("before").addClass("after");
		
		var $pictureChoice = $("#picture-choice");
		$pictureChoice.empty();
		$.each(data.picNames, function(index, value) {
			$pictureChoice.append("<li><a href=\"#\">" + value + "</a></li>");
		});
    
  });
  
  socket.on("unhideBackground", function() {
    $("#board").css("background-size", "3700%");
  });
  
  socket.on("enableCheckAnswerButton", function(data) {
    $("#checkAnswer").show();
    $("#guessPar").show();
    $("#warningBoard").show();
    countdownToHideGuessButton = setTimeout(function() { $("#warningBoard").hide();
                            $("#guessPar").hide();
                            $("#checkAnswer").hide();
                            socket.emit('ChangeToNextPlayer');
    }, 5000);// show "Guess image!" button for 5 seconds
  });
  
  socket.on("disableCheckAnswerButton", function() {
    $("#checkAnswer").hide();
  });
  
$('body').on('click', '#picture-choice li', function(){
  clearTimeout(setTimeout4);
    $("#guessPar").hide();
    
    var correctAnswer = false;
    var answer = $(this).text();
    socket.emit("checkAnswer", answer, function(data) {
      correctAnswer = data.result;
      data.score = 0;

       if (correctAnswer) {
          data.score += 100;
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

$('body').on('click', '#rooms li', function(){
    $("#listOfPeople").hide();
    $("#listOfRooms").toggle("slow");
    $("#listOfRooms").text("");
    
  socket.emit('sendRoomSize', $(this).attr("id"));
});

$('body').on('click', '#people li', function(){
    $("#listOfRooms").hide();
    $("#listOfPeople").toggle("slow");
});

socket.on("reloadPage", function(data) {
    $("#msgs").append("<li><strong><span class='text-warning'>Changing the room size...</span></strong></li>");
    window.location.href = "/room";
});

$('body').on('click', '#listOfRooms li', function(){
    socket.emit("joinRoom", {id : $(this).attr("id")});
});

  socket.on("roomList", function(data) {
    $("#rooms").text("");
    $("#rooms").append(
            "<div class=\"row-fluid no-gutter-at-all\" >" +
              "<div class=\"col-xs-4 \" >"+
                  "<li id = \"Large\" class=\"list-group-item\" role=\"presentation\"><a href=\"#\">Large <span class=\"badge\">"+ (typeof data.count.large != 'undefined' ? data.count.large : 0) +"</span></a></li>" +
              "</div>" +
              "<div class=\"col-xs-4 \" >"+
                  "<li id = \"Medium\" class=\"list-group-item\" role=\"presentation\"><a href=\"#\">Medium <span class=\"badge\">"+ (typeof data.count.medium != 'undefined' ? data.count.medium : 0) +"</span></a></li>" +
              "</div>" +
              "<div class=\"col-xs-4 \" >"+
                  "<li id = \"Small\" class=\"list-group-item\" role=\"presentation\"><a href=\"#\">Small <span class=\"badge\">"+ (typeof data.count.small != 'undefined' ? data.count.small : 0) +"</span></a></li>" +
              "</div>" +
            "</div>");
    if (!jQuery.isEmptyObject(data.rooms)) { 
      var displayNoRooms = 0;
      $.each(data.rooms, function(id, room) {
        if (room.size === data.s) {
          var html = "<button id="+id+" data-roomName="+room.name+" class='btn btn-default btn-xs' >Join</button>"/* + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>"*/;
          $('#listOfRooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span><span></span> " + html + " " + room.status + "</li>");
        } else {
          if (displayNoRooms < 1) {
            $("#msgs").append("<li class=\"text-success\">There are other room sizes available! </li>");
            displayNoRooms++; 
          }     
        }
      });
    } else {
      $("#listOfRooms").append("<li class=\"list-group-item text-danger\">There are no rooms yet. Press create room button to create your own!</li>");
    }
    $('#rooms li').removeClass('active');
    $('#'+data.s).addClass('active');
    
  });
  
  socket.on("updateActive", function(data) {
    $('#rooms li').removeClass('active');
    $('#'+data.s).addClass('active');
  });

  socket.on("sendRoomID", function(data) {
    myRoomID = data.id;
    active = data.active;
  });

  socket.on("changeActiveBoard", function(data) {
    active = data.active;
    $("#board").removeClass("active").addClass("not-active"); 
    $("#warningBoard").hide();
    clearTimeout(countdownToChangeToNextPlayer1);
    clearTimeout(countdownToChangeToNextPlayer2);
    clearTimeout(countdownToHideGuessButton);
    clearTimeout(countdownToShowClock);
    clearTimeout(countdown2);
  });
  
  socket.on("showStartButton", function(data) {
    $("#start_game_button").show();
    $("#start_game_button").removeClass("buttonDisabled").addClass("buttonEnabled");
  });
  
  socket.on("hideStartButton", function(data) {
    $("#start_game_button").hide();
    $("#start_game_button").removeClass("buttonEnabled").addClass("buttonDisabled");
  });
      
  socket.on("disableBoard", function(data) {
    $("#board").addClass("not-active"); 
    $("#warningBoard").hide();
  });

  socket.on("endGame", function(data, msg){
    $("#msgs").append("<li><strong><span class='text-warning'>" + msg + "</span></strong></li>");
    //$("#msg").attr("disabled", "disabled");
    //$("#send").attr("disabled", "disabled");
    $("#checkAnswer").hide();
    $("#board").addClass("not-active");
  });

  socket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
  });

});
