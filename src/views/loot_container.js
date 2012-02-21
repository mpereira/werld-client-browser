Werld.Views.LootContainer = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    this.bitmap = new Bitmap(Werld.IMAGES.LOOT_CONTAINER.IMAGE.SRC);
    this.character = this.options.character;

    _.bindAll(
      this,
      'onCharacterCoordinatesChange',
      'onContainerMouseMove',
      'onContainerMouseOut',
      'onContainerMouseOver',
      'onContainerPress'
    );

    this.container.onMouseOut = this.onContainerMouseOut;
    this.container.onMouseOver = this.onContainerMouseOver;
    this.container.onPress = this.onContainerPress;

    this.hide();
    this.container.alpha = 0.8;
    this.container.addChild(this.bitmap);
  },
  onContainerPress: function(event) {
    if (event.nativeEvent.which === 1) {
      Werld.util.bringToFront(this.container);

      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onContainerMouseMove;
    } else if (event.nativeEvent.which === 3) {
      this.container.visible = false;
    }
  },
  onContainerMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onContainerMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
  },
  onContainerMouseOut: function() {
    Werld.canvas.el.style.cursor = '';
  },
  onCharacterCoordinatesChange: function() {
    if (this.character.tileDistance(this.model) >= 2) {
      this.character.unbind('change:coordinates', this.onCharacterCoordinatesChange);
      this.hide();
    }
  },
  hide: function() {
    this.container.visible = false;
  },
  show: function() {
    var modelCoordinates = this.model.get('coordinates');
    var screenCoordinates = this.container.parent.screen.get('coordinates');

    this.container.x = modelCoordinates[0] - screenCoordinates[0];
    this.container.y = modelCoordinates[1] - screenCoordinates[1];
    this.container.visible = true;

    this.character.bind('change:coordinates', this.onCharacterCoordinatesChange);
  }
});
