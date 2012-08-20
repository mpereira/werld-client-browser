Werld.Models.Map = Backbone.Model.extend({
  initialize: function() {
    var tiles = [];

    for (var i = 0; i < Werld.Config.WORLD_MAP_DIMENSIONS[0]; i++) {
      tiles[i] = [];
      for (var j = 0; j < Werld.Config.WORLD_MAP_DIMENSIONS[1]; j++) {
        var type = Math.random() > 0.75 ? 'dirt' : 'grass';
        var walkable = type === 'grass';

        tiles[i][j] = new Werld.Models.Tile({
          type: type,
          walkable: walkable,
          coordinates: _([i, j]).map(Werld.Utils.Geometry.tilesToPixels)
        });
      }
    }

    this.set({
      tiles: tiles,
      dimensions: [tiles.length, tiles[0].length]
    });
  },
  getTileByCoordinates: function(coordinates) {
    var tile = Werld.Utils.Geometry.pixelPointToTilePoint(coordinates);

    return(this.get('tiles')[tile[0]][tile[1]]);
  }
});
