Werld.Models.Character = Werld.Models.Base.Creature.extend({
  defaults: function() {
    return(_({
      cumulativeStatCap: 200,
      individualStatCap: 100,
      cumulativeSkillCap: 300,
      individualSkillCap: 100
    }).extend(Werld.Models.Character.__super__.defaults()));
  },
  initialize: function() {
    Werld.Models.Character.__super__.initialize.call(this);

    this.backpack = new Werld.Models.Backpack(_({
      owner: this
    }).extend(Werld.GUMPS.BACKPACK));

    this.items.each(function(item) { item.container = this.backpack }, this);

    this.on('hitAttempted', function() {
      this.maybeIncreaseCappedAttribute('strength');
    }, this);
    this.on('hitAttempted', function() {
      this.maybeIncreaseCappedAttribute('dexterity');
    }, this);
    this.on('hitAttempted', function() {
      this.maybeIncreaseCappedAttribute('swordsmanship');
    }, this);
    this.on('error', function(model, errors) {
      console.error({ model: model, errors: errors });
    });
  },
  statNames: ['strength', 'dexterity', 'intelligence'],
  skillNames: ['swordsmanship'],
  cappedAttributeTypes: function() {
    return(['stat', 'skill']);
  },
  cappedAttributeNames: function(options) {
    options || (options = {});

    return(this[options.type + 'Names']);
  },
  cappedAttributeType: function(cappedAttributeName) {
    var type;

    if (_(this.statNames).include(cappedAttributeName)) {
      type = 'stat';
    } else if (_(this.skillNames).include(cappedAttributeName)) {
      type = 'skill';
    } else {
      throw new Error('Capped attribute must be a stat or a skill');
    }

    return(type);
  },
  individualCappedAttributeCap: function(cappedAttributeName) {
    return(this.get('individual' +
                      _.capitalize(this.cappedAttributeType(cappedAttributeName)) +
                      'Cap'));
  },
  cumulativeCappedAttributeCap: function(options) {
    options || (options = {});

    if (!options.type) {
      throw new Error('Must be passed a type');
    }

    return(this.get('cumulative' + _.capitalize(options.type) + 'Cap'));
  },
  statIncreaseChance: function(statName) {
    var x = this.get(statName);

    return(0.03);
  },
  skillIncreaseChance: function(skillName) {
    var x = this.get(skillName);

    return(0.05);
  },
  cappedAttributeIncreaseChance: function(cappedAttributeName) {
    var cappedAttributeTypeIncreaseChanceMethodName =
      this.cappedAttributeType(cappedAttributeName) + 'IncreaseChance';

    return(this[cappedAttributeTypeIncreaseChanceMethodName](cappedAttributeName));
  },
  cumulativeCappedAttributePoints: function(options) {
    options || (options = {});

    if (!options.type) {
      throw new Error('Must be passed a type');
    }

    return(_(this[options.type + 'Names']).reduce(_(function(memo, cappedAttributeName) {
      return(memo + this.get(cappedAttributeName));
    }).bind(this), 0));
  },
  statIncrement: function(statName) {
    return(1);
  },
  skillIncrement: function(skillName) {
    return(0.1);
  },
  incrementCappedAttribute: function(cappedAttributeName) {
    var incrementMethodName =
      this.cappedAttributeType(cappedAttributeName) + 'Increment';
    var increment = this[incrementMethodName](cappedAttributeName);

    this.normalizedSet(cappedAttributeName, this.get(cappedAttributeName) + increment);
  },
  maybeIncreaseCappedAttribute: function(cappedAttributeName) {
    if (this.get(cappedAttributeName) >=
          this.individualCappedAttributeCap(cappedAttributeName)) {
      return;
    }

    if (this.cumulativeCappedAttributePoints({
          type: this.cappedAttributeType(cappedAttributeName)
        }) >=
          this.cumulativeCappedAttributeCap({
            type: this.cappedAttributeType(cappedAttributeName)
          })) {
      return;
    }

    if (this.cappedAttributeIncreaseChance(cappedAttributeName) >
          Math.random()) {
      this.incrementCappedAttribute(cappedAttributeName);
    }
  },
  validateCappedAttributes: function(attributes, errors) {
    _(this.cappedAttributeTypes()).each(_(function(cappedAttributeType) {
      if (this.cumulativeCappedAttributePoints({ type: cappedAttributeType }) >
            this.cumulativeCappedAttributeCap({ type: cappedAttributeType })) {
        errors.base = 'can\'t exceed cumulative ' + cappedAttributeType + ' cap';
      }

      _(this.cappedAttributeNames({ type: cappedAttributeType })).each(_(function(cappedAttributeName) {
        if (attributes[cappedAttributeName] > this.individualCappedAttributeCap(cappedAttributeName)) {
          errors[cappedAttributeName] = 'can\'t exceed individual ' + cappedAttributeType + ' cap';
        }
      }).bind(this));
    }).bind(this));
  },
  validate: function(attributes) {
    var errors = {};

    this.validateCappedAttributes(attributes, errors);

    if (!_.isEmpty(errors)) { return(errors); }
  }
});
