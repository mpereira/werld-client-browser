Werld.Views.Tile = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this)

    this.container = new Container();
    this.container.view = this;
    this.bitmap = new Bitmap(Werld.canvas.textures.tiles[this.model.get('type')]);
    this.container.addChild(this.bitmap);
  },
  update: function(coordinates, offset) {
    this.container.x = coordinates[0] - offset[0];
    this.container.y = coordinates[1] - offset[1];
  },
  hide: function() {
    this.container.visible = false;
  },
  unhide: function() {
    this.container.visible = true;
  }
});
