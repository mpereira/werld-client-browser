Werld.Views.Base.Creature = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new CreateJS.Container();
    this.container.view = this;

    // TODO: find a better place to pass the main character to the view.
    this.lootContainerView = new Werld.Views.LootContainer({
      model: this.model.lootContainer,
      character: Werld.character
    });

    this.spriteSheet = new CreateJS.SpriteSheet({
      images: [this.options.image.SRC],
      frames: {
        width: this.options.image.DIMENSIONS[0],
        height: this.options.image.DIMENSIONS[1],
        regX: (this.options.image.DIMENSIONS[0] - Werld.Config.PIXELS_PER_TILE) / 2,
        regY: (1.7 * this.options.image.DIMENSIONS[1] - Werld.Config.PIXELS_PER_TILE) / 2
      },
      animations: {
        walkDown:  [0,  3,  true, 1 / this.options.image.FREQUENCY],
        walkLeft:  [4,  7,  true, 1 / this.options.image.FREQUENCY],
        walkRight: [8,  11, true, 1 / this.options.image.FREQUENCY],
        walkUp:    [12, 15, true, 1 / this.options.image.FREQUENCY]
      }
    });

    this.bitmapAnimation = new CreateJS.BitmapAnimation(this.spriteSheet);
    this.bitmapAnimation.currentFrame = 0;
    this.bitmapAnimation.onMouseOver = this.onBitmapAnimationMouseOver;
    this.bitmapAnimation.onMouseOut = this.onBitmapAnimationMouseOut;
    this.bitmapAnimation.onDoubleClick = this.onBitmapAnimationDoubleClick;

    this.messagesContainer = new CreateJS.Container();
    this.messagesContainer.y =
      - (this.spriteSheet._frameHeight - 0.1 * this.spriteSheet._regY);

    this.container.addChild(this.bitmapAnimation);
    this.container.addChild(this.messagesContainer);

    this.updateContainerOnScreenCoordinates();

    this.model.on('destroy', this.onModelDestroy);
    this.model.on('death', this.pauseBitmapAnimation);
    this.model.on('change:isMoving', function(creature, value, options) {
      if (!creature.isMoving()) {
        _.defer(this.pauseBitmapAnimation, creature);
      }
    }, this);
    this.model.on('change:coordinates', this.updateBitmapAnimation);
    this.model.on('change:coordinates', this.updateContainerOnScreenCoordinates);
    this.model.on('change:messages', this.messagesContainerTick);
    this.model.on('hitReceived', this.showHitReceivedMessage);
    this.model.on('hitMissed', this.showHitMissedMessage);
    this.model.on('hitDelivered:critical', this.showCriticalHitMessage);
  },
  showHitMissedMessage: function(attackee, attacker) {
    var hitMissedText = new Werld.Text(Werld.TEXT.CREATURE_HIT_MISSED);

    Werld.layers.battle.show(hitMissedText, { above: this.model });
  },
  showCriticalHitMessage: function(attackee, attacker, damage) {
    var criticalHitText = new Werld.Text(Werld.TEXT.CREATURE_CRITICAL_HIT);

    Werld.layers.battle.show(criticalHitText, { above: this.model });
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
    if (Werld.character.dead()) {
      return;
    }

    if (this.model !== Werld.character) {
      if (this.model.alive()) {
        Werld.character.attack(this.model);
      } else {
        if (Werld.character.tileDistance(this.model) <= 1) {
          this.showLoot();
        }
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
  messagesContainerTick: function() {
    var temporaryCreatureScreenCoordinates = [0, 0];
    var self = this;

    this.messagesContainer.removeAllChildren();
    _(this.model.get('messages')).each(function(message) {
      if (message.content !== '') {
        self.messageText = new CreateJS.Text();
        self.messagesContainer.addChild(self.messageText);

        self.messageText.text = message.content;
        self.messageText.textAlign = 'center';

        if (message.type === 'speech') {
          self.messageText.color = '#cccccc';
          self.messageText.font = '16px "PowellAntique" serif';
        } else {
          self.messageText.color = '#cccccc';
          self.messageText.font = '16px "PowellAntique" serif';
        }

        temporaryCreatureScreenCoordinates[1] -=
          self.messageText.getMeasuredLineHeight();
        self.messageText.x = Werld.Config.PIXELS_PER_TILE / 2;
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
