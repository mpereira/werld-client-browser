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
      name: $('#character-name-input', this.el).val(),
      coordinates: [
        Math.floor(Werld.Config.SCREEN_WIDTH / 2),
        Math.floor(Werld.Config.SCREEN_HEIGHT / 2)
      ]
    });
    Werld.canvas.characterView = new Werld.Views.Character({ model: Werld.character });
    var mapTiles = new Array();
    for (var i = 0; i < Werld.Config.WORLD_MAP_WIDTH; i++) {
      mapTiles[i] = new Array();
      for (var j = 0; j < Werld.Config.WORLD_MAP_HEIGHT; j++) {
        mapTiles[i][j] = new Werld.Models.Tile({
          type: (Math.random() > 0.75 ? 'dirt' : 'grass'), coordinates: [i, j]
        });
      }
    }
    Werld.map = new Werld.Models.Map({ tiles: mapTiles });
    Werld.screen = new Werld.Models.Screen({
      map: Werld.map,
      character: Werld.character,
      width: Werld.Config.SCREEN_WIDTH,
      height: Werld.Config.SCREEN_HEIGHT,
      coordinates: [0, 0]
    });
    Werld.canvas.screenView = new Werld.Views.Screen({ model: Werld.screen });
    window.addEventListener('keydown', Werld.canvas.keyboardHandler.bind(Werld.canvas), false);
    Werld.canvas.interval = setInterval(Werld.canvas.drawGameScreen.bind(Werld.canvas), Werld.Config.FRAME_RATE());
    Werld.canvas.drawGameScreen();

    $('input', this.el).val('').blur();
    $(this.el).hide();

    Werld.state = Werld.States.GAME_STARTED;

    return(false);
  }
});
