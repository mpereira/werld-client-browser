Werld.Views.Backpack = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    this.image = this.options.image;
    this.bitmap = new Bitmap(this.image.SRC);

    var self = this;
    self.container.onPress = function(event) {
      Werld.util.bringToFront(self.container);
      var offset = [
        self.container.x - event.stageX,
        self.container.y - event.stageY
      ];

      event.onMouseMove = function(ev) {
        self.container.x = ev.stageX + offset[0];
        self.container.y = ev.stageY + offset[1];
      };
    };

    this.container.onMouseOver = function() {
      self.container.parent.getStage().canvas.style.cursor = 'pointer';
    };

    this.container.onMouseOut = function() {
      self.container.parent.getStage().canvas.style.cursor = '';
    };

    this.container.addChild(this.bitmap);

    this.container.x = 470;
    this.container.y = 270;
  }
});
