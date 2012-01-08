Werld.Views.CharacterNameInputForm = Linchpin.DomView.extend({
  el: '#character-name-input-form',
  initialize: function() {
    $(this.el).bind('submit', this.submit.bind(this));
  },
  render: function() {
    $(this.el).show();
    $('input', this.el).focus();
  },
  submit: function() {
    clearInterval(Werld.canvas.interval);
    Werld.character = new Werld.Models.Character({
      name: $('#character-name-input', this.el).val(), coordinates: [5, 5]
    });
    Werld.canvas.characterView = new Werld.Views.Character(Werld.character);
    window.addEventListener('keydown', Werld.canvas.keyboardHandler.bind(Werld.canvas), false);
    Werld.canvas.interval = setInterval(Werld.canvas.drawGameScreen.bind(Werld.canvas), Werld.canvas.FRAME_RATE);
    Werld.canvas.drawGameScreen();

    $('input', this.el).val('').blur();;
    $(this.el).hide();
    return(false);
  }
});
