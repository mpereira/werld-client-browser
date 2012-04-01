Werld.Models.Base.Container = Backbone.Model.extend({
  initialize: function() {
    if (this.get('owner')) {
      this.owner = this.get('owner');
      this.unset('owner', { silent: true });

      if (this.owner.items) {
        this.items = this.owner.items;
      } else if (this.owner.get('items')) {
        this.items = this.owner.get('items');
      } else {
        this.items = new Werld.Collections.Items();
      }
    } else {
      if (this.get('items')) {
        this.items = this.get('items');
        this.unset('items', { silent: true });
      } else {
        this.items = new Werld.Collections.Items();
      }
    }
  }
});
