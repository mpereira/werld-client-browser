Werld.Views.Screen = Backbone.View.extend({
  initialize: function() {
    this.model.bind('change:coordinates', this.draw, this);
    this.createTileViews();
  },
  createTileViews: function() {
    this.tileViews = new Array();
    var self = this;
    this.model.get('map').get('tiles').forEach(function(tileArray) {
      tileArray.forEach(function(tile) {
        self.tileViews.push(new Werld.Views.Tile({ model: tile }));
      });
    });
  },
  draw: function() {
    var mapTiles = this.model.get('map').get('tiles');
    var screenCoordinatess = this.model.get('coordinates');

    for (var i = 0; i < this.model.get('width'); i++) {
      for (var j = 0; j < this.model.get('height'); j++) {
        var screenColumn = i + screenCoordinatess[0];
        var screenRow = j + screenCoordinatess[1];

        if (screenColumn > 0 && screenColumn < Werld.Config.WORLD_MAP_WIDTH &&
              screenRow > 0 && screenRow < Werld.Config.WORLD_MAP_HEIGHT) {
          // TODO: Get tile view from the tile views already instantiated.
          (new Werld.Views.Tile({
            model: mapTiles[screenColumn][screenRow]
          })).draw([i, j]);
        } else {
          Werld.canvas.context.fillStyle = 'black';
          Werld.canvas.context.fillRect(
            i * Werld.Config.PIXELS_PER_TILE,
            j * Werld.Config.PIXELS_PER_TILE,
            Werld.Config.PIXELS_PER_TILE,
            Werld.Config.PIXELS_PER_TILE
          );
        }
      }
    }
  }
});
