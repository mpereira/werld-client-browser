Werld.Models.Character = Werld.Models.Base.Creature.extend({
  initialize: function() {
    Werld.Models.Character.__super__.initialize.call(this);

    this.backpack = new Werld.Models.Backpack({
      owner: this
    });
  }
});
