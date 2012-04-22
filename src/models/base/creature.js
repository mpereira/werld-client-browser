Werld.Models.Base.Creature = Backbone.Model.extend({
  defaults: {
    lastAttackAt: Number.NEGATIVE_INFINITY,
    aggressivenessRadius: Werld.Config.AGGRESSIVENESS_RADIUS,
    hitPointRenegerationRate: Werld.Config.REGENERATION_RATE,
    manaRenegerationRate: Werld.Config.REGENERATION_RATE,
    staminaRenegerationRate: Werld.Config.REGENERATION_RATE
  },
  initialize: function(attributes, options) {
    _.bindAll(this);

    attributes || (attributes = {});
    this.set(attributes, { silent: true });
    this.options = options || {};

    this.items = (this.get('items') || new Werld.Collections.Items());

    var stats = this.get('stats');
    var coordinates = _.clone(this.get('coordinates'));

    this.set({
      status: 'alive',
      hitPoints: stats.strength,
      maxHitPoints: stats.strength,
      mana: stats.intelligence,
      maxMana: stats.intelligence,
      stamina: stats.dexterity,
      maxStamina: stats.dexterity,
      destination: coordinates,
      messages: []
    });

    this.intervalFunctionNamesWithIntervals = {
      messageSweeper: Werld.Config.MESSAGE_SWEEPER_POLLING_INTERVAL,
      movementHandler: Werld.frameRate(),
      statusObserver: Werld.frameRate(),
      aggressivenessHandler: Werld.frameRate(),
      hitPointObserver: this.get('hitPointRenegerationRate'),
      manaObserver: this.get('manaRenegerationRate'),
      staminaObserver: this.get('staminaRenegerationRate')
    };

    this.lootContainer = new Werld.Models.LootContainer({ owner: this });

    this.installIntervalFunctions();
  },
  installIntervalFunctions: function() {
    var self = this;
    _.chain(this.intervalFunctionNamesWithIntervals).keys().each(function(key) {
      Werld.Utils.Interval.set(
        self,
        self[key + 'IntervalId'],
        self[key],
        self.intervalFunctionNamesWithIntervals[key]
      );
    });
  },
  uninstallIntervalFunctions: function() {
    var self = this;
    _.chain(this.intervalFunctionNamesWithIntervals).keys().each(function(key) {
      Werld.Utils.Interval.clear(self, self[key + 'IntervalId']);
    });
  },
  say: function(message) {
    var messages = this.get('messages');

    messages.unshift({
      type: 'speech', content: message, created_at: Date.now()
    });
    this.set({ messages: messages });
  },
  move: function(destinationTile) {
    if (this.get('following')) {
      this.stopFollowing(this.get('following'));
    }

    /* Stop attacking if we move beyond the creature being attacked's
     * aggressiveness radius. */
    var creatureBeingAttacked = this.get('attacking');
    if (creatureBeingAttacked &&
          this.tileDistance(creatureBeingAttacked) >
          creatureBeingAttacked.get('aggressivenessRadius')) {
      this.stopAttacking(creatureBeingAttacked);
    }

    if (destinationTile[0] < 0) {
      destinationTile[0] = 0;
    } else if (destinationTile[0] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      destinationTile[0] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    if (destinationTile[1] < 0) {
      destinationTile[1] = 0;
    } else if (destinationTile[1] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      destinationTile[1] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    this.set({
      destination: _(destinationTile).map(Werld.Utils.Geometry.tilesToPixels)
    });
  },
  movementHandler: function() {
    // If we're following something, update our "destination" with their
    // "coordinates" unless they're already equal.
    var followee = this.get('following');
    if (followee) {
      if (!_(followee.get('coordinates')).isEqual(this.get('coordinates'))) {
        this.set('destination', followee.get('coordinates'));
      }
    }

    // TODO: don't trigger on every `movementHandler()` call.
    if (_(this.get('coordinates')).isEqual(this.get('destination'))) {
      this.trigger('idle', this);
      return;
    }

    var destination = this.get('destination');
    var coordinates = _.clone(this.get('coordinates'));
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

    this.set('coordinates', coordinates);
  },
  follow: function(creature) {
    this.set({ following: creature });
  },
  stopFollowing: function(creature) {
    this.follow(null);
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
    if (creature === this || this.dead()) {
      return;
    }

    Werld.Utils.Interval.set(
      this,
      'battleHandlerIntervalId',
      this.battleHandler,
      Werld.frameRate()
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
  stopMoving: function() {
    this.set({ destination: this.get('coordinates') });
  },
  stopAttacking: function(creature) {
    Werld.Utils.Interval.clear(this, 'battleHandlerIntervalId');
    this.set({ attacking: null });
    this.stopFollowing(creature);
    creature.acknowledgeAttackStop(this);
  },
  acknowledgeAttackStop: function(attacker) {
    this.set({ attacker: null });
  },
  hit: function(creature) {
    this.set({ lastAttackAt: Date.now() });
    creature.receiveHit(this.damage());
  },
  receiveHit: function(damage) {
    var messages = this.get('messages');

    this.set({ hitPoints: this.get('hitPoints') - damage });
    messages.unshift({
      type: 'hit', content: damage, created_at: Date.now()
    });
    this.set({ messages: messages });
  },
  aggressivenessHandler: function() {
    var attackedCreature = this.get('attacking');

    // Stop attacking if the creature we're attacking is no longer attacking us
    // and out of our agressiveness radius.
    if (attackedCreature && !this.get('attacker')) {
      if (this.tileDistance(attackedCreature) > this.get('aggressivenessRadius')) {
        this.stopAttacking(attackedCreature);
      }
    }
  },
  battleHandler: function() {
    var attackedCreature = this.get('attacking');

    if (!attackedCreature) {
      return;
    }

    if (attackedCreature.alive()) {
      if (this.tileDistance(attackedCreature) < 1) {
        if ((Date.now() - this.get('lastAttackAt')) >= this.attackSpeed()) {
          this.hit(attackedCreature);
        }
      }
    } else {
      this.stopAttacking(attackedCreature);
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
    }

    this.set({
      status: 'dead',
      hitPoints: 0,
      mana: 0,
      stamina: 0,
      messages: []
    });

    this.trigger('death', this);
  },
  resurrect: function() {
    var object = { status: 'alive' };
    var creature = this;

    _(['hitPoints', 'mana', 'stamina']).each(function(attributeName) {
      if (creature.get(attributeName) <= 0) {
        object[attributeName] = 1;
      }
    });

    this.set(object);
    this.trigger('resurrection', this);
  },
  coordinates: function() {
    return(this.get('coordinates'));
  },
  tileDistance: function(thing) {
    if (!this.coordinates || !thing.coordinates) {
      throw new Error('Both objects must implement a "coordinates" function');
    }

    return(
      Werld.Utils.Geometry.tileDistance(this.coordinates(), thing.coordinates())
    );
  },
  // There's probably a way to accomplish this without polling. Maybe put the
  // death checking on the battle handler and have some kind of resurrector
  // object (for ahnks, healers, or even mages with resurecting spells) for
  // the resurrect checking.
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
  increase: function(attributeName, quantity) {
    var maxAttributeValue =
      this.get('max' + _.upcaseFirstCharacter(attributeName));
    var futureAttributeValue = this.get(attributeName) + quantity;
    var object = {};

    if (futureAttributeValue > maxAttributeValue) {
      object[attributeName] = maxAttributeValue;
    } else {
      object[attributeName] = futureAttributeValue;
    }

    this.set(object);
  },
  hitPointObserver: function() {
    if (this.alive()) {
      if (this.get('hitPoints') < this.get('maxHitPoints')) {
        if (!this.hitPointRegeneratorIntervalId) {
          Werld.Utils.Interval.set(
            this,
            'hitPointRegeneratorIntervalId',
            this.hitPointRegenerator,
            Werld.Config.REGENERATION_RATE
          );
        }
      } else {
        if (this.hitPointRegeneratorIntervalId) {
          Werld.Utils.Interval.clear(this, 'hitPointRegeneratorIntervalId');
        }
      }
    } else {
      if (this.hitPointRegeneratorIntervalId) {
        Werld.Utils.Interval.clear(this, 'hitPointRegeneratorIntervalId');
      }
    }
  },
  hitPointRegenerator: function() {
    var hitPointsPerSecondRegeneration = this.get('stats').strength / 100;
    this.increase('hitPoints', hitPointsPerSecondRegeneration);
  },
  manaObserver: function() {
    if (this.alive()) {
      if (this.get('mana') < this.get('maxMana')) {
        Werld.Utils.Interval.set(
          this,
          'manaRegeneratorIntervalId',
          this.manaRegenerator,
          Werld.Config.REGENERATION_RATE
        );
      } else {
        if (this.manaRegeneratorIntervalId) {
          Werld.Utils.Interval.clear(this, 'manaRegeneratorIntervalId');
        }
      }
    } else {
      if (this.manaRegeneratorIntervalId) {
        Werld.Utils.Interval.clear(this, 'manaRegeneratorIntervalId');
      }
    }
  },
  manaRegenerator: function() {
    var manaPerSecondRegeneration = this.get('stats').intelligence / 100;
    this.increase('mana', manaPerSecondRegeneration);
  },
  staminaObserver: function() {
    if (this.alive()) {
      if (this.get('stamina') < this.get('maxStamina')) {
        if (!this.staminaRegeneratorIntervalId) {
          Werld.Utils.Interval.set(
            this,
            'staminaRegeneratorIntervalId',
            this.staminaRegenerator,
            Werld.Config.REGENERATION_RATE
          );
        }
      } else {
        if (this.staminaRegeneratorIntervalId) {
          Werld.Utils.Interval.clear(this, 'staminaRegeneratorIntervalId');
        }
      }
    } else {
      if (this.staminaRegeneratorIntervalId) {
        Werld.Utils.Interval.clear(this, 'staminaRegeneratorIntervalId');
      }
    }
  },
  staminaRegenerator: function() {
    var staminaPerSecondRegeneration = this.get('stats').dexterity / 100;
    this.increase('stamina', staminaPerSecondRegeneration);
  },
  messageSweeper: function() {
    var self = this;
    _(this.get('messages')).each(function(message) {
      if ((Date.now() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        var messages = self.get('messages');
        messages.pop();
        self.set({ messages: messages });
      }
    });
  },
  destroy: function() {
    this.trigger('destroy', this);
    this.uninstallIntervalFunctions();
  },
  getItem: function(item) {
    var creatureItem = this.items.find(function(collectionItem) {
      return(collectionItem.stackable() && collectionItem.same(item));
    });

    if (creatureItem) {
      creatureItem.merge(item);
      item.destroy();
      return(false);
    } else {
      this.items.add(item);
      return(true);
    }
  }
});
