Werld.ITEM_TYPES = {
  WEAPON: {
    NAME: 'weapon'
  }
};

Werld.ITEMS = {
  SHORT_SWORD: {
    name: 'Short Sword',
    skill: Werld.SKILLS.SWORDSMANSHIP.NAME,
    type: Werld.ITEM_TYPES.WEAPON.NAME,
    speed: 5,
    baseDamageRange: [2, 5],
    equipable: true
  },
  GOLD: {
    name: 'Gold',
    stackable: true
  }
};
