'use client';

import { use } from 'react';
import { WalletKitAuthContext } from '../WalletKitAuthProvider';

export function useWalletKitAuth() {
  const context = use(WalletKitAuthContext);

  if (!context) {
    throw new Error('useWalletKitAuth must be used within a WalletKitAuthProvider');
  }

  return context;
}