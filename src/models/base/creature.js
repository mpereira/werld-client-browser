Werld.Models.Base.Creature = Backbone.Model.extend({
  defaults: function() {
    var defaultSkills = _(Werld.SKILLS).reduce(function(memo, value, key) {
      memo[value.NAME] = 0;
      return(memo);
    }, {});

    return(_({
      lastHitAttemptedAt: Number.NEGATIVE_INFINITY,
      hitPointRenegerationRate: Werld.Config.REGENERATION_RATE,
      manaRenegerationRate: Werld.Config.REGENERATION_RATE,
      staminaRenegerationRate: Werld.Config.REGENERATION_RATE
    }).extend(defaultSkills));
  },
  initialize: function() {
    this.items = (this.get('items') || new Werld.Collections.Items());

    if (!this.has('threateners')) {
      this.set('threateners', new Werld.Collections.Threateners(null, {
        sortBy: this.threatenersSortBy
      }));
    }

    this.set({
      hitPoints: this.get('strength'),
      mana: this.get('intelligence'),
      stamina: this.get('dexterity'),
      destination: _.clone(this.get('coordinates')),
      messages: [],
      path: []
    });

    this.lootContainer = new Werld.Models.LootContainer(_({
      owner: this
    }).extend(Werld.GUMPS.LOOT_CONTAINER));

    this.installIntervalFunctions();

    this.on('change:path', this.onPathChange);
    this.on('change:coordinates change:destination', this.updateIsMoving);
    this.on('change:destination', this.onDestinationChange);
    this.on('change:hitPoints', this.resurrectIfHitPointsGreaterThanZero);
    this.on('change:hitPoints', this.dieIfHitPointsLowerThanZero);
    this.on('resurrection', this.installLifeIntervalFunctions);
    this.on('death', this.uninstallLifeIntervalFunctions);
    this.on('destroy', this.uninstallIntervalFunctions);
  },
  maxHitPoints: function() {
    return(this.get('strength'));
  },
  maxMana: function() {
    return(this.get('intelligence'));
  },
  maxStamina: function() {
    return(this.get('dexterity'));
  },
  threatenersSortBy: function(creature) {
    return(creature.tileDistance(this));
  },
  intervalFunctionNamesWithIntervals: function() {
    return({
      messageSweeper: Werld.Config.MESSAGE_SWEEPER_POLLING_INTERVAL
    });
  },
  lifeIntervalFunctionNamesWithIntervals: function() {
    return({
      hitPointRegenerator: this.get('hitPointRenegerationRate'),
      manaRegenerator: this.get('manaRenegerationRate'),
      staminaRegenerator: this.get('staminaRenegerationRate'),
      battleHandler: Werld.Config.MAXIMUM_ATTACK_SPEED * 1000
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
  isMoving: function() {
    return(this.get('isMoving'));
  },
  updateIsMoving: function(creature, value, options) {
    if (_(this.get('coordinates')).isEqual(this.get('destination'))) {
      this.set('path', _.tail(this.get('path')));

      if (_.isEmpty(this.get('path'))) {
        this.set('isMoving', false);
      }
    } else {
      this.set('isMoving', true);
    }
  },
  onDestinationChange: function(creature, value, options) {
    if (this.has('attackee')) {
      if (this.tileDistance(this.get('attackee')) > this.get('attackee').get('aggressivenessRadius')) {
        this.stopAttacking(this.get('attackee'));
      }
    }

    if (Werld.Utils.Interval.isInstalled('movementHandler', this)) {
      Werld.Utils.Interval.uninstall('movementHandler', this);
    }

    Werld.Utils.Interval.install({ movementHandler: Werld.frameRate() }, this);
  },
  onFolloweeCoordinatesChange: function(followee, coordinates, options) {
    this.pathfind(this.get('followee'));
  },
  movementHandler: function() {
    var coordinates = _.clone(this.get('coordinates'));

    if (this.get('coordinates')[0] > this.get('destination')[0]) {
      coordinates[0] -= this.get('MOVEMENT_SPEED');
    } else if (this.get('coordinates')[0] < this.get('destination')[0]) {
      coordinates[0] += this.get('MOVEMENT_SPEED');
    }

    if (this.get('coordinates')[1] > this.get('destination')[1]) {
      coordinates[1] -= this.get('MOVEMENT_SPEED');
    } else if (this.get('coordinates')[1] < this.get('destination')[1]) {
      coordinates[1] += this.get('MOVEMENT_SPEED');
    }

    this.set('coordinates', coordinates);
  },
  onPathChange: function(creature, value, options) {
    if (!this.has('path')) { return; }
    if (_.isEmpty(this.get('path'))) { return; }

    this.set('destination', Werld.Utils.Geometry.tilePointToPixelPoint([
      _.head(this.get('path')).x,
      _.head(this.get('path')).y
    ]));
  },
  pathfind: function(thing) {
    var self = this;

    this._pathfind || (this._pathfind = _.throttle(function(thing) {
      self.set('path', Werld.path.search(self, thing));
    }, 100));

    this._pathfind(thing);
  },
  follow: function(creature) {
    this.set('followee', creature);
    this.pathfind(creature);
    creature.on('change:coordinates', this.onFolloweeCoordinatesChange, this);
  },
  moveTo: function(destination, options) {
    if (options && options.stopFollowing) {
      if (this.has('followee')) {
        this.stopFollowing(this.get('followee'));
      }
    }

    this.pathfind(Werld.Utils.Geometry.pixelPointToTilePoint(destination));
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
    } else if (this.has('followee')) {
      return(this.states.following);
    } else {
      return(this.states.idle);
    }
  },
  stopFollowing: function(creature) {
    this.unset('followee');
    creature.off('change:coordinates', this.onFolloweeCoordinatesChange, this);
  },
  attackSpeed: function() {
    var baseAttackSpeed = this.has('weapon') ?
                            this.get('weapon').get('speed') :
                            this.get('baseAttackSpeed');

    return(_.max([
      Math.floor(baseAttackSpeed - (this.get('stamina') / 30)),
      Werld.Config.MAXIMUM_ATTACK_SPEED
    ]) * 1000);
  },
  attacking: function(creature) {
    return(this.get('attackee') === creature);
  },
  attack: function(creature) {
    this.follow(creature);
    this.set('attackee', creature);
    creature.acknowledgeAttack(this);
  },
  battleHandler: function() {
    if (!this.has('attackee')) {
      return;
    }

    if (this.get('attackee').alive()) {
      if (this.tileDistance(this.get('attackee')) <= 1) {
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
    this.unset('attackee');
    this.stopFollowing(creature);
    creature.acknowledgeAttackStop(this);
  },
  acknowledgeAttackStop: function(attacker) {
    this.unset('attacker');
  },
  currentCombatSkillName: function() {
    return(this.has('weapon') ?
             this.get('weapon').get('skill') :
             Werld.SKILLS.WRESTLING.NAME);
  },
  hitChance: function(creature) {
    var x = this.get('dexterity');
    var y = creature.get('dexterity');
    var z = this.get(this.currentCombatSkillName());
    var w = creature.get(creature.currentCombatSkillName());

    return(_.min([
      100 * (z + x / 5) / ((w + y / 5) * 2),
      Werld.Config.MAXIMUM_HIT_CHANCE_PERCENTAGE
    ]));
  },
  equip: function(item) {
    if (!item.get('equipable')) { return(false); }

    if (this.has(item.get('type'))) {
      return(false);
    } else {
      this.set(item.get('type'), item);
      return(true);
    }
  },
  unequip: function(item) {
    if (!item.get('equipable')) { return(false); }

    if (this.get(item.get('type')) === item) {
      this.unset(item.get('type'));
    }
  },
  damageRange: function() {
    var damageBonusPercentage = 0.35 * this.get('strength') +
                                  0.15 * this.get('dexterity') +
                                  0.6 * this.get(this.currentCombatSkillName());

    var normalizedDamageBonusPercentage =
      _.min([damageBonusPercentage, Werld.Config.MAXIMUM_DAMAGE_BONUS_PERCENTAGE]);

    var baseDamageRange = this.has('weapon') ?
                            this.get('weapon').get('baseDamageRange') :
                            this.get('baseDamageRange');

    return(_(baseDamageRange).map(function(baseDamage) {
      return(Math.floor(baseDamage * (1 + normalizedDamageBonusPercentage / 100)));
    }));
  },
  blow: function() {
    var boundaries = this.get('BOUNDARIES');
    var criticalHitChance = (this.get('dexterity') *
                               boundaries.MAX_CRITICAL_HIT_CHANCE /
                               boundaries.MAX_DEXTERITY) / 100;
    var critical = Math.random() < criticalHitChance;
    var damage = Werld.Utils.Math.randomIntegerBetween(this.damageRange());

    return({ damage: critical ? damage * 2 : damage, critical: critical });
  },
  attemptHit: function(creature) {
    this.set('lastHitAttemptedAt', Date.now());
    this.trigger('hitAttempted', this, creature);

    if (this.hitChance(creature) / 100 > Math.random()) {
      this.hit(creature);
    } else {
      this.miss(creature);
    }
  },
  hit: function(creature) {
    var blow = this.blow();

    creature.receiveHit(this, blow.damage);
    this.trigger('hitDelivered', this, creature, blow.damage);

    if (blow.critical) {
      this.trigger('hitDelivered:critical', this, creature, blow.damage);
    }
  },
  miss: function(creature) {
    this.trigger('hitMissed', this, creature);
  },
  receiveHit: function(creature, damage) {
    this.trigger('hitReceived', this, creature, damage);
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
      _.keys(this.lifeIntervalFunctionNamesWithIntervals()), this
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
      object[attributeName] = Werld.Utils.Math.toDecimal(value, 1);
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
      max: this['max' + _.capitalize(attributeName)]()
    });
  },
  hitPointRegenerator: function() {
    var hitPointsPerSecondRegeneration = this.get('strength') / 100;
    this.increase('hitPoints', hitPointsPerSecondRegeneration);
  },
  manaRegenerator: function() {
    var manaPerSecondRegeneration = this.get('intelligence') / 100;
    this.increase('mana', manaPerSecondRegeneration);
  },
  staminaRegenerator: function() {
    var staminaPerSecondRegeneration = this.get('dexterity') / 100;
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
  adjacentTileCoordinatePoints: function() {
    var coordinates = this.get('coordinates');

    return(_([
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]).map(function(adjacentTileOffset) {
      return(Werld.Utils.Geometry.tilePointToPixelPoint(adjacentTileOffset));
    }).reduce(function(memo, adjacentTileCoordinateOffset) {
      return(memo.concat([[
        coordinates[0] + adjacentTileCoordinateOffset[0],
        coordinates[1] + adjacentTileCoordinateOffset[1]
      ]]));
    }, []));
  },
  installIntervalFunctions: function(creature) {
    Werld.Utils.Interval.install(_({}).extend(
      this.intervalFunctionNamesWithIntervals(),
      this.lifeIntervalFunctionNamesWithIntervals()
    ), this);
  },
  uninstallIntervalFunctions: function(creature) {
    Werld.Utils.Interval.uninstall(_({}).extend(
      _.keys(this.intervalFunctionNamesWithIntervals()),
      _.keys(this.lifeIntervalFunctionNamesWithIntervals())
    ), this);
  }
});
