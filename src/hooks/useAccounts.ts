import { useMemo } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

export function useAccounts() {
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  const ethersAccount = useAppKitAccount({ namespace: 'eip155' });

  return useMemo(() => {
    return {
      status: solanaAccount.status,
      solana: solanaAccount.address,
      bsc: ethersAccount.address,
      ethereum: ethersAccount.address,
    };
  }, [solanaAccount, ethersAccount]);
}