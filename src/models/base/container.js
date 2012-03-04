Werld.Models.Base.Container = Backbone.Model.extend({
  initialize: function() {
    this.owner = this.get('owner');
    this.items = this.owner.items;
  }
});
