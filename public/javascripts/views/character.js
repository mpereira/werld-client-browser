Werld.Views.Character = function(model) {
  this.model = model;
  this.image = new Image();
  this.image.src = '../images/textures/character.png';
  this.image.onload = this.draw.bind(this);
  $(this.model).bind('change', this.draw.bind(this));
};

Werld.Views.Character.prototype = {
  draw: function() {
    Werld.canvas.context.drawImage(this.image, this.model.x * 40, this.model.y * 40, 40, 40);
  }
};
