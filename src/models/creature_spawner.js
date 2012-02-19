Werld.Models.CreatureSpawner = Backbone.Model.extend({
  defaults: {
    creatures: (new Werld.Collections.Creatures())
  },
  activate: function() {
    for (var i = 0; i < this.get('numberOfCreatures'); i++) {
      var creature = new Werld.Models.Creature(_({
        coordinates: (new Werld.Util.Circle({
          center: Werld.util.tilePointToPixelPoint(this.get('coordinates')),
          radius: Werld.util.tileToPixel(this.get('radius'))
        })).randomTile()
      }).extend(this.get('creature')));

      this.get('creatures').add(creature);
    }
  }
});
