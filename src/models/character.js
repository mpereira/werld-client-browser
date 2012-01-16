Werld.Models.Character = Backbone.Model.extend({
  initialize: function() {
    this.messages = new Werld.Util.Queue();
    this.set({ fixedCoordinates: this.get('coordinates') });
    $(this.messages).bind('add', this.messagesSweeper.bind(this));
    this.messagesSweeperIntervalId = setInterval(this.messagesSweeper.bind(this), 1000);
  },
  say: function(message) {
    var now = new Date();
    this.messages.enqueue({ content: message, created_at: now.getTime() });
    $(this.messages).trigger('add');
  },
  moveTo: function(coordinates) {
    var screenDestinationColumn = Math.floor(coordinates[0] / Werld.Config.PIXELS_PER_TILE);
    var screenDestinationRow = Math.floor(coordinates[1] / Werld.Config.PIXELS_PER_TILE);
    var columnOffset = screenDestinationColumn - this.get('fixedCoordinates')[0];
    var rowOffset = screenDestinationRow - this.get('fixedCoordinates')[1];

    this.set({
      destinationColumn: this.get('coordinates')[0] + columnOffset,
      destinationRow: this.get('coordinates')[1] + rowOffset
    });

    this.trigger('move');
  },
  messagesSweeper: function() {
    var now = new Date();
    this.messages.forEach(function(message) {
      if ((now.getTime() - message.created_at) > Werld.Config.MESSAGE_LIFE_CYCLE) {
        this.messages.dequeue();
      }
    }.bind(this));
  }
});
