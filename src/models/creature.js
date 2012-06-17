Werld.Models.Creature = Werld.Models.Base.Creature.extend({
  defaults: function() {
    return(_({
      aggressivenessRadius: Werld.Config.AGGRESSIVENESS_RADIUS,
      aggressivenessHandlerRate: Werld.Config.AGGRESSIVENESS_HANDLER_RATE,
      provocability: Werld.Config.PROVOCABILITY,
      stopAttackingHandlerRate: Werld.Config.STOP_ATTACKING_HANDLER_RATE
    }).extend(Werld.Models.Creature.__super__.defaults.call(this)));
  },
  initialize: function() {
    Werld.Models.Creature.__super__.initialize.call(this);

    var goldQuantityRange = this.get('ITEMS').GOLD;
    var goldQuantity = Werld.Utils.Math.randomIntegerBetween(goldQuantityRange);

    this.items.add(new Werld.Models.Item(_({
      container: this.lootContainer,
      quantity: goldQuantity
    }).extend(Werld.ITEMS.GOLD)));
  },
  lifeIntervalFunctionNamesWithIntervals: function() {
    return(_({
      threatenersHandler: this.get('aggressivenessHandlerRate'),
      threatenersUpdater: this.get('aggressivenessHandlerRate'),
      stopAttackingHandler: this.get('stopAttackingHandlerRate')
    }).extend(
      Werld.Models.Creature.__super__.lifeIntervalFunctionNamesWithIntervals.call(
        this
      )
    ));
  },
  stopAttacking: function(creature) {
    Werld.Models.Creature.__super__.stopAttacking.call(this, creature);
    this.stopMoving();
  },
  acknowledgeAttack: function(attacker) {
    Werld.Models.Creature.__super__.acknowledgeAttack.call(this, attacker);

    if (!this.attacking(attacker)) {
      this.attack(attacker);
    }
  },
  threatenersHandler: function() {
    var closestThreateningCreature = this.get('threateners').first();

    if (this.get('threateners').isEmpty()) {
      return;
    }

    if (!this.creatureWithinAggressivenessRadius(closestThreateningCreature)) {
      return;
    }

    if (Math.random() > this.get('provocability')) {
      return;
    }

    if (this.has('attackee')) {
      if (this.get('attackee').tileDistance(this) >
            closestThreateningCreature.tileDistance(this)) {
        this.attack(closestThreateningCreature);
      }
    } else {
      this.attack(closestThreateningCreature);
    }
  },
  threatenersUpdater: function() {
    var charactersWithinAggressivenessArea =
      Werld.game.charactersWithinArea(this.aggressivenessAreaCircle());

    var aliveCharactersWithinAggressivenessArea =
      _(charactersWithinAggressivenessArea).filter(function(character) {
        return(character.alive());
      });

    if (charactersWithinAggressivenessArea.length > 0) {
      this.get('threateners').update(aliveCharactersWithinAggressivenessArea);
    }
  },
  aggressivenessAreaCircle: function() {
    return(new Werld.Utils.Circle({
      center: this.tileCoordinates(),
      radius: this.get('aggressivenessRadius'),
      measurement: 'tiles'
    }));
  },
  tilePointWithinAggressivenessRadius: function(tilePoint) {
    return(this.aggressivenessAreaCircle().tilePointWithinArea(tilePoint));
  },
  creatureWithinAggressivenessRadius: function(creature) {
    return(this.tilePointWithinAggressivenessRadius(creature.tileCoordinates()));
  },
  stopAttackingHandler: function() {
    if (!this.has('attackee')) {
      return;
    }

    // Stop attacking the attackee if it's no longer attacking and out of our
    // agressiveness radius.
    if (!this.get('attackee').attacking(this)) {
      if (!this.creatureWithinAggressivenessRadius(this.get('attackee'))) {
        this.stopAttacking(this.get('attackee'));
      }
    }
  },
  currentCombatSkill: function() {
    return('wrestling');
  }
});
