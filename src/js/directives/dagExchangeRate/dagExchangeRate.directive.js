/* global angular */

(() => {
  'use strict';

  /**
   * @desc displaying dagcoins to USD exchange rate
   * @example <dag-exchange-rate-view></dag-exchange-rate-view>
   */
  angular
      .module('copayApp.directives')
      .directive('dagExchangeRateView', dagExchangeRateView);

  dagExchangeRateView.$inject = ['exchangeRate'];

  function dagExchangeRateView(exchangeRate) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagExchangeRate/dagExchangeRate.template.html',
      replace: true,
      scope: {},
      link: ($scope) => {
        exchangeRate.get().then((json) => {
          $scope.price_usd = json.price_usd;
          $scope.percent_change = json.percent_change_24h;
          $scope.last_updated = json.last_updated;
        });

        $scope.stateClass = (percentChange) => {
          if (percentChange) {
            return percentChange.toString().indexOf('-') >= 0 ? 'negative' : 'positive';
          }
          return 'negative';
        };
      },
    };
  }
})();
