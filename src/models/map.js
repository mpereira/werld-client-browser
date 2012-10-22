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
  getTileByTilePoint: function(tilePoint) {
    return(this.get('tiles')[tilePoint[0]][tilePoint[1]]);
  },
  getTileByCoordinatePoint: function(coordinates) {
    var tilePoint = Werld.Utils.Geometry.pixelPointToTilePoint(coordinates);

    return(this.getTileByTilePoint(tilePoint));
  },
  tilesAdjacentToTile: function(tile) {
    return(_([
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]).reduce(_(function(memo, tilePointOffset) {
      return(memo.concat(
        this.getTileByTilePoint([
          tile.get('tilePoint')[0] + tilePointOffset[0],
          tile.get('tilePoint')[1] + tilePointOffset[1]
        ])
      ));
    }).bind(this), []));
  },
  tilesAdjacentToCreature: function(creature) {
    return(this.tilesAdjacentToTile(creature.tile()));
  },
  tileAdjacentToTile: function(tile, direction) {
    var directions = [
      { name: 'top', offset: [0, -1] },
      { name: 'right', offset: [1, 0] },
      { name: 'bottom', offset: [0, 1] },
      { name: 'left', offset: [-1, 0] }
    ];

    if (!_(_(directions).pluck('name')).include(direction)) {
      console.error('invalid direction: ' + direction);
      return;
    }

    return(this.getTileByTilePoint([
      tile.get('tilePoint')[0] + _(directions).where({ name: direction })[0].offset[0],
      tile.get('tilePoint')[1] + _(directions).where({ name: direction })[0].offset[1]
    ]));
  }
});
