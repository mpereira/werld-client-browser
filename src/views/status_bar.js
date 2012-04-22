Werld.Views.StatusBar = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;
    this.container.x = 0;
    this.container.y = 405;

    this.container.onPress = this.onContainerPress;
    this.container.onMouseOver = this.onContainerMouseOver;
    this.container.onMouseOut = this.onContainerMouseOut;

    // FIXME: refactor this mess.
    this.statusBarRectangle = new Rectangle(0, 0, 200, 75);
    var statusBarRectangle = new Graphics();
    statusBarRectangle.
      beginFill('#ccc').
      drawRoundRect(
        this.statusBarRectangle.x,
        this.statusBarRectangle.y,
        this.statusBarRectangle.width,
        this.statusBarRectangle.height,
        5
      ).
      endFill();
    this.statusBarRectangleShape = new Shape(statusBarRectangle);
    this.statusBarRectangleShape.alpha = 0.5;

    this.hitPointsTextKey = new Text('H', '16px "PowellAntique" serif', 'white');
    this.hitPointsTextKey.x = 15;
    var leftRectangleWidth = this.hitPointsTextKey.x + this.hitPointsTextKey.getMeasuredWidth();
    var barPadding = 5;
    var valueTextX = leftRectangleWidth + (this.statusBarRectangle.width - leftRectangleWidth) / 2;

    this.hitPointsTextKey.y = 5;
    this.hitPointsTextKey.textBaseline = 'top';
    this.hitPointsTextKey.textAlign = 'center';
    this.hitPointsTextValue = new Text(
      this.model.get('hitPoints') + '/' + this.model.get('maxHitPoints'),
      '16px "PowellAntique" serif',
      'white'
    );
    this.hitPointsTextValue.textBaseline = 'top';
    this.hitPointsTextValue.textAlign = 'center';
    this.hitPointsTextValue.y = this.hitPointsTextKey.y;
    this.hitPointsTextValue.x = valueTextX;
    var hitPointsPercentage = this.model.get('maxHitPoints') / this.model.get('hitPoints');
    this.hitPointsBarRectangle = new Rectangle(
      leftRectangleWidth + barPadding,
      this.hitPointsTextKey.y,
      hitPointsPercentage * (this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding),
      this.hitPointsTextKey.getMeasuredLineHeight()
    );
    this.hitPointsBarGraphics = new Graphics();
    this.hitPointsBarGraphics.
      beginFill('red').
      drawRoundRect(
        this.hitPointsBarRectangle.x,
        this.hitPointsBarRectangle.y,
        this.hitPointsBarRectangle.width,
        this.hitPointsBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.hitPointsBar = new Shape(this.hitPointsBarGraphics);
    this.hitPointsBar.alpha = 0.5;

    this.manaTextKey = new Text('M', '16px "PowellAntique" serif', 'white');
    this.manaTextKey.x = this.hitPointsTextKey.x;
    this.manaTextKey.y = this.hitPointsTextKey.y + this.manaTextKey.getMeasuredLineHeight();
    this.manaTextKey.textBaseline = 'top';
    this.manaTextKey.textAlign = 'center';
    this.manaTextValue = new Text(
      this.model.get('mana') + '/' + this.model.get('maxMana'),
      '16px "PowellAntique" serif',
      'white'
    );
    this.manaTextValue.textBaseline = 'top';
    this.manaTextValue.textAlign = 'center';
    this.manaTextValue.y = this.manaTextKey.y;
    this.manaTextValue.x = valueTextX;
    this.manaBarRectangle = new Rectangle(
      leftRectangleWidth + barPadding,
      this.manaTextKey.y,
      this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding,
      this.manaTextKey.getMeasuredLineHeight()
    );
    this.manaBarGraphics = new Graphics();
    this.manaBarGraphics.
      beginFill('blue').
      drawRoundRect(
        this.manaBarRectangle.x,
        this.manaBarRectangle.y,
        this.manaBarRectangle.width,
        this.manaBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.manaBar = new Shape(this.manaBarGraphics);
    this.manaBar.alpha = 0.5;

    this.staminaTextKey = new Text('S', '16px "PowellAntique" serif', 'white');
    this.staminaTextKey.x = this.manaTextKey.x;
    this.staminaTextKey.y = this.manaTextKey.y + this.staminaTextKey.getMeasuredLineHeight();
    this.staminaTextKey.textBaseline = 'top';
    this.staminaTextKey.textAlign = 'center';
    this.staminaTextValue = new Text(
      this.model.get('stamina') + '/' + this.model.get('maxStamina'),
      '16px "PowellAntique" serif',
      'white'
    );
    this.staminaTextValue.textBaseline = 'top';
    this.staminaTextValue.textAlign = 'center';
    this.staminaTextValue.y = this.staminaTextKey.y;
    this.staminaTextValue.x = valueTextX;
    this.staminaBarRectangle = new Rectangle(
      leftRectangleWidth + barPadding,
      this.staminaTextKey.y,
      this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding,
      this.staminaTextKey.getMeasuredLineHeight()
    );
    this.staminaBarGraphics = new Graphics();
    this.staminaBarGraphics.
      beginFill('yellow').
      drawRoundRect(
        this.staminaBarRectangle.x,
        this.staminaBarRectangle.y,
        this.staminaBarRectangle.width,
        this.staminaBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.staminaBar = new Shape(this.staminaBarGraphics);
    this.staminaBar.alpha = 0.5;

    this.container.addChild(this.statusBarRectangleShape);
    this.container.addChild(this.hitPointsBar);
    this.container.addChild(this.hitPointsTextKey);
    this.container.addChild(this.hitPointsTextValue);
    this.container.addChild(this.manaBar);
    this.container.addChild(this.manaTextKey);
    this.container.addChild(this.manaTextValue);
    this.container.addChild(this.staminaBar);
    this.container.addChild(this.staminaTextKey);
    this.container.addChild(this.staminaTextValue);

    this.model.on(
      'change:hitPoints change:stamina change:mana',
      this.update
    );
  },
  onContainerPress: function(event) {
    if (event.nativeEvent.which === 1) {
      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onContainerMouseMove;
    }
  },
  onContainerMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onContainerMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
    this.container.scaleX = this.container.scaleY = 1.05;
  },
  onContainerMouseOut: function(event) {
    Werld.canvas.el.style.cursor = '';
    this.container.scaleX = this.container.scaleY = 1.0;
  },
  update: function() {
    var barPadding = 5;
    var leftRectangleWidth = this.hitPointsTextKey.x + this.hitPointsTextKey.getMeasuredWidth();

    var hitPointsPercentage = this.model.get('hitPoints') / this.model.get('maxHitPoints');
    this.hitPointsBarRectangle.width = hitPointsPercentage * (this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding);
    this.hitPointsBarGraphics.
      clear().
      beginFill('red').
      drawRoundRect(
        this.hitPointsBarRectangle.x,
        this.hitPointsBarRectangle.y,
        this.hitPointsBarRectangle.width,
        this.hitPointsBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.hitPointsTextValue.text =
      Math.floor(this.model.get('hitPoints')) + '/' + this.model.get('maxHitPoints');

    var manaPercentage = this.model.get('mana') / this.model.get('maxMana');
    this.manaBarRectangle.width = manaPercentage * (this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding);
    this.manaBarGraphics.
      clear().
      beginFill('blue').
      drawRoundRect(
        this.manaBarRectangle.x,
        this.manaBarRectangle.y,
        this.manaBarRectangle.width,
        this.manaBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.manaTextValue.text =
      Math.floor(this.model.get('mana')) + '/' + this.model.get('maxMana');

    var staminaPercentage = this.model.get('stamina') / this.model.get('maxStamina');
    this.staminaBarRectangle.width = staminaPercentage * (this.statusBarRectangle.width - leftRectangleWidth - 2 * barPadding);
    this.staminaBarGraphics.
      clear().
      beginFill('yellow').
      drawRoundRect(
        this.staminaBarRectangle.x,
        this.staminaBarRectangle.y,
        this.staminaBarRectangle.width,
        this.staminaBarRectangle.height,
        2
      ).
      endStroke().
      endFill();
    this.staminaTextValue.text =
      Math.floor(this.model.get('stamina')) + '/' + this.model.get('maxStamina');
  }
});
