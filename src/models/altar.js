Werld.Models.Altar = Backbone.Model.extend({
  initialize: function() {
    this.characterResurrectionObserverIntervalId = setInterval(
      _.bind(this.characterResurrectionObserver, this),
      Werld.Config.FRAME_RATE()
    );
  },
  characterResurrectionObserver: function() {
    var character = Werld.character;
    if (Werld.util.tileDistance(this.get('coordinates'), character.get('coordinates')) <= 1) {
      if (character.dead()) {
        character.resurrect();
      }
    }
  }
});
