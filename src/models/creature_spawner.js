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

    this.creatures = new Werld.Collections.Creatures();

    var spawner = this;

    // FIXME: put this in a view?
    this.creatures.on('add', function(creature) {
      var creatureView = new Werld.Views.Creature({
        model: creature,
        image: Werld.IMAGES[creature.get('name')]
      });
      Werld.containers.creatures.addChild(creatureView.container);
    });

    this.creatures.on('add', function(creature) {
      spawner.spawnAreaMovementHandler(creature);
    });
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
        var randomWalkableAdjacentTileCoordinatePointWithinSpawnArea =
          spawner.randomWalkableAdjacentTileCoordinatePointWithinSpawnArea(creature);

        // This means the creature is either inside the spawn area or at least
        // tangential to the spawn area's bounds.
        if (randomWalkableAdjacentTileCoordinatePointWithinSpawnArea) {
          creature.moveToCoordinatePoint(
            randomWalkableAdjacentTileCoordinatePointWithinSpawnArea
          );
        } else {
          creature.moveToCoordinatePoint(
            spawner.walkableAdjacentTileCoordinatePointCloserToSpawnArea(creature)
          );
        }
      }

      spawner.spawnAreaMovementHandler(creature);
    }).delay(time);
  },
  walkableAdjacentTileCoordinatePointCloserToSpawnArea: function(creature) {
    var spawner = this;

    return(_(creature.walkableAdjacentTileCoordinatePoints()).sortBy(function(tilePoint) {
      return(Werld.Utils.Geometry.tileDistance(
        Werld.Utils.Geometry.pixelPointToTilePoint(
          spawner.spawnAreaCircle.center
        ),
        tilePoint
      ));
    })[0]);
  },
  randomWalkableAdjacentTileCoordinatePointWithinSpawnArea: function(creature) {
    var spawner = this;
    var walkableAdjacentTilePointsWithinSpawnArea =
      _(creature.walkableAdjacentTileCoordinatePoints()).filter(function(coordinatePoint) {
        return(spawner.tileCoordinatePointWithinSpawnArea(coordinatePoint));
      });

    return(_.shuffle(walkableAdjacentTilePointsWithinSpawnArea)[0]);
  },
  tileCoordinatePointWithinSpawnArea: function(tileCoordinatePoint) {
    return(this.spawnAreaCircle.pixelPointWithinArea(tileCoordinatePoint));
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
    this.creatures.add(creature);
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
    this.creatures.remove(creature);
  }
});
