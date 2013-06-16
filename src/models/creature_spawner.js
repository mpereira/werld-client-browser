Werld.Models.CreatureSpawner = Backbone.Model.extend({
  defaults: {
    respawnTime: Werld.Config.RESPAWN_TIME,
    corpseDecayTime: Werld.Config.CORPSE_DECAY_TIME,
    randomMovementWithinSpawnAreaTimeRange: [5000, 10000]
  },
  initialize: function() {
    _.bindAll(this);

    this.spawnAreaCircle = new Werld.Utils.Circle({
      center: this.get('tileCoordinates'),
      radius: this.get('tileRadius'),
      measurement: 'tiles'
    });

    this.has('creatures') || this.set('creatures', new Werld.Collections.Creatures());

    this.get('creatures').on('add', this.createCreatureView);
    this.get('creatures').on('add', this.spawnAreaMovementHandler);
    this.get('creatures').on('reset', this.addCreaturesToGameCreatures);
    this.get('creatures').on('add', this.addCreatureToGameCreatures);
    this.get('creatures').on('remove', this.removeCreatureFromGameCreatures);
  },
  createCreatureView: function(creature) {
    var creatureView = new Werld.Views.Creature({
      model: creature,
      image: Werld.IMAGES[creature.get('name')]
    });

    Werld.containers.creatures.addChild(creatureView.container);
  },
  spawnAreaMovementHandler: function(creature) {
    var timeRange = this.get('randomMovementWithinSpawnAreaTimeRange');
    var time = Werld.Utils.Math.randomIntegerBetween(timeRange);
    var spawner = this;

    _(function() {
      // Stop recursing if creature is dead.
      if (creature.dead()) {
        return;
      }

      if (creature.state() === creature.states.idle) {
        var randomWalkableAdjacentTilePointWithinSpawnArea =
          spawner.randomWalkableAdjacentTilePointWithinSpawnArea(creature);

        // This means the creature is either inside the spawn area or at least
        // tangential to the spawn area's bounds.
        if (randomWalkableAdjacentTilePointWithinSpawnArea) {
          creature.pathfindToTilePoint(
            randomWalkableAdjacentTilePointWithinSpawnArea
          );
        } else {
          creature.pathfindToTilePoint(
            spawner.walkableAdjacentTilePointCloserToSpawnArea(creature)
          );
        }
      }

      spawner.spawnAreaMovementHandler(creature);
    }).delay(time);
  },
  walkableAdjacentTilePointCloserToSpawnArea: function(creature) {
    var spawner = this;

    return(_(creature.walkableAdjacentTilePoints()).sortBy(function(tilePoint) {
      return(Werld.Utils.Geometry.tileDistance(
        Werld.Utils.Geometry.pixelPointToTilePoint(
          spawner.spawnAreaCircle.center
        ),
        tilePoint
      ));
    })[0]);
  },
  randomWalkableAdjacentTilePointWithinSpawnArea: function(creature) {
    var spawner = this;
    var walkableAdjacentTilePointsWithinSpawnArea =
      _(creature.walkableAdjacentTilePoints()).filter(function(tilePoint) {
        return(spawner.tilePointWithinSpawnArea(tilePoint));
      });

    return(_.shuffle(walkableAdjacentTilePointsWithinSpawnArea)[0]);
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

    creature.on('death', this.scheduleCreatureDestroy);
    creature.on('death', this.scheduleAddCreature);
    creature.on('destroy', this.onCreatureDestroy);

    this.get('creatures').add(creature);
  },
  activate: function() {
    for (var i = 0; i < this.get('numberOfCreatures'); i++) {
      this.addCreature();
    }
  },
  scheduleCreatureDestroy: function(creature) {
    _(_(creature.destroy).bind(creature)).delay(this.get('corpseDecayTime'));
  },
  scheduleAddCreature: function(creature) {
    _(this.addCreature).delay(this.get('respawnTime'));
  },
  onCreatureDestroy: function(creature) {
    this.get('creatures').remove(creature);
  },
  addCreatureToGameCreatures: function(creature) {
    Werld.game.get('creatures').add(creature);
  },
  addCreaturesToGameCreatures: function(collection) {
    collection.each(this.addCreatureToGameCreatures);
  },
  removeCreatureFromGameCreatures: function(creature) {
    Werld.game.get('creatures').remove(creature);
  }
});
