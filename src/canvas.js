Werld.Canvas = Backbone.View.extend({
  el: 'canvas',
  initialize: function() {
    this.context = this.el.getContext('2d');
    this.loadTextures();
  },
  /* TODO: better async resource loading. */
  loadTextures: function(callback) {
    this.textures = {};
    this.textures.tiles = {};
    this.textures.tiles.grass = 'images/textures/tiles/grass.jpg';
    this.textures.tiles.dirt = 'images/textures/tiles/dirt.jpg';
  }
});
