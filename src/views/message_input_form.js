Werld.Views.MessageInputForm = Backbone.View.extend({
  el: '#message-input-form',
  initialize: function() {
    var self = this;
    $(this.el).submit(function(event) {
      Werld.character.say($('input', self.el).val());
      $('input', self.el).val('').blur();
      $(self.el).hide();
      return(false);
    });
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
