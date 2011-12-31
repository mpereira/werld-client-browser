var Werld = {
  config: {},
  account: {},
  setAccount: function(providerName, apiResponse) {
    this.account.name = apiResponse.name;
    this.account.email = apiResponse.email;
    this.account.provider = {};
    this.account.provider.id = apiResponse.id;
    this.account.provider.name = providerName;
  }
};
