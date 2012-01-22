Werld.Models.Map =  Backbone.Model.extend({
  initialize: function() {
    this.set({
      dimensions: [
        this.get('tiles').length,
        this.get('tiles')[0].length
      ]
    });
  }
});
