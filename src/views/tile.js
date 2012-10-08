Werld.Views.Tile = Werld.Views.Base.Container.extend({
  initialize: function() {
    this.constructor.__super__.initialize.call(this);

    _.bindAll(this);

    this.filters = {};

    if (Werld.Config.HIGHLIGHT_TILES_WHEN_CREATURES_MOVE) {
      var brightnessFilterMatrix = new CreateJS.ColorMatrix();
      brightnessFilterMatrix.adjustBrightness(50);
      this.filters.brightness = new CreateJS.ColorMatrixFilter(brightnessFilterMatrix);

      this.model.on('change:highlighted', this.onModelHighlightedChange);
    }

    this.model.on(
      'change:onScreenCoordinates', this.onModelScreenCoordinatesChange
    );

    this.bitmap =
      new CreateJS.Bitmap(Werld.canvas.textures.tiles[this.model.get('type')]);
    this.bitmap.filters || (this.bitmap.filters = []);
    this.bitmap.onPress = this.onBitmapPress;
    this.container.addChild(this.bitmap);
  },
  onBitmapPress: function(event) {
    Werld.character.pathfindToCoordinatePoint(this.model.get('coordinates'), {
      stopFollowing: true
    });
  },
  onModelScreenCoordinatesChange: function() {
    this.container.x = this.model.get('onScreenCoordinates')[0];
    this.container.y = this.model.get('onScreenCoordinates')[1];
  },
  hide: function() {
    this.container.visible = false;
  },
  unhide: function() {
    this.container.visible = true;
  },
  handleItemDrop: function(item) {
    if (Werld.character.tileDistance(this.model) <= 1) {
      item.collection.remove(item);
      this.model.items.add(item);
      return(true);
    } else {
      return(false);
    }
  },
  onModelHighlightedChange: function() {
    this.bitmap.cache(0, 0, 40, 40);

    if (this.model.isHighlighted()) {
      this.bitmap.filters.push(this.filters.brightness);
    } else {
      this.bitmap.filters = _(this.bitmap.filters).reject(function(filter) {
        return(filter === this.filters.brightness);
      }, this);
    }

    this.bitmap.updateCache();
  }
});
