Werld.Models.Screen = Backbone.Model.extend({
  initialize: function() {
    this.get('character').bind('change:coordinates', this.updateCoordinates, this);
  },
  updateCoordinates: function() {
    var characterCoordinates = this.get('character').get('coordinates');
    var dimensions = this.get('dimensions');

    this.set({
      coordinates: [
        characterCoordinates[0] -
          Werld.Utils.Geometry.tilesToPixels(Math.floor(dimensions[0] / 2)),
        characterCoordinates[1] -
          Werld.Utils.Geometry.tilesToPixels(Math.floor(dimensions[1] / 2))
      ]
    });
  },
  objectCoordinates: function(object) {
    return([
      object.get('coordinates')[0] - this.get('coordinates')[0],
      object.get('coordinates')[1] - this.get('coordinates')[1]
    ]);
  }
});
