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
    this.images.splash = '../images/splash.jpg';
  },
  drawSplashScreen: function() {
    this.stage.update();
  },
  drawGameScreen: function() {
    this.stage.update();
    this.screenView.draw();
    this.characterView.draw();
    this.creatureView.draw();
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
  init: function() {
    this.el = document.getElementsByTagName('canvas')[0];
    this.context = this.el.getContext('2d');

    if (this.context) {
      this.loadImages();
      this.loadTextures();

      this.stage = new Stage(this.el);
      this.stage.enableMouseOver();

      var splashImage = new Bitmap(this.images.splash);
      splashImage.x = 0;
      splashImage.y = 0;

      var titleText = new Text(
        'Werld Online',
        '90px "PowellAntique" serif',
        '#dc9a44'
      );
      titleText.shadow = new Shadow('#000000', 4, 4, 0);
      titleText.textAlign = 'center';
      titleText.x = 320;
      titleText.y = 120;

      signInText = new Text('Sign In', '40px "PowellAntique" serif', '#dc9a44');
      signInText.textBaseline = 'bottom';
      signInText.x = 400;
      signInText.y = 320;
      signInText.shadow = new Shadow('#000000', 2, 2, 0);

      var signInGraphics = new Graphics();
      var signInGraphicsX = signInText.x + signInText.getMeasuredWidth() / 2;
      var signInGraphicsY = signInText.y - signInText.getMeasuredLineHeight() /2;
      var signInGraphicsInnerRadius = 10;
      var signInGraphicsOuterRadius = 110;
      signInGraphics.beginRadialGradientFill(
        ['#dc9a44', '#000000'], [0, 0.9],
        signInGraphicsX, signInGraphicsY, signInGraphicsInnerRadius,
        signInGraphicsX, signInGraphicsY, signInGraphicsOuterRadius
      );
      signInGraphics.drawCircle(
        signInGraphicsX, signInGraphicsY, signInGraphicsOuterRadius
      );

      var signInGraphicsShape = new Shape(signInGraphics);
      signInGraphicsShape.alpha = 0.3;
      signInGraphicsShape.compositeOperation = 'lighter';
      signInGraphicsShape.visible = false;

      var signInClickableGraphics = new Graphics();
      var signInClickableGraphicsWidth = signInText.getMeasuredWidth() + 50;
      var signInClickableGraphicsHeight = signInText.getMeasuredLineHeight() + 50;
      /* HACK: need to fill something to be able to attach mouse events. */
      signInClickableGraphics.beginFill('rgba(0,0,0,0.01)');
      signInClickableGraphics.drawEllipse(
        signInText.x - (signInClickableGraphicsWidth - signInText.getMeasuredWidth()) / 2,
        (2 * signInText.y - signInText.getMeasuredLineHeight() - signInClickableGraphicsHeight) / 2,
        signInClickableGraphicsWidth,
        signInClickableGraphicsHeight
      );

      var signInClickableGraphicsShape = new Shape(signInClickableGraphics);
      signInClickableGraphicsShape.onMouseOver = function() {
        signInClickableGraphicsShape.parent.canvas.style.cursor = 'pointer';
        signInGraphicsShape.visible = true;
      };
      signInClickableGraphicsShape.onMouseOut = function() {
        signInClickableGraphicsShape.parent.canvas.style.cursor = '';
        signInGraphicsShape.visible = false;
      };
      signInClickableGraphicsShape.onClick = function() {
        Werld.switchState(Werld.States.CHOOSING_NAME, {
          callback: function() {
            signInClickableGraphicsShape.onMouseOver = null;
            signInClickableGraphicsShape.onMouseOut = null;
            signInClickableGraphicsShape.onClick = null;
            signInClickableGraphicsShape.visible = false;
          }
        });
      };

      this.stage.addChild(splashImage);
      this.stage.addChild(titleText);
      this.stage.addChild(signInClickableGraphicsShape);
      this.stage.addChild(signInGraphicsShape);
      this.stage.addChild(signInText);

      Werld.switchState(Werld.States.SPLASH_SCREEN);
    } else {
      console.log('fail');
    }
  }
};
