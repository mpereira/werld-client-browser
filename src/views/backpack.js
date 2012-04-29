Werld.Views.Backpack = Werld.Views.Base.Container.extend({
  initialize: function() {
    Werld.Views.Backpack.__super__.initialize.call(this);

    _.bindAll(this);

    this.bitmap = new Bitmap(this.options.image.SRC);
    this.bitmap.onPress = this.onBitmapPress;

    this.container.x = 470;
    this.container.y = 270;
    this.container.addChildAt(this.bitmap, 0);
  },
  onBitmapPress: function(event) {
    if (event.nativeEvent.which === 1) {
      Werld.Utils.Easel.bringDisplayObjectToFront(this.container);

      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onBitmapMouseMove;
    }
  },
  onBitmapMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onBitmapMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
  },
  onBitmapMouseOut: function() {
    Werld.canvas.el.style.cursor = '';
  }
});
