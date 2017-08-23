(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('sidebarController',
    function ($rootScope, $timeout, lodash, profileService, configService, go, isMobile, isCordova, backButton, $state) {

      this.isWindowsPhoneApp = isMobile.Windows() && isCordova;
      this.walletSelection = false;

      $rootScope.$on('Local/WalletListUpdated', () => {
        this.walletSelection = false;
        this.setWallets();
      });

      $rootScope.$on('Local/ColorUpdated', () => {
        this.setWallets();
      });

      $rootScope.$on('Local/AliasUpdated', () => {
        this.setWallets();
      });

      this.signout = function () {
        profileService.signout();
      };

      this.switchWallet = function (selectedWalletId, currentWalletId) {
        backButton.menuOpened = false;
        if (selectedWalletId === currentWalletId) {
          return;
        }
        this.walletSelection = false;
        profileService.setAndStoreFocus(selectedWalletId, () => {
        });
      };

      this.switchWalletOpenPreferences = function (selectedWalletId, currentWalletId) {
        this.switchWallet(selectedWalletId, currentWalletId);
        $state.go('preferences');
      };

      this.toggleWalletSelection = function () {
        this.walletSelection = !this.walletSelection;
        if (!this.walletSelection) {
          return;
        }
        this.setWallets();
      };

      this.setWallets = function () {
        if (!profileService.profile) return;
        const config = configService.getSync();
        config.colorFor = config.colorFor || {};
        config.aliasFor = config.aliasFor || {};
        const ret = lodash.map(profileService.profile.credentials, c => ({
          m: c.m,
          n: c.n,
          name: config.aliasFor[c.walletId] || c.walletName,
          id: c.walletId,
          color: config.colorFor[c.walletId] || '#4A90E2'
        }));
        this.wallets = lodash.sortBy(ret, 'name');

        console.group('SIDEBAR WALLETS');
        console.log(console.log(this.wallets));
        console.groupEnd('SIDEBAR WALLETS');
      };

      this.setWallets();
    });
}());

