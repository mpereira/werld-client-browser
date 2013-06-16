Werld.Views.Altar = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);

    this.container = new CreateJS.Container();
    this.container.view = this;

    var bitmap = new CreateJS.Bitmap(this.model.get('IMAGE').SRC);
    this.container.addChild(bitmap);

    this.updateContainerOnScreenCoordinates();

    Werld.character.on(
      'change:coordinates', this.updateContainerOnScreenCoordinates
    );

    this.model.get('characters').each(function(character) {
      character.on('change:tile', this.resurrectCharacterIfCloseEnough, this);
    }, this);
  },
  updateContainerOnScreenCoordinates: function() {
    var onScreenCoordinates = Werld.screen.objectCoordinates(this.model);

    this.container.x = onScreenCoordinates[0];
    this.container.y = onScreenCoordinates[1];
  },
  resurrectCharacterIfCloseEnough: function(character) {
    if (character.tileDistance(this.model) > 1) {
      return;
    }

    if (character.alive()) {
      return;
    }

    character.resurrect();
  }
});
