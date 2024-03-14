import { toChecksumAddress } from 'ethereumjs-util';
import { EthAccountType, EthMethod } from '@metamask/keyring-api';
import { toHex } from '@metamask/controller-utils';
import {
  getConfiguredCustodians,
  getCustodianIconForAddress,
  getCustodyAccountDetails,
  getCustodyAccountSupportedChains,
  getMmiPortfolioEnabled,
  getMmiPortfolioUrl,
  getTransactionStatusMap,
  getWaitForConfirmDeepLinkDialog,
  getIsCustodianSupportedChain,
  getMMIAddressFromModalOrAddress,
  getMMIConfiguration,
  getInteractiveReplacementToken,
  getCustodianDeepLink,
  getIsNoteToTraderSupported,
} from './selectors';

function buildState(overrides = {}) {
  const defaultState = {
    metamask: {
      providerConfig: {
        type: 'test',
        chainId: toHex(1),
      },
      internalAccounts: {
        selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
        accounts: {
          'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
            id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            metadata: {
              name: 'Custody Account A',
              keyring: {
                type: 'Custody',
              },
            },
            options: {},
            methods: [...Object.values(EthMethod)],
            type: EthAccountType.Eoa,
            code: '0x',
            balance: '0x47c9d71831c76efe',
            nonce: '0x1b',
            address: '0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275',
          },
        },
      },
      waitForConfirmDeepLinkDialog: '123',
      keyrings: [
        {
          type: 'Custody',
          accounts: ['0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275'],
        },
      ],
      custodyStatusMaps: '123',
      custodyAccountDetails: {
        '0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275': {
          custodianName: 'saturn',
        },
      },
      custodianSupportedChains: {
        '0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275': {
          supportedChains: ['1', '2'],
          custodianName: 'saturn',
        },
      },
      mmiConfiguration: {
        portfolio: {
          enabled: true,
          url: 'https://dashboard.metamask-institutional.io',
        },
        custodians: [
          {
            type: 'saturn',
            envName: 'saturn',
            apiUrl: 'https://saturn-custody.dev.metamask-institutional.io',
            iconUrl: 'images/saturn.svg',
            displayName: 'Saturn Custody',
            production: true,
            refreshTokenUrl: null,
            isNoteToTraderSupported: false,
            version: 1,
          },
        ],
      },
    },
  };
  return { ...defaultState, ...overrides };
}

