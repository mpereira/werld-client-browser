Werld.Path = function(options) {
  options || (options = {});

  if (!options.map) {
    throw new Error('Must be initialized with a map');
  }

  this.map = options.map;

  this.mapTiles = this.map.get('tiles').map(function(row, index, map) {
    return(row.map(function(tile) {
      return(tile.get('walkable') ? 0 : 1);
    }));
  });

  this.mapGraph = new Graph(this.mapTiles);

  var path = this;

  _(this.map.get('tiles')).each(function(row, index, map) {
    _(row).each(function(tile) {
      tile.get('creatures').on('add remove reset', function(creature, creatures) {
        var tilePoint =
          Werld.Utils.Geometry.pixelPointToTilePoint(tile.get('coordinates'));

        path.mapTiles[tilePoint[0]][tilePoint[1]] =
          tile.isCurrentlyWalkable() ? 0 : 1;

        path.mapGraph = new Graph(path.mapTiles);
      });
    });
  });
};

Werld.Path.prototype = {
  search: function(origin, destination) {
    var originTile;
    var destinationTile;

    if (origin instanceof Backbone.Model) {
      originTile =
        _(origin.get('coordinates')).map(Werld.Utils.Geometry.pixelsToTiles);
    } else {
      originTile = origin;
    }

    if (destination instanceof Backbone.Model) {
      destinationTile =
        _(destination.get('coordinates')).map(Werld.Utils.Geometry.pixelsToTiles);
    } else {
      destinationTile = destination;
    }

    return(astar.search(
      this.mapGraph.nodes,
      this.mapGraph.nodes[originTile[0]][originTile[1]],
      this.mapGraph.nodes[destinationTile[0]][destinationTile[1]],
      true,
      astar.chebyshev
    ));
  }
};
