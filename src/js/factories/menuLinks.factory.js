(() => {
    'use strict';

    angular
        .module('copayApp.services')
        .factory('menuLinks', menuLinks);

    menuLinks.$inject = [];
    function menuLinks() {
        return [{
            category: 'Account',
            links: [
                {
                    title: 'My Wallet',
                    icon: 'wallet',
                    state: 'walletHome',
                    menuBar: true
                }, {
                    title: 'Send',
                    icon: 'paperplane',
                    state: 'send',
                    menuBar: true
                }, {
                    title: 'Receive',
                    icon: 'banknote',
                    state: 'receive',
                    menuBar: true
                }, {
                    title: 'Contacts',
                    icon: 'business-card',
                    state: 'contacts'
                }
            ]
        }, {
            category: 'More',
            links: [
                {
                    title: 'Settings',
                    icon: 'cog',
                    state: 'settings',
                    menuBar: true
                }
            ]
        }];
    }
})();
