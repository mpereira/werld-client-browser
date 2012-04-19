Werld.Models.Creature = Werld.Models.Base.Creature.extend({
  initialize: function() {
    Werld.Models.Creature.__super__.initialize.call(this);

    var goldQuantityRange = this.get('ITEMS').GOLD;
    var goldQuantity = Werld.Utils.Math.randomIntegerBetween(goldQuantityRange);

    this.items.add(new Werld.Models.Item(_({
      container: this.lootContainer,
      quantity: goldQuantity
    }).extend(Werld.ITEMS.GOLD)));
  },
  stopAttacking: function(creature) {
    Werld.Models.Creature.__super__.stopAttacking.call(this, creature);
    this.stopMoving();
  }
});
