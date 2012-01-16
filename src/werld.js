var Werld = {
  Views: {},
  Models: {},
  Util: {},
  States: {
    INIT: 1,
    SPLASH_SCREEN: 2,
    CHOOSING_NAME: 3,
    GAME_STARTED: 4
  },
  Config: {
    WORLD_MAP_WIDTH: 20,
    WORLD_MAP_HEIGHT: 20,
    SCREEN_WIDTH: 16,
    SCREEN_HEIGHT: 12,
    MESSAGE_LIFE_CYCLE: 5000,
    CHARACTER_MOVEMENT_SPEED: 4,
    PIXELS_PER_TILE: 40,
    FRAMES_PER_SECOND: 20,
    FRAME_RATE: function() {
      return(Math.floor(1000 / Werld.Config.FRAMES_PER_SECOND));
    }
  },
  account: {
    provider: {}
  },
  sounds: {
    music: {
      ogg: '../sounds/music.ogg',
      mp3: '../sounds/music.mp3',
      wav: '../sounds/music.wav'
    }
  },
  setAccount: function(providerName, apiResponse) {
    this.account.name = apiResponse.name;
    this.account.email = apiResponse.email;
    this.account.provider.id = apiResponse.id;
    this.account.provider.name = providerName;
  },
  loadSounds: function() {
    var music = document.createElement('audio');
    var supportedType;

    if (music.canPlayType('audio/mp3')) {
      supportedType = 'mp3';
    } else if (music.canPlayType('audio/wav')) {
      supportedType = 'wav';
    } else if (music.canPlayType('audio/ogg')) {
      supportedType = 'ogg';
    }

    if (supportedType) {
      document.body.appendChild(music);
      music.setAttribute('src', this.sounds.music[supportedType]);
      //music.addEventListener('canplay', music.play, false);
    }
  },
  messageInputForm: function() {
    if (!this.messageInputView) {
     this.messageInputView = new Werld.Views.MessageInputForm();
    }
    return(this.messageInputView);
  },
  switchState: function(state, data) {
    if (Werld.state === Werld.States.INIT) {
      if (state === Werld.States.SPLASH_SCREEN) {
        $(Werld.canvas.el).mousemove(
          _.bind(Werld.canvas.mouseMoveHandler, Werld.canvas)
        );

        $(Werld.canvas.el).mouseup(
          _.bind(Werld.canvas.mouseClickHandler, Werld.canvas)
        );

        $(window).contextmenu(function() {
          return(false);
        });

        clearInterval(Werld.canvas.interval);
        Werld.canvas.interval = setInterval(
          _.bind(Werld.canvas.drawSplashScreen, Werld.canvas),
          Werld.Config.FRAME_RATE()
        );

        Werld.state = Werld.States.SPLASH_SCREEN;
      }
    } else if (Werld.state === Werld.States.SPLASH_SCREEN) {
      if (state === Werld.States.CHOOSING_NAME) {
        var characterNameInputForm = new Werld.Views.CharacterNameInputForm();
        characterNameInputForm.render();
        Werld.state = Werld.States.CHOOSING_NAME;
      }
    } else if (Werld.state === Werld.States.CHOOSING_NAME) {
      if (state === Werld.States.GAME_STARTED) {
        clearInterval(Werld.canvas.interval);

        Werld.character = new Werld.Models.Character({
          name: data.character.name,
          coordinates: [
            Math.floor(Werld.Config.SCREEN_WIDTH / 2),
            Math.floor(Werld.Config.SCREEN_HEIGHT / 2)
          ]
        });

        Werld.canvas.characterView = new Werld.Views.Character({
          model: Werld.character
        });

        var mapTiles = [];
        for (var i = 0; i < Werld.Config.WORLD_MAP_WIDTH; i++) {
          mapTiles[i] = [];
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

        Werld.canvas.screenView = new Werld.Views.Screen({
          model: Werld.screen
        });

        window.addEventListener(
          'keydown', _.bind(Werld.canvas.keyboardHandler, Werld.canvas), false
        );

        Werld.canvas.interval = setInterval(
          _.bind(Werld.canvas.drawGameScreen, Werld.canvas),
          Werld.Config.FRAME_RATE()
        );
        Werld.canvas.drawGameScreen();

        Werld.state = Werld.States.GAME_STARTED;
      }
    } else {
      if (state === Werld.States.INIT) {
        Werld.state = Werld.States.INIT;
      }
    }

  },
  init: function() {
    this.switchState(Werld.States.INIT);
    this.loadSounds();
    this.canvas.init();
  }
};

$(function() {
  Werld.init();
});
