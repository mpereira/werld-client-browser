Werld.Views.MessageInputForm = Backbone.View.extend({
  el: '#message-input-form',
  initialize: function() {
    $(this.el).submit(function(event) {
      Werld.character.say($('input', this.el).val());
      $('input', this.el).val('').blur();
      $(this.el).hide();
      return(false);
    }.bind(this));
    return(this);
  },
  showOrSubmit: function(event) {
    if ($(this.el).css('display') === 'none') {
      event.preventDefault();
      $(this.el).show();
      $('input', this.el).focus();
    } else {
      $(this.el).submit();
    }
  }
});
