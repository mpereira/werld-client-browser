Werld.Models.Character = Backbone.Model.extend({
  initialize: function() {
    this.messages = new Werld.Util.Queue();
    this.set({ fixedCoordinates: this.get('coordinates') });
    $(this.messages).bind('add', this.messagesSweeper.bind(this));
    this.messagesSweeperIntervalId = setInterval(
      _.bind(this.messagesSweeper, this), 1000
    );
  },
  say: function(message) {
    var now = new Date();
    this.messages.enqueue({ content: message, created_at: now.getTime() });
    $(this.messages).trigger('add');
  },
  moveTo: function(coordinates) {
    var screenDestinationColumn =
      Math.floor(coordinates[0] / Werld.Config.PIXELS_PER_TILE);
    var screenDestinationRow =
      Math.floor(coordinates[1] / Werld.Config.PIXELS_PER_TILE);
    var columnOffset = screenDestinationColumn - this.get('fixedCoordinates')[0];
    var rowOffset = screenDestinationRow - this.get('fixedCoordinates')[1];
    var destinationColumn = this.get('coordinates')[0] + columnOffset;
    var destinationRow = this.get('coordinates')[1] + rowOffset;

    if (destinationColumn < 0) {
      destinationColumn = 0;
    } else if (destinationColumn >= Werld.Config.WORLD_MAP_WIDTH) {
      destinationColumn = Werld.Config.WORLD_MAP_WIDTH - 1;
    }

    if (destinationRow < 0) {
      destinationRow = 0;
    } else if (destinationRow >= Werld.Config.WORLD_MAP_HEIGHT) {
      destinationRow = Werld.Config.WORLD_MAP_HEIGHT - 1;
    }

    this.set({
      destinationColumn: destinationColumn,
      destinationRow: destinationRow
    });

    this.trigger('move');
  },
  messagesSweeper: function() {
    var now = new Date();
    var self = this;
    this.messages.forEach(function(message) {
      if ((now.getTime() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        self.messages.dequeue();
      }
    });
  }
});
