import { useMemo } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import type { Address } from 'viem';

export interface Account {
  address: Address | string | undefined;
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
}

export interface Accounts {
  bsc: Account;
  ethereum: Account;
  solana: Account;
}

export function useAccounts() {
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  const ethersAccount = useAppKitAccount({ namespace: 'eip155' });

  return useMemo(() => {
    return {
      bsc: {
        address: ethersAccount.address as Address,
        status: ethersAccount.status,
      },
      ethereum: {
        address: ethersAccount.address as Address,
        status: ethersAccount.status,
      },
      solana: {
        address: solanaAccount.address as string,
        status: solanaAccount.status,
      },
    };
  }, [solanaAccount, ethersAccount]);
}
