Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;

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

      this.nameText = new Text();
      this.updateCreatureName();

      this.messagesContainer = new Container();
      // FIXME: only call the message updating callback on 'change:messages'.
      this.messagesContainer.onTick = this.messagesContainerTick;

      this.container.addChild(this.bitmapAnimation);
      this.container.addChild(this.nameText);
      this.container.addChild(this.messagesContainer);

      this.updateContainerOnScreenCoordinates();

      this.model.on('destroy', this.onModelDestroy);
      this.model.on('change:status', this.updateCreatureName);
      this.model.on('death', this.pauseBitmapAnimation);
      this.model.on('idle', this.pauseBitmapAnimation);
      this.model.on('change:coordinates', this.updateBitmapAnimation);
      this.model.on('change:coordinates', this.updateContainerOnScreenCoordinates);
    }, this);
  },
  updateContainerOnScreenCoordinates: function() {
    var onScreenCoordinates =
      Werld.screen.objectCoordinates(this.model);

    this.container.x = onScreenCoordinates[0];
    this.container.y = onScreenCoordinates[1];
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
  pauseBitmapAnimation: function(creature) {
    this.bitmapAnimation.currentAnimationFrame = 0;
    this.bitmapAnimation.paused = true;
  },
  updateBitmapAnimation: function(creature) {
    this.bitmapAnimation.paused = false;

    // If the creature is moving diagonally give precedence to vertical
    // animations (i.e. "walkDown" and "walkUp") because we don't have diagonal
    // animations.
    if (this.model.get('coordinates')[1] > this.model.previous('coordinates')[1]) {
      if (this.bitmapAnimation.currentAnimation !== 'walkDown') {
        this.bitmapAnimation.gotoAndPlay('walkDown');
      }
    } else if (this.model.get('coordinates')[1] < this.model.previous('coordinates')[1]) {
      if (this.bitmapAnimation.currentAnimation !== 'walkUp') {
        this.bitmapAnimation.gotoAndPlay('walkUp');
      }
    } else {
      if (this.model.get('coordinates')[0] > this.model.previous('coordinates')[0]) {
        if (this.bitmapAnimation.currentAnimation !== 'walkRight') {
          this.bitmapAnimation.gotoAndPlay('walkRight');
        }
      } else if (this.model.get('coordinates')[0] < this.model.previous('coordinates')[0]) {
        if (this.bitmapAnimation.currentAnimation !== 'walkLeft') {
          this.bitmapAnimation.gotoAndPlay('walkLeft');
        }
      }
    }
  },
  updateCreatureName: function() {
    this.nameText.text = this.nameTextText();
    this.nameText.font = this.nameTextFont;
    this.nameText.color = this.nameTextColor;
    if (this.nameTextShadow) {
      this.nameText.shadow = this.nameTextShadow;
    }

    this.nameText.textBaseline = 'top';
    this.nameText.textAlign = 'center';
    this.nameText.x = 20;
    this.nameText.y = - (this.spriteSheet._regY + 28);
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
  }
});
