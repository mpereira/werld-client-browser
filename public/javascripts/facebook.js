window.fbAsyncInit = function() {
  FB.init({
    appId: '262558847140814',
    status: true,
    cookie: true,
    xfbml: true,
    oauth: true
  });

  function facebookProfilePicture(userId) {
    return('https://graph.facebook.com/' + userId + '/picture');
  }

  function facebookGraphApiCallback(response) {
    var accountName = document.getElementById('account-name');
    var accountPicture = document.getElementById('account-picture');
    var button = document.getElementById('fb-auth');

    Werld.setAccount('facebook', response);

    accountName.innerHTML = response.name;
    accountPicture.src = facebookProfilePicture(response.id);
    button.innerHTML = 'Logout';
  }

  function updateAuthenticationView(response) {
    view.style.display = 'hidden';

    if (response.authResponse) {
      var button = document.getElementById('fb-auth');

      view.style.fontSize = '1.0em';
      button.style.width = '';

      Werld.config.accessToken = response.authResponse.accessToken;
      FB.api('/me', facebookGraphApiCallback);

      view.style.display = 'block';

      button.onclick = function() {
        FB.logout(function(response) {
          var accountName = document.getElementById('account-name');
          var accountPicture = document.getElementById('account-picture');

          accountName.innerHTML = '';
          accountPicture.src = '';
        });
      };
    } else {
      var button = document.getElementById('fb-auth');

      view.style.display = 'block';
      view.style.fontSize = '1.4em';

      button.style.width = '100%';
      button.style.textAlign = 'center';
      button.innerHTML = 'Sign in with facebook';

      view.style.display = 'block';

      button.onclick = function() {
        FB.login(function(response) {
          if (response.authResponse) {
            FB.api('/me', facebookGraphApiCallback);
          }
        }, { scope: 'email, publish_stream' });
      }
    }
  }

  var view = document.getElementById('authentication');
  FB.getLoginStatus(updateAuthenticationView);
  FB.Event.subscribe('auth.statusChange', updateAuthenticationView);
};

(function(d) {
  var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = '//connect.facebook.net/en_US/all.js';
  d.getElementsByTagName('head')[0].appendChild(js);
}(document));
