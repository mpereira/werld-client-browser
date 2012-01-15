Werld.Models.Tile = Backbone.Model.extend({
  initialize: function(params) {
    this.type = params.type;
    this.coordinates = params.coordinates;
  }
});
