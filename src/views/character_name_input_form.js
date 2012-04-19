Werld.Views.CharacterNameInputForm = Backbone.View.extend({
  el: '#character-name-input-form',
  initialize: function() {
    $(this.el).bind('submit', _.bind(this.submit, this));
  },
  render: function() {
    $(this.el).show();
    $('input', this.el).focus();
  },
  submit: function() {
    Werld.switchState(Werld.STATES.GAME_STARTED, {
      data: {
        character: { name: $('#character-name-input', this.el).val() }
      }
    });

    $('input', this.el).val('').blur();
    $(this.el).hide();

    return(false);
  }
});
