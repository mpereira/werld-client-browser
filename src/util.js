Werld.util = {
  tileToPixel: function(tile) {
    return(tile * Werld.Config.PIXELS_PER_TILE);
  },
  pixelToTile: function(pixel) {
    return(Math.floor(pixel / Werld.Config.PIXELS_PER_TILE));
  },
  tilePointToPixelPoint: function(tilePoint) {
    return(_(tilePoint).map(Werld.util.tileToPixel));
  },
  pixelPointToTilePoint: function(pixelPoint) {
    return(_(pixelPoint).map(Werld.util.pixelToTile));
  },
  pixelDistance: function(a, b) {
    return(Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)));
  },
  tileDistance: function(a, b) {
    var _pixelDistance = this.pixelDistance(a, b);
    return((_pixelDistance - _pixelDistance % Werld.Config.PIXELS_PER_TILE) /
             Werld.Config.PIXELS_PER_TILE);
  },
  capitalizeFirstLetter: function(string) {
    return(string.charAt(0).toUpperCase() + string.slice(1));
  },
  bringToFront: function(container) {
    container.parent.sortChildren(function(a, b) {
      if (a === container) {
        return(1);
      } else {
        return(0);
      }
    });
  }
};

Werld.Util = {};

Werld.Util.Circle = function(params) {
  this.center = params.center;
  this.radius = params.radius;

  this.randomTile = function() {
    var randomAngle = Math.random() * 2 * Math.PI;
    var randomRadius = Math.random() * this.radius;
    var rawCoordinates = [
      this.center[0] + randomRadius * Math.cos(randomAngle),
      this.center[1] + randomRadius * Math.sin(randomAngle)
    ];

    return(_(rawCoordinates).map(function(coordinate) {
      return(coordinate - (coordinate % Werld.Config.PIXELS_PER_TILE));
    }));
  };
};
