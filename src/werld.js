var Werld = {
  Views: { Base: {} },
  Models: { Base: {} },
  Collections: {},
  containers: {},
  CONTAINER_NAMES: [
    'terrain',
    'objects',
    'creatures',
    'character',
    'gumps'
  ],
  States: {
    INIT: 1,
    SPLASH_SCREEN: 2,
    CHOOSING_NAME: 3,
    GAME_STARTED: 4
  },
  ITEMS: {
    GOLD: {
      name: 'Gold',
      stackable: true
    }
  },
  IMAGES: {
    BACKPACK: {
      IMAGE: {
        SRC: '../images/backpack.png'
      }
    },
    LOOT_CONTAINER: {
      IMAGE: {
        SRC: '../images/loot_container.png'
      }
    },
    GOLD: {
      IMAGE: {
        SRC: '../images/gold.png'
      }
    }
  },
  Objects: {
    ALTAR: {
      IMAGE: {
        SRC: '../images/objects/altar.png'
      }
    }
  },
  Config: {
    AGGRESSIVENESS_RADIUS: 6,
    RESPAWN_TIME: 60 * 1000,
    CORPSE_DECAY_TIME: 80 * 1000,
    FRAMES_PER_SECOND: 30,
    FRAME_RATE: function() {
      return(Math.floor(1000 / Werld.Config.FRAMES_PER_SECOND));
    },
    MESSAGE_LIFE_CYCLE: 5000,
    MESSAGE_SWEEPER_POLLING_INTERVAL: 1000,
    PIXELS_PER_TILE: 40,
    REGENERATION_RATE: 1000,
    SCREEN_DIMENSIONS: [16, 12],
    WORLD_MAP_DIMENSIONS: [50, 50]
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
  keyboardHandler: function(event) {
    if (Werld.state === Werld.States.GAME_STARTED) {
      if (event.keyCode === 13) {
        Werld.messageInputForm().showOrSubmit(event);
      }
    }
  },
  messageInputForm: function() {
    if (!this.messageInputView) {
     this.messageInputView = new Werld.Views.MessageInputForm();
    }
    return(this.messageInputView);
  },
  switchState: function(state, params) {
    if (Werld.state === Werld.States.INIT) {
      if (state === Werld.States.SPLASH_SCREEN) {
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
        Werld.stage.removeAllChildren();

        Werld.character = new Werld.Models.Character(
          _.extend(Werld.Creatures.CHARACTER, {
            fixed: true,
            name: params.data.character.name,
            stats: {
              strength: 20,
              dexterity: 20,
              intelligence: 10
            },
            coordinates: _([
              Math.floor(Werld.Config.SCREEN_DIMENSIONS[0] / 2),
              Math.floor(Werld.Config.SCREEN_DIMENSIONS[1] / 2)
            ]).map(function(coordinate) {
              return(coordinate * Werld.Config.PIXELS_PER_TILE);
            })
          })
        );

        Werld.canvas.characterView = new Werld.Views.Character({
          model: Werld.character
        });

        Werld.altar = new Werld.Models.Altar(
          _.extend(Werld.Objects.ALTAR, {
            coordinates: _([7, 8]).map(function(coordinate) {
              return(coordinate * Werld.Config.PIXELS_PER_TILE);
            })
          })
        );

        Werld.canvas.altarView = new Werld.Views.Altar({
          model: Werld.altar
        });

        Werld.canvas.statusBarView = new Werld.Views.StatusBar({
          model: Werld.character
        });

        Werld.canvas.backpackView = new Werld.Views.Backpack({
          model: Werld.character.backpack, image: Werld.IMAGES.BACKPACK.IMAGE
        });

        var silverBatSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.Creatures.SILVER_BAT,
          coordinates: [4, 4],
          radius: 3,
          numberOfCreatures: 3
        });

        var whiteWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.Creatures.WHITE_WOLF,
          coordinates: [15, 10],
          radius: 4,
          numberOfCreatures: 2
        });

        var fireWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.Creatures.FIRE_WOLF,
          coordinates: [15, 15],
          radius: 4,
          numberOfCreatures: 2
        });

        var leviathanSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.Creatures.LEVIATHAN,
          coordinates: [4, 15],
          radius: 4,
          numberOfCreatures: 1
        });

        var blueDragonSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.Creatures.BLUE_DRAGON,
          coordinates: [4, 10],
          radius: 4,
          numberOfCreatures: 1
        });

        Werld.creatureSpawners = new Werld.Collections.CreatureSpawners([
          silverBatSpawner,
          whiteWolfSpawner,
          fireWolfSpawner,
          leviathanSpawner,
          blueDragonSpawner
        ]);

        Werld.map = new Werld.Models.Map();

        Werld.screen = new Werld.Models.Screen({
          map: Werld.map,
          character: Werld.character,
          dimensions: Werld.Config.SCREEN_DIMENSIONS,
          coordinates: [0, 0]
        });

        Werld.canvas.screenView = new Werld.Views.Screen({
          model: Werld.screen
        });

        $(window).keypress(Werld.keyboardHandler);

        _(Werld.CONTAINER_NAMES).each(function(name) {
          Werld.containers[name] = new Container();
        });

        Werld.containers.terrain.addChild(Werld.canvas.screenView.container);
        Werld.containers.objects.addChild(Werld.canvas.altarView.container);
        Werld.containers.character.addChild(Werld.canvas.characterView.container);
        Werld.creatureSpawners.activateAll();

        Werld.containers.gumps.addChild(Werld.canvas.statusBarView.container);
        Werld.containers.gumps.addChild(Werld.canvas.backpackView.container);
        Werld.containers.gumps.screen = Werld.screen;

        _.chain(Werld.containers).values().each(function(container) {
          Werld.stage.addChild(container);
        });

        Werld.state = Werld.States.GAME_STARTED;
      }
    } else {
      if (state === Werld.States.INIT) {
        Werld.state = Werld.States.INIT;
      }
    }
    params && params.callback && params.callback();
  },
  init: function() {
    $(window).contextmenu(function() { return(false); });

    Werld.switchState(Werld.States.INIT);
    Werld.loadSounds();

    Werld.canvas = new Werld.Canvas();

    Werld.stage = new Stage(Werld.canvas.el);
    Werld.stage.enableMouseOver();
    Ticker.addListener(Werld.stage);
    Ticker.setFPS(Werld.Config.FRAME_RATE());

    var splashScreenView = new Werld.Views.SplashScreen();
    Werld.stage.addChild(splashScreenView.container);

    Werld.switchState(Werld.States.SPLASH_SCREEN);
  }
};

$(function() {
  Werld.init();
});
