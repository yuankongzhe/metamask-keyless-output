const { strict: assert } = require('assert');
const {
  getWindowHandles,
  withFixtures,
  openDapp,
  unlockWallet,
  generateGanacheOptions,
} = require('../../helpers');
const FixtureBuilder = require('../../fixture-builder');

describe('Editing Confirm Transaction', function () {
  it('allows selecting high, medium, low gas estimates on edit gas fee popover @no-mmi', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withTransactionControllerTypeTwoTransaction()
          .build(),
        ganacheOptions: generateGanacheOptions({ hardfork: 'london' }),
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        const transactionAmounts = await driver.findElements(
          '.currency-display-component__text',
        );
        const transactionAmount = transactionAmounts[0];
        assert.equal(await transactionAmount.getText(), '1');

        // update estimates to high
        await driver.clickElement('[data-testid="edit-gas-fee-icon"]');
        await driver.waitForSelector({
          text: 'sec',
          tag: 'span',
        });
        await driver.clickElement(
          '[data-testid="edit-gas-fee-item-high"] > span:first-child',
        );

        await driver.waitForSelector({
          text: 'Aggressive',
        });

        // update estimates to medium
        await driver.clickElement('[data-testid="edit-gas-fee-icon"]');
        await driver.clickElement(
          '[data-testid="edit-gas-fee-item-medium"] > span:first-child',
        );

        await driver.waitForSelector({
          text: 'Market',
        });

        // update estimates to low
        await driver.clickElement('[data-testid="edit-gas-fee-icon"]');
        await driver.clickElement(
          '[data-testid="edit-gas-fee-item-low"] > span:first-child',
        );

        await driver.waitForSelector({
          text: 'Slow',
        });
        await driver.waitForSelector('[data-testid="low-gas-fee-alert"]');

        // confirms the transaction
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

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

  it('allows accessing advance gas fee popover from edit gas fee popover', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withTransactionControllerTypeTwoTransaction()
          .build(),
        ganacheOptions: generateGanacheOptions({ hardfork: 'london' }),
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        const transactionAmounts = await driver.findElements(
          '.currency-display-component__text',
        );
        const transactionAmount = transactionAmounts[0];
        assert.equal(await transactionAmount.getText(), '1');

        // update estimates to high
        await driver.clickElement('[data-testid="edit-gas-fee-icon"]');
        await driver.waitForSelector({
          text: 'sec',
          tag: 'span',
        });
        await driver.clickElement('[data-testid="edit-gas-fee-item-custom"]');

        // enter max fee
        await driver.fill('[data-testid="base-fee-input"]', '8.5');

        // enter priority fee
        await driver.fill('[data-testid="priority-fee-input"]', '8.5');

        // save default values
        await driver.clickElement('input[type="checkbox"]');

        // edit gas limit
        await driver.clickElement('[data-testid="advanced-gas-fee-edit"]');
        await driver.fill('[data-testid="gas-limit-input"]', '100000');

        // Submit gas fee changes
        await driver.clickElement({ text: 'Save', tag: 'button' });

        // has correct updated value on the confirm screen the transaction
        await driver.waitForSelector({
          css: '.currency-display-component__text',
          text: '0.00085',
        });
        await driver.waitForSelector({
          css: '.currency-display-component__suffix',
          text: 'ETH',
        });

        // confirms the transaction
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

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

  it('should use dapp suggested estimates for transaction coming from dapp @no-mmi', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions: generateGanacheOptions({ hardfork: 'london' }),
        title: this.test.fullTitle(),
        dapp: true,
      },
      async ({ driver }) => {
        // login to extension
        await unlockWallet(driver);

        // open dapp and connect
        await openDapp(driver);
        await driver.clickElement({
          text: 'Send EIP 1559 Transaction',
          tag: 'button',
        });

        // check transaction in extension popup
        const windowHandles = await getWindowHandles(driver, 3);
        await driver.switchToWindow(windowHandles.popup);
        await driver.waitForSelector({
          text: 'Site suggested',
        });

        await driver.clickElement('[data-testid="edit-gas-fee-icon"]');
        await driver.waitForSelector({
          text: 'sec',
          tag: 'span',
        });
        await driver.clickElement(
          '[data-testid="edit-gas-fee-item-dappSuggested"]',
        );

        const transactionAmounts = await driver.findElements(
          '.currency-display-component__text',
        );
        const transactionAmount = transactionAmounts[0];
        assert.equal(await transactionAmount.getText(), '0');

        // has correct updated value on the confirm screen the transaction
        await driver.waitForSelector({
          css: '.currency-display-component__text',
          text: '0.00021',
        });

        // confirms the transaction
        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        // transaction should correct values in activity tab
        await driver.switchToWindow(windowHandles.extension);
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
        assert.ok(/-0\s*ETH/u.test(await txValues[0].getText()));
      },
    );
  });
});
