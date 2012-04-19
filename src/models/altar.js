Werld.Models.Altar = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this);

    Werld.Utils.Interval.set(
      this,
      'characterResurrectionObserverIntervalId',
      this.characterResurrectionObserver,
      Werld.Config.ALTAR_CHARACTER_RESURRECTION_OBSERVER_INTERVAL
    );
  },
  coordinates: function() {
    return(this.get('coordinates'));
  },
  characterResurrectionObserver: function() {
    if (Werld.character.tileDistance(this) <= 1) {
      if (Werld.character.dead()) {
        Werld.character.resurrect();
      }
    }
  }
});
