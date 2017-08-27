/* global angular */

(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-bottom-bar></dag-bottom-bar>
   */
  angular
    .module('copayApp.directives')
    .directive('dagBottomBar', dagBottomBar);

  dagBottomBar.$inject = ['menuLinks', '$timeout'];

  function dagBottomBar(menuLinks, $timeout) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagBottomBar/dagBottomBar.template.html',
      replace: true,
      scope: {},
      link: ($scope, element, attr) => {
        $scope.links = [];

        menuLinks.forEach((category) => {
          category.links.forEach((link) => {
            if (link.menuBar) {
              $scope.links.push(link);
            }
          });
        });
        
      }
    };
  }
})();
