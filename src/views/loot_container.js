Werld.Views.LootContainer = Werld.Views.Base.Container.extend({
  initialize: function() {
    Werld.Views.LootContainer.__super__.initialize.call(this);

    _.bindAll(this);

    this.character = this.options.character;

    this.model.owner.on('destroy', this.removeContainerFromGumpsContainer);

    this.bitmap = new Bitmap(Werld.IMAGES.LOOT_CONTAINER.IMAGE.SRC);
    this.bitmap.onPress = this.onBitmapPress;
    this.container.addChildAt(this.bitmap, 0);
    Werld.containers.gumps.addChild(this.container);

    this.hide();
  },
  removeContainerFromGumpsContainer: function(event) {
    Werld.containers.gumps.removeChild(this.container);
  },
  onBitmapPress: function(event) {
    if (event.nativeEvent.which === 1) {
      Werld.util.bringToFront(this.container);

      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onBitmapMouseMove;
    } else if (event.nativeEvent.which === 3) {
      this.hide();
    }
  },
  onBitmapMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onCharacterCoordinatesChange: function() {
    if (this.character.tileDistance(this.model.owner) >= 2) {
      this.character.unbind(
        'change:coordinates',
        this.onCharacterCoordinatesChange
      );
      this.hide();
    }
  },
  hide: function() {
    this.container.visible = false;
  },
  hidden: function() {
    return(!this.container.visible);
  },
  show: function() {
    if (!this.hidden()) return;

    var ownerCoordinates = this.model.owner.get('coordinates');
    var screenCoordinates = this.container.parent.screen.get('coordinates');

    this.container.x = ownerCoordinates[0] - screenCoordinates[0];
    this.container.y = ownerCoordinates[1] - screenCoordinates[1];
    this.container.visible = true;
    Werld.util.bringToFront(this.container);

    this.character.bind('change:coordinates', this.onCharacterCoordinatesChange);
  }
});
