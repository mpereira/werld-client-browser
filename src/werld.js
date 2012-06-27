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
  MESSAGES: {
    STAT_INCREASE: {
      NAME: 'STAT_INCREASE',
      FONT: '18px "PowellAntique" serif',
      COLOR: '#66cc00'
    },
    STAT_DECREASE: {
      NAME: 'STAT_DECREASE',
      FONT: '18px "PowellAntique" serif',
      COLOR: '#66cc00'
    },
    SKILL_INCREASE: {
      NAME: 'SKILL_INCREASE',
      FONT: '18px "PowellAntique" serif',
      COLOR: '#05b8cc'
    },
    SKILL_DECREASE: {
      NAME: 'SKILL_DECREASE',
      FONT: '18px "PowellAntique" serif',
      COLOR: '#05b8cc'
    },
  },
  STATES: {
    INIT: 1,
    SPLASH_SCREEN: 2,
    CHOOSING_NAME: 3,
    GAME_STARTED: 4
  },
  SKILLS: {
    WRESTLING: {
      NAME: 'wrestling'
    },
    SWORDSMANSHIP: {
      NAME: 'swordsmanship'
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
    AGGRESSIVENESS_HANDLER_RATE: 2000,
    ALTAR_CHARACTER_RESURRECTION_OBSERVER_INTERVAL: 1000,
    RESPAWN_TIME: 60 * 1000,
    CORPSE_DECAY_TIME: 80 * 1000,
    FRAMES_PER_SECOND: 30,
    MAXIMUM_ATTACK_SPEED: 1.25,
    MAXIMUM_DAMAGE_BONUS_PERCENTAGE: 100,
    MAXIMUM_HIT_CHANCE_PERCENTAGE: 100,
    MESSAGE_LIFE_CYCLE: 5000,
    MESSAGE_SWEEPER_POLLING_INTERVAL: 1000,
    PIXELS_PER_TILE: 40,
    PROVOCABILITY: 0.3,
    REGENERATION_RATE: 1000,
    SCREEN_DIMENSIONS: [16, 12],
    STOP_ATTACKING_HANDLER_RATE: 500,
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
        var characterNameInputForm = new Werld.Views.CharacterNameInputForm();
        characterNameInputForm.render();
        Werld.state = Werld.STATES.CHOOSING_NAME;
      }
    } else if (Werld.state === Werld.STATES.CHOOSING_NAME) {
      if (state === Werld.STATES.GAME_STARTED) {
        Werld.stage.removeAllChildren();

        _(Werld.CONTAINER_NAMES).each(function(name) {
          Werld.containers[name] = new Container();
        });

        var shortSword = new Werld.Models.Item(Werld.ITEMS.SHORT_SWORD);

        Werld.character = new Werld.Models.Character(_({
          id: 1,
          name: params.data.character.name,
          strength: 20,
          dexterity: 20,
          intelligence: 10,
          swordsmanship: 50,
          items: new Werld.Collections.Items([shortSword]),
          coordinates: _([
            Math.floor(Werld.Config.SCREEN_DIMENSIONS[0] / 2),
            Math.floor(Werld.Config.SCREEN_DIMENSIONS[1] / 2)
          ]).map(Werld.Utils.Geometry.tilesToPixels)
        }).extend(Werld.CREATURES.CHARACTER));

        Werld.character.equip(shortSword);

        Werld.game = new Werld.Models.Game({ characters: [Werld.character] });

        Werld.canvas.characterView = new Werld.Views.Character({
          model: Werld.character
        });

        Werld.canvas.statusBarView = new Werld.Views.StatusBar({
          model: Werld.character
        });

        Werld.canvas.backpackView = new Werld.Views.Backpack({
          model: Werld.character.backpack
        });

        var silverBatSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.SILVER_BAT,
          tileCoordinates: [4, 4],
          tileRadius: 3,
          numberOfCreatures: 3
        });

        var whiteWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.WHITE_WOLF,
          tileCoordinates: [15, 10],
          tileRadius: 4,
          numberOfCreatures: 2
        });

        var fireWolfSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.FIRE_WOLF,
          tileCoordinates: [15, 15],
          tileRadius: 4,
          numberOfCreatures: 2
        });

        var leviathanSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.LEVIATHAN,
          tileCoordinates: [4, 15],
          tileRadius: 4,
          numberOfCreatures: 1
        });

        var blueDragonSpawner = new Werld.Models.CreatureSpawner({
          creature: Werld.CREATURES.BLUE_DRAGON,
          tileCoordinates: [4, 10],
          tileRadius: 4,
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

        new Werld.Views.GameMessages({
          model: Werld.character,
          collection: new Werld.Collections.EphemeralMessages(null, {
            lifetime: 7000
          }),
          container: Werld.containers.gameMessages
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
    Werld.switchState(Werld.STATES.INIT);

    Werld.canvas = new Werld.Canvas();
    Werld.stage = new Stage(Werld.canvas.el);
    Werld.stage.enableMouseOver();
    Ticker.useRAF = true;
    Ticker.setFPS(Werld.Config.FRAMES_PER_SECOND);

    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'fixed';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

    Ticker.addListener({
      tick: function() {
        stats.begin();
        Werld.stage.tick();
        stats.end();
      }
    });

    var splashScreenView = new Werld.Views.SplashScreen();
    Werld.stage.addChild(splashScreenView.container);

    Werld.switchState(Werld.STATES.SPLASH_SCREEN);
  }
};

$(Werld.init);
