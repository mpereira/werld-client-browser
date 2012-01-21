Werld.Views.Tile = Backbone.View.extend({
  draw: function(coordinates, offset) {
    Werld.canvas.context.drawImage(
      Werld.canvas.textures.tiles[this.model.get('type')],
      (coordinates[0] * Werld.Config.PIXELS_PER_TILE) - offset[0],
      (coordinates[1] * Werld.Config.PIXELS_PER_TILE) - offset[1],
      Werld.Config.PIXELS_PER_TILE,
      Werld.Config.PIXELS_PER_TILE
    );
  }
});
