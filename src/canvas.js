Werld.canvas = {
  loadTextures: function(callback) {
    this.textures = {};
    this.textures.tiles = {};
    this.textures.tiles.grass = '../images/textures/tiles/grass.jpg';
    this.textures.tiles.dirt = '../images/textures/tiles/dirt.jpg';
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
