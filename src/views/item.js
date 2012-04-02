Werld.Views.Item = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;
    this.bitmap = new Bitmap(Werld.IMAGES.GOLD.IMAGE.SRC);
    this.container.addChild(this.bitmap);

    this.tooltipView = new Werld.Views.Tooltip({
      model: this.model, observedProperties: ['quantity'], output: function() {
        return(this.model.get('quantity'));
      }
    });
    this.container.addChild(this.tooltipView.container);

    this.model.bind('destroy', this.onModelDestroy);

    // TODO: maybe we could create an abstraction for these, e.g.:
    //       _(this.bitmap).extend(Werld.Mixins.Draggable); */
    this.bitmap.onDoubleClick = this.onBitmapDoubleClick;
    this.bitmap.onPress = this.onBitmapPress;
    this.bitmap.onMouseOut = this.onBitmapMouseOut;
    this.bitmap.onMouseOver = this.onBitmapMouseOver;
  },
  onModelDestroy: function(model) {
    this.container.parent.removeChild(this.container);
    // TODO: maybe we could create an abstraction for these, e.g.:
    //       this.bitmap.destroy(); */
    delete this.bitmap.onDoubleClick;
    delete this.bitmap.onPress;
    delete this.bitmap.onMouseOut;
    delete this.bitmap.onMouseOver;
  },
  onBitmapPress: function(event) {
    if (event.nativeEvent.which === 1) {
      Werld.util.bringToFront(this.container);

      this.coordinatesOnPress = [this.container.x, this.container.y];
      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      if (Werld.character.tileDistance(this.model) <= 1) {
        Werld.containers.itemTransfer.x = this.container.parent.x;
        Werld.containers.itemTransfer.y = this.container.parent.y;
        this.container.parentBeforePress = this.container.parent;
        this.container.parent.removeChild(this.container);
        Werld.containers.itemTransfer.addChild(this.container);

        event.onMouseMove = this.onBitmapMouseMove;
        event.onMouseUp = this.onBitmapMouseUp;
      }
    }
  },
  onBitmapMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  handleItemDrop: function(item) {
    if (this.model.same(item) && this.model.stackable()) {
      item.collection.remove(item);
      this.model.merge(item);
      return(true);
    } else {
      return(false);
    }
  },
  onBitmapMouseUp: function(event) {
    // Getting the DisplayObject below the item's DisplayObject, which is
    // possibly the bitmap of a Werld container (loot container, backpack etc.)
    // on which we're dropping the item.
    //
    // Is there a better way to do this?
    var targetDisplayObject =
      Werld.stage.getObjectsUnderPoint(event.stageX, event.stageY)[1];
    var targetView = targetDisplayObject.parent.view;

    Werld.containers.itemTransfer.removeChild(this.container);
    this.container.parent = this.container.parentBeforePress;
    this.container.parent.addChild(this.container);
    delete this.container.parentBeforePress;

    // TODO: pass item transfer handling logic to models and have views only
    //       responding to events.
    if (Werld.Util.Callback.run(targetView.handleItemDrop, this.model)) {
      this.model.transfer(targetView.model);
    } else {
      this.cancelMovement();
    }
  },
  cancelMovement: function() {
    this.container.x = this.coordinatesOnPress[0];
    this.container.y = this.coordinatesOnPress[1];
  },
  onBitmapMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
    this.showToolTip();
  },
  onBitmapMouseOut: function() {
    Werld.canvas.el.style.cursor = '';
    this.hideToolTip();
  },
  showToolTip: function() {
    console.log('[ItemView][showToolTip]')
  },
  hideToolTip: function() {
    console.log('[ItemView][hideToolTip]')
  }
});
