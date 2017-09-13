(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-wallet></dag-wallet>
   */
  angular
    .module('copayApp.directives')
    .directive('dagWallet', dagWallet);

  dagWallet.$inject = ['$window'];

  function dagWallet($window) {
    return {
      restrict: 'E',
      template: '<div>Wallet Directive</div>',
      scope: {
        data: '='
      },
      link: ($scope) => {
        angular.element($window).on('scroll', () => {
          console.log($window.scrollY);
        });
      }
    };
  }
})();
