Werld.Views.Layer = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.options.character.on(
      'change:coordinates', this.onCharacterChangeCoordinates
    );
  },
  onCharacterChangeCoordinates: function(character, value, options) {
    var characterCoordinatesDifference = [
      character.get('coordinates')[0] - character.previous('coordinates')[0],
      character.get('coordinates')[1] - character.previous('coordinates')[1]
    ];

    this.model.x -= characterCoordinatesDifference[0];
    this.model.y -= characterCoordinatesDifference[1];
  },
  show: function(text, options) {
    options || (options = {});

    text.x =
      options.above.get('coordinates')[0] - Werld.Config.PIXELS_PER_TILE / 2;
    text.y =
     options.above.get('coordinates')[1] - text.getMeasuredLineHeight();

    CreateJS.Tween.get(text)
      .to({
        alpha: 0.9,
        y: text.y - text.getMeasuredLineHeight()
      }, 1000, CreateJS.Ease.getPowOut(5))
      .to({ alpha: 0 }, 300, CreateJS.Ease.linear)
      .call(function() {
        this.model.removeChild(text);
      }, null, this);

    this.model.addChild(text);
  }
});
