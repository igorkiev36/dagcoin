(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('sidebarController',
    function ($rootScope, $timeout, lodash, profileService, configService, go, isMobile, isCordova, backButton) {
      const self = this;
      self.isWindowsPhoneApp = isMobile.Windows() && isCordova;
      self.walletSelection = false;

      $rootScope.$on('Local/WalletListUpdated', () => {
        self.walletSelection = false;
        self.setWallets();
      });

      $rootScope.$on('Local/ColorUpdated', () => {
        self.setWallets();
      });

      $rootScope.$on('Local/AliasUpdated', () => {
        self.setWallets();
      });


      self.signout = function () {
        profileService.signout();
      };

      self.switchWallet = function (selectedWalletId, currentWalletId) {
        backButton.menuOpened = false;
        if (selectedWalletId === currentWalletId) {
          return;
        }
        self.walletSelection = false;
        profileService.setAndStoreFocus(selectedWalletId, () => { });
      };

      self.toggleWalletSelection = function () {
        self.walletSelection = !self.walletSelection;
        if (!self.walletSelection) {
          return;
        }
        self.setWallets();
      };

      1
    });
}());

