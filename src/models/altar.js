Werld.Models.Altar = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this);

    // TODO: move this logic to a 'change:coordinates' callback on each
    // character.
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
        // TODO: Improve the external resurrection interface.
        Werld.character.set('hitPoints', 1);
      }
    }
  }
});
