Werld.Utils = {};

Werld.Utils.Geometry = {
  tilesToPixels: function(tiles) {
    return(tiles * Werld.Config.PIXELS_PER_TILE);
  },
  pixelsToTiles: function(pixels) {
    return(Math.floor(pixels / Werld.Config.PIXELS_PER_TILE));
  },
  tilePointToPixelPoint: function(tilePoint) {
    return(_(tilePoint).map(Werld.Utils.Geometry.tilesToPixels));
  },
  pixelPointToTilePoint: function(pixelPoint) {
    return(_(pixelPoint).map(Werld.Utils.Geometry.pixelsToTiles));
  },
  pixelDistance: function(a, b) {
    return(Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)));
  },
  tileDistance: function(a, b) {
    return(Werld.Utils.Geometry.pixelsToTiles(Werld.Utils.Geometry.pixelDistance(
      Werld.Utils.Geometry.tilePointToPixelPoint(a),
      Werld.Utils.Geometry.tilePointToPixelPoint(b)
    )));
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
    return(Math.floor(Werld.Utils.Math.randomBetween(range)));
  },
  toDecimal: function(number, digits) {
    return(Number(number.toFixed(digits)));
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
  _intervalIdName: function(callbackName) {
    return(callbackName + 'IntervalId');
  },
  isInstalled: function(callbackName, context) {
    return(!!context[Werld.Utils.Interval._intervalIdName(callbackName)]);
  },
  set: function(context, intervalIdName, callback, interval) {
    context[intervalIdName] = setInterval(_(callback).bind(context), interval);
  },
  clear: function(context, intervalIdName) {
    clearInterval(context[intervalIdName]);
    context[intervalIdName] = null;
  },
  install: function(intervalFunctionNamesWithIntervals, context) {
    _.chain(intervalFunctionNamesWithIntervals).keys().each(function(key) {
      Werld.Utils.Interval.set(
        context,
        Werld.Utils.Interval._intervalIdName(key),
        _(context[key]).bind(context),
        intervalFunctionNamesWithIntervals[key]
      );
    });
  },
  uninstall: function(intervalFunctionNames, context) {
    _(_.flatten([intervalFunctionNames])).each(function(key) {
      Werld.Utils.Interval.clear(context, Werld.Utils.Interval._intervalIdName(key));
    });
  }
};

Werld.Utils.Circle = function(params) {
  if (!params.center || !params.radius) {
    throw new Error('Circle must be initialized with a center point and a radius');
  }

  params.measurement || (params.measurement = 'pixels');

  if (params.measurement === 'pixels') {
    this.center = params.center;
    this.radius = params.radius;
  } else if (params.measurement === 'tiles') {
    this.center = Werld.Utils.Geometry.tilePointToPixelPoint(params.center);
    this.radius = Werld.Utils.Geometry.tilesToPixels(params.radius);
  } else {
    throw new Error('Unknown measurement ' + this.measurement + ' for Circle');
  }

  this.pixelPointWithinArea = _(function(pixelPoint) {
    return(
      Werld.Utils.Geometry.pixelDistance(this.center, pixelPoint) <= this.radius
    );
  }).bind(this);

  this.tilePointWithinArea = _(function(tilePoint) {
    return(
      this.pixelPointWithinArea(
        Werld.Utils.Geometry.tilePointToPixelPoint(tilePoint)
      )
    );
  }).bind(this);

  this.randomPixelPoint = _(function() {
    var randomAngle = Math.random() * 2 * Math.PI;
    var randomRadius = Math.random() * this.radius;

    return([
      this.center[0] + randomRadius * Math.cos(randomAngle),
      this.center[1] + randomRadius * Math.sin(randomAngle)
    ]);
  }).bind(this);

  this.randomTilePoint = _(function() {
    var randomPixelPoint = this.randomPixelPoint();

    return(_(randomPixelPoint).map(function(pixels) {
      return(Werld.Utils.Geometry.pixelsToTiles(
        pixels - (pixels % Werld.Config.PIXELS_PER_TILE)
      ));
    }));
  }).bind(this);
};
