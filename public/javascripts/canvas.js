Werld.canvas = {
  FRAME_RATE: 30,
  loadTextures: function(callback) {
    this.textures = {};
    this.textures.tiles = {};
    this.textures.tiles.grass = new Image();
    this.textures.tiles.grass.src = '../images/textures/tiles/grass.jpg';
    this.textures.tiles.grass.onload = callback;
  },
  loadImages: function(callback) {
    this.images = {};
    this.images.splash = new Image();
    this.images.splash.src = '../images/splash.jpg';
    this.images.splash.onload = callback;
  },
  drawSplashScreen: function() {
    this.context.drawImage(this.images.splash, 0, 0);

    if (this.signInLinkGradientDrawn) {
      this.context.fillStyle = this.signInLinkGradient;
      this.context.globalAlpha = 0.2;
      this.context.fillRect(0, 0, 640, 480);
      this.context.globalAlpha = 1;
    }

    this.context.shadowColor = '#000000';
    this.context.shadowOffsetX = 4;
    this.context.shadowOffsetY = 4;
    this.context.fillStyle = '#dc9a44';
    this.context.font = '90px "PowellAntique" serif';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'center';
    this.context.fillText('Werld Online', 320, 20);
    this.context.font = '40px "PowellAntique" serif';
    this.context.shadowOffsetX = 2;
    this.context.shadowOffsetY = 2;
    this.context.fillText('Sign In', 440, 240);
  },
  drawGameScreen: function() {
    this.mapView.draw();
    this.characterView.draw();
  },
  mouseCoordinates: function(e) {
    var x;
    var y;
    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return([x, y]);
  },
  mouseMoveHandler: function(e) {
    var x;
    var y;
    var coordinates;

    coordinates = this.mouseCoordinates(e);
    x = coordinates[0];
    y = coordinates[1];

    if (x > 720 && x < 880 && y > 270 && y < 340) {
      this.signInLinkGradientDrawn = true;
      this.el.style.cursor = 'pointer';
    } else {
      this.signInLinkGradientDrawn = false;
      this.el.style.cursor = '';
    }
  },
  mouseClickHandler: function(e) {
    var x;
    var y;
    var coordinates;

    coordinates = this.mouseCoordinates(e);
    x = coordinates[0];
    y = coordinates[1];

    if (x > 720 && x < 880 && y > 270 && y < 340) {
      clearInterval(this.interval);
      this.characterView = new Werld.Views.Character(Werld.character);
      window.addEventListener('keydown', this.keyboardHandler.bind(this), false);
      this.interval = setInterval(this.drawGameScreen.bind(this), this.FRAME_RATE);
      this.drawGameScreen();
    }
  },
  keyboardHandler: function(event) {
    switch (event.keyCode) {
    case 13:
      Werld.messageInputForm().showOrSubmit(event);
      break;
    case 38:
      Werld.character.move('up')
      break;
    case 40:
      Werld.character.move('down')
      break;
    case 37:
      Werld.character.move('left')
      break;
    case 39:
      Werld.character.move('right')
      break;
    }
  },
  init: function() {
    this.el = document.getElementsByTagName('canvas')[0];
    if (this.context = this.el.getContext('2d')) {
      this.signInLinkGradient = this.context.createRadialGradient(440, 275, 10, 440, 275, 90);
      this.signInLinkGradient.addColorStop(0.4, '#dc9a44');
      this.signInLinkGradient.addColorStop(1, '#000000');

      this.loadTextures();
      this.loadImages();

      this.mapView = new Werld.Views.Map(Werld.map);
      this.el.addEventListener('mousemove', this.mouseMoveHandler.bind(this), false);
      this.el.addEventListener('click', this.mouseClickHandler.bind(this), false);
      this.interval = setInterval(this.drawSplashScreen.bind(this), this.FRAME_RATE);
    } else {
      console.log('fail');
    }
  }
}
