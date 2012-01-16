Werld.Models.Screen = Backbone.Model.extend({
  initialize: function() {
    this.get('character').bind('change:coordinates', this.updateCoordinates, this);
  },
  updateCoordinates: function() {
    var characterCoordinates = this.get('character').get('coordinates');
    this.set({
      coordinates: [
        characterCoordinates[0] - Math.floor(this.get('width') / 2),
        characterCoordinates[1] - Math.floor(this.get('height') / 2)
      ]
    });
  }
});
