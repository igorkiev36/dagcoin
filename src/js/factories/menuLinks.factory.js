/* global angular */

(() => {
  'use strict';

  angular
      .module('copayApp.services')
      .factory('menuLinks', menuLinks);

  menuLinks.$inject = [];
  function menuLinks() {
    return [{
      category: 'Wallet',
      links: [
        {
          title: 'Accounts',
          icon: 'credit-card',
          state: 'walletHome',
          menuBar: true,
        }, {
          title: 'Send',
          icon: 'paperplane',
          state: 'send',
          menuBar: true,
        }, {
          title: 'Receive',
          icon: 'banknote',
          state: 'receive',
          menuBar: true,
        },/* {
          title: 'Contacts',
          icon: 'business-card',
          state: 'contacts',
          menuBar: true,
        },*/
      ],
    }, {
      category: 'More',
      links: [
        {
          title: 'Settings',
          icon: 'cog',
          state: 'settings',
        },
      ],
    }];
  }
})();
