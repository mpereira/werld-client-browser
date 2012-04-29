Werld.Views.Tooltip = Backbone.View.extend({
  initialize: function() {
    this.output = this.options.output;
    _.bindAll(this);

    this.container = new Container();
    this.container.view = this;
    this.container.x = Werld.Config.PIXELS_PER_TILE * 0.7;
    this.container.y = Werld.Config.PIXELS_PER_TILE * 0.6;

    _(this.options.observedProperties).each(this.bindObservedPropertyToUpdate);

    this.createDisplayObjects();
  },
  bindObservedPropertyToUpdate: function(observedProperty) {
    this.model.bind('change:' + observedProperty, this.update);
  },
  update: function() {
    this.text.text = this.output();
    this.rectangle.width =
      this.text.getMeasuredWidth() + this.padding.right + this.padding.left;
    this.rectangle.height =
      this.text.getMeasuredLineHeight() + this.padding.top + this.padding.bottom;
    this.drawRectangle();
  },
  drawRectangle: function() {
    this.rectangleGraphics.
      clear().
      beginFill('#000').
      drawRoundRect(
        this.rectangle.x,
        this.rectangle.y,
        this.rectangle.width,
        this.rectangle.height,
        2
      ).
      endFill();
  },
  createDisplayObjects: function() {
    this.text = new Text(
      this.output(),
      'bold 8px sans serif',
      'white'
    );
    this.text.textBaseline = 'top';

    this.padding = { top: 2, right: 4, bottom: 2, left: 4 };

    this.rectangle = new Rectangle(
      - (this.padding.right + this.padding.left) / 2,
      - (this.padding.top + this.padding.bottom) / 2,
      this.text.getMeasuredWidth() + this.padding.right + this.padding.left,
      this.text.getMeasuredLineHeight() + this.padding.top + this.padding.bottom
    );

    this.rectangleGraphics = new Graphics();
    this.drawRectangle();

    this.rectangleGraphicsShape = new Shape(this.rectangleGraphics);

    this.container.addChild(this.rectangleGraphicsShape);
    this.container.addChild(this.text);
  }
});
