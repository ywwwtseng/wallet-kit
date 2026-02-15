import { useEffect, useRef, useState } from 'react';
import { type UseAppKitAccountReturn } from '@reown/appkit/react';

type Status = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export function useStabilizedAccount(
  account: UseAppKitAccountReturn,
) {
  const statusRef = useRef<Status | undefined>(undefined);
  const [stabilizedAccount, setStabilizedAccount] = useState({
    address: account.address,
    isConnected: account.isConnected,
    status: 'connecting' as Status,
  });


  useEffect(() => {
    if (account.status === 'connecting' || account.status === 'reconnecting') {
      if (!statusRef.current) {
        statusRef.current = account.status;
      }
    } else {
      statusRef.current = account.status;
    }

    setStabilizedAccount({
      address: account.address,
      status: statusRef.current,
      isConnected: account.isConnected,
    });
  }, [account.address, account.status, account.isConnected]);

  return stabilizedAccount;
}
