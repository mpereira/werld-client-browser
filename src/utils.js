Werld.Utils = {};

Werld.Utils.Geometry = {
  tilesToPixels: function(tiles) {
    return(tiles * Werld.Config.PIXELS_PER_TILE);
  },
  pixelsToTiles: function(pixels) {
    return(Math.floor(pixels / Werld.Config.PIXELS_PER_TILE));
  },
  tilePointToPixelPoint: function(tilePoint) {
    return(_(tilePoint).map(this.tilesToPixels));
  },
  pixelPointToTilePoint: function(pixelPoint) {
    return(_(pixelPoint).map(this.tilesToPixels));
  },
  pixelDistance: function(a, b) {
    return(Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)));
  },
  tileDistance: function(a, b) {
    var _pixelDistance = this.pixelDistance(a, b);
    return((_pixelDistance - _pixelDistance % Werld.Config.PIXELS_PER_TILE) /
             Werld.Config.PIXELS_PER_TILE);
  }
};

Werld.Utils.Easel = {
  bringDisplayObjectToFront: function(displayObject) {
    displayObject.parent.sortChildren(function(a, b) {
      if (a === displayObject) {
        return(1);
      } else {
        return(0);
      }
    });
  }
};

Werld.Utils.Math = {
  randomBetween: function(range) {
    return(Math.random() * (range[1] - range[0] + 1) + range[0]);
  },
  randomIntegerBetween: function(range) {
    return(Math.floor(this.randomBetween(range)));
  }
};

Werld.Utils.Callback = {
  run: function(callback) {
    if (callback instanceof Function) {
      return(callback.apply(
        null,
        Array.prototype.slice.call(_(arguments).toArray(), 1)
      ));
    }
  }
};

Werld.Utils.Interval = {
  set: function(context, intervalIdName, callback, interval) {
    context[intervalIdName] = setInterval(callback, interval);
  },
  clear: function(context, intervalIdName) {
    clearInterval(context[intervalIdName]);
    context[intervalIdName] = null;
  }
};

Werld.Utils.Circle = function(params) {
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