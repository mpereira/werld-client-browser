Werld.Views.CharacterNameInput = Backbone.View.extend({
  el: '#character-name-input-wrapper',
  initialize: function() {
    $(this.el).css('width', this.options.width);
    $(this.el).css('height', this.options.height);
  },
  render: function() {
    $(this.el).show();
    $('input', this.el).focus();
  }
});
