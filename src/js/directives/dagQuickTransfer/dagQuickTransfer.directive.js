(() => {
    'use strict';

    /**
     * @desc directive to make quick transactions
     * @example <dag-quick-transfer></dag-quick-transfer>
     */
    angular
        .module('copayApp.directives')
        .directive('dagQuickTransfer', dagQuickTransfer);

    dagQuickTransfer.$inject = [];

    function dagQuickTransfer() {
        return {
            restrict: 'E',
            templateUrl: 'directives/dagQuickTransfer/dagQuickTransfer.template.html',
            scope: {},
            link: ($scope) => {
                $scope.quickTransferList = [{
                    full_name: 'Roman Shabanov'
                }, {
                    full_name: 'Yary Ribero'
                }];
            }
        };
    }
})();
