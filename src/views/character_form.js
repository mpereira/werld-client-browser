Werld.Views.CharacterForm = Backbone.View.extend({
  el: '#character-form',
  initialize: function() {
    var $canvas = $(this.options.canvas.el);
    $(this.el).css({
      top: $canvas.position().top + $canvas.height() / 4 + 'px',
      left: $canvas.position().left + $canvas.width() / 4 + 'px',
      width: $canvas.width() / 2,
      height: $canvas.height() / 2
    });

    this.characterNameInputView = new Werld.Views.CharacterNameInput({
      width: '100%',
      height: '4em'
    });
    this.characterStatInputsView = new Werld.Views.CharacterStatInputs({
      position: {
        top: $(this.characterNameInputView.el).height(),
        left: '2em'
      },
      width: '100%',
      height: '8em'
    });

    $(this.el).bind('submit', _.bind(this.submit, this));
  },
  render: function() {
    this.characterStatInputsView.render();
    this.characterNameInputView.render();
    $(this.el).show();
  },
  submit: function() {
    var inputValue = function(inputSelector, context) {
      $(inputSelector, context.el).val();
    };

    var name = inputValue('#character-name-input', this.characterNameInputView);
    var strength = inputValue(
      '#character-stat-inputs-strength-input',
      this.characterStatInputsView
    );
    var dexterity = inputValue(
      '#character-stat-inputs-dexterity-input',
      this.characterStatInputsView
    );
    var intelligence = inputValue(
      '#character-stat-inputs-intelligence-input',
      this.characterStatInputsView
    );

    Werld.switchState(Werld.States.GAME_STARTED, {
      data: {
        character: {
          name: name,
          strength: strength,
          dexterity: dexterity,
          intelligence: intelligence
        }
      }
    });

    $('input', this.el).val('').blur();
    $(this.el).hide();

    return(false);
  }
});
