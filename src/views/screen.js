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
    var screenCoordinatess = this.model.get('coordinates');

    for (var i = 0; i < this.model.get('width'); i++) {
      for (var j = 0; j < this.model.get('height'); j++) {
        var screenColumn = i + screenCoordinatess[0];
        var screenRow = j + screenCoordinatess[1];

        if (screenColumn > 0 && screenColumn < Werld.Config.WORLD_MAP_WIDTH &&
              screenRow > 0 && screenRow < Werld.Config.WORLD_MAP_HEIGHT) {
          this.mapTileViews[screenColumn][screenRow].draw([i, j]);
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
