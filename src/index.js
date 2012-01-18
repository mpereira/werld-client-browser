var Index = {
  Views: {},
  Models: {}
};

Index.Models.Account = Backbone.Model.extend({
  facebookProfilePictureUrl: function() {
    return('https://graph.facebook.com/' + this.get('provider').id + '/picture');
  }
});

Index.Views.AccountBar = Backbone.View.extend({
  el: '#account-bar',
  initialize: function() {
    this.model.bind('change', this.render, this);
    this.template = _.template($('#account-bar-template').html());
    _.bindAll(this, 'render');
  },
  events: {
    'click #facebook-login': 'facebookLogin',
    'click #facebook-logout': 'facebookLogout'
  },
  render: function() {
    $(this.el).html(this.template({ account: this.model }));
    $(this.el).show();
  },
  facebookLogin: function() {
    this.options.facebook.login();
  },
  facebookLogout: function() {
    var model = this.model;
    this.options.facebook.logout({
      complete: function() {
        model.set({ authenticated: false });
      }
    });
  },
});

$(function() {
  $(document).one('facebook:loaded', function() {
    Index.account = new Index.Models.Account();
    var facebook = new Index.Facebook({
      callback: function(account) {
        Index.account.set(account);
      }
    });
    Index.accountBarView = new Index.Views.AccountBar({
      model: Index.account,
      facebook: facebook
    });
  });
});
