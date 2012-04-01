Werld.Views.Base.Container = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.itemViews = [];
    this.container = new Container();
    this.container.view = this;

    this.model.items.bind('add', this.addItemView);
    this.model.items.bind('remove', this.removeItemView);

    this.model.items.each(this.addItemView);
  },
  addItemView: function(item) {
    var itemView = new Werld.Views.Item({ model: item });
    this.itemViews.push(itemView);
    this.container.addChild(itemView.container);
  },
  removeItemView: function(item) {
    var viewToBeRemoved = _(this.itemViews).find(function(itemView) {
      return(itemView.model === item);
    });
    this.itemViews = _(this.itemViews).without(viewToBeRemoved);
    this.container.removeChild(viewToBeRemoved.container);
  },
  handleItemDrop: function(item) {
    if (item.collection !== this.model.items) {
      item.collection.remove(item);
      this.model.items.add(item);
    }

    return(true);
  }
});
