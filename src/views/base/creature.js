Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;
    this.walking = {};

    this.model.bind('destroy', this.onModelDestroy, this);

    // TODO: find a better place to pass the main character to the view.
    this.lootContainerView = new Werld.Views.LootContainer({
      model: this.model.lootContainer,
      character: Werld.character
    });

    // TODO: load images asynchronously when the game starts, not inside views.
    var SPRITE = this.model.get('SPRITE');
    var image = new Image();
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
          walkDown:  [0,  3,  true, 1 / SPRITE.FREQUENCY],
          walkLeft:  [4,  7,  true, 1 / SPRITE.FREQUENCY],
          walkRight: [8,  11, true, 1 / SPRITE.FREQUENCY],
          walkUp:    [12, 15, true, 1 / SPRITE.FREQUENCY]
        }
      });

      this.bitmapAnimation = new BitmapAnimation(this.spriteSheet);
      this.bitmapAnimation.currentFrame = 0;
      this.bitmapAnimation.onMouseOver = this.onBitmapAnimationMouseOver;
      this.bitmapAnimation.onMouseOut = this.onBitmapAnimationMouseOut;
      this.bitmapAnimation.onDoubleClick = this.onBitmapAnimationDoubleClick;
      this.bitmapAnimation.tick = this.bitmapAnimationTick;

      this.characterNameText = new Text();
      this.characterNameText.tick = this.characterNameTextTick;

      this.messagesContainer = new Container();
      this.messagesContainer.tick = this.messagesContainerTick;

      this.container.tick = this.tick;

      this.container.addChild(this.bitmapAnimation);
      this.container.addChild(this.characterNameText);
      this.container.addChild(this.messagesContainer);
    }, this);
  },
  onBitmapAnimationMouseOver: function(event) {
    Werld.canvas.el.style.cursor = 'pointer';
  },
  onBitmapAnimationMouseOut: function(event) {
    Werld.canvas.el.style.cursor = '';
  },
  onBitmapAnimationDoubleClick: function(event) {
    if (this.model.alive()) {
      Werld.character.attack(this.model);
    } else {
      if (Werld.character.tileDistance(this.model) <= 1) {
        this.showLoot();
      }
    }
  },
  showLoot: function() {
    this.lootContainerView.show();
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
    this.characterNameText.y = - (this.spriteSheet._regY + 28);
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
  onModelDestroy: function() {
    this.container.parent.removeChild(this.container);
    delete this.bitmapAnimation.onMouseOver;
    delete this.bitmapAnimation.onMouseOut;
  },
  tick: function() {
    var modelCoordinates = this.model.get('coordinates');
    var screenCoordinates = Werld.screen.get('coordinates');
    var mapDimensions = Werld.map.get('dimensions');

    if (modelCoordinates[0] >= 0 &&
          modelCoordinates[0] < Werld.util.tileToPixel(mapDimensions[0]) &&
          modelCoordinates[1] >= 0 &&
          modelCoordinates[1] < Werld.util.tileToPixel(mapDimensions[1])) {
      this.container.x = modelCoordinates[0] - screenCoordinates[0];
      this.container.y = modelCoordinates[1] - screenCoordinates[1];
    }
  }
});
