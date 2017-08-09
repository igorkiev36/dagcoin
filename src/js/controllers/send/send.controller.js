(() => {
    'use strict';

    angular
        .module('copayApp.controllers')
        .controller('SendDagsController', SendDagsController);

    SendDagsController.$inject = ['ngDialog'];
    function SendDagsController(ngDialog) {
        const vm = this;
        vm.submitForm = submitForm;
        vm.findReceiver = findReceiver;
        vm.canSendExternalPayment = canSendExternalPayment;

        function submitForm() {
            console.log('submit this form');
        }

        function findReceiver() {
            ngDialog.open({
                template: '<p>find receiver</p>',
                plain: true,
                className: 'ngdialog-theme-default',
            });
        }

        function canSendExternalPayment() {
            return true;
        }
    }
})();

