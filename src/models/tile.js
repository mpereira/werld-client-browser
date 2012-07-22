Werld.Models.Tile = Werld.Models.Base.Container.extend({
  coordinates: function() {
    return(this.get('coordinates'));
  },
  walkable: function() {
    return(this.get('type') === 'grass');
  },
});
