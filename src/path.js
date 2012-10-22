Werld.Path = function(options) {
  options || (options = {});

  if (!options.tiles) {
    throw new Error('Must be initialized with the tiles');
  }

  this.tiles = options.tiles;
  this.finder = new PF.AStarFinder({ allowDiagonal: true });
  this.grid = new PF.Grid(
    this.tiles.length,
    this.tiles[0].length,
    this.tiles.map(function(row, index, matrix) {
      return(row.map(function(tile) {
        return(tile.isCurrentlyWalkable() ? 0 : 1);
      }));
    }).transpose()
  );

  var path = this;

  _(this.tiles).each(function(row, index, matrix) {
    _(row).each(function(tile) {
      tile.get('creatures').on(
        'add remove reset death resurrection',
        function(creature, creatures) {
          path.onTileCreaturesChange(tile);
        }
      );
    });
  });
};

Werld.Path.prototype = {
  onTileCreaturesChange: function(tile) {
    this.grid.setWalkableAt(
      tile.get('tilePoint')[0],
      tile.get('tilePoint')[1],
      tile.isCurrentlyWalkable()
    );
  },
  highlight: function(path, options) {
    options || (options = {});

    _(path).each(function(tilePoint) {
      this.tiles[tilePoint[0]][tilePoint[1]].highlight({
        duration: options.duration
      });
    }, this);
  },
  search: function(origin, destination) {
    if (!origin) {
      console.error('origin is undefined');
      return([]);
    }

    if (!destination) {
      console.error('destination is undefined');
      return([]);
    }

    if (!_(origin).isArray() || origin.length !== 2) {
      console.error('origin is not a tile point');
      return([]);
    }

    if (!_(destination).isArray() || destination.length !== 2) {
      console.error('destination is not a tile point');
      return([]);
    }

    return(_(this.finder.findPath(
      origin[0],
      origin[1],
      destination[0],
      destination[1],
      (this.grid = this.grid.clone())
    )).rest() || []);
  }
};
