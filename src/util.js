Werld.util = {
  requestAnimationFrame: function(callback) {
    return((window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame)(callback));
  },
  tileToPixel: function(tile) {
    return(tile * Werld.Config.PIXELS_PER_TILE);
  },
  pixelToTile: function(pixel) {
    return(Math.floor(pixel / Werld.Config.PIXELS_PER_TILE));
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
