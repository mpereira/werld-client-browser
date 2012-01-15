Werld.util = {
  requestAnimationFrame: function(callback) {
    return((window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame)(callback));
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
