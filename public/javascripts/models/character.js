Werld.Models.Character = function(params) {
  this.name = params.name;
  this.x = params.coordinates[0];
  this.y = params.coordinates[1];
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
  }
};
