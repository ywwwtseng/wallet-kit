// https://docs.reown.com/appkit/next/core/multichain
// https://github.com/reown-com/appkit-web-examples/tree/main/react/react-multichain
// https://solana.com/docs/tokens/basics/transfer-tokens
'use client';

import {
  useMemo,
  createContext,
} from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { ConnectedWalletInfo } from '@reown/appkit';
import { WalletKitConnectProvider } from './WalletKitConnectContext';
import type { AppKitNetwork } from './types';

// AppKit 配置类型（允许部分覆盖）
export type AppKitConfig = {
  networks?: [AppKitNetwork, ...AppKitNetwork[]];
  includeWalletIds?: string[];
  // 可以添加其他可配置的选项
};

interface WalletKitContextType {
  getWalletInfo?: () => ConnectedWalletInfo | undefined;
}

const queryClient = new QueryClient();


export const WalletKitContext = createContext<WalletKitContextType>({
  getWalletInfo: () => undefined,
});

export const WalletKitProvider = ({
  config,
  logo,
  children,
  getWalletInfo,
}: {
  config: typeof WagmiAdapter.prototype.wagmiConfig;
  logo: React.ReactNode;
  children: React.ReactNode;
  getWalletInfo?: () => ConnectedWalletInfo | undefined;
}) => {
  const value = useMemo(
    () => ({
      getWalletInfo,
    }),
    [
      getWalletInfo,
    ]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <WalletKitContext.Provider value={value}>
          <WalletKitConnectProvider logo={logo}>
            {children}
          </WalletKitConnectProvider>
        </WalletKitContext.Provider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
