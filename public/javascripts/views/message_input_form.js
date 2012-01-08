Werld.Views.MessageInputForm = Linchpin.DomView.extend({
  el: '#message-input-form',
  initialize: function() {
    var self = this;
    $(this.el).submit(function(event) {
      Werld.character.say($('input', this.el).val());
      $('input', this.el).val('');
      $('input', this.el).blur();
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
