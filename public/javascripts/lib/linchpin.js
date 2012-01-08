(function() {
  var root = this;

  var Linchpin;

  if (typeof exports !== 'undefined') {
    Linchpin = exports;
  } else {
    Linchpin = root.Linchpin = {};
  }

  var domViewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  Linchpin.DomView = function(options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(Linchpin.DomView.prototype, {
    initialize : function() {},
    render: function() { return(this); },
    tagName: 'div'
  });

  Linchpin.CanvasView = function(options) {
    this.initialize.apply(this, arguments);
  };

  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  //Linchpin.Model.extend =
    //Linchpin.Collection.extend =
    //Linchpin.Router.extend =
    Linchpin.DomView.extend =
    extend;

    var ctor = function() {};

    var inherits = function(parent, protoProps, staticProps) {
      var child;
      if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
      } else {
        child = function(){ return parent.apply(this, arguments); };
      }

      _.extend(child, parent);

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();

      if (protoProps) _.extend(child.prototype, protoProps);
      if (staticProps) _.extend(child, staticProps);
      child.prototype.constructor = child;
      child.__super__ = parent.prototype;

      return child;
    };

}).call(this)
