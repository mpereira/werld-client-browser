Werld.Models.CreatureSpawner = Backbone.Model.extend({
  defaults: {
    respawnTime: Werld.Config.RESPAWN_TIME,
    corpseDecayTime: Werld.Config.CORPSE_DECAY_TIME
  },
  initialize: function() {
    this.creatures = new Werld.Collections.Creatures();

    /* FIXME: put this in a view? */
    this.creatures.bind('add', function(creature) {
      var creatureView = new Werld.Views.Creature({ model: creature });
      Werld.canvas.stage.addChild(creatureView.container);
    });
  },
  addCreature: function() {
    var creature = new Werld.Models.Creature(_({
      coordinates: (new Werld.Util.Circle({
        center: Werld.util.tilePointToPixelPoint(this.get('coordinates')),
        radius: Werld.util.tileToPixel(this.get('radius'))
      })).randomTile()
    }).extend(this.get('creature')));
    creature.bind('change:status', this.onCreatureStatusChange, this);
    creature.bind('destroy', this.onCreatureDestroy, this);
    this.creatures.add(creature);
  },
  activate: function() {
    for (var i = 0; i < this.get('numberOfCreatures'); i++) {
      this.addCreature();
    }
  },
  onCreatureStatusChange: function(creature) {
    if (creature.dead()) {
      _(_(creature.destroy).bind(creature)).delay(this.get('corpseDecayTime'));
      _(_(this.addCreature).bind(this)).delay(this.get('respawnTime'));
    }
  },
  onCreatureDestroy: function(creature) {
    this.creatures.remove(creature);
  }
});
