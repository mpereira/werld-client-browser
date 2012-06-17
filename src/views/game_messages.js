Werld.Views.GameMessages = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = this.options.container;

    this.model.on(
      'change:strength change:dexterity change:intelligence',
      this.addStatChangeMessage
    );

    this.collection.on('add remove reset', this.render);
  },
  addSkillChangeMessage: function(model, value, options) {
    var body = 'Your skill in ' + key + ' has ' + varyString + ' by ' +
      statDifference + '. It is now ' + model.get(key) + '.';
  },
  addStatChangeMessage: function(model, value, options) {
    var changedStats = _(model.changed).pick(model.statNames);

    var messages = _(changedStats).reduce(function(memo, value, key, object) {
      var statDifference = model.get(key) - model.previous(key);
      var type;
      var varyString;

      if (statDifference > 0) {
        type = Werld.MESSAGE_TYPES.STAT_INCREASE;
        varyString = 'increased';
      } else if (statDifference < 0) {
        type = Werld.MESSAGE_TYPES.STAT_DECREASE;
        varyString = 'decreased';
      } else {
        return(memo);
      }

      var body = 'Your ' + key + ' has ' + varyString + ' by ' +
                   statDifference + '. It is now ' + model.get(key) + '.';

      var message = new Backbone.Model({
        type: type,
        body: body,
        created_at: Date.now()
      });

      return(memo.concat(message));
    }, []);

    this.collection.add(messages);
  },
  render: function() {
    this.container.removeAllChildren();

    var padding = { bottom: 10, left: 10 };
    var y = 480;

    this.collection.each(function(message, index, collection) {
      var text =
        new Text(message.get('body'), '18px "PowellAntique" serif', '#66cc00');
      text.textAlign = 'left';
      text.x = padding.left;
      text.y = y - (index * text.getMeasuredLineHeight() + padding.bottom);
      text.shadow = new Shadow('#000000', 1, 1, 0);
      this.container.addChild(text);
    }, this);

  }
});
