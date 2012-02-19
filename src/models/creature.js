Werld.Models.Creature = Werld.Models.Base.Creature.extend({
  stopAttacking: function(creature) {
    Werld.Models.Character.__super__.stopAttacking.call(this, creature);
    this.stopMoving();
  }
});
