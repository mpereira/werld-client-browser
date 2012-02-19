Werld.Collections.CreatureSpawners = Backbone.Collection.extend({
  activateAll: function() {
    this.each(function(creatureSpawner) {
      creatureSpawner.activate();
    });
  }
});
