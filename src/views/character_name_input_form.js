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
    clearInterval(Werld.canvas.interval);
    Werld.character = new Werld.Models.Character({
      name: $('#character-name-input', this.el).val(), coordinates: [5, 5]
    });
    Werld.canvas.characterView = new Werld.Views.Character(Werld.character);
    var mapTiles = new Array();
    for (var i = 0; i < 100; i++) {
      mapTiles[i] = new Array();
      for (var j = 0; j < 100; j++) {
        mapTiles[i][j] = new Werld.Models.Tile({
          type: (Math.random() > 0.75 ? 'dirt' : 'grass'), coordinates: [i * 40, j * 40]
        });
      }
    }
    Werld.map = new Werld.Models.Map({
      tiles: mapTiles, character: Werld.character
    });
    Werld.canvas.mapView = new Werld.Views.Map({ model: Werld.map });
    window.addEventListener('keydown', Werld.canvas.keyboardHandler.bind(Werld.canvas), false);
    Werld.canvas.interval = setInterval(Werld.canvas.drawGameScreen.bind(Werld.canvas), Werld.Config.FRAME_RATE());
    Werld.canvas.drawGameScreen();

    $('input', this.el).val('').blur();;
    $(this.el).hide();

    Werld.state = Werld.States.GAME_STARTED;

    return(false);
  }
});
