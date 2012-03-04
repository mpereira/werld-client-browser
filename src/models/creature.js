Werld.Models.Creature = Werld.Models.Base.Creature.extend({
  initialize: function() {
    var goldQuantityRange = this.get('ITEMS').GOLD;
    var goldQuantity = Werld.util.randomIntegerBetween(goldQuantityRange);
    var goldItemObject = _(Werld.ITEMS.GOLD).extend({ quantity: goldQuantity });
    var goldItem = new Werld.Models.Item(goldItemObject);

    Werld.Models.Creature.__super__.initialize.call(this, {
      items: new Werld.Collections.Items([goldItem])
    });
  },
  stopAttacking: function(creature) {
    Werld.Models.Character.__super__.stopAttacking.call(this, creature);
    this.stopMoving();
  }
});
