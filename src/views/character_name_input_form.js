Werld.Views.CharacterNameInputForm = Backbone.View.extend({
  el: '#character-name-input-form',
  initialize: function() {
    $(this.el).bind('submit', this.submit.bind(this));
  },
  render: function() {
    $(this.el).show();
    $('input', this.el).focus();
  },
  submit: function() {
    Werld.switchState(Werld.States.GAME_STARTED, {
      character: { name: $('#character-name-input', this.el).val() }
    });

    $('input', this.el).val('').blur();
    $(this.el).hide();

    return(false);
  }
});