describe('Institutional selectors', () => {
  describe('getWaitForConfirmDeepLinkDialog', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getWaitForConfirmDeepLinkDialog(state);
      expect(result).toStrictEqual(state.metamask.waitForConfirmDeepLinkDialog);
    });
  });

  describe('getCustodyAccountDetails', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getCustodyAccountDetails(state);
      expect(result).toStrictEqual(state.metamask.custodyAccountDetails);
    });
  });

  describe('getTransactionStatusMap', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getTransactionStatusMap(state);
      expect(result).toStrictEqual(state.metamask.custodyStatusMaps);
    });
  });

  describe('getCustodyAccountSupportedChains', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getCustodyAccountSupportedChains(
        state,
        '0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275',
      );
      expect(result).toStrictEqual(
        state.metamask.custodianSupportedChains[
          toChecksumAddress('0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275')
        ],
      );
    });
  });

  describe('getMmiPortfolioEnabled', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getMmiPortfolioEnabled(state);
      expect(result).toStrictEqual(
        state.metamask.mmiConfiguration.portfolio.enabled,
      );
    });
  });

  describe('getMmiPortfolioUrl', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getMmiPortfolioUrl(state);
      expect(result).toStrictEqual(
        state.metamask.mmiConfiguration.portfolio.url,
      );
    });
  });

  describe('getConfiguredCustodians', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getConfiguredCustodians(state);
      expect(result).toStrictEqual(state.metamask.mmiConfiguration.custodians);
    });
  });

  describe('getCustodianIconForAddress', () => {
    it('extracts a state property', () => {
      const state = buildState();
      const result = getCustodianIconForAddress(
        state,
        '0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275',
      );

      expect(result).toStrictEqual(
        state.metamask.mmiConfiguration.custodians[0].iconUrl,
      );
    });
  });

  describe('getIsCustodianSupportedChain', () => {
    it('returns true if the current keyring type is "custody" and currently selected chain ID is in the list of supported chain IDs', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: ['1', '2', '3'],
            },
          },
          providerConfig: {
            chainId: toHex(1),
          },
        },
      });

      const isSupported = getIsCustodianSupportedChain(state);

      expect(isSupported).toBe(true);
    });

    it('returns false if the current keyring type is "custody" and the currently selected chain ID is not in the list of supported chain IDs', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: ['4'],
            },
          },
          providerConfig: {
            chainId: toHex(1),
          },
        },
      });

      const isSupported = getIsCustodianSupportedChain(state);

      expect(isSupported).toBe(false);
    });

    it('returns true if the current keyring type is not "custody"', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          keyrings: [
            {
              type: 'SomethingElse',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: ['4'],
            },
          },
          internalAccounts: {
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                address: accountAddress,
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Test Account',
                  keyring: {
                    type: 'HD Key Tree',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
              },
            },
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
          },
          providerConfig: {
            chainId: toHex(1),
          },
        },
      });

      const isSupported = getIsCustodianSupportedChain(state);

      expect(isSupported).toBe(true);
    });

    it('throws an error if accountType is null', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          keyrings: [],
          custodianSupportedChains: {},
          selectedAddress: accountAddress,
          providerConfig: {},
        },
      });

      expect(() => getIsCustodianSupportedChain(state)).toThrow(
        'Invalid state',
      );
    });

    it('throws an error if providerConfig is null', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          keyrings: [
            {
              type: 'Custody',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {},
          selectedAddress: accountAddress,
          providerConfig: null,
        },
      });

      expect(() => getIsCustodianSupportedChain(state)).toThrow(
        'Invalid state',
      );
    });

    it('returns true if supportedChains is null', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          keyrings: [
            {
              type: 'Custody',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {
            [accountAddress]: null,
          },
          selectedAddress: accountAddress,
          providerConfig: {
            chainId: toHex(1),
          },
        },
      });

      const isSupported = getIsCustodianSupportedChain(state);

      expect(isSupported).toBe(true);
    });

    it('returns false if the supportedChains array is empty', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          keyrings: [
            {
              type: 'Custody',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: [],
            },
          },
          selectedAddress: accountAddress,
          providerConfig: {
            chainId: toHex(1),
          },
        },
      });

      const isSupported = getIsCustodianSupportedChain(state);

      expect(isSupported).toBe(false);
    });

    it('throws an error if chain ID is not a string', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: accountAddress,
              },
            },
          },
          keyrings: [
            {
              type: 'Custody',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: ['1'],
            },
          },
          selectedAddress: accountAddress,
          providerConfig: {
            chainId: 1,
          },
        },
      });

      expect(() => getIsCustodianSupportedChain(state)).toThrow(
        'Chain ID must be a string',
      );
    });

    it('throws an error if chain ID is not a hexadecimal number', () => {
      const accountAddress = '0x1';
      const state = buildState({
        metamask: {
          internalAccounts: {
            selectedAccount: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
            accounts: {
              'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3': {
                id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
                metadata: {
                  name: 'Custody Account A',
                  keyring: {
                    type: 'Custody',
                  },
                },
                options: {},
                methods: [...Object.values(EthMethod)],
                type: EthAccountType.Eoa,
                code: '0x',
                balance: '0x47c9d71831c76efe',
                nonce: '0x1b',
                address: '0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275',
              },
            },
          },
          keyrings: [
            {
              type: 'Custody',
              accounts: [accountAddress],
            },
          ],
          custodianSupportedChains: {
            [accountAddress]: {
              supportedChains: ['1'],
            },
          },
          selectedAddress: accountAddress,
          providerConfig: {
            chainId: 'not a hex number',
          },
        },
      });

      expect(() => getIsCustodianSupportedChain(state)).toThrow(
        'Chain ID must be a hexadecimal number',
      );
    });
  });

  describe('getMMIAddressFromModalOrAddress', () => {
    it('returns modalAddress if it exists', () => {
      const state = {
        appState: {
          modal: {
            modalState: {
              props: {
                address: 'modalAddress',
              },
            },
          },
        },
        metamask: {
          selectedAddress: 'selectedAddress',
        },
      };

      const address = getMMIAddressFromModalOrAddress(state);

      expect(address).toBe('modalAddress');
    });

    it('returns selectedAddress if modalAddress does not exist', () => {
      const state = {
        appState: {
          modal: {
            modalState: {
              props: {},
            },
          },
        },
        metamask: {
          selectedAddress: 'selectedAddress',
        },
      };

      const address = getMMIAddressFromModalOrAddress(state);

      expect(address).toBe('selectedAddress');
    });

    it('returns undefined if neither modalAddress nor selectedAddress exist', () => {
      const state = {
        appState: {
          modal: {
            modalState: {
              props: {},
            },
          },
        },
        metamask: {},
      };

      const address = getMMIAddressFromModalOrAddress(state);

      expect(address).toBeUndefined();
    });
  });

  describe('getMMIConfiguration', () => {
    it('returns mmiConfiguration if it exists', () => {
      const mmiConfiguration = [{ test: 'test' }];
      const state = {
        metamask: {
          mmiConfiguration,
        },
      };

      const config = getMMIConfiguration(state);

      expect(config).toStrictEqual(mmiConfiguration);
    });

    it('returns an empty array if mmiConfiguration does not exist', () => {
      const state = {
        metamask: {},
      };

      const config = getMMIConfiguration(state);

      expect(config).toStrictEqual([]);
    });
  });

  describe('getInteractiveReplacementToken', () => {
    it('returns interactiveReplacementToken if it exists', () => {
      const interactiveReplacementToken = {
        url: 'testUrl',
        oldRefreshToken: 'testToken',
      };
      const state = {
        metamask: {
          interactiveReplacementToken,
        },
      };

      const token = getInteractiveReplacementToken(state);

      expect(token).toStrictEqual(interactiveReplacementToken);
    });

    it('returns an empty object if interactiveReplacementToken does not exist', () => {
      const state = {
        metamask: {},
      };

      const token = getInteractiveReplacementToken(state);

      expect(token).toStrictEqual({});
    });
  });

  describe('getCustodianDeepLink', () => {
    it('returns custodianDeepLink if it exists', () => {
      const custodianDeepLink = {
        fromAddress: '0x',
        custodyId: 'custodyId',
      };
      const state = {
        metamask: {
          custodianDeepLink,
        },
      };

      const token = getCustodianDeepLink(state);

      expect(token).toStrictEqual(custodianDeepLink);
    });

    it('returns an empty object if custodianDeepLink does not exist', () => {
      const state = {
        metamask: {},
      };

      const token = getCustodianDeepLink(state);

      expect(token).toStrictEqual({});
    });
  });

  describe('getIsNoteToTraderSupported', () => {
    it('returns true if isNoteToTraderSupported is true for the custodian', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {
            '0x1': {
              custodianName: 'custodian1',
            },
          },
          mmiConfiguration: {
            custodians: [
              {
                envName: 'custodian1',
                isNoteToTraderSupported: true,
              },
            ],
          },
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(true);
    });

    it('returns false if isNoteToTraderSupported is false for the custodian', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {
            '0x1': {
              custodianName: 'custodian1',
            },
          },
          mmiConfiguration: {
            custodians: [
              {
                envName: 'custodian1',
                isNoteToTraderSupported: false,
              },
            ],
          },
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(false);
    });

    it('returns false if custodyAccountDetails does not exist for the address', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {},
          mmiConfiguration: {
            custodians: [
              {
                envName: 'custodian1',
                isNoteToTraderSupported: true,
              },
            ],
          },
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(false);
    });

    it('returns false if custodianName does not exist in custodyAccountDetails', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {
            '0x1': {},
          },
          mmiConfiguration: {
            custodians: [
              {
                envName: 'custodian1',
                isNoteToTraderSupported: true,
              },
            ],
          },
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(false);
    });

    it('returns false if custodianName does not match any custodian in mmiConfiguration', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {
            '0x1': {
              custodianName: 'custodian2',
            },
          },
          mmiConfiguration: {
            custodians: [
              {
                envName: 'custodian1',
                isNoteToTraderSupported: true,
              },
            ],
          },
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(false);
    });

    it('returns false if mmiConfiguration or custodians is null', () => {
      const state = {
        metamask: {
          custodyAccountDetails: {
            '0x1': {
              custodianName: 'custodian1',
            },
          },
          mmiConfiguration: null,
        },
      };

      const isSupported = getIsNoteToTraderSupported(state, '0x1');

      expect(isSupported).toBe(false);
    });
  });
});
