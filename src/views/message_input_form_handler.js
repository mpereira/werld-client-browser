Werld.Views.MessageInputFormHandler = Backbone.View.extend({
  el: window,
  events: {
    'keypress': 'onWindowKeyPress'
  },
  initialize: function() {
    this.messageInputView = new Werld.Views.MessageInputForm();
  },
  onWindowKeyPress: function(event) {
    if (Werld.state === Werld.STATES.GAME_STARTED) {
      if (event.which === 13) {
        this.messageInputView.showOrSubmit(event);
      }
    }
  }
});
