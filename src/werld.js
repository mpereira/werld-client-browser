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
    'gumps',
    'itemTransfer',
    'gameMessages'
  ],
  STATES: {
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
        SRC: 'images/backpack.png'
      }
    },
    LOOT_CONTAINER: {
      IMAGE: {
        SRC: 'images/loot_container.png'
      }
    },
    GOLD: {
      IMAGE: {
        SRC: 'images/gold.png'
      }
    }
  },
  OBJECTS: {
    ALTAR: {
      IMAGE: {
        SRC: 'images/objects/altar.png'
      }
    }
  },
  Config: {
    AGGRESSIVENESS_RADIUS: 6,
    ALTAR_CHARACTER_RESURRECTION_OBSERVER_INTERVAL: 1000,
    RESPAWN_TIME: 60 * 1000,
    CORPSE_DECAY_TIME: 80 * 1000,
    FRAMES_PER_SECOND: 30,
    MESSAGE_LIFE_CYCLE: 5000,
    MESSAGE_SWEEPER_POLLING_INTERVAL: 1000,
    PIXELS_PER_TILE: 40,
    REGENERATION_RATE: 1000,
    SCREEN_DIMENSIONS: [16, 12],
    WORLD_MAP_DIMENSIONS: [50, 50]
  },
  frameRate: function() {
    return(Math.floor(1000 / Werld.Config.FRAMES_PER_SECOND));
  },
  switchState: function(state, params) {
    params || (params = {});

    if (Werld.state === Werld.STATES.INIT) {
      if (state === Werld.STATES.SPLASH_SCREEN) {
        Werld.state = Werld.STATES.SPLASH_SCREEN;
      }
    } else if (Werld.state === Werld.STATES.SPLASH_SCREEN) {
      if (state === Werld.STATES.CHOOSING_NAME) {
        var characterForm = new Werld.Views.CharacterForm({
          canvas: Werld.canvas
        });
        characterForm.render();
        Werld.state = Werld.STATES.CHOOSING_NAME;
      }
    } else if (Werld.state === Werld.STATES.CHOOSING_NAME) {
      if (state === Werld.STATES.GAME_STARTED) {
        Werld.stage.removeAllChildren();

        _(Werld.CONTAINER_NAMES).each(function(name) {
          Werld.containers[name] = new Container();
        });

        Werld.character = new Werld.Models.Character(
          _({
            coordinates: _([
              Math.floor(Werld.Config.SCREEN_DIMENSIONS[0] / 2),
              Math.floor(Werld.Config.SCREEN_DIMENSIONS[1] / 2)
            ]).map(function(coordinate) {
              return(coordinate * Werld.Config.PIXELS_PER_TILE);
            })
          }).extend(params.data.character, Werld.CREATURES.CHARACTER)
        );

        Werld.canvas.characterView = new Werld.Views.Character({
          model: Werld.character
        });

        Werld.canvas.statusBarView = new Werld.Views.StatusBar({
          model: Werld.character
        });

        Werld.canvas.backpackView = new Werld.Views.Backpack({
          model: Werld.character.backpack, image: Werld.IMAGES.BACKPACK.IMAGE
        });

        var silverBatSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.SILVER_BAT,
          coordinates: [4, 4],
          radius: 3,
          numberOfCreatures: 3
        });

        var whiteWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.WHITE_WOLF,
          coordinates: [15, 10],
          radius: 4,
          numberOfCreatures: 2
        });

        var fireWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.FIRE_WOLF,
          coordinates: [15, 15],
          radius: 4,
          numberOfCreatures: 2
        });

        var leviathanSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.LEVIATHAN,
          coordinates: [4, 15],
          radius: 4,
          numberOfCreatures: 1
        });

        var blueDragonSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.BLUE_DRAGON,
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

        Werld.altar = new Werld.Models.Altar(
          _.extend(Werld.OBJECTS.ALTAR, {
            coordinates: _([7, 8]).map(function(coordinate) {
              return(coordinate * Werld.Config.PIXELS_PER_TILE);
            })
          })
        );

        Werld.canvas.altarView = new Werld.Views.Altar({
          model: Werld.altar
        });

        new Werld.Views.MessageInputFormHandler();

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

        Werld.state = Werld.STATES.GAME_STARTED;
      }
    } else {
      if (state === Werld.STATES.INIT) {
        Werld.state = Werld.STATES.INIT;
      }
    }

    Werld.Utils.Callback.run(params.callback);
  },
  init: function() {
    // Disabling right click.
    $(window).contextmenu(function(event) { return(false); });

    Werld.switchState(Werld.STATES.INIT);

    Werld.canvas = new Werld.Canvas();
    Werld.stage = new Stage(Werld.canvas.el);
    Werld.stage.enableMouseOver();
    Ticker.useRAF = true;
    Ticker.setFPS(Werld.frameRate());
    Ticker.addListener(Werld.stage);

    var splashScreenView = new Werld.Views.SplashScreen();
    Werld.stage.addChild(splashScreenView.container);

    Werld.switchState(Werld.STATES.SPLASH_SCREEN);
  }
};

$(Werld.init);
