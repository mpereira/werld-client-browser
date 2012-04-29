Werld.Views.CharacterStatInputs = Backbone.View.extend({
  el: '#character-stat-inputs-wrapper',
  initialize: function() {
    _.bindAll(this);

    $(this.el).css('width', this.options.width);
    $(this.el).css('height', this.options.height);

    var setValue = function(valueSelector, inputSelector, context) {
      $(valueSelector, context.el).html($(inputSelector, context.el).val());
    };

    var self = this;
    _(['strength', 'dexterity', 'intelligence']).each(function(attribute) {
      var valueSelector = '#character-stat-inputs-' + attribute + '-value';
      var inputSelector = '#character-stat-inputs-' + attribute + '-input';
      setValue(valueSelector, inputSelector, self);
      $(inputSelector, this.el).change(function() {
        setValue(valueSelector, inputSelector, self);
      });
    });
  },
  render: function() {
    $(this.el).show();
  }
});
