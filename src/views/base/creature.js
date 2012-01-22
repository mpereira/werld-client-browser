Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    this.sprite = { frame: 0, partialFrame: 0, directionFrame: 0 };
    this.sprite.sheet = new Image();
    this.sprite.sheet.src = this.model.get('SPRITE').SRC;
    this.sprite.sheet.onload = _.bind(this.draw, this);
    this.movement = {};
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
    var sprite = this.model.get('SPRITE');

    if (this.movement.directionX === 'none' &&
          this.movement.directionY === 'none') {
      this.sprite.frame = 0;
    } else {
      this.sprite.partialFrame += sprite.FRAME_CHANGE_SPEED;
      if (this.sprite.partialFrame >= sprite.FRAMES) {
        this.sprite.partialFrame -= (sprite.FRAMES - 1);
      }

      this.sprite.frame = Math.floor(this.sprite.partialFrame);
    }
  },
  draw: function() {
    var modelCoordinates = this.model.get('coordinates');
    var fixedModelCoordinates = this.model.get('fixedCoordinates');
    var modelDestinationCoordinates = this.model.get('destination');
    var screenCoordinates = Werld.screen.get('coordinates');
    var mapDimensions = Werld.map.get('dimensions');
    var creatureScreenCoordinates;

    if (modelCoordinates[0] >= 0 &&
          modelCoordinates[0] < Werld.util.tileToPixel(mapDimensions[0]) &&
          modelCoordinates[1] >= 0 &&
          modelCoordinates[1] < Werld.util.tileToPixel(mapDimensions[1])) {
      if (this.model.get('fixed')) {
        creatureScreenCoordinates = [
          fixedModelCoordinates[0],
          fixedModelCoordinates[1]
        ];
      } else {
        creatureScreenCoordinates = [
          modelCoordinates[0] - screenCoordinates[0],
          modelCoordinates[1] - screenCoordinates[1]
        ];
      }
    } else {
      return;
    }

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

    if (this.model instanceof Werld.Models.Character) {
      Werld.canvas.context.shadowColor = '#3300ff';
      Werld.canvas.context.shadowOffsetX = 1;
      Werld.canvas.context.shadowOffsetY = 1;
      Werld.canvas.context.fillStyle = '#00ccff';
      Werld.canvas.context.font = '20px "PowellAntique" serif';
    } else {
      Werld.canvas.context.shadowOffsetX = 0;
      Werld.canvas.context.shadowOffsetY = 0;
      Werld.canvas.context.fillStyle = '#cccccc';
      Werld.canvas.context.font = '16px "PowellAntique" serif';
    }

    Werld.canvas.context.textBaseline = 'top';
    Werld.canvas.context.textAlign = 'center';
    Werld.canvas.context.fillText(
      this.model.get('name'),
      creatureScreenCoordinates[0] + 20,
      creatureScreenCoordinates[1] - 30
    );
    Werld.canvas.context.drawImage(
      this.sprite.sheet,
      this.sprite.frame * Werld.Config.PIXELS_PER_TILE,
      this.sprite.directionFrame,
      Werld.Config.PIXELS_PER_TILE,
      Werld.Config.PIXELS_PER_TILE,
      creatureScreenCoordinates[0],
      creatureScreenCoordinates[1],
      Werld.Config.PIXELS_PER_TILE,
      Werld.Config.PIXELS_PER_TILE
    );

    Werld.canvas.context.shadowOffsetX = 0;
    Werld.canvas.context.shadowOffsetY = 0;

    var temporaryCreatureScreenCoordinates = _.clone(creatureScreenCoordinates);
    _(this.model.get('messages')).each(function(message) {
      if (message.content !== '') {
        Werld.canvas.context.save();
        if (message.type === 'speech') {
          Werld.canvas.context.fillStyle = '#cccccc';
          Werld.canvas.context.font = '16px "PowellAntique" serif';
        } else if (message.type === 'hit') {
          Werld.canvas.context.shadowColor = 'black';
          Werld.canvas.context.shadowOffsetX = 1;
          Werld.canvas.context.shadowOffsetY = 1;
          Werld.canvas.context.shadowBlur = 1;
          Werld.canvas.context.fillStyle = '#ff3300';
          Werld.canvas.context.font = '14px "PowellAntique" serif';
        } else {
          Werld.canvas.context.fillStyle = '#cccccc';
          Werld.canvas.context.font = '16px "PowellAntique" serif';
        }
        temporaryCreatureScreenCoordinates[1] -= 20;
        Werld.canvas.context.fillText(
          message.content,
          temporaryCreatureScreenCoordinates[0] + 20,
          temporaryCreatureScreenCoordinates[1] - 30
        );
        Werld.canvas.context.restore();
      }
    });

    this.advanceFrame();
  }
});
