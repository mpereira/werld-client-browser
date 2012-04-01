Werld.Models.Item = Backbone.Model.extend({
  stackable: function() {
    return(this.get('stackable'));
  },
  same: function(item) {
    return(this.get('name') === item.get('name'));
  },
  merge: function(item) {
    this.set('quantity', this.get('quantity') + item.get('quantity'));
  },
  destroy: function() {
    this.trigger('destroy', this);
  }
});
