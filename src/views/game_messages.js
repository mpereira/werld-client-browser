Werld.Views.GameMessages = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = this.options.container;

    this.model.on(
      'change:strength change:dexterity change:intelligence',
      this.addCharacterStatChangeMessage
    );

    this.model.on('change:swordsmanship', this.addCharacterSkillChangeMessage);

    this.collection.on('add remove reset', this.render);
  },
  addCharacterStatChangeMessage: function(character, value, options) {
    var statName = _.keys(options.changes)[0];
    var statDifference = character.get(statName) - character.previous(statName);
    var varyString;

    if (statDifference > 0) {
      varyString = 'increased';
    } else if (statDifference < 0) {
      varyString = 'decreased';
    }

    var message = 'Your ' + statName + ' has ' + varyString + ' by ' +
                    statDifference + '. It is now ' +
                    character.get(statName) + '.';

    this.addCharacterAttributeChangeMessage(
      statName,
      statDifference,
      { message: message, type: 'stat' }
    );
  },
  addCharacterSkillChangeMessage: function(character, value, options) {
    var skillName = _.keys(options.changes)[0];
    var skillDifference = character.get(skillName) - character.previous(skillName);
    var varyString;

    if (skillDifference > 0) {
      varyString = 'increased';
    } else if (skillDifference < 0) {
      varyString = 'decreased';
    }

    var message = 'Your skill in ' + skillName + ' has ' + varyString +
                    ' by ' + skillDifference.toFixed(1) + '. It is now ' +
                    character.get(skillName).toFixed(1) + '.';

    this.addCharacterAttributeChangeMessage(
      skillName,
      skillDifference,
      { message: message, type: 'skill' }
    );
  },
  addCharacterAttributeChangeMessage: function(attributeName, attributeDifference, options) {
    var typeSuffix;

    if (attributeDifference > 0) {
      typeSuffix = '_INCREASE';
    } else if (attributeDifference < 0) {
      typeSuffix = '_DECREASE';
    }

    var message = new Backbone.Model({
      type: Werld.MESSAGES[(options.type || attributeName).toUpperCase() + typeSuffix].NAME,
      body: options.message,
      created_at: Date.now()
    });

    this.collection.add(message);
  },
  render: function() {
    this.container.removeAllChildren();

    var padding = { bottom: 10, left: 10 };
    var y = 480;

    this.collection.each(function(message, index, collection) {
      var text = new Text(
                   message.get('body'),
                   Werld.MESSAGES[message.get('type')].FONT,
                   Werld.MESSAGES[message.get('type')].COLOR
                 );
      text.textAlign = 'left';
      text.x = padding.left;
      text.y = y - (index * text.getMeasuredLineHeight() + padding.bottom);
      text.shadow = new Shadow('#000000', 1, 1, 0);
      this.container.addChild(text);
    }, this);

  }
});
