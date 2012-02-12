Werld.Views.Character = Werld.Views.Base.Creature.extend({
  characterNameTextTick: function() {
    Werld.Views.Character.__super__.characterNameTextTick.call(this);
    this.characterNameText.shadow = new Shadow('#3300ff', 1, 1, 0);
    this.characterNameText.color = '#00ccff';
    this.characterNameText.font = '20px "PowellAntique" serif';
  },
  _characterNameText: function() {
    return(this.model.get('name'));
  }
});
