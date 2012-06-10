Werld.Models.Character = Werld.Models.Base.Creature.extend({
  defaults: function() {
    return(_({
      cumulativeStatCap: '200',
      individualStatCap: '100'
    }).extend(Werld.Models.Character.__super__.defaults()));
  },
  initialize: function() {
    Werld.Models.Character.__super__.initialize.call(this);

    this.backpack = new Werld.Models.Backpack({
      owner: this
    });

    this.on('hitAttempted', this.maybeIncreaseStrength);
    this.on('hitAttempted', this.maybeIncreaseDexterity);
    this.on('error', function(model, errors) {
      console.error({ model: model, errors: errors });
    });
  },
  statIncreaseChance: function(statName) {
    var x = this.get(statName);

    return(0.05);
  },
  maybeIncreaseStat: function(statName) {
    if (this.statIncreaseChance(statName) > Math.random()) {
      this.incrementStat(statName);
    }
  },
  maybeIncreaseStrength: function() {
    this.maybeIncreaseStat('strength');
  },
  maybeIncreaseDexterity: function() {
    this.maybeIncreaseStat('dexterity');
  },
  validateStats: function(attributes, errors) {
    var statNames = ['strength', 'dexterity', 'intelligence'];

    var cumulativeStatPoints = _(statNames).reduce(function(memo, statName) {
      return(memo + attributes[statName]);
    }, 0);

    if (cumulativeStatPoints > this.get('cumulativeStatCap')) {
      errors.base = 'can\'t exceed cumulative stat cap';
    }

    var individualStatPoints =_(statNames).each(_(function(statName) {
      if (attributes[statName] > this.get('individualStatCap')) {
        errors[statName] = 'can\'t exceed individual stat cap'
      }
    }).bind(this));
  },
  validate: function(attributes) {
    var errors = {};

    this.validateStats(attributes, errors);

    if (!_.isEmpty(errors)) { return(errors); }
  },
});
