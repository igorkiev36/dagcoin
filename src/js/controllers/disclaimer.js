(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('disclaimerController', disclaimerController);

  disclaimerController.$inject = ['$scope', '$timeout', 'storageService', 'gettextCatalog', 'isCordova', 'uxLanguage', '$state'];
  function disclaimerController($scope, $timeout, storageService, gettextCatalog, isCordova, uxLanguage, $state) {
    $scope.agree = function () {
      if (isCordova) {
        window.plugins.spinnerDialog.show(null, gettextCatalog.getString('Loading...'), true);
      }
      $scope.loading = true;
      $timeout(() => {
        storageService.setDisclaimerFlag(() => {
          $timeout(() => {
            if (isCordova) {
              window.plugins.spinnerDialog.hide();
            }
            $state.go('walletHome');
          }, 1000);
        });
      }, 100);
    };

    $scope.init = function () {
      storageService.getDisclaimerFlag((err, val) => {
        $scope.lang = uxLanguage.currentLanguage;
        $scope.agreed = val;
        $timeout(() => {
          $scope.$digest();
        }, 1);
      });
    };
  }
})();

