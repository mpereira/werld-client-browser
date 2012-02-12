Werld.Views.Creature = Werld.Views.Base.Creature.extend({
  characterNameTextTick: function() {
    Werld.Views.Character.__super__.characterNameTextTick.call(this);
    this.characterNameText.color = '#cccccc';
    this.characterNameText.font = '16px "PowellAntique" serif';
  },
  _characterNameText: function() {
    if (this.model.alive()) {
      return(this.model.get('name'));
    } else {
      return(this.model.get('name') + ' corpse');
    }
  }
});
