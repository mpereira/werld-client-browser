Werld.Creatures = {
  CHARACTER: {
    MOVEMENT_SPEED: 2,
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    SPRITE: {
      SRC: '../images/sprite_sheets/characters/mage.png',
      DIMENSIONS: [40, 40],
      FREQUENCY: 0.25
    }
  },
  SILVER_BAT: {
    name: 'a silver bat',
    MOVEMENT_SPEED: 1,
    stats: {
      strength: 15,
      dexterity: 15,
      intelligence: 10
    },
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    ITEMS: {
      GOLD: [5, 10]
    },
    SPRITE: {
      SRC: '../images/sprite_sheets/creatures/silver_bat.png',
      DIMENSIONS: [40, 40],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  WHITE_WOLF: {
    name: 'a white wolf',
    MOVEMENT_SPEED: 1,
    stats: {
      strength: 30,
      dexterity: 30,
      intelligence: 10
    },
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    ITEMS: {
      GOLD: [15, 20]
    },
    SPRITE: {
      SRC: '../images/sprite_sheets/creatures/white_wolf.png',
      DIMENSIONS: [48, 48],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  FIRE_WOLF: {
    name: 'a fire wolf',
    MOVEMENT_SPEED: 1,
    stats: {
      strength: 40,
      dexterity: 50,
      intelligence: 20
    },
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    ITEMS: {
      GOLD: [30, 50]
    },
    SPRITE: {
      SRC: '../images/sprite_sheets/creatures/fire_wolf.png',
      DIMENSIONS: [48, 53],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  BLUE_DRAGON: {
    name: 'a blue dragon',
    MOVEMENT_SPEED: 2,
    stats: {
      strength: 200,
      dexterity: 200,
      intelligence: 200
    },
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    ITEMS: {
      GOLD: [500, 600]
    },
    SPRITE: {
      SRC: '../images/sprite_sheets/creatures/blue_dragon.png',
      DIMENSIONS: [96, 96],
      FRAMES: 4,
      FREQUENCY: 0.5
    }
  }
};
