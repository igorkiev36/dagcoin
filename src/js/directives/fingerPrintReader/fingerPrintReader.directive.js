/* global angular */

(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <finger-print-reader></finger-print-reader>
   */
  angular
      .module('copayApp.directives')
      .directive('finderPrintReader', finderPrintReader);

  finderPrintReader.$inject = [];

  function finderPrintReader() {
    return {
      restrict: 'E',
      scope: {},
      link: () => {

      },
    };
  }
})();

