Werld.Models.Character = Backbone.Model.extend({
  defaults: {
    lastAttackAt: Number.NEGATIVE_INFINITY
  },
  initialize: function() {
    this.messages = new Werld.Util.Queue();
    var coordinates = _.clone(this.get('coordinates'));
    this.set({ fixedCoordinates: coordinates, destination: coordinates });
    $(this.messages).bind('add', _.bind(this.messagesSweeper, this));
    this.messagesSweeperIntervalId = setInterval(
      _.bind(this.messagesSweeper, this),
      Werld.Config.CHARACTER_MESSAGE_SWEEPER_POLLING_INTERVAL
    );
    this.movementHandlerIntervalId = setInterval(
      _.bind(this.movementHandler, this), Werld.Config.FRAME_RATE()
    );
    this.attackHandlerIntervalId = setInterval(
      _.bind(this.attackHandler, this), Werld.Config.FRAME_RATE()
    );
  },
  say: function(message) {
    var now = new Date();
    this.messages.enqueue({ content: message, created_at: now.getTime() });
    $(this.messages).trigger('add');
  },
  moveTo: function(screenDestinationCoordinates) {
    var fixedCoordinates = this.get('fixedCoordinates');
    var coordinates = this.get('coordinates');

    var screenDestinationTile = [
      Werld.util.pixelToTile(screenDestinationCoordinates[0]),
      Werld.util.pixelToTile(screenDestinationCoordinates[1])
    ];

    var tileOffset = [
      screenDestinationTile[0] - Werld.util.pixelToTile(fixedCoordinates[0]),
      screenDestinationTile[1] - Werld.util.pixelToTile(fixedCoordinates[1])
    ];

    var mapDestinationTile = [
      Werld.util.pixelToTile(coordinates[0]) + tileOffset[0],
      Werld.util.pixelToTile(coordinates[1]) + tileOffset[1]
    ];

    if (mapDestinationTile[0] < 0) {
      mapDestinationTile[0] = 0;
    } else if (mapDestinationTile[0] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      mapDestinationTile[0] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    if (mapDestinationTile[1] < 0) {
      mapDestinationTile[1] = 0;
    } else if (mapDestinationTile[1] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      mapDestinationTile[1] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    this.set({
      destination: _(mapDestinationTile).map(function(column) {
        return(Werld.util.tileToPixel(column));
      })
    });
  },
  movementHandler: function() {
    var coordinates = this.get('coordinates');
    var destination = this.get('destination');

    if (coordinates[0] > destination[0]) {
      coordinates[0] -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (coordinates[0] < destination[0]) {
      coordinates[0] += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    }

    if (coordinates[1] > destination[1]) {
      coordinates[1] -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (coordinates[1] < destination[1]) {
      coordinates[1] += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    }

    this.set({ coordinates: coordinates });
    /* TODO: figure out why set() isn't triggering the change event and remove
     *       this hack. */
    this.trigger('change:coordinates');
  },
  follow: function(creature) {
    this.set({ destination: creature.get('coordinates') });
  },
  attack: function(creature) {
    this.follow(creature);
    this.set({ attacking: creature });
  },
  damage: function() {
    var stats = this.get('stats');
    var criticalHitChance = (stats.dexterity *
                              Werld.Config.CHARACTER_MAX_CRITICAL_HIT_CHANCE /
                              Werld.Config.CHARACTER_MAX_DEXTERITY) / 100;
    var critical = Math.random() < criticalHitChance;
    var damage = stats.strength / 10;
    return(critical ? damage * 2 : damage);
  },
  attackHandler: function() {
    var attackedCreature = this.get('attacking');

    if (attackedCreature) {
      var coordinates = this.get('coordinates');
      var attackedCreatureCoordinates = attackedCreature.get('coordinates');
      var distance =
        Werld.util.pixelDistance(coordinates, attackedCreatureCoordinates);
      var lastAttackAt = this.get('lastAttackAt');
      var attackSpeed = this.get('attackSpeed');
      var now = new Date();

      if (distance <= Werld.Config.PIXELS_PER_TILE &&
            (now.getTime() - lastAttackAt) >= attackSpeed) {
        this.set({ lastAttackAt: now.getTime() });
        this.hit(attackedCreature);
      }
    }
  },
  hit: function(creature) {
    creature.receiveHit(this.damage());
  },
  messagesSweeper: function() {
    var now = new Date();
    var self = this;
    this.messages.forEach(function(message) {
      if ((now.getTime() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        self.messages.dequeue();
      }
    });
  }
});
