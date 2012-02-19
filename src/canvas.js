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
    Ticker.setFPS(Werld.Config.FRAME_RATE());

    var splashScreenView = new Werld.Views.SplashScreen();
    this.stage.addChild(splashScreenView.container);

    Werld.switchState(Werld.States.SPLASH_SCREEN);
  }
};
