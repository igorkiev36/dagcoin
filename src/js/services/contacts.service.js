/* global angular */

(() => {
  'use strict';

  angular
      .module('copayApp.services')
      .factory('ContactsService', ContactsService);

  ContactsService.$inject = ['$http', '$q'];
  function ContactsService($http, $q) {
    const service = {
      get,
    };

    return service;

    function get() {
      return [{
        'full_name': 'Roman Shabanov',
        'first_name': 'Roman',
        'last_name': 'Shabanov',
        'wallet_address': 'random'
      }];
    }
  }
})();

