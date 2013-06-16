Werld.Models.Game = Backbone.Model.extend({
  initialize: function() {
    this.has('creatures') || this.set('creatures', new Werld.Collections.Creatures());
    this.has('characters') || this.set('characters', new Werld.Collections.Characters());

    this.addUpdateTileCreaturesToCreatures(this.get('creatures'));
    this.addUpdateTileCreaturesToCreatures(this.get('characters'));

    this.get('creatures').on('reset', this.addUpdateTileCreaturesToCreatures, this);
    this.get('creatures').on('add', this.addUpdateTileCreatures, this);
    this.get('creatures').on('remove', this.removeUpdateTileCreatures, this);
    this.get('characters').on('reset', this.addUpdateTileCreaturesToCreatures, this);
    this.get('characters').on('add', this.addUpdateTileCreatures, this);
    this.get('characters').on('remove', this.removeUpdateTileCreatures, this);
  },
  charactersWithinArea: function(area) {
    if (area instanceof Werld.Utils.Circle) {
      return(this.charactersWithinCircle(area));
    } else {
      throw new Error('Area type unknown');
    }
  },
  charactersWithinCircle: function(circle) {
    return(this.get('characters').filter(function(character) {
      return(circle.tilePointWithinArea(character.tileCoordinates()));
    }));
  },
  addUpdateTileCreatures: function(creature) {
    creature.on('change:tile', this.updateTileUnderCreatureCreatures, this);
  },
  removeUpdateTileCreatures: function(creature) {
    creature.off('change:tile', this.updateTileUnderCreatureCreatures, this);
  },
  updateTileUnderCreatureCreatures: function(creature) {
    var tile = this.get('map').getTileByTilePoint(creature.get('tile'));

    if (!tile) { return; }

    tile.get('creatures').add(creature);
  },
  addUpdateTileCreaturesToCreatures: function(collection) {
    collection.each(this.addUpdateTileCreatures, this);
  }
});
