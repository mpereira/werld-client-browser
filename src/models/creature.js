Werld.Models.Creature = Backbone.Model.extend({
  initialize: function() {
    var type = this.get('type');
    this.set({
      name: type.NAME,
      hitPoints: type.HIT_POINTS,
      messages: [],
      destination: _.clone(this.get('coordinates'))
    });
    this.messagesSweeperIntervalId = setInterval(
      _.bind(this.messagesSweeper, this),
      Werld.Config.CREATURE_MESSAGE_SWEEPER_POLLING_INTERVAL
    );
    this.movementHandlerIntervalId = setInterval(
      _.bind(this.movementHandler, this), Werld.Config.FRAME_RATE()
    );
  },
  say: function(message) {
    var now = new Date();
    var messages = this.get('messages');

    messages.unshift({
      type: 'speech', content: message, created_at: now.getTime()
    });
    this.set({ messages: messages });
  },
  move: function(mapDestinationTile) {
    if (mapDestinationTile[0] < 0) {
      mapDestinationTile[0] = 0;
    } else if (mapDestinationTile[0] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      mapDestinationTile[0] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    if (mapDestinationTile[1] < 0) {
      mapDestinationTile[1] = 0;
    } else if (mapDestinationTile[1] >= Werld.Config.WORLD_MAP_DIMENSIONS[0]) {
      mapDestinationTile[1] = Werld.Config.WORLD_MAP_DIMENSIONS[1] - 1;
    }

    this.set({
      destination: _(mapDestinationTile).map(function(column) {
        return(Werld.util.tileToPixel(column));
      })
    });
  },
  movementHandler: function() {
    var coordinates = this.get('coordinates');
    var destination = this.get('destination');
    var type = this.get('type');

    if (coordinates[0] > destination[0]) {
      coordinates[0] -= type.MOVEMENT_SPEED;
    } else if (coordinates[0] < destination[0]) {
      coordinates[0] += type.MOVEMENT_SPEED;
    }

    if (coordinates[1] > destination[1]) {
      coordinates[1] -= type.MOVEMENT_SPEED;
    } else if (coordinates[1] < destination[1]) {
      coordinates[1] += type.MOVEMENT_SPEED;
    }

    this.set({ coordinates: coordinates });
    /* TODO: figure out why set() isn't triggering the change event and remove
     *       this hack. */
    this.trigger('change:coordinates');
  },
  receiveHit: function(damage) {
    var now = new Date();
    var messages = this.get('messages');

    this.set({ hitPoints: this.get('hitPoints') - damage });
    messages.unshift({
      type: 'hit', content: damage, created_at: now.getTime()
    });
    this.set({ messages: messages });
  },
  messagesSweeper: function() {
    var now = new Date();
    var self = this;
    _(this.get('messages')).each(function(message) {
      if ((now.getTime() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        var messages = self.get('messages');
        messages.pop();
        self.set({ messages: messages });
      }
    });
  }
});
