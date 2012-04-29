Werld.Models.CreatureSpawner = Backbone.Model.extend({
  defaults: {
    respawnTime: Werld.Config.RESPAWN_TIME,
    corpseDecayTime: Werld.Config.CORPSE_DECAY_TIME,
    randomMovementWithinSpawnAreaTimeRange: [10000, 20000]
  },
  initialize: function() {
    _.bindAll(this);

    this.spawnAreaCircle = new Werld.Utils.Circle({
      center: this.get('tileCoordinates'),
      radius: this.get('tileRadius'),
      measurement: 'tiles'
    });

    this.creatures = new Werld.Collections.Creatures();

    var spawner = this;

    // FIXME: put this in a view?
    this.creatures.on('add', function(creature) {
      var creatureView = new Werld.Views.Creature({ model: creature });
      spawner.moveRandomlyWithinSpawnArea(creature);
      Werld.containers.creatures.addChild(creatureView.container);
    });
  },
  moveRandomlyWithinSpawnArea: function(creature) {
    var timeRange = this.get('randomMovementWithinSpawnAreaTimeRange');
    var time = Werld.Utils.Math.randomIntegerBetween(timeRange);
    var spawner = this;

    _(function() {
      creature.move(spawner.randomAdjacentTilePointWithinSpawnArea(creature));
      spawner.moveRandomlyWithinSpawnArea(creature);
    }).delay(time);
  },
  randomAdjacentTilePointWithinSpawnArea: function(creature) {
    var spawner = this;
    var adjacentTilePointsWithinSpawnArea =
      _(creature.adjacentTilePoints()).filter(function(tilePoint) {
        return(spawner.tilePointWithinSpawnArea(tilePoint));
      });

    if (adjacentTilePointsWithinSpawnArea.length > 0) {
      return(_.shuffle(adjacentTilePointsWithinSpawnArea)[0]);
    } else {
      throw new Error('fuu');
    }
  },
  tilePointWithinSpawnArea: function(tilePoint) {
    return(this.spawnAreaCircle.tilePointWithinArea(tilePoint));
  },
  randomTilePointWithinSpawnArea: function() {
    return(this.spawnAreaCircle.randomTilePoint());
  },
  addCreature: function() {
    var creature = new Werld.Models.Creature(_({
      coordinates: Werld.Utils.Geometry.tilePointToPixelPoint(
        this.randomTilePointWithinSpawnArea()
      )
    }).extend(this.get('creature')));

    creature.on('change:status', this.onCreatureStatusChange);
    creature.on('destroy', this.onCreatureDestroy);
    this.creatures.add(creature);
  },
  activate: function() {
    for (var i = 0; i < this.get('numberOfCreatures'); i++) {
      this.addCreature();
    }
  },
  onCreatureStatusChange: function(creature) {
    if (creature.dead()) {
      _(creature.destroy).delay(this.get('corpseDecayTime'));
      _(this.addCreature).delay(this.get('respawnTime'));
    }
  },
  onCreatureDestroy: function(creature) {
    this.creatures.remove(creature);
  }
});
