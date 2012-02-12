Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    var image = new Image();
    image.src = this.model.get('SPRITE').SRC;
    image.onload = _.bind(function() {
      var spriteSheet = new SpriteSheet({
        images: [image],
        frames: { width: 40, height: 40 },
        animations: {
          walkDown:  [0, 3],
          walkLeft:  [4, 7],
          walkRight: [8, 11],
          walkUp:    [12, 15]
        }
      });

      this.bitmapAnimation = new BitmapAnimation(spriteSheet);
      this.bitmapAnimation.currentFrame = 0;
      this.bitmapAnimation.mouseEnabled = true;
      this.bitmapAnimation.paused = true;
      this.bitmapAnimation.onMouseOver = function() {
        this.parent.getStage().canvas.style.cursor = 'pointer';
      };
      this.bitmapAnimation.onMouseOut = function() {
        this.parent.getStage().canvas.style.cursor = '';
      };
      var self = this;
      this.bitmapAnimation.onPress = function(event) {
        if (self.model.alive()) {
          Werld.character.attack(self.model);
        } else {
          self.showLoot(self.model.loot());
        }
      };
      this.bitmapAnimation.tick = _.bind(this.bitmapAnimationTick, this);

      this.characterNameText = new Text();
      this.characterNameText.tick = _.bind(this.characterNameTextTick, this);

      this.messagesContainer = new Container();
      this.messagesContainer.tick = _.bind(this.messagesContainerTick, this);

      this.container.tick = _.bind(this.tick, this);

      this.container.addChild(this.bitmapAnimation);
      this.container.addChild(this.characterNameText);
      this.container.addChild(this.messagesContainer);
    }, this);
  },
  showLoot: function() {
  },
  bitmapAnimationTick: function() {
    var modelCoordinates = this.model.get('coordinates');
    var modelDestinationCoordinates = this.model.get('destination');
    var gotoThrottle = Ticker.getTicks() % 4;
    var advanceThrottle = Ticker.getTicks() % 8;
    var walking = [];

    if (gotoThrottle === 0) {
      if (modelCoordinates[0] > modelDestinationCoordinates[0]) {
        this.bitmapAnimation.gotoAndStop('walkLeft');
        walking[0] = true;
      } else if (modelCoordinates[0] < modelDestinationCoordinates[0]) {
        this.bitmapAnimation.gotoAndStop('walkRight');
        walking[0] = true;
      } else {
        walking[0] = false;
      }

      if (modelCoordinates[1] > modelDestinationCoordinates[1]) {
        this.bitmapAnimation.gotoAndStop('walkUp');
        walking[1] = true;
      } else if (modelCoordinates[1] < modelDestinationCoordinates[1]) {
        this.bitmapAnimation.gotoAndStop('walkDown');
        walking[1] = true;
      } else {
        walking[1] = false;
      }
    }

    if ((walking[0] || walking[1]) && advanceThrottle === 0) {
      this.bitmapAnimation.advance();
    }
  },
  characterNameTextTick: function() {
    this.characterNameText.text = this._characterNameText();

    this.characterNameText.textBaseline = 'top';
    this.characterNameText.textAlign = 'center';
    this.characterNameText.x = 20;
    this.characterNameText.y = -30;
  },
  messagesContainerTick: function() {
    var temporaryCreatureScreenCoordinates = [0, 0];
    var self = this;

    this.messagesContainer.removeAllChildren();
    _(this.model.get('messages')).each(function(message) {
      if (message.content !== '') {
        self.messageText = new Text();
        self.messagesContainer.addChild(self.messageText);

        self.messageText.text = message.content;
        self.messageText.textAlign = 'center';

        if (message.type === 'speech') {
          self.messageText.color = '#cccccc';
          self.messageText.font = '16px "PowellAntique" serif';
        } else if (message.type === 'hit') {
          self.messageText.text = Math.ceil(self.messageText.text);
          self.messageText.shadow = new Shadow('black', 1, 1, 1);
          self.messageText.color = '#ff3300';
          self.messageText.font = '14px "PowellAntique" serif';
        } else {
          self.messageText.color = '#cccccc';
          self.messageText.font = '16px "PowellAntique" serif';
        }

        temporaryCreatureScreenCoordinates[1] -= 30;
        self.messageText.x = 20;
        self.messageText.y = temporaryCreatureScreenCoordinates[1];
      }
    });
  },
  tick: function() {
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

    this.container.x = creatureScreenCoordinates[0];
    this.container.y = creatureScreenCoordinates[1];
  }
});
