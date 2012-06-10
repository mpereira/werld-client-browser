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

    // FIXME: jesus christ, please refactor this mess.
    this.statusBarRectangle = new Rectangle(0, 0, 250, 75);
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

    this.statsRectangle = new Rectangle(0, 0, 100, 75);
    this.hitPointsStaminaManaRectangle = new Rectangle(100, 0, 150, 75);

    this.strengthTextKey = new Text('STR', '16px "PowellAntique" serif', 'white');
    this.strengthTextKey.x = this.statsRectangle.x + 25;
    var leftRectangleWidth = this.strengthTextKey.x + this.strengthTextKey.getMeasuredWidth();
    var valueTextX = leftRectangleWidth;

    this.strengthTextKey.y = 5;
    this.strengthTextKey.textBaseline = 'top';
    this.strengthTextKey.textAlign = 'center';

    this.strengthTextValue =
      new Text(this.model.get('stats').strength, '16px "PowellAntique" serif', 'white');
    this.strengthTextValue.textBaseline = 'top';
    this.strengthTextValue.textAlign = 'center';
    this.strengthTextValue.y = this.strengthTextKey.y;
    this.strengthTextValue.x = valueTextX;

    this.container.addChild(this.strengthTextKey);
    this.container.addChild(this.strengthTextValue);

    this.dexterityTextKey = new Text('DEX', '16px "PowellAntique" serif', 'white');
    this.dexterityTextKey.x = this.statsRectangle.x + 25;
    var leftRectangleWidth = this.dexterityTextKey.x + this.dexterityTextKey.getMeasuredWidth();
    var valueTextX = leftRectangleWidth;

    this.dexterityTextKey.y = this.strengthTextKey.y + this.strengthTextKey.getMeasuredLineHeight();
    this.dexterityTextKey.textBaseline = 'top';
    this.dexterityTextKey.textAlign = 'center';

    this.dexterityTextValue =
      new Text(this.model.get('stats').dexterity, '16px "PowellAntique" serif', 'white');
    this.dexterityTextValue.textBaseline = 'top';
    this.dexterityTextValue.textAlign = 'center';
    this.dexterityTextValue.y = this.dexterityTextKey.y;
    this.dexterityTextValue.x = valueTextX;

    this.container.addChild(this.dexterityTextKey);
    this.container.addChild(this.dexterityTextValue);

    this.intelligenceTextKey = new Text('INT', '16px "PowellAntique" serif', 'white');
    this.intelligenceTextKey.x = this.statsRectangle.x + 25;
    var leftRectangleWidth = this.intelligenceTextKey.x + this.intelligenceTextKey.getMeasuredWidth();
    var valueTextX = leftRectangleWidth;

    this.intelligenceTextKey.y = this.dexterityTextKey.y + this.dexterityTextKey.getMeasuredLineHeight();
    this.intelligenceTextKey.textBaseline = 'top';
    this.intelligenceTextKey.textAlign = 'center';

    this.intelligenceTextValue =
      new Text(this.model.get('stats').intelligence, '16px "PowellAntique" serif', 'white');
    this.intelligenceTextValue.textBaseline = 'top';
    this.intelligenceTextValue.textAlign = 'center';
    this.intelligenceTextValue.y = this.intelligenceTextKey.y;
    this.intelligenceTextValue.x = valueTextX;

    this.container.addChild(this.intelligenceTextKey);
    this.container.addChild(this.intelligenceTextValue);


    this.hitPointsTextKey = new Text('H', '16px "PowellAntique" serif', 'white');
    this.hitPointsTextKey.x = this.hitPointsStaminaManaRectangle.x + 15;
    leftRectangleWidth = this.hitPointsTextKey.x + this.hitPointsTextKey.getMeasuredWidth();
    valueTextX = leftRectangleWidth + (this.statusBarRectangle.width - leftRectangleWidth) / 2;

    this.hitPointsTextKey.y = 5;
    this.hitPointsTextKey.textBaseline = 'top';
    this.hitPointsTextKey.textAlign = 'center';
    this.hitPointsTextValue = new Text(
      this.model.get('hitPoints') + '/' + this.model.maxHitPoints(),
      '16px "PowellAntique" serif',
      'white'
    );
    this.hitPointsTextValue.textBaseline = 'top';
    this.hitPointsTextValue.textAlign = 'center';
    this.hitPointsTextValue.y = this.hitPointsTextKey.y;
    this.hitPointsTextValue.x = valueTextX;
    var hitPointsPercentage = this.model.maxHitPoints() / this.model.get('hitPoints');
    var barPadding = 5;
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

    this.staminaTextKey = new Text('S', '16px "PowellAntique" serif', 'white');
    this.staminaTextKey.x = this.hitPointsTextKey.x;
    this.staminaTextKey.y = this.hitPointsTextKey.y + this.staminaTextKey.getMeasuredLineHeight();
    this.staminaTextKey.textBaseline = 'top';
    this.staminaTextKey.textAlign = 'center';
    this.staminaTextValue = new Text(
      this.model.get('stamina') + '/' + this.model.maxStamina(),
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

    this.manaTextKey = new Text('M', '16px "PowellAntique" serif', 'white');
    this.manaTextKey.x = this.staminaTextKey.x;
    this.manaTextKey.y = this.staminaTextKey.y + this.manaTextKey.getMeasuredLineHeight();
    this.manaTextKey.textBaseline = 'top';
    this.manaTextKey.textAlign = 'center';
    this.manaTextValue = new Text(
      this.model.get('mana') + '/' + this.model.maxMana(),
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

    this.container.addChild(this.statusBarRectangleShape);
    this.container.addChild(this.hitPointsBar);
    this.container.addChild(this.hitPointsTextKey);
    this.container.addChild(this.hitPointsTextValue);
    this.container.addChild(this.staminaBar);
    this.container.addChild(this.staminaTextKey);
    this.container.addChild(this.staminaTextValue);
    this.container.addChild(this.manaBar);
    this.container.addChild(this.manaTextKey);
    this.container.addChild(this.manaTextValue);

    this.model.on('change:stats', this.updateStats);
    this.model.on('change:hitPoints change:stamina change:mana', this.update);
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
  updateStats: function() {
    this.strengthTextValue.text = this.model.get('stats').strength;
    this.dexterityTextValue.text = this.model.get('stats').dexterity;
    this.intelligenceTextValue.text = this.model.get('stats').intelligence;
  },
  update: function() {
    var barPadding = 5;
    var leftRectangleWidth = this.hitPointsTextKey.x + this.hitPointsTextKey.getMeasuredWidth();

    var hitPointsPercentage = this.model.get('hitPoints') / this.model.maxHitPoints();
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
      Math.floor(this.model.get('hitPoints')) + '/' + this.model.maxHitPoints();

    var manaPercentage = this.model.get('mana') / this.model.maxMana();
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
      Math.floor(this.model.get('mana')) + '/' + this.model.maxMana();

    var staminaPercentage = this.model.get('stamina') / this.model.maxStamina();
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
      Math.floor(this.model.get('stamina')) + '/' + this.model.maxStamina();
  }
});
