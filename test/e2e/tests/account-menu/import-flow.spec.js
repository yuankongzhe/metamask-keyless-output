const { strict: assert } = require('assert');
const path = require('path');
const {
  TEST_SEED_PHRASE,
  convertToHexValue,
  withFixtures,
  regularDelayMs,
  largeDelayMs,
  completeImportSRPOnboardingFlow,
  completeImportSRPOnboardingFlowWordByWord,
  openActionMenuAndStartSendFlow,
  unlockWallet,
  WALLET_PASSWORD,
  waitForAccountRendered,
} = require('../../helpers');
const FixtureBuilder = require('../../fixture-builder');
const { emptyHtmlPage } = require('../../mock-e2e');

const ganacheOptions = {
  accounts: [
    {
      secretKey:
        '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
      balance: convertToHexValue(25000000000000000000),
    },
  ],
};

async function mockTrezor(mockServer) {
  return await mockServer
    .forGet('https://connect.trezor.io/9/popup.html')
    .thenCallback(() => {
      return {
        statusCode: 200,
        body: emptyHtmlPage(),
      };
    });
}

describe('Import flow @no-mmi', function () {
  it('Import wallet using Secret Recovery Phrase', async function () {
    if (process.env.MULTICHAIN) {
      return;
    }
    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await driver.navigate();

        await completeImportSRPOnboardingFlow(
          driver,
          TEST_SEED_PHRASE,
          WALLET_PASSWORD,
        );

        // Show account information
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="account-list-item-menu-button"]',
        );
        await driver.clickElement('[data-testid="account-list-menu-details"');
        await driver.findVisibleElement('.qr-code__wrapper');

        // shows a QR code for the account
        await driver.findVisibleElement(
          '[data-testid="account-details-modal"]',
        );
        // shows the correct account address
        await driver.findElement('[data-testid="app-header-copy-button"]');

        await driver.clickElement('button[aria-label="Close"]');
        await driver.assertElementNotPresent(
          '[data-testid="account-details-modal"]',
        );
        // logs out of the account
        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );
        await driver.clickElement({
          css: '[data-testid="global-menu-lock"]',
          text: 'Lock MetaMask',
        });

        // accepts the account password after lock
        await unlockWallet(driver, {
          waitLoginSuccess: false,
        });

        // Create a new account
        // switches to localhost
        await driver.delay(largeDelayMs);
        await driver.clickElement('[data-testid="network-display"]');
        await driver.clickElement('.toggle-button');
        await driver.clickElement({ text: 'Localhost', tag: 'p' });

        // choose Create account from the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );
        await driver.clickElement({ text: 'Add a new account', tag: 'button' });

        // set account name
        await driver.fill('[placeholder="Account 2"]', '2nd account');
        await driver.delay(regularDelayMs);
        await driver.clickElement({ text: 'Create', tag: 'button' });

        // should show the correct account name
        const accountName = await driver.isElementPresent({
          tag: 'span',
          text: '2nd account',
        });

        assert.equal(accountName, true, 'Account name is not correct');

        // Switch back to original account
        // chooses the original account from the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '.multichain-account-list-item__account-name__button',
        );

        // Send ETH from inside MetaMask
        // starts a send transaction
        await openActionMenuAndStartSendFlow(driver);
        await driver.fill(
          'input[placeholder="Enter public address (0x) or ENS name"]',
          '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        );
        await driver.fill('.unit-input__input', '1');
        // Continue to next screen
        await driver.clickElement({ text: 'Next', tag: 'button' });

        // confirms the transaction
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        // finds the transaction in the transactions list
        await driver.clickElement('[data-testid="home__activity-tab"]');
        await driver.wait(async () => {
          const confirmedTxes = await driver.findElements(
            '.transaction-list__completed-transactions .activity-list-item',
          );
          return confirmedTxes.length === 1;
        }, 10000);

        const txValues = await driver.findElements(
          '[data-testid="transaction-list-item-primary-currency"]',
        );
        assert.equal(txValues.length, 1);
        assert.ok(/-1\s*ETH/u.test(await txValues[0].getText()));
      },
    );
  });

  it('Import wallet using Secret Recovery Phrase with pasting word by word', async function () {
    const testAddress = '0x0Cc5261AB8cE458dc977078A3623E2BaDD27afD3';

    await withFixtures(
      {
        fixtures: new FixtureBuilder({ onboarding: true }).build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await driver.navigate();

        await completeImportSRPOnboardingFlowWordByWord(
          driver,
          TEST_SEED_PHRASE,
          WALLET_PASSWORD,
        );

        // Show account information
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="account-list-item-menu-button"]',
        );
        await driver.clickElement('[data-testid="account-list-menu-details"');
        await driver.findVisibleElement('.qr-code__wrapper');
        // shows the correct account address
        await driver.findElement({
          css: '.qr-code [data-testid="address-copy-button-text"]',
          text: testAddress,
        });
      },
    );
  });

  it('Import Account using private key and remove imported account', async function () {
    const testPrivateKey1 =
      '14abe6f4aab7f9f626fe981c864d0adeb5685f289ac9270c27b8fd790b4235d6';
    const testPrivateKey2 =
      'F4EC2590A0C10DE95FBF4547845178910E40F5035320C516A18C117DE02B5669';

    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withKeyringControllerImportedAccountVault()
          .withPreferencesControllerImportedAccountIdentities()
          .withAccountsControllerImportedAccount()
          .build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );
        await driver.clickElement({ text: 'Import account', tag: 'button' });

        // Imports Account 4 with private key
        await driver.findClickableElement('#private-key-box');
        await driver.fill('#private-key-box', testPrivateKey1);
        await driver.clickElement(
          '[data-testid="import-account-confirm-button"]',
        );

        // New imported account has correct name and label
        await driver.findClickableElement({
          css: '[data-testid="account-menu-icon"]',
          text: 'Account 4',
        });
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.findElement({
          css: `.multichain-account-list-item--selected .multichain-account-list-item__content .mm-tag`,
          text: 'Imported',
        });

        // Imports Account 5 with private key
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );
        await driver.clickElement({ text: 'Import account', tag: 'button' });
        await driver.findClickableElement('#private-key-box');
        await driver.fill('#private-key-box', testPrivateKey2);
        await driver.clickElement(
          '[data-testid="import-account-confirm-button"]',
        );

        // New imported account has correct name and label
        await driver.findClickableElement({
          css: '[data-testid="account-menu-icon"]',
          text: 'Account 5',
        });
        await driver.clickElement('[data-testid="account-menu-icon"]');
        const accountListItems = await driver.findElements(
          '.multichain-account-list-item',
        );
        assert.equal(accountListItems.length, 5);

        await driver.clickElement(
          '.multichain-account-list-item--selected [data-testid="account-list-item-menu-button"]',
        );

        // Account 5 can be removed
        await driver.clickElement('[data-testid="account-list-menu-remove"]');
        await driver.clickElement({ text: 'Remove', tag: 'button' });

        await driver.delay(1000);
        await driver.clickElementUsingMouseMove({
          css: '[data-testid="account-menu-icon"]',
          text: 'Account 4',
        });
        const accountListItemsAfterRemoval = await driver.findElements(
          '.multichain-account-list-item',
        );
        assert.equal(accountListItemsAfterRemoval.length, 4);
      },
    );
  });

  it('Import Account using json file', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withKeyringControllerImportedAccountVault()
          .withPreferencesControllerImportedAccountIdentities()
          .withAccountsControllerImportedAccount()
          .build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);
        await waitForAccountRendered(driver);
        // Imports an account with JSON file
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );

        await driver.clickElement({ text: 'Import account', tag: 'button' });

        await driver.clickElement('.dropdown__select');
        await driver.clickElement({ text: 'JSON File', tag: 'option' });

        const fileInput = await driver.findElement('input[type="file"]');
        const importJsonFile = path.join(
          __dirname,
          '../..',
          'import-utc-json',
          'test-json-import-account-file.json',
        );

        fileInput.sendKeys(importJsonFile);

        await driver.fill('#json-password-box', 'foobarbazqux');
        await driver.clickElement(
          '[data-testid="import-account-confirm-button"]',
        );

        await waitForAccountRendered(driver);
        // New imported account has correct name and label
        await driver.findClickableElement({
          css: '[data-testid="account-menu-icon"]',
          text: 'Account 4',
        });

        await driver.clickElement('[data-testid="account-menu-icon"]');

        await driver.findElement({
          css: `.multichain-account-list-item--selected .multichain-account-list-item__content .mm-tag`,
          text: 'Imported',
        });

        const accountListItems = await driver.findElements(
          '.multichain-account-list-item',
        );
        assert.equal(accountListItems.length, 4);
      },
    );
  });

  it('Import Account using private key of an already active account should result in an error', async function () {
    const testPrivateKey =
      '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9';
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withKeyringControllerImportedAccountVault()
          .withPreferencesControllerImportedAccountIdentities()
          .withAccountsControllerImportedAccount()
          .build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        // choose Import Account from the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );
        await driver.clickElement({ text: 'Import account', tag: 'button' });

        // enter private key
        await driver.findClickableElement('#private-key-box');
        await driver.fill('#private-key-box', testPrivateKey);
        await driver.clickElement(
          '[data-testid="import-account-confirm-button"]',
        );

        // error should occur
        await driver.waitForSelector({
          css: '.mm-help-text',
          text: 'The account you are trying to import is a duplicate',
        });
      },
    );
  });

  it('Connects to a Hardware wallet for trezor', async function () {
    if (process.env.ENABLE_MV3) {
      // Hardware wallets not supported in MV3 build yet
      this.skip();
    }
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        ganacheOptions,
        title: this.test.fullTitle(),
        testSpecificMock: mockTrezor,
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        // choose Connect hardware wallet from the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement(
          '[data-testid="multichain-account-menu-popover-action-button"]',
        );
        await driver.clickElement({
          text: 'Add hardware wallet',
          tag: 'button',
        });
        await driver.delay(regularDelayMs);

        // should open the TREZOR Connect popup
        await driver.clickElement('.hw-connect__btn:nth-of-type(2)');
        await driver.delay(largeDelayMs * 2);
        await driver.clickElement({ text: 'Continue', tag: 'button' });

        const allWindows = await driver.waitUntilXWindowHandles(2);
        assert.equal(allWindows.length, 2);
      },
    );
  });
});
