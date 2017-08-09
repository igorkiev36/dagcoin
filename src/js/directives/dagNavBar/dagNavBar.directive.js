/* global angular */

(() => {
  'use strict';

  /**
   * @desc dagNavBar directive
   * @example <dag-nav-bar></dag-nav-bar>
   */
  angular
      .module('copayApp.directives')
      .directive('dagNavBar', dagNavBar);

  dagNavBar.$inject = ['go'];

  function dagNavBar(go) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagNavBar/dagNavBar.template.html',
      replace: true,
      scope: {
        stateTitle: '@',
        title: '@',
      },
      link: ($scope, element, attr) => {
        if ('invert' in attr) {
          element.addClass('invert');
        }

        if ('goBack' in attr) {
          $scope.showBack = true;
        }

        $scope.openLeftMenu = () => {
          go.swipe(true);
        };
      },
    };
  }
})();
