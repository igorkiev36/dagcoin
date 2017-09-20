/* eslint-disable import/no-dynamic-require */
(function () {
  'use strict';

  angular.module('copayApp.services')
    .factory('fundingExchangeClientService', (
      $rootScope,
      discoveryService,
      configService,
      dagcoinProtocolService,
      promiseService,
      fileSystemService
    ) => {
      const self = {};

      // Statuses
      self.active = false;
      self.activating = false;

      self.bytesProviderDeviceAddress = null;
      self.byteOrigin = null;
      self.dagcoinDestination = null;

      function clearRequireCache(module) {
        if (typeof require.resolve === 'function') {
          delete require.cache[require.resolve(module)];
        }
      }

      function requireUncached(module) {
        clearRequireCache(module);
        return require(module.toString());
      }

      function getConfiguration() {
        return new Promise((resolve, reject) => {
          configService.get((err, config) => {
            if (err) {
              reject(err);
            }

            try {
              const userConfFile = fileSystemService.getUserConfFilePath();
              resolve(Object.assign({}, config, requireUncached(userConfFile)));
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      function isFundingPairPresent() {
          let fundingPairAvailable = true;

          if (!self.bytesProviderDeviceAddress) {
            console.log('MISSING bytesProviderDeviceAddress IN THE CONFIGURATION');
            fundingPairAvailable = false;
          }

          if (!self.byteOrigin) {
            console.log('MISSING byteOrigin IN THE CONFIGURATION');
            fundingPairAvailable = false;
          }

          if (!self.dagcoinDestination) {
            console.log('MISSING dagcoinDestination IN THE CONFIGURATION');
            fundingPairAvailable = false;
          }

          return fundingPairAvailable;
      }

      function askForFundingNode() {
        console.log('ASKING FOR A FUNDING NODE');

        const promise = promiseService.listeningTimedPromise(
          `dagcoin.response.${discoveryService.messages.listTraders}`,
          (message, fromAddress) => {
            if (!discoveryService.isDiscoveryServiceAddress(fromAddress)) {
              console.log(`RECEIVED A LIST OF TRADERS FROM AN ADDRESS THAT IS NOT MY DISCOVERY SERVICE: ${fromAddress}`);
              return false;
            }

            console.log(`THE DISCOVERY SERVICE (${fromAddress}) SENT A MESSAGE: ${JSON.stringify(message)}`);

            const body = message.messageBody;

            if (!body) {
              console.log(`DISCOVERY SERVICE (${fromAddress}) SENT A TRADERS LIST WITH NO BODY`);
              return false;
            }

            const traders = body.traders;

            if (!traders) {
              console.log(`DISCOVERY SERVICE (${fromAddress}) SENT A TRADERS LIST MESSAGE BODY WITH NO TRADERS' SECTION`);
              return false;
            }

            if (traders.length === 0) {
              console.log(`DISCOVERY SERVICE (${fromAddress}) HAS NO TRADERS AVAILABLE`);
              return false;
            }

            traders.sort((a, b) => {
              if (a.exchangeFee > b.exchangeFee) {
                return 1;
              }
              return -1;
            });

            return traders[0];
          },
          30 * 1000,
          'NO LIST OF TRADERS FROM THE DISCOVERY SERVICE'
        );

        console.log('BEFORE SENDING A MESSAGE TO THE DISCOVERY SERVICE');
        discoveryService.sendMessage(discoveryService.messages.listTraders);
        console.log('AFTER SENDING A MESSAGE TO THE DISCOVERY SERVICE');

        return promise;
      }

      function activate() {
        if (self.active) {
          return Promise.resolve(true);
        }

        if (self.activating) {
          return Promise.resolve(false);
        }

        self.activating = true;

        if (isFundingPairPresent()) {
          self.activating = false;
          self.active = true;
          return Promise.resolve(true);
        }

        return askForFundingNode().then((fundingNode) => {
          console.log(`TRADERS AVAILABLE: ${JSON.stringify(fundingNode)}`);

          self.bytesProviderDeviceAddress = fundingNode.deviceAddress;

          return dagcoinProtocolService.pairAndConnectDevice(fundingNode.pairCode);
        }).then((correspondent) => {
          console.log(`PAIRED WITH ${correspondent.device_address}`);

          return Promise.resolve();
        }).then(
          (result) => {
            self.activating = false;
            self.active = true;
            return Promise.resolve(result);
          },
          (err) => {
            self.activating = false;
            return Promise.reject(err);
        });
      }

      $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
        console.log('ACTIVATING');
        self.activate().then(
          (active) => {
            if (active) {
              console.log('FUNDING EXCHANGE CLIENT ACTIVATED');
            } else {
              console.log('FUNDING EXCHANGE CLIENT STILL ACTIVATING. BE PATIENT');
            }
          },
          (err) => {
            console.log(`COULD NOT ACTIVATE FUNDING EXCHANGE CLIENT: ${err}`);
          }
        );
      });

      self.activate = activate;

      return self;
    });
}());
