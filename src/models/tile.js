Werld.Models.Tile = Werld.Models.Base.Container.extend({
  defaults: {
    highlightDuration: 2000
  },
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);

    _.bindAll(this, 'onCreatureAdd', 'onCreatureCoordinatesChange');

    this.has('creatures') || (this.set('creatures', new Werld.Collections.Creatures()));
    this.updateTile();

    this.on('change:coordinates', this.updateTile);

    this.get('creatures').on('add', this.onCreatureAdd);
  },
  updateTile: function(creature, value, options) {
    this.set(
      'tilePoint',
      Werld.Utils.Geometry.pixelPointToTilePoint(this.get('coordinates'))
    );
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
    return(!!this.get('walkable') && !this.get('creatures').anyAlive());
  },
  isHighlighted: function() {
    return(this.get('highlighted'));
  },
  highlight: function(options) {
    options || (options = {});

    this.set('highlighted', true);

    if (options.duration) {
      var unhighlight = _(this.unhighlight).bind(this);
      _(unhighlight).delay(options.duration || this.get('highlightDuration'));
    }
  },
  unhighlight: function() {
    this.set('highlighted', false);
  }
});
