Werld.Models.Map = Backbone.Model.extend({
  initialize: function() {
    var tiles = [];

    for (var i = 0; i < Werld.Config.WORLD_MAP_DIMENSIONS[0]; i++) {
      tiles[i] = [];
      for (var j = 0; j < Werld.Config.WORLD_MAP_DIMENSIONS[1]; j++) {
        tiles[i][j] = new Werld.Models.Tile({
          type: (Math.random() > 0.75 ? 'dirt' : 'grass'),
          coordinates: _([i, j]).map(Werld.Utils.Geometry.tilesToPixels)
        });
      }
    }

    this.set({
      tiles: tiles,
      dimensions: [tiles.length, tiles[0].length]
    });
  }
});
