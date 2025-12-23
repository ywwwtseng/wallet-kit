'use client';

import { use } from 'react';
import { WalletKitConnectContext } from '../WalletKitConnectContext';

export function useWalletKitConnect() {
  const context = use(WalletKitConnectContext);

  if (!context) {
    throw new Error('useWalletKitConnect must be used within a WalletKitProvider');
  }

  return context;
}