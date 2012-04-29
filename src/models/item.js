Werld.Models.Item = Backbone.Model.extend({
  initialize: function() {
    if (this.get('container')) {
      this.container = this.get('container');
      this.unset('container', { silent: true });
    }
  },
  stackable: function() {
    return(this.get('stackable'));
  },
  same: function(item) {
    return(this.get('name') === item.get('name'));
  },
  merge: function(item) {
    this.set('quantity', this.get('quantity') + item.get('quantity'));
  },
  transfer: function(container) {
    this.container = container;
  },
  destroy: function() {
    this.trigger('destroy', this);
  },
  coordinates: function() {
    return(this.container.coordinates());
  }
});
