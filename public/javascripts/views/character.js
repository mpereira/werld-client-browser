Werld.Views.Character = function(model) {
  this.model = model;
  this.x = this.model.column * Werld.Config.PIXELS_PER_TILE;
  this.y = this.model.row * Werld.Config.PIXELS_PER_TILE;
  this.destinationX = this.x;
  this.destinationY = this.y;
  this.image = new Image();
  this.image.src = '../images/textures/character.png';
  this.image.onload = this.draw.bind(this);
  $(this.model).bind('move', this.updateDestination.bind(this));
  $(this.model.messages).bind('add', this.draw.bind(this));
};

Werld.Views.Character.prototype = {
  updateDestination: function() {
    this.destinationX = this.model.destinationColumn * Werld.Config.PIXELS_PER_TILE;
    this.destinationY = this.model.destinationRow * Werld.Config.PIXELS_PER_TILE;
  },
  draw: function() {
    if (this.x > this.destinationX) {
      this.x -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (this.x < this.destinationX) {
      this.x += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else {
      this.model.column = Math.floor(this.x / Werld.PIXELS_PER_TILE);
    }
    if (this.y > this.destinationY) {
      this.y -= Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else if (this.y < this.destinationY) {
      this.y += Werld.Config.CHARACTER_MOVEMENT_SPEED;
    } else {
      this.model.row = Math.floor(this.y / Werld.PIXELS_PER_TILE);
    }

    var x = this.x;
    var y = this.y;

    Werld.canvas.context.shadowColor = '#3300ff';
    Werld.canvas.context.shadowOffsetX = 1;
    Werld.canvas.context.shadowOffsetY = 1;
    Werld.canvas.context.fillStyle = '#00ccff';
    Werld.canvas.context.font = '20px "PowellAntique" serif';
    Werld.canvas.context.textBaseline = 'top';
    Werld.canvas.context.textAlign = 'center';
    Werld.canvas.context.fillText(this.model.name, x + 20, y - 30);
    Werld.canvas.context.drawImage(this.image, x, y, 40, 40);

    Werld.canvas.context.shadowOffsetX = 0;
    Werld.canvas.context.shadowOffsetY = 0;
    Werld.canvas.context.fillStyle = '#cccccc';
    Werld.canvas.context.font = '16px "PowellAntique" serif';
    this.model.messages.forEach(function(message) {
      if (message.content !== '') {
        y -= 20;
        Werld.canvas.context.fillText(message.content, x + 20, y - 30);
      }
    });
  },
};
