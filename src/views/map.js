Werld.Views.Map = function(model) {
  this.model = model;
  this.tileViews = new Array();
  var self = this;
  this.model.tiles.forEach(function(tileArray) {
    tileArray.forEach(function(tile) {
      self.tileViews.push(new Werld.Views.Tile(tile));
    });
  });
}

Werld.Views.Map.prototype = {
  draw: function() {
    this.tileViews.forEach(function(tileView) {
      tileView.draw();
    })
  }
}
