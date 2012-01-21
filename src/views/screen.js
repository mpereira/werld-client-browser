Werld.Views.Screen = Backbone.View.extend({
  initialize: function() {
    this.model.bind('change:coordinates', this.draw, this);
    this.createMapTileViews();
  },
  createMapTileViews: function() {
    var mapTiles = this.model.get('map').get('tiles');

    this.mapTileViews = [];
    for (var i = 0; i < mapTiles.length; i++) {
      this.mapTileViews[i] = [];
      for (var j = 0; j < mapTiles[i].length; j++) {
        this.mapTileViews[i][j] = new Werld.Views.Tile({
          model: mapTiles[i][j]
        });
      }
    }
  },
  draw: function() {
    var mapTiles = this.model.get('map').get('tiles');
    var screenCoordinates = this.model.get('coordinates');

    for (var i = 0; i < this.model.get('width') + 1; i++) {
      for (var j = 0; j < this.model.get('height') + 1; j++) {
        var roundedCoordinates = [
          Math.floor(screenCoordinates[0]),
          Math.floor(screenCoordinates[1])
        ];
        var screenColumn = i + roundedCoordinates[0];
        var screenRow = j + roundedCoordinates[1];
        var offset = [
          (screenCoordinates[0] - roundedCoordinates[0]) *
            Werld.Config.PIXELS_PER_TILE,
          (screenCoordinates[1] - roundedCoordinates[1]) *
            Werld.Config.PIXELS_PER_TILE
        ];

        if (screenColumn > 0 && screenColumn < Werld.Config.WORLD_MAP_WIDTH &&
              screenRow > 0 && screenRow < Werld.Config.WORLD_MAP_HEIGHT) {
          this.mapTileViews[screenColumn][screenRow].draw([i, j], offset);
        } else {
          Werld.canvas.context.fillStyle = 'black';
          Werld.canvas.context.fillRect(
            (i * Werld.Config.PIXELS_PER_TILE) - offset[0],
            (j * Werld.Config.PIXELS_PER_TILE) - offset[1],
            Werld.Config.PIXELS_PER_TILE,
            Werld.Config.PIXELS_PER_TILE
          );
        }
      }
    }
  }
});
