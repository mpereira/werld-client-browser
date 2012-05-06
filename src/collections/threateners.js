Werld.Collections.Threateners = Werld.Collections.Creatures.extend({
  update: function(creatures) {
    var creaturesCollection = new Werld.Collections.Creatures(creatures);
    var that = this;

    this.each(function(creature) {
      if (!creaturesCollection.get(creature.id)) {
        that.remove(creature);
      }
    });

    creaturesCollection.each(function(creature) {
      if (!that.get(creature.id)) {
        that.add(creature);
      }
    });
  }
});
