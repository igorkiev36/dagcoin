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
                template: '<div id="receiverModalInput"><label><strong>Receiver:</strong><input type="text"></label></div><div id="receiverQuickAccess"><ul><li>Roman Shabanov</li><li>Roman Shabanov</li><li>Roman Shabanov</li></ul></div>',
                plain: true,
                className: 'receiverModal',
                height: '100%',
                controller: ['$scope', ($scope) => {
                    $scope.text = 'LONG UPPERSPACE TEXT';
                }],
                onOpenCallback: () => {
                    TweenMax.to('#receiverModalInput', 0.4, { opacity: '1', top: 0, delay: 0.5 });
                    TweenMax.to('#receiverQuickAccess', 0.4, { opacity: '1', top: 0, delay: 1.0 });
                }
            });
        }

        function canSendExternalPayment() {
            return true;
        }
    }
})();

