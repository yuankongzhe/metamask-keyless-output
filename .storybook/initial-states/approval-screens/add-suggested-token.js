import { ApprovalType } from '@metamask/controller-utils';

export const pendingTokenApprovals = {
  1: {
    id: 1,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        symbol: 'ETH',
        decimals: 18,
        image: './images/eth_logo.svg',
        unlisted: false,
      },
    },
  },
  2: {
    id: 2,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
        symbol: '0X',
        decimals: 18,
        image: '0x.svg',
        unlisted: false,
      },
    },
  },
  3: {
    id: 3,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        symbol: 'AST',
        decimals: 18,
        image: 'ast.png',
        unlisted: false,
      },
    },
  },
  4: {
    id: 4,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        symbol: 'BAT',
        decimals: 18,
        image: 'BAT_icon.svg',
        unlisted: false,
      },
    },
  },
  5: {
    id: 5,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0xe83cccfabd4ed148903bf36d4283ee7c8b3494d1',
        symbol: 'CVL',
        decimals: 18,
        image: 'CVL_token.svg',
        unlisted: false,
      },
    },
  },
  6: {
    id: 6,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        symbol: 'GLA',
        decimals: 18,
        image: 'gladius.svg',
        unlisted: false,
      },
    },
  },
  7: {
    id: 7,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x467Bccd9d29f223BcE8043b84E8C8B282827790F',
        symbol: 'GNO',
        decimals: 18,
        image: 'gnosis.svg',
        unlisted: false,
      },
    },
  },
  8: {
    id: 8,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0xff20817765cb7f73d4bde2e66e067e58d11095c2',
        symbol: 'OMG',
        decimals: 18,
        image: 'omg.jpg',
        unlisted: false,
      },
    },
  },
  9: {
    id: 9,
    type: ApprovalType.WatchAsset,
    requestData: {
      asset: {
        address: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
        symbol: 'WED',
        decimals: 18,
        image: 'wed.png',
        unlisted: false,
      },
    },
  },
};
