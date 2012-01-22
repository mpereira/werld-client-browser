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
  }
};

Werld.Util.Queue = function() {
  this.elements = [];
};

Werld.Util.Queue.prototype = {
  enqueue: function(element) {
    this.elements.unshift(element);
  },
  dequeue: function() {
    this.elements.pop();
  },
  forEach: function(lambda) {
    this.elements.forEach(lambda);
  },
  reduceRight: function(lambda) {
    this.elements.reduceRight(lambda);
  },
  size: function() {
    return(this.elements.length);
  }
};
