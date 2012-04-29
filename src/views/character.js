Werld.Views.Character = Werld.Views.Base.Creature.extend({
  nameTextFont: '18px "PowellAntique" serif',
  nameTextColor: '#6495ed',
  nameTextShadow: new Shadow('black', 1, 1, 1),
  nameTextText: function() {
    return(this.model.get('name'));
  }
});
