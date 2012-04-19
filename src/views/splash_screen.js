Werld.Views.SplashScreen = Backbone.View.extend({
  initialize: function() {
    var splashImage = new Bitmap('../images/splash.jpg');
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
      signInClickableGraphicsShape.getStage().canvas.style.cursor = 'pointer';
      signInGraphicsShape.visible = true;
    };
    signInClickableGraphicsShape.onMouseOut = function() {
      signInClickableGraphicsShape.getStage().canvas.style.cursor = '';
      signInGraphicsShape.visible = false;
    };
    signInClickableGraphicsShape.onClick = function() {
      signInClickableGraphicsShape.getStage().canvas.style.cursor = '';
      Werld.switchState(Werld.STATES.CHOOSING_NAME, {
        callback: function() {
          signInClickableGraphicsShape.onMouseOver = null;
          signInClickableGraphicsShape.onMouseOut = null;
          signInClickableGraphicsShape.onClick = null;
          signInClickableGraphicsShape.visible = false;
        }
      });
    };

    this.container = new Container();
    this.container.addChild(splashImage);
    this.container.addChild(titleText);
    this.container.addChild(signInClickableGraphicsShape);
    this.container.addChild(signInGraphicsShape);
    this.container.addChild(signInText);
  }
});
