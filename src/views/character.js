Werld.Views.Character = Backbone.View.extend({
  initialize: function() {
    this.sprite = { frame: 0, partialFrame: 0, directionFrame: 0 };
    this.sprite.sheet = new Image();
    this.sprite.sheet.src = '/images/sprite_sheets/character.png';
    this.sprite.sheet.onload = _.bind(this.draw, this);
    this.movement = {};
    $(this.model.messages).bind('add', _.bind(this.draw, this));
  },
  updateDirectionFrame: function() {
    if (this.movement.directionX === 'left' &&
          this.movement.directionY === 'up') {
      this.sprite.directionFrame = 120;
    } else if (this.movement.directionX === 'left' &&
                 this.movement.directionY === 'down') {
      this.sprite.directionFrame = 0;
    } else if (this.movement.directionX === 'left' &&
                 this.movement.directionY === 'none') {
      this.sprite.directionFrame = 40;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'up') {
      this.sprite.directionFrame = 120;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'down') {
      this.sprite.directionFrame = 0;
    } else if (this.movement.directionX === 'right' &&
                 this.movement.directionY === 'none') {
      this.sprite.directionFrame = 80;
    } else if (this.movement.directionX === 'none' &&
                 this.movement.directionY === 'up') {
      this.sprite.directionFrame = 120;
    } else if (this.movement.directionX === 'none' &&
                 this.movement.directionY === 'down') {
      this.sprite.directionFrame = 0;
    }
  },
  advanceFrame: function() {
    if (this.movement.directionX === 'none' &&
          this.movement.directionY === 'none') {
      this.sprite.frame = 0;
    } else {
      this.sprite.partialFrame +=
        Werld.Config.CHARACTER_MOVEMENT_FRAME_SPEED;
      if (this.sprite.partialFrame >=
            Werld.Config.CHARACTER_SPRITES_NUMBER) {
        this.sprite.partialFrame -=
          (Werld.Config.CHARACTER_SPRITES_NUMBER - 1);
      }

      this.sprite.frame = Math.floor(this.sprite.partialFrame);
    }
  },
  draw: function() {
    var modelCoordinates = this.model.get('coordinates');
    var modelDestinationCoordinates = this.model.get('destination');
    var fixedModelCoordinates = this.model.get('fixedCoordinates');

    if (modelCoordinates[0] > modelDestinationCoordinates[0]) {
      this.movement.directionX = 'left';
    } else if (modelCoordinates[0] < modelDestinationCoordinates[0]) {
      this.movement.directionX = 'right';
    } else {
      this.movement.directionX = 'none';
    }

    if (modelCoordinates[1] > modelDestinationCoordinates[1]) {
      this.movement.directionY = 'up';
    } else if (modelCoordinates[1] < modelDestinationCoordinates[1]) {
      this.movement.directionY = 'down';
    } else {
      this.movement.directionY = 'none';
    }

    this.updateDirectionFrame();

    Werld.canvas.context.shadowColor = '#3300ff';
    Werld.canvas.context.shadowOffsetX = 1;
    Werld.canvas.context.shadowOffsetY = 1;
    Werld.canvas.context.fillStyle = '#00ccff';
    Werld.canvas.context.font = '20px "PowellAntique" serif';
    Werld.canvas.context.textBaseline = 'top';
    Werld.canvas.context.textAlign = 'center';
    Werld.canvas.context.fillText(
      this.model.get('name'),
      fixedModelCoordinates[0] + 20,
      fixedModelCoordinates[1] - 30
    );
    Werld.canvas.context.drawImage(
      this.sprite.sheet,
      this.sprite.frame * Werld.Config.PIXELS_PER_TILE,
      this.sprite.directionFrame,
      Werld.Config.PIXELS_PER_TILE,
      Werld.Config.PIXELS_PER_TILE,
      fixedModelCoordinates[0],
      fixedModelCoordinates[1],
      Werld.Config.PIXELS_PER_TILE,
      Werld.Config.PIXELS_PER_TILE
    );

    Werld.canvas.context.shadowOffsetX = 0;
    Werld.canvas.context.shadowOffsetY = 0;
    Werld.canvas.context.fillStyle = '#cccccc';
    Werld.canvas.context.font = '16px "PowellAntique" serif';

    var temporaryFixedModelCoordinates = _.clone(fixedModelCoordinates);
    this.model.messages.forEach(function(message) {
      if (message.content !== '') {
        temporaryFixedModelCoordinates[1] -= 20;
        Werld.canvas.context.fillText(
          message.content,
          temporaryFixedModelCoordinates[0] + 20,
          temporaryFixedModelCoordinates[1] - 30
        );
      }
    });

    this.advanceFrame();
  }
});
