Werld.util = {
  requestAnimationFrame: function(callback) {
    return((window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame)(callback));
  }
};
