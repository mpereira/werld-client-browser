var Werld = {
  Views: {},
  Models: {},
  Util: {},
  States: {
    SPLASH_SCREEN: 1,
    CHOOSING_NAME: 2,
    GAME_STARTED: 3
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
  init: function() {
    this.loadSounds();
    this.canvas.init();
  }
};

window.onload = Werld.init.bind(Werld);
