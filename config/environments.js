var _ = require('grunt').utils._;

var environments = {
  base: {
  }
};

environments.development = _({
}).extend(environments.base);

environments.production = _({
}).extend(environments.base);

module.exports = environments;
