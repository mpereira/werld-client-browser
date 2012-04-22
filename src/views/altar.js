Werld.Views.Altar = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;

    var bitmap = new Bitmap(this.model.get('IMAGE').SRC);
    this.container.addChild(bitmap);

    this.updateContainerOnScreenCoordinates();

    Werld.character.on(
      'change:coordinates',
      this.updateContainerOnScreenCoordinates
    );
  },
  updateContainerOnScreenCoordinates: function() {
    var onScreenCoordinates =
      Werld.screen.objectCoordinates(this.model);

    this.container.x = onScreenCoordinates[0];
    this.container.y = onScreenCoordinates[1];
  }
});
