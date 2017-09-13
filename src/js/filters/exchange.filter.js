(() => {
  'use strict';

  angular
    .module('copayApp.filters')
    .filter('exchange', exchange);

  exchange.$inject = [];

  function exchange() {
    return function (value) {
      return value;
    };
  }
})();
