import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
  TextAlign,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { DEFAULT_ROUTE } from '../../../../helpers/constants/routes';
import { getURLHost } from '../../../../helpers/utils/util';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import {
  getConnectedSitesList,
  getInternalAccounts,
  getOrderedConnectedAccountsForActiveTab,
  getOriginOfCurrentTab,
  getSelectedAccount,
} from '../../../../selectors';
import {
  AvatarFavicon,
  AvatarFaviconSize,
  Box,
  Button,
  ButtonIcon,
  ButtonIconSize,
  ButtonPrimary,
  ButtonPrimarySize,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../component-library';
import { Tab } from '../../../ui/tabs';
import Tabs from '../../../ui/tabs/tabs.component';
import { mergeAccounts } from '../../account-list-menu/account-list-menu';
import { AccountListItem, AccountListItemMenuTypes } from '../..';
import { Content, Footer, Header, Page } from '../page';
import { AccountType, ConnectedSites } from './components/connections.types';
import { NoConnectionContent } from './components/no-connection';

export const Connections = () => {
  const t = useI18nContext();
  const history = useHistory();
  const CONNECTED_ACCOUNTS_TAB_KEY = 'connected-accounts';
  const activeTabOrigin = useSelector(getOriginOfCurrentTab);
  const subjectMetadata: { [key: string]: any } = useSelector(
    getConnectedSitesList,
  );
  const connectedSubjectsMetadata = subjectMetadata[activeTabOrigin];
  const connectedAccounts = useSelector(
    getOrderedConnectedAccountsForActiveTab,
  );
  const selectedAccount = useSelector(getSelectedAccount);
  const internalAccounts = useSelector(getInternalAccounts);
  const mergedAccounts = mergeAccounts(connectedAccounts, internalAccounts);
  return (
    <Page data-testid="connections-page" className="connections-page">
      <Header
        backgroundColor={BackgroundColor.backgroundDefault}
        startAccessory={
          <ButtonIcon
            ariaLabel={t('back')}
            iconName={IconName.ArrowLeft}
            className="connections-header__start-accessory"
            color={IconColor.iconDefault}
            onClick={() => history.push(DEFAULT_ROUTE)}
            size={ButtonIconSize.Sm}
          />
        }
      >
        <Box
          display={Display.Flex}
          alignItems={AlignItems.center}
          gap={2}
          justifyContent={JustifyContent.center}
          className="connections-header__title"
        >
          {connectedSubjectsMetadata?.iconUrl ? (
            <AvatarFavicon
              name={connectedSubjectsMetadata.name}
              size={AvatarFaviconSize.Sm}
              src={connectedSubjectsMetadata.iconUrl}
            />
          ) : (
            <Icon
              name={IconName.Global}
              size={IconSize.Sm}
              color={IconColor.iconDefault}
            />
          )}
          <Text
            as="span"
            variant={TextVariant.headingMd}
            textAlign={TextAlign.Center}
            ellipsis
          >
            {getURLHost(activeTabOrigin)}
          </Text>
        </Box>
      </Header>
      <Content padding={0}>
        {connectedSubjectsMetadata ? (
          <Tabs defaultActiveTabKey="connections">
            {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              <Tab
                tabKey={CONNECTED_ACCOUNTS_TAB_KEY}
                name={t('connectedaccountsTabKey')}
                padding={4}
              >
                {mergedAccounts.map((account: AccountType, index: number) => {
                  const connectedSites: ConnectedSites = {};

                  const connectedSite = connectedSites[account.address]?.find(
                    ({ origin }) => origin === activeTabOrigin,
                  );
                  return (
                    <AccountListItem
                      identity={account}
                      key={account.address}
                      accountsCount={mergedAccounts.length}
                      selected={selectedAccount.address === account.address}
                      connectedAvatar={connectedSite?.iconUrl}
                      connectedAvatarName={connectedSite?.name}
                      menuType={AccountListItemMenuTypes.Connection}
                      currentTabOrigin={activeTabOrigin}
                      isActive={index === 0 ? t('active') : null}
                    />
                  );
                })}
              </Tab>
            }
          </Tabs>
        ) : (
          <NoConnectionContent />
        )}
      </Content>
      <Footer>
        {connectedSubjectsMetadata ? (
          <Box
            display={Display.Flex}
            gap={2}
            flexDirection={FlexDirection.Column}
            width={BlockSize.Full}
            data-test-id="connections-button"
          >
            <Button
              size={ButtonSize.Lg}
              block
              variant={ButtonVariant.Secondary}
              startIconName={IconName.Add}
            >
              {t('connectMoreAccounts')}
            </Button>
            <Button
              size={ButtonSize.Lg}
              block
              variant={ButtonVariant.Secondary}
              startIconName={IconName.Logout}
              danger
            >
              {t('disconnectAllAccounts')}
            </Button>
          </Box>
        ) : (
          <ButtonPrimary
            size={ButtonPrimarySize.Lg}
            block
            data-test-id="no-connections-button"
          >
            {t('connectAccounts')}
          </ButtonPrimary>
        )}
      </Footer>
    </Page>
  );
};
