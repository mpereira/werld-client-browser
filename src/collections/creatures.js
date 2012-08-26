Werld.Collections.Creatures = Backbone.Collection.extend({
  model: Werld.Models.Creature,
  anyAlive: function() {
    return(this.any(function(creature) {
      return(creature.alive());
    }));
  }
});
