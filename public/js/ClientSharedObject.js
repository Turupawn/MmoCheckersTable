/* global game */

var ClientSharedObject = function (index,game, startX, startY,image) {
  this.index = index
  this.game = game
  this.my_sprite = game.add.sprite(startX, startY, image)
  this.my_sprite.inputEnabled = true;
  this.my_sprite.input.enableDrag();
  this.my_sprite.events.onDragStart.add(onDragStart, this);
  this.my_sprite.events.onDragStop.add(onDragStop, this);
}

ClientSharedObject.prototype.update = function () {
   //console.log('Update');
}

function onDragStart(sprite, pointer) {
  result = "Dragging " + sprite.key;
  this.drag_adjustment_x = pointer.x-sprite.x-800/2
  this.drag_adjustment_y = pointer.y-sprite.y-600/2
}

function onDragStop(sprite, pointer) {
  result = sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y;
  var new_position_x = pointer.x-800/2-this.drag_adjustment_x//-800/2+game.camera.x
  var new_position_y = pointer.y-600/2-this.drag_adjustment_y//-600/2+game.camera.y
  console.log("fds"+new_position_y)
  if(new_position_x<-400)
  {
    console.log("fdsa")
    new_position_x=-400
  }
  if(new_position_y<-300)
    new_position_y=-300
  if(new_position_x>350)
    new_position_x=350
  if(new_position_y>250)
    new_position_y=250

  this.my_sprite.x = new_position_x
  this.my_sprite.y = new_position_y

  socket.emit('move object', { index: this.index, x: new_position_x, y: new_position_y })
  console.log('Client sent message: move object')

}

window.ClientSharedObject = ClientSharedObject
