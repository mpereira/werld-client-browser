Werld.Collections.CreatureSpawners = Backbone.Collection.extend({
  activateAll: function() {
    this.each(function(creatureSpawner) {
      creatureSpawner.activate();
    });
  },
  creatures: function() {
    return(_(this.map(function(creatureSpawner) {
      return(creatureSpawner.get('creatures').models);
    })).flatten());
  }
});
