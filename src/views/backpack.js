Werld.Views.Backpack = Werld.Views.Base.Container.extend({
  initialize: function() {
    Werld.Views.Backpack.__super__.initialize.call(this);

    _.bindAll(this);

    this.bitmap = new Bitmap(this.options.image.SRC);

    this.bitmap.onPress = this.onContainerPress;

    this.container.x = 470;
    this.container.y = 270;

    this.container.addChild(this.bitmap);
    this.model.items.each(this.addItem);
  },
  onContainerPress: function(event) {
    if (event.nativeEvent.which === 1) {
      Werld.util.bringToFront(this.container);

      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onContainerMouseMove;
    }
  },
  onContainerMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onContainerMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
  },
  onContainerMouseOut: function() {
    Werld.canvas.el.style.cursor = '';
  },
});
