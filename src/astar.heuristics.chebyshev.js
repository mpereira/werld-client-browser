// http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
// http://en.wikipedia.org/wiki/Chebyshev_distance

astar.chebyshev = function(a, b) {
  var diagonal = _.min([Math.abs(b.x - a.x), Math.abs(b.y - a.y)]);
  var straight = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  return(1.5 * diagonal + 1 * (straight - 2 * diagonal));
};
