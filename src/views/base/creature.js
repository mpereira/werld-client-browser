Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    this.walking = {};

    var image = new Image();
    var SPRITE = this.model.get('SPRITE');
    image.src = SPRITE.SRC;
    image.onload = _.bind(function() {
      this.spriteSheet = new SpriteSheet({
        images: [image],
        frames: {
          width: SPRITE.DIMENSIONS[0],
          height: SPRITE.DIMENSIONS[1],
          regX: (SPRITE.DIMENSIONS[0] - Werld.Config.PIXELS_PER_TILE) / 2,
          regY: (1.7 * SPRITE.DIMENSIONS[1] - Werld.Config.PIXELS_PER_TILE) / 2
        },
        animations: {
          walkDown:  [0, 3, true, 4],
          walkLeft:  [4, 7, true, 4],
          walkRight: [8, 11, true, 4],
          walkUp:    [12, 15, true, 4]
        }
      });

      this.bitmapAnimation = new BitmapAnimation(this.spriteSheet);
      this.bitmapAnimation.currentFrame = 0;
      this.bitmapAnimation.mouseEnabled = true;
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

    if (modelCoordinates[1] > modelDestinationCoordinates[1]) {
      if (!this.walking.up) {
        this.bitmapAnimation.gotoAndPlay('walkUp');
        this.walking.up = true;
        this.walking.down = false;
        this.walking.left = false;
        this.walking.right = false;
      }
    } else if (modelCoordinates[1] < modelDestinationCoordinates[1]) {
      if (!this.walking.down) {
        this.bitmapAnimation.gotoAndPlay('walkDown');
        this.walking.up = false;
        this.walking.down = true;
        this.walking.left = false;
        this.walking.right = false;
      }
    } else {
      this.walking.up = false;
      this.walking.down = false;

      if (modelCoordinates[0] > modelDestinationCoordinates[0]) {
        if (!this.walking.left) {
          this.bitmapAnimation.gotoAndPlay('walkLeft');
          this.walking.left = true;
          this.walking.right = false;
        }
      } else if (modelCoordinates[0] < modelDestinationCoordinates[0]) {
        if (!this.walking.right) {
          this.bitmapAnimation.gotoAndPlay('walkRight');
          this.walking.left = false;
          this.walking.right = true;
        }
      } else {
        this.walking.left = false;
        this.walking.right = false;
        this.bitmapAnimation.currentAnimationFrame = 0;
        this.bitmapAnimation.paused = true;
      }
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
