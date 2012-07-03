Werld.Text = function(object) {
  Text.apply(this, [object.TEXT, object.FONT, object.COLOR]);

  _(['textAlign', 'shadow', 'textBaseline']).each(function(property, index, array) {
    this[property] = object[_.underscored(property).toUpperCase()];
  }, this);
};

Werld.Text.prototype = new Text();
Werld.Text.prototype.constructor = Werld.Text;
