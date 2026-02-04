import { useMemo } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import type { Address } from 'viem';
import { useStabilizedAccount } from './useStabilizedAccount';

export interface Account {
  address: Address | string | undefined;
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
  isConnected: boolean;
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
  const stabilizedAccount = useStabilizedAccount(ethersAccount);

  return useMemo(() => {
    return {
      bsc: stabilizedAccount,
      ethereum: stabilizedAccount,
      solana: {
        address: solanaAccount.address as string,
        status: solanaAccount.status,
        isConnected: solanaAccount.isConnected,
      },
    };
  }, [solanaAccount, ethersAccount, stabilizedAccount]);
}
