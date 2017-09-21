/* eslint-disable import/no-dynamic-require */
(function () {
  'use strict';

  angular.module('copayApp.services')
    .factory('fundingExchangeClientService', ($rootScope,
                                              discoveryService,
                                              configService,
                                              dagcoinProtocolService,
                                              promiseService) => {
      const self = {};

      // Statuses
      self.active = false;
      self.activating = false;

      self.dagcoinOrigin = null;

      self.bytesProviderDeviceAddress = null;
      self.byteOrigin = null;
      self.dagcoinDestination = null;

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

        const db = require('byteballcore/db');

        return readMyAddress().then((myAddress) => {
          if (!myAddress) {
            return Promise.reject('COULD NOT FIND ANY ADDRESS IN THE DATABASE');
          }

          self.dagcoinOrigin = myAddress;

          return new Promise((resolve, reject) => {
            db.query(
              'SELECT shared_address, address, device_address FROM shared_address_signing_paths WHERE address <> ?',
              [myAddress],
              (rows) => {
                if (rows.length === 0) {
                  console.log('NO SHARED ADDRESSES FOUND. QUERYING THE DISCOVERY SERVICE FOR A FUNDING NODE');
                  resolve(false);
                } else if (rows.length > 1) {
                  reject(`THERE ARE TOO MANY SHARED ADDRESSES: ${JSON.stringify(rows)}`);
                } else {
                  self.byteOrigin = rows[0].shared_address;
                  self.dagcoinDestination = rows[0].address;
                  self.bytesProviderDeviceAddress = rows[0].device_address;

                  resolve(true);
                }
              }
            );
          });
        }).then((ready) => {
          if (ready) {
            console.log('A SHARED ADDRESS WAS FOUND IN THE DATABASE USED THAT ONE TO INITIALIZE');
            self.activating = false;
            self.active = true;
            self.index.selectSubWallet(self.byteOrigin);
            return Promise.resolve();
          }

          return queryDiscoveryService();
        });
      }

      function queryDiscoveryService() {
        return askForFundingNode().then((fundingNode) => {
          console.log(`TRADERS AVAILABLE: ${JSON.stringify(fundingNode)}`);

          self.bytesProviderDeviceAddress = fundingNode.deviceAddress;

          return dagcoinProtocolService.pairAndConnectDevice(fundingNode.pairCode);
        }).then(() => {
          console.log(`SUCCESSFULLY PAIRED WITH ${self.bytesProviderDeviceAddress}`);

          if (self.dagcoinOrigin) {
            return Promise.resolve(self.dagcoinOrigin);
          }

          return readMyAddress();
        }).then((myAddress) => {
          if (!myAddress) {
            return Promise.reject('COULD NOT FIND ANY ADDRESS IN THE DATABASE');
          }

          self.dagcoinOrigin = myAddress;

          const device = require('byteballcore/device');

          self.myDeviceAddress = device.getMyDeviceAddress();

          return askForFundingAddress();
        })
          .then(
          (result) => {
            self.activating = false;
            self.active = true;
            self.index.selectSubWallet(self.byteOrigin);
            return Promise.resolve(result);
          },
          (err) => {
            self.activating = false;
            return Promise.reject(err);
          }
        );
      }

      function askForFundingAddress() {
        if (self.isWaitingForFundingAddress) {
          return Promise.reject('Already requesting a funding address');
        }

        console.log(`REQUESTING A FUNDING ADDRESS TO ${self.bytesProviderDeviceAddress} TO BE USED WITH ${self.dagcoinOrigin}`);

        self.isWaitingForFundingAddress = true;

        const messageTitle = 'request.share-funded-address';
        const device = require('byteballcore/device.js');
        const messageId = discoveryService.nextMessageId();

        console.log(`Sending ${messageTitle} to ${device.getMyDeviceAddress()}:${self.dagcoinOrigin}`);

        const promise = listenToCreateNewSharedAddress();

        device.sendMessageToDevice(
          self.bytesProviderDeviceAddress,
          'text',
          JSON.stringify({
            protocol: 'dagcoin',
            title: messageTitle,
            id: messageId,
            deviceAddress: device.getMyDeviceAddress(),
            address: self.dagcoinOrigin
          })
        );

        return promise;
      }

      function listenToCreateNewSharedAddress() {
        return new Promise((resolve) => {
          const eventBus = require('byteballcore/event_bus');
          const device = require('byteballcore/device');

          eventBus.on('create_new_shared_address', (template, signers) => {
            console.log(`CREATE NEW SHARED ADDRESS FOR ${self.dagcoinOrigin} TEMPLATE: ${JSON.stringify(template)}`);
            console.log(`CREATE NEW SHARED ADDRESS FOR ${self.dagcoinOrigin} SIGNERS: ${JSON.stringify(signers)}`);

            const localSigners = {
              r: {
                address: self.dagcoinOrigin,
                device_address: device.getMyDeviceAddress()
              }
            };

            const objectHash = require('byteballcore/object_hash');
            const addressTemplateCHash = objectHash.getChash160(template);

            device.sendMessageToDevice(self.bytesProviderDeviceAddress, 'approve_new_shared_address', {
              address_definition_template_chash: addressTemplateCHash,
              address: self.dagcoinOrigin,
              device_addresses_by_relative_signing_paths: localSigners
            });

            self.byteOrigin = addressTemplateCHash;

            resolve();
          });
        });
      }

      // TODO: should have some dagcoins on it
      function readMyAddress() {
        return new Promise((resolve, reject) => {
          const walletGeneral = require('byteballcore/wallet_general.js');
          walletGeneral.readMyAddresses((arrMyAddresses) => {
            if (arrMyAddresses.length === 0) {
              reject('NO ADDRESSES AVAILABLE');
            } else {
              console.log(`FOUND AN ADDRESS: ${arrMyAddresses[0]}`);
              resolve(arrMyAddresses[0]);
            }
          });
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

      self.setIndex = (index) => {
        self.index = index;
      };

      return self;
    });
}());
