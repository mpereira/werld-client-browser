Werld.Views.LootContainer = Backbone.View.extend({
  initialize: function() {
    this.container = new Container();
    this.bitmap = new Bitmap(Werld.IMAGES.LOOT_CONTAINER.IMAGE.SRC);

    var self = this;
    this.container.onPress = function(event) {
      if (event.nativeEvent.which === 1) {
        Werld.util.bringToFront(self.container);
        var offset = [
          self.container.x - event.stageX,
          self.container.y - event.stageY
        ];

        event.onMouseMove = function(ev) {
          self.container.x = ev.stageX + offset[0];
          self.container.y = ev.stageY + offset[1];
        };
      } else if (event.nativeEvent.which === 3) {
        self.container.visible = false;
      }
    };

    this.container.onMouseOver = function() {
      Werld.canvas.el.style.cursor = 'pointer';
    };

    this.container.onMouseOut = function() {
      Werld.canvas.el.style.cursor = '';
    };

    this.container.visible = false;
    this.container.alpha = 0.8;
    this.container.addChild(this.bitmap);
  },
  show: function() {
    this.container.visible = true;
  }
});
