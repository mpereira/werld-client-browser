Werld.Models.Character = function(params) {
  this.name = params.name;
  this.messages = new Werld.Util.Queue();
  this.x = params.coordinates[0];
  this.y = params.coordinates[1];
  $(this.messages).bind('add', this.messagesSweeper.bind(this));
  this.messagesSweeperIntervalId = setInterval(this.messagesSweeper.bind(this), 1000);
};

Werld.Models.Character.prototype = {
  move: function(direction) {
    switch(direction) {
    case 'up':
      this.y--;
      break;
    case 'down':
      this.y++;
      break;
    case 'left':
      this.x--;
      break;
    case 'right':
      this.x++
      break;
    }
    $(this).trigger('change');
  },
  say: function(message) {
    var now = new Date();
    this.messages.enqueue({ content: message, created_at: now.getSeconds() });
    $(this.messages).trigger('add');
  },
  messagesSweeper: function() {
    var now = new Date();
    this.messages.forEach(function(message) {
      if ((now.getSeconds() - message.created_at) > Werld.Config.messageLifeCycle) {
        this.messages.dequeue();
      }
    }.bind(this));
  }
};
