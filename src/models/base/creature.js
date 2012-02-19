Werld.Models.Base.Creature = Backbone.Model.extend({
  defaults: {
    lastAttackAt: Number.NEGATIVE_INFINITY
  },
  initialize: function() {
    var stats = this.get('stats');
    var coordinates = _.clone(this.get('coordinates'));
    var fixedCoordinates;

    if (this.get('fixed')) {
      fixedCoordinates = coordinates;
    }

    this.set({
      status: 'alive',
      hitPoints: stats.strength,
      maxHitPoints: stats.strength,
      mana: stats.intelligence,
      maxMana: stats.intelligence,
      stamina: stats.dexterity,
      maxStamina: stats.dexterity,
      destination: coordinates,
      messages: [],
      fixedCoordinates: fixedCoordinates
    });

    this.messagesSweeperIntervalId = setInterval(
      _.bind(this.messagesSweeper, this),
      Werld.Config.MESSAGE_SWEEPER_POLLING_INTERVAL
    );

    this.movementHandlerIntervalId = setInterval(
      _.bind(this.movementHandler, this), Werld.Config.FRAME_RATE()
    );

    this.statusObserverIntervalId = setInterval(
      _.bind(this.statusObserver, this), Werld.Config.FRAME_RATE()
    );

    this.hitPointObserverIntervalId = setInterval(
      _.bind(this.hitPointObserver, this), Werld.Config.REGENERATION_RATE
    );

    this.manaObserverIntervalId = setInterval(
      _.bind(this.manaObserver, this), Werld.Config.REGENERATION_RATE
    );

    this.staminaObserverIntervalId = setInterval(
      _.bind(this.staminaObserver, this), Werld.Config.REGENERATION_RATE
    );
  },
  say: function(message) {
    var now = new Date();
    var messages = this.get('messages');

    messages.unshift({
      type: 'speech', content: message, created_at: now.getTime()
    });
    this.set({ messages: messages });
  },
  move: function(destinationTile) {
    var mapDestinationTile;

    this.follow(null);

    if (this.get('fixed')) {
      var fixedCoordinates = this.get('fixedCoordinates');
      var coordinates = this.get('coordinates');

      var tileOffset = [
        destinationTile[0] - Werld.util.pixelToTile(fixedCoordinates[0]),
        destinationTile[1] - Werld.util.pixelToTile(fixedCoordinates[1])
      ];

      mapDestinationTile = [
        Werld.util.pixelToTile(coordinates[0]) + tileOffset[0],
        Werld.util.pixelToTile(coordinates[1]) + tileOffset[1]
      ];

    } else {
      mapDestinationTile = destinationTile;
    }

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
    if (this.get('following')) {
      this.set({ destination: _.clone(this.get('following').get('coordinates')) });
    }

    var coordinates = this.get('coordinates');
    var destination = this.get('destination');
    var movementSpeed = this.get('MOVEMENT_SPEED');

    if (coordinates[0] > destination[0]) {
      coordinates[0] -= movementSpeed;
    } else if (coordinates[0] < destination[0]) {
      coordinates[0] += movementSpeed;
    }

    if (coordinates[1] > destination[1]) {
      coordinates[1] -= movementSpeed;
    } else if (coordinates[1] < destination[1]) {
      coordinates[1] += movementSpeed;
    }

    this.set({ coordinates: coordinates });
    /* TODO: figure out why set() isn't triggering the change event and remove
     *       this hack. */
    this.trigger('change:coordinates');
  },
  follow: function(creature) {
    this.set({ following: creature });
  },
  damage: function() {
    var stats = this.get('stats');
    var boundaries = this.get('BOUNDARIES');
    var criticalHitChance = (stats.dexterity *
                               boundaries.MAX_CRITICAL_HIT_CHANCE /
                               boundaries.MAX_DEXTERITY) / 100;
    var critical = Math.random() < criticalHitChance;
    var damage = stats.strength / 10;
    return(critical ? damage * 2 : damage);
  },
  attackSpeed: function() {
    return(((-4 * this.get('stats').dexterity / 125) + 5) * 1000);
  },
  attack: function(creature) {
    if (creature === this) return;

    this.battleHandlerIntervalId = setInterval(
      _.bind(this.battleHandler, this), Werld.Config.FRAME_RATE()
    );
    this.follow(creature);
    this.set({ attacking: creature });
    creature.acknowledgeAttack(this);
  },
  acknowledgeAttack: function(attacker) {
    if (this.get('attacker') !== attacker) {
      this.set({ attacker: attacker });
      this.attack(attacker);
    }
  },
  stopAttacking: function(creature) {
    clearInterval(this.battleHandlerIntervalId);
    this.set({ attacking: null });
    this.follow(null);
    creature.acknowledgeAttackStop(this);
  },
  acknowledgeAttackStop: function(attacker) {
    this.set({ attacker: null });
  },
  hit: function(creature) {
    creature.receiveHit(this.damage());
  },
  receiveHit: function(damage) {
    var now = new Date();
    var messages = this.get('messages');

    this.set({ hitPoints: this.get('hitPoints') - damage });
    messages.unshift({
      type: 'hit', content: damage, created_at: now.getTime()
    });
    this.set({ messages: messages });
  },
  battleHandler: function() {
    var attackedCreature = this.get('attacking');

    if (attackedCreature) {
      if (attackedCreature.alive()) {
        var coordinates = this.get('coordinates');
        var attackedCreatureCoordinates = attackedCreature.get('coordinates');
        var distance =
          Werld.util.pixelDistance(coordinates, attackedCreatureCoordinates);
        var lastAttackAt = this.get('lastAttackAt');
        var now = new Date();

        if (distance <= Werld.Config.PIXELS_PER_TILE &&
              (now.getTime() - lastAttackAt) >= this.attackSpeed()) {
          this.set({ lastAttackAt: now.getTime() });
          this.hit(attackedCreature);
        }
      } else {
        this.stopAttacking(attackedCreature);
      }
    }
  },
  alive: function() {
    return(this.get('status') === 'alive');
  },
  dead: function() {
    return(this.get('status') === 'dead');
  },
  die: function() {
    if (this.get('attacking')) {
      this.stopAttacking(this.get('attacking'));
    } else {
      this.follow(null);
    }
    this.set({
      status: 'dead',
      hitPoints: 0,
      mana: 0,
      stamina: 0,
      messages: []
    });
  },
  resurrect: function() {
    this.set({ status: 'alive' });
    _(['hitPoints', 'mana', 'stamina']).each(_.bind(function(attribute) {
      if (this.get(attribute) <= 0) {
        var object = {};
        object[attribute] = 1;
        this.set(object);
      }
    }, this));
  },
  statusObserver: function() {
    if (this.dead()) {
      if (this.get('hitPoints') > 0) {
        this.resurrect();
      }
    } else {
      if (this.get('hitPoints') <= 0) {
        this.die();
      }
    }
  },
  loot: function() {
  },
  increase: function(attribute, quantity) {
    var currentAttributeValue = this.get(attribute);
    var maxAttributeValue =
      this.get('max' + Werld.util.capitalizeFirstLetter(attribute));
    var futureAttributeValue = quantity + currentAttributeValue;
    var object = {};
    if (futureAttributeValue > maxAttributeValue) {
      object[attribute] = maxAttributeValue;
    } else {
      object[attribute] = futureAttributeValue;
    }
    this.set(object);
  },
  hitPointObserver: function() {
    if (this.alive()) {
      if (this.get('hitPoints') < this.get('maxHitPoints')) {
        if (this.hitPointRegeneratorIntervalId === null) {
          this.hitPointRegeneratorIntervalId = setInterval(
            _.bind(this.hitPointRegenerator, this),
            Werld.Config.REGENERATION_RATE
          );
        }
      } else {
        clearInterval(this.hitPointRegeneratorIntervalId);
        this.hitPointRegeneratorIntervalId = null;
      }
    } else {
      clearInterval(this.hitPointRegeneratorIntervalId);
      this.hitPointRegeneratorIntervalId = null;
    }
  },
  hitPointRegenerator: function() {
    var hitPointsPerSecondRegeneration = this.get('stats').strength / 100;
    this.increase('hitPoints', hitPointsPerSecondRegeneration);
  },
  manaObserver: function() {
    if (this.alive()) {
      if (this.get('mana') < this.get('maxMana')) {
        if (this.manaRegeneratorIntervalId === null) {
          this.manaRegeneratorIntervalId = setInterval(
            _.bind(this.manaRegenerator, this),
            Werld.Config.REGENERATION_RATE
          );
        }
      } else {
        clearInterval(this.manaRegeneratorIntervalId);
        this.manaRegeneratorIntervalId = null;
      }
    } else {
      clearInterval(this.manaRegeneratorIntervalId);
      this.manaRegeneratorIntervalId = null;
    }
  },
  manaRegenerator: function() {
    var manaPerSecondRegeneration = this.get('stats').intelligence / 100;
    this.increase('mana', manaPerSecondRegeneration);
  },
  staminaObserver: function() {
    if (this.alive()) {
      if (this.get('stamina') < this.get('maxStamina')) {
        if (this.staminaRegeneratorIntervalId === null) {
          this.staminaRegeneratorIntervalId = setInterval(
            _.bind(this.staminaRegenerator, this),
            Werld.Config.REGENERATION_RATE
          );
        }
      } else {
        clearInterval(this.staminaRegeneratorIntervalId);
        this.staminaRegeneratorIntervalId = null;
      }
    } else {
      clearInterval(this.staminaRegeneratorIntervalId);
      this.staminaRegeneratorIntervalId = null;
    }
  },
  staminaRegenerator: function() {
    var staminaPerSecondRegeneration = this.get('stats').dexterity / 100;
    this.increase('stamina', staminaPerSecondRegeneration);
  },
  messagesSweeper: function() {
    var now = new Date();
    var self = this;
    _(this.get('messages')).each(function(message) {
      if ((now.getTime() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        var messages = self.get('messages');
        messages.pop();
        self.set({ messages: messages });
      }
    });
  },
  destroy: function() {
    this.trigger('destroy', this);
  }
});
