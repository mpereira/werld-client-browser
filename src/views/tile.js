Werld.Views.Tile = function(model) {
  this.model = model;
}

Werld.Views.Tile.prototype = {
  draw: function() {
    Werld.canvas.context.drawImage(Werld.canvas.textures.tiles[this.model.type],
                                   this.model.coordinates[0],
                                   this.model.coordinates[1],
                                   40,
                                   40);
  }
}
