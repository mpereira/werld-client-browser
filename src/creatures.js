Werld.CREATURES = {
  CHARACTER: {
    baseDamageRange: [1, 4],
    MOVEMENT_SPEED: 2,
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    SPRITE: {
      SRC: 'images/sprite_sheets/characters/mage.png',
      DIMENSIONS: [40, 40],
      FREQUENCY: 0.25
    }
  },
  SILVER_BAT: {
    name: 'a silver bat',
    MOVEMENT_SPEED: 1,
    strength: 15,
    dexterity: 15,
    intelligence: 10,
    wrestling: 40,
    baseDamageRange: [2, 5],
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
      SRC: 'images/sprite_sheets/creatures/silver_bat.png',
      DIMENSIONS: [40, 40],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  WHITE_WOLF: {
    name: 'a white wolf',
    MOVEMENT_SPEED: 1,
    strength: 30,
    dexterity: 30,
    intelligence: 10,
    wrestling: 50,
    baseDamageRange: [5, 10],
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
      SRC: 'images/sprite_sheets/creatures/white_wolf.png',
      DIMENSIONS: [48, 48],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  FIRE_WOLF: {
    name: 'a fire wolf',
    MOVEMENT_SPEED: 1,
    strength: 40,
    dexterity: 50,
    intelligence: 20,
    wrestling: 60,
    baseDamageRange: [8, 15],
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
      SRC: 'images/sprite_sheets/creatures/fire_wolf.png',
      DIMENSIONS: [48, 53],
      FRAMES: 4,
      FREQUENCY: 0.25
    }
  },
  LEVIATHAN: {
    name: 'a leviathan',
    MOVEMENT_SPEED: 1,
    strength: 100,
    dexterity: 100,
    intelligence: 200,
    wrestling: 90,
    baseDamageRange: [15, 25],
    BOUNDARIES: {
      MAX_CRITICAL_HIT_CHANCE: 20,
      MAX_DEXTERITY: 125,
      MAX_STRENGHT: 125,
      MAX_INTELLIGENCE: 125
    },
    ITEMS: {
      GOLD: [300, 400]
    },
    SPRITE: {
      SRC: 'images/sprite_sheets/creatures/leviathan.png',
      DIMENSIONS: [96, 96],
      FRAMES: 4,
      FREQUENCY: 0.5
    }
  },
  BLUE_DRAGON: {
    name: 'a blue dragon',
    MOVEMENT_SPEED: 1,
    strength: 200,
    dexterity: 200,
    intelligence: 200,
    wrestling: 100,
    baseDamageRange: [20, 30],
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
      SRC: 'images/sprite_sheets/creatures/blue_dragon.png',
      DIMENSIONS: [96, 96],
      FRAMES: 4,
      FREQUENCY: 0.5
    }
  }
};
