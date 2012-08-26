Werld.Models.Tile = Werld.Models.Base.Container.extend({
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);

    _.bindAll(this, 'onCreatureAdd', 'onCreatureCoordinatesChange');

    this.has('creatures') || (this.set('creatures', new Werld.Collections.Creatures()));

    this.get('creatures').on('add', this.onCreatureAdd);
  },
  onCreatureAdd: function(creature, creatures) {
    creature.on('change:coordinates', this.onCreatureCoordinatesChange);
  },
  onCreatureCoordinatesChange: function(creature, value, options) {
    var tile = this;

    if (!creature.isSteppingOnTile(tile)) {
      tile.get('creatures').remove(creature);
      creature.off('change:coordinates', this.onCreatureCoordinatesChange);
    }
  },
  coordinates: function() {
    return(this.get('coordinates'));
  },
  isCurrentlyWalkable: function() {
    return(this.get('walkable') && !this.get('creatures').anyAlive());
  }
});
