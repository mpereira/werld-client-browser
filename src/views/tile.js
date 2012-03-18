Werld.Views.Tile = Werld.Views.Base.Container.extend({
  initialize: function() {
    Werld.Views.LootContainer.__super__.initialize.call(this);

    _.bindAll(this)

    this.model.bind('change', this.onModelChange);

    this.bitmap =
      new Bitmap(Werld.canvas.textures.tiles[this.model.get('type')]);
    this.bitmap.onPress = this.onBitmapPress;
    this.container.addChild(this.bitmap);
  },
  onBitmapPress: function(event) {
    Werld.character.move(_(this.model.get('coordinates')).map(function(pixels) {
      return(Werld.util.pixelToTile(pixels));
    }));
  },
  onModelChange: function(event) {
    this.container.x =
      this.model.get('coordinates')[0] - this.model.get('offset')[0];
    this.container.y =
      this.model.get('coordinates')[1] - this.model.get('offset')[1];
  },
  hide: function() {
    this.container.visible = false;
  },
  unhide: function() {
    this.container.visible = true;
  }
});
