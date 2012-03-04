Werld.Views.Base.Container = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.itemViews = [];
    this.container = new Container();
    this.container.view = this;

    this.model.items.bind('add', this.addItem);
    this.model.items.bind('remove', this.removeItem);
  },
  addItem: function(item) {
    var itemView = new Werld.Views.Item({ model: item });
    this.itemViews.push(itemView);
    this.container.addChild(itemView.container);
  },
  removeItem: function(item) {
    var viewToBeRemoved = _(this.itemViews).find(function(itemView) {
      return(itemView.model === item);
    });
    this.itemViews = _(this.itemViews).without(viewToBeRemoved);
    this.container.removeChild(viewToBeRemoved.container);
  }
});
