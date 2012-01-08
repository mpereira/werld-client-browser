Werld.Views.Character = function(model) {
  this.model = model;
  this.image = new Image();
  this.image.src = '../images/textures/character.png';
  this.image.onload = this.draw.bind(this);
  $(this.model).bind('change', this.draw.bind(this));
  $(this.model.messages).bind('add', this.draw.bind(this));
};

Werld.Views.Character.prototype = {
  draw: function() {
    var x = this.model.x * 40;
    var y = this.model.y * 40;

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
