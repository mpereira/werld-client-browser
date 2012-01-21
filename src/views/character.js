Werld.Views.Character = Backbone.View.extend({
  initialize: function() {
    this.x = this.model.get('coordinates')[0] * Werld.Config.PIXELS_PER_TILE;
    this.y = this.model.get('coordinates')[1] * Werld.Config.PIXELS_PER_TILE;
    this.destinationX = this.x;
    this.destinationY = this.y;
    this.fixedX = this.x;
    this.fixedY = this.y;
    this.spriteSheet = new Image();
    this.spriteSheet.src = '/images/sprite_sheets/character.png';
    this.spriteSheet.onload = _.bind(this.draw, this);
    this.currentSpriteFrame = 0;
    this.currentSpritePartialFrame = 0;
    this.directionFrame = 0;
    this.movement = {};
    this.model.bind('move', this.updateDestination, this);
    $(this.model.messages).bind('add', this.draw.bind(this));
  },
  updateDestination: function() {
    this.destinationX = this.model.get('destinationColumn') * Werld.Config.PIXELS_PER_TILE;
    this.destinationY = this.model.get('destinationRow') * Werld.Config.PIXELS_PER_TILE;
  },
  updateDirectionFrame: function() {
    if (this.movement.directionX === 'left' &&
          this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'left' &&
                 this.movement.directionY === 'down') {
      this.directionFrame = 0;
    } else if (this.movement.directionX === 'left' &&
                 this.movement.directionY === 'none') {
      this.directionFrame = 40;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'down') {
      this.directionFrame = 0;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'none') {
      this.directionFrame = 80;
    } else if (this.movement.directionX === 'none' &&
                 this.movement.directionY === 'up') {
      this.directionFrame = 120;
    } else if (this.movement.directionX === 'none' &&
                 this.movement.directionY === 'down') {
      this.directionFrame = 0;
    }
  },
  advanceFrame: function() {
    if (this.movement.directionX === 'none' &&
          this.movement.directionY === 'none') {
      this.currentSpriteFrame = 0;
    } else {
      this.currentSpritePartialFrame +=
        Werld.Config.CHARACTER_MOVEMENT_FRAME_SPEED;
      if (this.currentSpritePartialFrame >=
            Werld.Config.CHARACTER_SPRITES_NUMBER) {
        this.currentSpritePartialFrame -=
          (Werld.Config.CHARACTER_SPRITES_NUMBER - 1);
      }

      this.currentSpriteFrame = Math.floor(this.currentSpritePartialFrame);
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
    }

    if (this.y > this.destinationY) {
      this.movement.directionY = 'up';
      this.y -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (this.y < this.destinationY) {
      this.movement.directionY = 'down';
      this.y += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else {
      this.movement.directionY = 'none';
    }

    this.model.set({
      coordinates: [
        this.x / Werld.Config.PIXELS_PER_TILE,
        this.y / Werld.Config.PIXELS_PER_TILE
      ]
    });

    this.updateDirectionFrame();

    Werld.canvas.context.shadowColor = '#3300ff';
    Werld.canvas.context.shadowOffsetX = 1;
    Werld.canvas.context.shadowOffsetY = 1;
    Werld.canvas.context.fillStyle = '#00ccff';
    Werld.canvas.context.font = '20px "PowellAntique" serif';
    Werld.canvas.context.textBaseline = 'top';
    Werld.canvas.context.textAlign = 'center';
    Werld.canvas.context.fillText(
      this.model.get('name'), this.fixedX + 20, this.fixedY - 30
    );
    Werld.canvas.context.drawImage(
      this.spriteSheet,
      this.currentSpriteFrame * 40, this.directionFrame, 40, 40,
      this.fixedX, this.fixedY, 40, 40
    );

    Werld.canvas.context.shadowOffsetX = 0;
    Werld.canvas.context.shadowOffsetY = 0;
    Werld.canvas.context.fillStyle = '#cccccc';
    Werld.canvas.context.font = '16px "PowellAntique" serif';
    var x = this.fixedX;
    var y = this.fixedY;
    this.model.messages.forEach(function(message) {
      if (message.content !== '') {
        y -= 20;
        Werld.canvas.context.fillText(message.content, x + 20, y - 30);
      }
    });

    this.advanceFrame();
  }
});
