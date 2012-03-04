Werld.Views.Item = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;
    this.bitmap = new Bitmap(Werld.IMAGES.GOLD.IMAGE.SRC);
    this.container.addChild(this.bitmap);

    this.model.bind('destroy', this.onModelDestroy);

    this.bitmap.onDoubleClick = this.onContainerDoubleClick;
    this.bitmap.onPress = this.onContainerPress;
    this.bitmap.onMouseOut = this.onContainerMouseOut;
    this.bitmap.onMouseOver = this.onContainerMouseOver;
  },
  onModelDestroy: function(model) {
    this.container.parent.removeChild(this.container);
    delete this.bitmap.onDoubleClick;
    delete this.bitmap.onPress;
    delete this.bitmap.onMouseOut;
    delete this.bitmap.onMouseOver;
  },
  onContainerPress: function(event) {
    Werld.util.bringToFront(this.container.parent);
    if (event.nativeEvent.which === 1) {
      Werld.util.bringToFront(this.container);

      this.pressEventOffset = [
        this.container.x - event.stageX,
        this.container.y - event.stageY
      ];

      event.onMouseMove = this.onContainerMouseMove;
      event.onMouseUp = this.onContainerMouseUp;
    }
  },
  onContainerMouseMove: function(event) {
    this.container.x = event.stageX + this.pressEventOffset[0];
    this.container.y = event.stageY + this.pressEventOffset[1];
  },
  onContainerMouseUp: function(event) {
    /* FIXME: Getting the DisplayObject below the item's DisplayObject. Is
     *        there a better way to do this? */
    var targetDisplayObject =
      Werld.canvas.stage.getObjectsUnderPoint(event.stageX, event.stageY)[1];
    var targetView = targetDisplayObject.parent.view;
    var targetModel = targetView.model;

    if (targetView instanceof Werld.Views.Item) {
      if (targetModel.same(this.model) && targetModel.stackable()) {
        this.model.collection.remove(this.model);
        targetModel.merge(this.model);
      }
    } else if (targetView instanceof Werld.Views.Base.Container) {
      if (targetView !== this.container.parent.view) {
        this.model.collection.remove(this.model);
        targetModel.items.add(this.model);
      }
    }

  },
  onContainerMouseOver: function() {
    Werld.canvas.el.style.cursor = 'pointer';
  },
  onContainerMouseOut: function() {
    Werld.canvas.el.style.cursor = '';
  }
});
