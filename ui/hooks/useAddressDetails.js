import { useSelector } from 'react-redux';

import { toChecksumHexAddress } from '../../shared/modules/hexstring-utils';
import {
  getAddressBook,
  getInternalAccounts,
  getTokenList,
} from '../selectors';
import { shortenAddress } from '../helpers/utils/util';

const useAddressDetails = (toAddress) => {
  const addressBook = useSelector(getAddressBook);
  const accounts = useSelector(getInternalAccounts);
  const tokenList = useSelector(getTokenList);
  const checksummedAddress = toChecksumHexAddress(toAddress);

  if (!toAddress) {
    return {};
  }
  const toAccount = accounts.find(
    (account) => toChecksumHexAddress(account.address) === checksummedAddress,
  );

  const addressBookEntryObject = addressBook.find(
    (entry) => entry.address === checksummedAddress,
  );
  if (addressBookEntryObject?.name) {
    return { toName: addressBookEntryObject.name, isTrusted: true };
  }
  if (toAccount) {
    return { toName: toAccount.metadata.name, isTrusted: true };
  }
  if (tokenList[toAddress?.toLowerCase()]?.name) {
    return {
      toName: tokenList[toAddress?.toLowerCase()].name,
      isTrusted: true,
    };
  }
  return {
    toName: shortenAddress(checksummedAddress),
    isTrusted: false,
  };
};

export default useAddressDetails;
