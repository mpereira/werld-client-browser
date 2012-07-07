Werld.Views.Creature = Werld.Views.Base.Creature.extend({
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);

    this.hitPointsBarRectangleWidth = 40;
    this.hitPointsBarRectangle = new Rectangle(
      -((this.hitPointsBarRectangleWidth - Werld.Config.PIXELS_PER_TILE) / 2),
      -((30 / 29) * this.options.image.DIMENSIONS[1] - 25),
      this.hitPointsBarRectangleWidth,
      3
    );
    this.hitPointsBarGraphics = new Graphics();
    this.hitPointsBar = new Shape(this.hitPointsBarGraphics);
    this.hitPointsBar.alpha = 0.7;

    this.container.addChild(this.hitPointsBar);

    this.updateHitPointsBar(this.model);

    this.nameText = new Werld.Text(_({
      TEXT: this.model.get('name')
    }).extend(Werld.TEXT.CREATURE_NAME));
    this.nameText.x = Werld.Config.PIXELS_PER_TILE / 2;
    this.nameText.y =
      this.hitPointsBarRectangle.y - (this.nameText.getMeasuredLineHeight() + 3);

    this.container.addChild(this.nameText);

    this.model.on('death', function(creature, options) {
      this.nameText.text = this.model.get('name') + ' corpse';
    }, this);
    this.model.on('resurrection', function(creature, options) {
      this.nameText.text = this.model.get('name');
    }, this);
    this.model.on('death', this.showLootIfCharacterIsClose);
    this.model.on('change:hitPoints', this.updateHitPointsBar);
    Werld.character.on(
      'change:coordinates',
      this.updateContainerOnScreenCoordinates
    );
  },
  showHitReceivedMessage: function(attackee, attacker, damage) {
    var damageText = new Werld.Text(_({
      TEXT: Math.abs(damage)
    }).extend(Werld.TEXT.CREATURE_HIT_RECEIVED));
    Werld.layers.battle.show(damageText, { above: this.model });
  },
  updateHitPointsBar: function(model) {
    var hitPointsPercentage =
      this.model.get('hitPoints') / this.model.maxHitPoints();
    this.hitPointsBarRectangle.width =
      hitPointsPercentage * this.hitPointsBarRectangleWidth;
    this.hitPointsBarGraphics.clear();

    if (this.hitPointsBarRectangle.width > 0) {
      this.hitPointsBarGraphics.
        beginFill('red').
        beginStroke('black').
        drawRoundRect(
          this.hitPointsBarRectangle.x,
          this.hitPointsBarRectangle.y,
          this.hitPointsBarRectangle.width,
          this.hitPointsBarRectangle.height,
          1
        ).
        endStroke().
        endFill();
    }
  },
  showLootIfCharacterIsClose: function() {
    if (this.model.tileDistance(Werld.character) <= 1) {
      this.showLoot();
    }
  }
});
