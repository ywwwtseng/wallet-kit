import { useMemo, useState, useEffect } from 'react';
import { useAppKitAccount, type AccountState } from '@reown/appkit/react';
import type { Address } from 'viem';
import { useFinalizedAppKitStatus } from './useFinalizedAppKitStatus';

export interface Account {
  address: Address | string | undefined;
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
}

export interface Accounts {
  bsc: Account;
  ethereum: Account;
  solana: Account;
}

// (connecting) -> (disconnected) -> connecting -> disconnected
// (reconnecting) -> (connected) -> reconnecting ->connected

export function useAccounts() {
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  const ethersAccount = useAppKitAccount({ namespace: 'eip155' });
  const finalizedStatus = useFinalizedAppKitStatus(ethersAccount.status);

  return useMemo(() => {
    return {
      bsc: {
        address: ethersAccount.address as Address,
        status: finalizedStatus,
      },
      ethereum: {
        address: ethersAccount.address as Address,
        status: finalizedStatus,
      },
      solana: {
        address: solanaAccount.address as string,
        status: solanaAccount.status,
      },
    };
  }, [solanaAccount, ethersAccount, finalizedStatus]);
}
