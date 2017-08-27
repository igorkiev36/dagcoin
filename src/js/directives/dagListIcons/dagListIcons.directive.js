(() => {
  'use strict';

  angular
    .module('copayApp.directives')
    /**
     * @desc locate an icon on the left of the list element
     * @example <li dag-left-icon="shield"></li>
     */
    .directive('dagLeftIcon', dagLeftIcon)
    /**
     * @desc locate an icon on the right of the list element
     * @example <li dag-right-icon="shield"></li>
     */
    .directive('dagRightIcon', dagRightIcon);

  dagLeftIcon.$inject = ['$compile'];
  function dagLeftIcon($compile) {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, element, attr) => {
        element.addClass('left_icon');
        const icon = $compile(`<svg-icon name="${attr.dagLeftIcon}"></svg-icon>`)($scope);
        element.prepend(icon);
      }
    };
  }

  dagRightIcon.$inject = ['$compile'];
  function dagRightIcon($compile) {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, element, attr) => {
        element.addClass('right_icon');
        const icon = $compile(`<svg-icon name="${attr.dagRightIcon}"></svg-icon>`)($scope);
        element.append(icon);
      }
    };
  }
})();
