Werld.canvas = {
  loadTextures: function(callback) {
    this.textures = {};
    this.textures.tiles = {};
    this.textures.tiles.grass = new Image();
    this.textures.tiles.grass.src = '../images/textures/tiles/grass.jpg';
    this.textures.tiles.grass.onload = callback;
    this.textures.tiles.dirt = new Image();
    this.textures.tiles.dirt.src = '../images/textures/tiles/dirt.jpg';
    this.textures.tiles.dirt.onload = callback;
  },
  loadImages: function(callback) {
    this.images = {};
    this.images.splash = new Image();
    this.images.splash.src = '../images/splash.jpg';
    this.images.splash.onload = callback;
  },
  drawSplashScreen: function() {
    this.context.drawImage(this.images.splash, 0, 0);

    if (Werld.state !== Werld.States.CHOOSING_NAME) {
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
    }
  },
  drawGameScreen: function() {
    this.screenView.draw();
    this.characterView.draw();
  },
  mouseCoordinates: function(e) {
    return([e.offsetX, e.offsetY]);
  },
  mouseMoveHandler: function(e) {
    if (Werld.state === Werld.States.SPLASH_SCREEN) {
      var x;
      var y;
      var coordinates;

      coordinates = this.mouseCoordinates(e);
      x = coordinates[0];
      y = coordinates[1];

      if (this.signInLinkArea(coordinates)) {
        this.signInLinkGradientDrawn = true;
        this.el.style.cursor = 'pointer';
      } else {
        this.signInLinkGradientDrawn = false;
        this.el.style.cursor = '';
      }
    }
  },
  mouseClickHandler: function(e) {
    var x;
    var y;
    var coordinates;

    coordinates = this.mouseCoordinates(e);
    x = coordinates[0];
    y = coordinates[1];

    if (Werld.state === Werld.States.SPLASH_SCREEN) {
      if (this.signInLinkArea(coordinates)) {
        this.el.style.cursor = '';
        Werld.switchState(Werld.States.CHOOSING_NAME);
      }
    } else if (Werld.state === Werld.States.GAME_STARTED) {
      if (e.which === 3) {
        Werld.character.moveTo(coordinates);
      }
    }
  },
  keyboardHandler: function(event) {
    if (Werld.state === Werld.States.GAME_STARTED) {
      if (event.keyCode === 13) {
        Werld.messageInputForm().showOrSubmit(event);
      }
    }
  },
  init: function() {
    this.el = document.getElementsByTagName('canvas')[0];
    this.context = this.el.getContext('2d');
    if (this.context) {
      this.signInLinkGradient = this.context.createRadialGradient(440, 275, 10, 440, 275, 90);
      this.signInLinkGradient.addColorStop(0.4, '#dc9a44');
      this.signInLinkGradient.addColorStop(1, '#000000');
      this.signInLinkArea = function(coordinates) {
        return(coordinates[0] > 350 && coordinates[0] < 520 &&
                 coordinates[1] > 230 && coordinates[1] < 310);
      };

      this.loadTextures();
      this.loadImages();

      Werld.switchState(Werld.States.SPLASH_SCREEN);
    } else {
      console.log('fail');
    }
  }
};
