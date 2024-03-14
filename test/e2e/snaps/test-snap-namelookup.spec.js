const {
  withFixtures,
  defaultGanacheOptions,
  unlockWallet,
  WINDOW_TITLES,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const { TEST_SNAPS_WEBSITE_URL } = require('./enums');

describe('Test Snap Name Lookup', function () {
  it('tests name-lookup functionality', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await driver.navigate();
        await unlockWallet(driver);

        // navigate to test snaps page and connect
        await driver.openNewPage(TEST_SNAPS_WEBSITE_URL);

        // wait for page to load
        await driver.waitForSelector({
          text: 'Installed Snaps',
          tag: 'h2',
        });

        // find and scroll to the namelookup test snap and connect
        const snapButton1 = await driver.findElement('#connectname-lookup');
        await driver.scrollToElement(snapButton1);
        await driver.delay(1000);
        await driver.clickElement('#connectname-lookup');

        // switch to metamask extension and click connect
        const windowHandles = await driver.waitUntilXWindowHandles(
          3,
          1000,
          10000,
        );
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.Dialog,
          windowHandles,
        );
        await driver.clickElement({
          text: 'Connect',
          tag: 'button',
        });

        await driver.waitForSelector({ text: 'Install' });

        await driver.clickElement({
          text: 'Install',
          tag: 'button',
        });

        await driver.waitForSelector({ text: 'OK' });

        await driver.clickElement({
          text: 'OK',
          tag: 'button',
        });

        // switch to fullscreen metamask tab
        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
          windowHandles,
        );

        // switch network to ethereum-mainnet for name lookup to work
        await driver.clickElement('[data-testid="network-display"');
        await driver.waitForSelector({
          text: 'Ethereum Mainnet',
          tag: 'p',
        });
        await driver.clickElement({
          text: 'Ethereum Mainnet',
          tag: 'p',
        });

        // click send
        await driver.clickElement('[data-testid="eth-overview-send"]');

        // wait for input field and enter name to lookup
        await driver.waitForSelector('[data-testid="ens-input"]');
        await driver.fill('[data-testid="ens-input"]', 'metamask.domain');

        // verify name output from snap
        await driver.waitForSelector({
          text: '0xc0ff...4979',
          tag: 'p',
        });
      },
    );
  });
});
