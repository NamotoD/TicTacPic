# [Turn-based game with Chat app written in node.js and socket.io](https://tic-tac-pic.herokuapp.com/)
<p>This game uses chat functionality from https://github.com/tpiros/advanced-chat</p>
## Libraries used
<ul>
  <li>node.js / npm</li>
  <li>socket.io</li>
  <li>express</li>
  <li>node-uuid</li>
  <li>underscore</li>
  <li>ejs</li>
  <li>bootstrap</li>
  <li>flipclock</li>
  <li>bootpag</li>
  <li>pace.js</li>
  <li>jquery</li>
</ul>

# Overview
<ul>
  <li>Tic Tac Pic is a responsive turn based game, that could be played on any device ranging from a mobile phone through to a tablet or a desktop.</li>
  <li>It could be played by 2 players in Small and Medium room sizes, and by 2-4 players when Large room was chosen.</li>
  <li>Players can either create their own room by pressing Create room button, or join another player(s) by clicking on the room size of their choice. Clicking again on the room size will reveal the available rooms(note: Player can see those rooms under the the Lobby tab).</li>
  <li>The game starts after the owner(first game in a room), or the winner of the previous game(every following game) in the same room pressed the Start button</li>
  <li>User agent and geo location are both detected</li>
  <li>People can setup a room. Room names are unique. One person can create one room and join one room</li>
  <li>Users have to join a room to chat.</li>
  <li>Users can leave a room and/or disconnect from the server anytime</li>
  <li><strong>New:</strong> People joining the room will see the past 10 messages (chat history).</li>
  <li><strong>New:</strong> People will see an 'is typing' message when someone is typing a message.</li>
</ul>

# Rules
<ul>
  <li>Player with the highest score at the end of a game is the winner. If scores are equal the room owner becomes the winner.</li>
  <li>Players can gain points in two different ways:</li>
  <li>1) Uncover 3-5 consecutive squares in either direction
                        3 * square = 20 points
                        4 * square = 50 points
                        5 * square = 100 points
                    Already uncovered squares can not be extended or reused.
                    It is possible to complete multiple winning sets in one turn.</li>
  <li>2) After uncovering winning squares, a player will also have the opportunity to guess what is on the underlying image(Guess button will appear for 5 seconds). 
		            Pressing the button will reveal for 10 seconds a list of answers including the correct one.
                    Each player has up to three attempts in each game...</li>
  <li>...Correct guess incurres 100 points, wrong answer incurres penalty 50 points.The game ends either when none of the players in the room have any valid moves left, or after one of the players correctly guessed what animal was on the background image.
		        Enjoy the game!!!
		        Suggestions: TicTacPic@mail.com</li>
</ul>

## Setup and configuration

Make sure that you update <strong>server.js</strong>:
<pre>server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});</pre>
and add your own IP address/hostname if required, i.e.:
<pre>server.listen(app.get('port'), "192.168.56.102", function(){
  console.log('Express server listening on port ' + app.get('port'));
});</pre>

(the port is defined in the <code>app.set('port', process.env.PORT || 3000);</code> section.)

Please also update <strong>public/js/client.js</strong>:
<pre>var socket = io.connect("192.168.56.102:3000");</pre>
with the right IP address/hostname.

To install <code>npm install && bower install</code> and to launch run <code>npm start</code>.