Werld.Models.Game = Backbone.Model.extend({
  charactersWithinArea: function(area) {
    if (area instanceof Werld.Utils.Circle) {
      return(this.charactersWithinCircle(area));
    } else {
      throw new Error('Area type unknown');
    }
  },
  charactersWithinCircle: function(circle) {
    return(_(this.get('characters')).filter(function(character) {
      return(circle.tilePointWithinArea(character.tileCoordinates()));
    }));
  }
});
