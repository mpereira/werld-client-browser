window.fbAsyncInit = function() {
  FB.init({
    appId: '232052313538058',
    status: true,
    cookie: true,
    xfbml: true,
    oauth: true
  });

  var config = {
    scope: 'email, publish_stream'
  };

  var account = {};

  var graphApiCallback = function(response, options) {
    if (!response || response.error) {
      options.error && options.error(account);
    } else {
      account.name = response.name;
      account.email = response.email;
      account.provider || (account.provider = {});
      account.provider.id = response.id;
      account.provider.name = 'facebook';
      options.success && options.success(account);
    }
    options.complete && options.complete(account);
  };

  var statusChangeCallback = function(response, options) {
    if (response.status === 'connected') {
      account.authenticated = true;
      account.accessToken = response.authResponse.accessToken;
      FB.api('/me', function(response) {
        graphApiCallback(response, options);
      });
    } else {
      account = { authenticated: false };
      options.error && options.error(account);
    }
  };

  Index.Facebook = function(options) {
    var callback = options.callback;

    FB.getLoginStatus(function(response) {
      if (!response.authResponse) {
        callback({ authenticated: false });
      }
    });

    FB.Event.subscribe('auth.statusChange', function(response) {
      statusChangeCallback(response, {
        complete: function(facebookAccount) {
          callback(facebookAccount);
        }
      });
    });
  };

  Index.Facebook.prototype = {
    login: function() {
      FB.login(function() {}, { scope: config.scope });
    },
    logout: function(params) {
      FB.logout(function(response) {
        params.complete(response);
      });
    }
  };

  $(document).trigger('facebook:loaded');
};

(function(document) {
  var jsId = 'facebook-jssdk';
  if (!document.getElementById(jsId)) {
    var div;
    var js;
    div = document.createElement('div');
    div.id = 'fb-root';
    document.getElementsByTagName('body')[0].appendChild(div);
    js = document.createElement('script');
    js.id = jsId;
    js.async = true;
    js.src = '//connect.facebook.net/en_US/all.js';
    document.getElementsByTagName('head')[0].appendChild(js);
  }
}(document));
