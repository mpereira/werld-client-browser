Werld.Models.Base.Creature = Backbone.Model.extend({
  defaults: function() {
    return({
      lastHitAttemptedAt: Number.NEGATIVE_INFINITY,
      hitPointRenegerationRate: Werld.Config.REGENERATION_RATE,
      manaRenegerationRate: Werld.Config.REGENERATION_RATE,
      staminaRenegerationRate: Werld.Config.REGENERATION_RATE
    });
  },
  initialize: function(attributes, options) {
    _.bindAll(this);

    attributes || (attributes = {});
    this.set(attributes, { silent: true });
    this.options = options || {};

    this.items = (this.get('items') || new Werld.Collections.Items());

    if (!this.has('threateners')) {
      var sortBy = _(function(creature) {
        return(creature.tileDistance(self));
      }).bind(this);

      this.set('threateners', new Werld.Collections.Threateners(null, {
        sortBy: sortBy
      }));
    }

    var stats = this.get('stats');

    this.set({
      hitPoints: stats.strength,
      maxHitPoints: stats.strength,
      mana: stats.intelligence,
      maxMana: stats.intelligence,
      stamina: stats.dexterity,
      maxStamina: stats.dexterity,
      destination: _.clone(this.get('coordinates')),
      messages: []
    });

    this.lootContainer = new Werld.Models.LootContainer({ owner: this });

    Werld.Utils.Interval.install(_({
    }).extend(
      this.intervalFunctionNamesWithIntervals(),
      this.lifeIntervalFunctionNamesWithIntervals()
    ), this);

    this.on('change:hitPoints', this.resurrectIfHitPointsGreaterThanZero);
    this.on('change:hitPoints', this.dieIfHitPointsLowerThanZero);
    this.on('resurrection', this.installLifeIntervalFunctions);
    this.on('death', this.uninstallLifeIntervalFunctions);
    this.on('destroy', this.uninstallIntervalFunctions);
  },
  intervalFunctionNamesWithIntervals: function() {
    return({
      messageSweeper: Werld.Config.MESSAGE_SWEEPER_POLLING_INTERVAL,
      movementHandler: Werld.frameRate()
    });
  },
  lifeIntervalFunctionNamesWithIntervals: function() {
    return({
      hitPointRegenerator: this.get('hitPointRenegerationRate'),
      manaRegenerator: this.get('manaRenegerationRate'),
      staminaRegenerator: this.get('staminaRenegerationRate')
    });
  },
  say: function(message) {
    var messages = _.clone(this.get('messages'));

    messages.unshift({
      type: 'speech', content: message, created_at: Date.now()
    });

    this.set('messages', messages);
  },
  tileCoordinates: function() {
    return(Werld.Utils.Geometry.pixelPointToTilePoint(this.get('coordinates')));
  },
  move: function(destinationTile) {
    if (this.get('following')) {
      this.stopFollowing(this.get('following'));
    }

    /* Stop attacking if we move beyond the creature being attacked's
     * aggressiveness radius. */
    var creatureBeingAttacked = this.get('attackee');
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
      destination: Werld.Utils.Geometry.tilePointToPixelPoint(destinationTile)
    });
  },
  states: {
    attacking: 'attacking',
    beingAttacked: 'beingAttacked',
    following: 'following',
    idle: 'idle'
  },
  state: function() {
    if (this.has('attackee')) {
      return(this.states.attacking);
    } else if (this.has('attacker')) {
      return(this.states.beingAttacked);
    } else if (this.has('following')) {
      return(this.states.following);
    } else {
      return(this.states.idle);
    }
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
    this.set('following', creature);
  },
  stopFollowing: function(creature) {
    this.follow(null);
  },
  attackSpeed: function() {
    return(((-4 * this.get('stats').dexterity / 125) + 5) * 1000);
  },
  attacking: function(creature) {
    return(this.get('attackee') === creature);
  },
  attack: function(creature) {
    Werld.Utils.Interval.set(
      this,
      'battleHandlerIntervalId',
      this.battleHandler,
      Werld.frameRate()
    );

    this.follow(creature);
    this.set('attackee', creature);
    creature.acknowledgeAttack(this);
  },
  battleHandler: function() {
    if (!this.has('attackee')) {
      return;
    }

    if (this.get('attackee').alive()) {
      if (this.tileDistance(this.get('attackee')) < 1) {
        if ((Date.now() - this.get('lastHitAttemptedAt')) >= this.attackSpeed()) {
          this.attemptHit(this.get('attackee'));
        }
      }
    } else {
      this.stopAttacking(this.get('attackee'));
    }
  },
  acknowledgeAttack: function(attacker) {
    this.set('attacker', attacker);
  },
  stopMoving: function() {
    this.set('destination', this.get('coordinates'));
  },
  stopAttacking: function(creature) {
    Werld.Utils.Interval.clear(this, 'battleHandlerIntervalId');
    this.unset('attackee');
    this.stopFollowing(creature);
    creature.acknowledgeAttackStop(this);
  },
  acknowledgeAttackStop: function(attacker) {
    this.unset('attacker');
  },
  hitChance: function(creature) {
    var x = this.get('stats').dexterity;
    var y = creature.get('stats').dexterity;

    return(
      ((Math.sqrt(x) - Math.sqrt(y)) / 5) * ((10 + Math.sqrt(10)) / 40) + 0.55
    );
  },
  blow: function() {
    var stats = this.get('stats');
    var boundaries = this.get('BOUNDARIES');
    var criticalHitChance = (stats.dexterity *
                               boundaries.MAX_CRITICAL_HIT_CHANCE /
                               boundaries.MAX_DEXTERITY) / 100;
    var critical = Math.random() < criticalHitChance;
    var damage = stats.strength / 10;

    return({ damage: critical ? damage * 2 : damage, critical: critical });
  },
  attemptHit: function(creature) {
    this.set('lastHitAttemptedAt', Date.now());

    if (this.hitChance(creature) > Math.random()) {
      this.hit(creature);
    } else {
      this.miss(creature);
    }
  },
  hit: function(creature) {
    var blow = this.blow();

    creature.receiveHit(blow.damage);
    this.trigger('hit', this, creature);

    if (blow.critical) {
      this.trigger('hit:critical', this, creature);
    }
  },
  miss: function(creature) {
    this.trigger('miss', this, creature);
  },
  receiveHit: function(damage) {
    var messages = _.clone(this.get('messages'));

    messages.unshift({
      type: 'hit', content: damage, created_at: Date.now()
    });

    this.set('messages', messages);

    this.decrease('hitPoints', damage);
  },
  alive: function() {
    return(this.get('hitPoints') > 0);
  },
  dead: function() {
    return(!this.alive());
  },
  die: function() {
    if (this.has('attackee')) {
      this.stopAttacking(this.get('attackee'));
    }

    this.set({
      hitPoints: 0,
      mana: 0,
      stamina: 0,
      messages: []
    });

    this.trigger('death', this);
  },
  resurrect: function() {
    var object = {};
    var creature = this;

    _(['hitPoints', 'mana', 'stamina']).each(function(attributeName) {
      if (creature.get(attributeName) <= 0) {
        object[attributeName] = 1;
      }
    });

    this.set(object);
    this.trigger('resurrection', this);
  },
  installLifeIntervalFunctions: function(creature) {
    Werld.Utils.Interval.install(
      this.lifeIntervalFunctionNamesWithIntervals(), this
    );
  },
  uninstallLifeIntervalFunctions: function(creature) {
    Werld.Utils.Interval.uninstall(
      this.lifeIntervalFunctionNamesWithIntervals(), this
    );
  },
  coordinates: function() {
    return(this.get('coordinates'));
  },
  tileDistance: function(thing) {
    if (!this.coordinates || !thing.coordinates) {
      throw new Error('Both objects must implement a "coordinates" function');
    }

    return(
      Werld.Utils.Geometry.pixelsToTiles(
        Werld.Utils.Geometry.pixelDistance(
          this.coordinates(),
          thing.coordinates()
        )
      )
    );
  },
  resurrectIfHitPointsGreaterThanZero: function(creature, hitPoints, options) {
    if (this.previous('hitPoints') <= 0 && this.get('hitPoints') > 0) {
      this.resurrect();
    }
  },
  dieIfHitPointsLowerThanZero: function(creature, hitPoints, options) {
    if (this.previous('hitPoints') > 0 && this.get('hitPoints') <= 0) {
      this.die();
    }
  },
  normalizedSet: function(attributeName, value, options) {
    options || (options = {});

    var object = {};

    if (_.isNumber(options.min) && value < options.min) {
      object[attributeName] = options.min;
    } else if (_.isNumber(options.max) && value > options.max) {
      object[attributeName] = options.max;
    } else {
      object[attributeName] = value;
    }

    this.set(object);
  },
  decrease: function(attributeName, quantity) {
    this.normalizedSet(attributeName, this.get(attributeName) - quantity, {
      min: 0
    });
  },
  increase: function(attributeName, quantity) {
    this.normalizedSet(attributeName, this.get(attributeName) + quantity, {
      max: this.get('max' + _.upcaseFirstCharacter(attributeName))
    });
  },
  hitPointRegenerator: function() {
    var hitPointsPerSecondRegeneration = this.get('stats').strength / 100;
    this.increase('hitPoints', hitPointsPerSecondRegeneration);
  },
  manaRegenerator: function() {
    var manaPerSecondRegeneration = this.get('stats').intelligence / 100;
    this.increase('mana', manaPerSecondRegeneration);
  },
  staminaRegenerator: function() {
    var staminaPerSecondRegeneration = this.get('stats').dexterity / 100;
    this.increase('stamina', staminaPerSecondRegeneration);
  },
  messageSweeper: function() {
    var messages = _.clone(this.get('messages'));
    var lastMessage = messages[messages.length - 1];

    if (lastMessage) {
      if ((Date.now() - lastMessage.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        messages.pop();
        this.set('messages', messages);
      }
    }
  },
  destroy: function() {
    this.trigger('destroy', this);
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
  },
  adjacentTilePoints: function() {
    var tileCoordinates = this.tileCoordinates();

    return(_([
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]).reduce(function(memo, adjacentTileCoordinateOffset) {
      return(memo.concat([[
        tileCoordinates[0] + adjacentTileCoordinateOffset[0],
        tileCoordinates[1] + adjacentTileCoordinateOffset[1]
      ]]));
    }, []));
  },
  uninstallIntervalFunctions: function(creature) {
    Werld.Utils.Interval.install(_({
    }).extend(
      this.intervalFunctionNamesWithIntervals(),
      this.lifeIntervalFunctionNamesWithIntervals()
    ), this);
  }
});
