Werld.Views.Map = Backbone.View.extend({
  initialize: function() {
    this.character = this.options.character;
    this.character.bind('move', this.draw, this);
    this.createTileViews();
  },
  createTileViews: function() {
    this.tileViews = new Array();
    var self = this;
    this.model.get('tiles').forEach(function(tileArray) {
      tileArray.forEach(function(tile) {
        self.tileViews.push(new Werld.Views.Tile(tile));
      });
    });
  },
  draw: function() {
    this.tileViews.forEach(function(tileView) {
      tileView.draw();
    })
  }
});
