Werld.Models.Tile = Backbone.Model.extend({
  initialize: function() {
    if (!this.get('items')) {
      this.set({ items: new Werld.Collections.Items() });
    }
    this.items = this.get('items');
  }
});
