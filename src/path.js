Werld.Path = function(options) {
  options || (options = {});

  if (!options.map) {
    throw new Error('Must be initialized with a map');
  }

  this.map = options.map;
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

    var mapTiles = this.map.get('tiles').map(function(row, index, map) {
      return(row.map(function(tile) {
        return(tile.walkable() ? 0 : 1);
      }));
    });

    var mapGraph = new Graph(mapTiles);

    return(astar.search(
      mapGraph.nodes,
      mapGraph.nodes[originTile[0]][originTile[1]],
      mapGraph.nodes[destinationTile[0]][destinationTile[1]],
      true,
      astar.chebyshev
    ));
  }
};
