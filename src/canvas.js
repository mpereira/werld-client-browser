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
  mouseCoordinates: function(e) {
    return([e.offsetX, e.offsetY]);
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
      }
    } else if (Werld.state === Werld.States.GAME_STARTED) {
      if (e.which === 3) {
        Werld.character.move(_(coordinates).map(function(pixels) {
          return(Werld.util.pixelToTile(pixels));
        }));
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
  tick: function() {
    this.stage.update();
  },
  init: function() {
    this.el = document.getElementsByTagName('canvas')[0];
    this.context = this.el.getContext('2d');

    this.loadTextures();

    this.stage = new Stage(this.el);
    this.stage.enableMouseOver();
    Ticker.addListener(this);

    var splashScreenView = new Werld.Views.SplashScreen();
    this.stage.addChild(splashScreenView.container);

    Werld.switchState(Werld.States.SPLASH_SCREEN);
  }
};
