/* global angular */

(() => {
  'use strict';

  const request = require('request');

  angular
      .module('copayApp.services')
      .factory('exchangeRate', exchangeRate);

  exchangeRate.$inject = ['$http', '$q'];
  function exchangeRate($http, $q) {
    const service = {
      get,
    };

    return service;

    function get() {
      return $q((resolve, reject) => {
        request('https://api.coinmarketcap.com/v1/ticker/byteball/', (error, response, body) => {
          if (!error && response.statusCode === 200) {
            const json = JSON.parse(body);
            return resolve(json[0]);
          }
          return reject({});
        });
      });
    }
  }
})();
