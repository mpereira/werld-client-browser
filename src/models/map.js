Werld.Models.Map =  Backbone.Model.extend({
  initialize: function() {
    this.tiles = this.attributes.tiles;
    this.character = this.attributes.character;
  }
});
