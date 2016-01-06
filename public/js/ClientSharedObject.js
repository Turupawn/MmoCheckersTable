/* global game */

var ClientSharedObject = function (index,game, startX, startY,image) {
  this.index = index
  this.game = game
  this.my_sprite = game.add.sprite(startX, startY, image)
  this.my_sprite.inputEnabled = true;
  this.my_sprite.input.enableDrag();
  this.my_sprite.events.onDragStart.add(onDragStart, this);
  this.my_sprite.events.onDragStop.add(onDragStop, this);
  this.my_sprite.events.onInputDown.add(onDown, this);

  this.normal_animation = this.my_sprite.animations.add('normal', [0], 10, true);
  this.queen_animation = this.my_sprite.animations.add('queen', [1], 10, true);
  this.my_sprite.play('normal')
}

ClientSharedObject.prototype.update = function () {
   //console.log('Update');
}

function toggleAnimation(_this)
{
  if(_this.my_sprite.animations.currentAnim == _this.normal_animation)
    _this.my_sprite.play('queen')
  else if(_this.my_sprite.animations.currentAnim == _this.queen_animation)
    _this.my_sprite.play('normal')
}

function onDown(sprite, pointer) {
  //toggleAnimation(this)
}

function onDragStart(sprite, pointer) {
  result = "Dragging " + sprite.key;
  this.drag_adjustment_x = pointer.x-sprite.x-800/2
  this.drag_adjustment_y = pointer.y-sprite.y-600/2

  this.drag_start_x = sprite.x
  this.drag_start_y = sprite.y
}

function onDragStop(sprite, pointer) {
  result = sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y;
  var new_position_x = pointer.x-800/2-this.drag_adjustment_x
  var new_position_y = pointer.y-600/2-this.drag_adjustment_y

  if(new_position_x<-400)
    new_position_x=-400
  if(new_position_y<-300)
    new_position_y=-300
  if(new_position_x>350)
    new_position_x=350
  if(new_position_y>250)
    new_position_y=250

  var crown = false

  if(this.drag_start_x == new_position_x && this.drag_start_y == new_position_y)
  {
    toggleAnimation(this)
    crown = true
  }

  this.my_sprite.x = new_position_x
  this.my_sprite.y = new_position_y

  socket.emit('move object', { index: this.index, x: new_position_x, y: new_position_y, crown: crown })
  console.log('Client sent message: move object')

}

window.ClientSharedObject = ClientSharedObject
