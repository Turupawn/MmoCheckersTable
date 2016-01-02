var util = require('util')
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var io = require('socket.io')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('game_database.sqlite3')

var Player = require('./Player')

var port = process.env.PORT || 8080

/* ************************************************
** GAME VARIABLES
************************************************ */
var socket	// Socket controller
var players	// Array of connected players

var objects_x=[]
var objects_y=[]
var object_amount=48

/* ************************************************
** GAME INITIALISATION
************************************************ */

// Create and start the http server
var server = http.createServer(
  ecstatic({ root: path.resolve(__dirname, '../public') })
).listen(port, function (err) {
  if (err) {
    throw err
  }

  init()
})

function init () {

  /*
  db.serialize(function() {


    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        console.log(row.id + ": " + row.info);
    });
  });

  db.close();
  */


  // Create an empty array to store players
  players = []

  for(var i=0;i<object_amount;i++)
  {
    objects_x.push(0)
    objects_y.push(0)
  }

  // Attach Socket.IO to server
  socket = io.listen(server)

  // Configure Socket.IO
  socket.configure(function () {
    // Only use WebSockets
    socket.set('transports', ['websocket'])

    // Restrict log output
    socket.set('log level', 2)
  })

  // Start listening for events
  setEventHandlers()
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection)
}

// New socket connection
function onSocketConnection (client) {
  util.log('New player has connected: ' + client.id)

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer)

  client.on('test', onTest)

  client.on('move object', onMoveSharedObject)

}

// Socket client has disconnected
function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}

// New player has joined
function onNewPlayer (data) {
  // Create a new player
  var newPlayer = new Player(data.x, data.y)
  newPlayer.id = this.id

  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

  // Send existing players to the new player
  var i, existingPlayer
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i]
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
  }

  //Send existing objects to the new player
  for(var i=0;i<objects_x.length;i++)
  {
    this.emit('move object', { index: i, x: objects_x[i], y: objects_y[i]})
  }

  // Add new player to the players array
  players.push(newPlayer)
}

function onTest (data) {
  console.log('Server received message')
  this.broadcast.emit('test', {id: 1, x: 2, y: 3})
}

// Player has moved
function onMovePlayer (data) {
  // Find player in array
  var movePlayer = playerById(this.id)

  // Player not found
  if (!movePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()})
}

function onMoveSharedObject (data) {
  console.log('Server received message: move object')
  objects_x[data.index]=data.x
  objects_y[data.index]=data.y
  this.broadcast.emit('move object', { index: data.index, x: data.x, y: data.y})
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}
