Werld.Collections.EphemeralMessages = Werld.Collections.Messages.extend({
  initialize: function(models, options) {
    if (!options.lifetime) {
      throw new Error('Must be initialized with a lifetime');
    }

    this.lifetime = options.lifetime;

    this.on('add', this.maybeInstallSweeper);
    this.on('remove', this.maybeUninstallSweeper);
  },
  maybeInstallSweeper: function(collection) {
    if (this.length === 1) {
      Werld.Utils.Interval.install({ sweeper: this.lifetime }, this);
    }
  },
  maybeUninstallSweeper: function(collection) {
    if (this.isEmpty()) {
      Werld.Utils.Interval.uninstall({ sweeper: this.lifetime }, this);
    }
  },
  sweeper: function() {
    if (this.isEmpty()) { return; }

    this.remove(this.filter(_(function(message) {
      return((Date.now() - message.get('created_at')) > this.lifetime);
    }).bind(this)));
  },
});
