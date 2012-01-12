Werld.Views.Character = function(model) {
  this.model = model;
  this.x = this.model.column * Werld.Config.PIXELS_PER_TILE;
  this.y = this.model.row * Werld.Config.PIXELS_PER_TILE;
  this.destinationX = this.x;
  this.destinationY = this.y;
  this.spriteSheet = new Image();
  this.spriteSheet.src = '/images/sprite_sheets/character.png';
  this.spriteSheet.onload = this.draw.bind(this);
  this.currentFrame = 0;
  this.directionFrame = 0;
  this.movement = {};
  $(this.model).bind('move', this.updateDestination.bind(this));
  $(this.model.messages).bind('add', this.draw.bind(this));
};

Werld.Views.Character.prototype = {
  updateDestination: function() {
    this.destinationX = this.model.destinationColumn * Werld.Config.PIXELS_PER_TILE;
    this.destinationY = this.model.destinationRow * Werld.Config.PIXELS_PER_TILE;
  },
  updateDirectionFrame: function() {
    if (this.movement.directionX === 'left' && this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'left' && this.movement.directionY === 'down') {
      this.directionFrame = 0;
    } else if (this.movement.directionX === 'left' && this.movement.directionY === 'none') {
      this.directionFrame = 40;
    } else if (this.movement.directionX === 'right' && this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'right' && this.movement.directionY === 'down') {
      this.directionFrame = 0;
    } else if (this.movement.directionX === 'right' && this.movement.directionY === 'none') {
      this.directionFrame = 80;
    } else if (this.movement.directionX === 'none' && this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'none' && this.movement.directionY === 'down') {
      this.directionFrame = 0;
    }
  },
  advanceFrame: function() {
    if (this.movement.directionX !== 'none' || this.movement.directionY !== 'none') {
      this.currentFrame = this.currentFrame > 2 ? 0 : (this.currentFrame + 1);
    }
  },
  draw: function() {
    if (this.x > this.destinationX) {
      this.movement.directionX = 'left';
      this.x -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (this.x < this.destinationX) {
      this.movement.directionX = 'right';
      this.x += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else {
      this.movement.directionX = 'none';
      this.model.column = Math.floor(this.x / Werld.PIXELS_PER_TILE);
    }

    if (this.y > this.destinationY) {
      this.movement.directionY = 'up';
      this.y -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (this.y < this.destinationY) {
      this.movement.directionY = 'down';
      this.y += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else {
      this.movement.directionY = 'none';
      this.model.row = Math.floor(this.y / Werld.PIXELS_PER_TILE);
    }

    this.updateDirectionFrame();

    Werld.canvas.context.shadowColor = '#3300ff';
    Werld.canvas.context.shadowOffsetX = 1;
    Werld.canvas.context.shadowOffsetY = 1;
    Werld.canvas.context.fillStyle = '#00ccff';
    Werld.canvas.context.font = '20px "PowellAntique" serif';
    Werld.canvas.context.textBaseline = 'top';
    Werld.canvas.context.textAlign = 'center';
    Werld.canvas.context.fillText(this.model.name, this.x + 20, this.y - 30);
    Werld.canvas.context.drawImage(
      this.spriteSheet, this.currentFrame * 40, this.directionFrame, 40, 40,
      this.x, this.y, 40, 40
    );

    Werld.canvas.context.shadowOffsetX = 0;
    Werld.canvas.context.shadowOffsetY = 0;
    Werld.canvas.context.fillStyle = '#cccccc';
    Werld.canvas.context.font = '16px "PowellAntique" serif';
    var y = this.y;
    this.model.messages.forEach(function(message) {
      if (message.content !== '') {
        y -= 20;
        Werld.canvas.context.fillText(message.content, this.x + 20, y - 30);
      }
    });

    this.advanceFrame();
  },
};
