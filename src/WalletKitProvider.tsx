// https://docs.reown.com/appkit/next/core/multichain
// https://github.com/reown-com/appkit-web-examples/tree/main/react/react-multichain
// https://solana.com/docs/tokens/basics/transfer-tokens
'use client';

import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletKitConnectProvider } from './WalletKitConnectProvider';
import { initAppKit } from './utils';

const queryClient = new QueryClient();

export const WalletKitProvider = ({
  theme = 'dark',
  debug = false,
  maunalExecuteConnectedCallbacks = false,
  isMainnet = true,
  cookies,
  logo,
  appKit,
  children,
}: {
  theme?: 'light' | 'dark';
  debug?: boolean;
  maunalExecuteConnectedCallbacks?: boolean;
  isMainnet?: boolean;
  cookies?: string | null;
  logo: React.ReactNode;
  appKit: ReturnType<typeof initAppKit>;
  children: React.ReactNode;
}) => {
  const initialState = cookieToInitialState(appKit.config, cookies);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={appKit.config} initialState={initialState}>
        <WalletKitConnectProvider
          debug={debug}
          isMainnet={isMainnet}
          logo={logo}
          theme={theme}
          maunalExecuteConnectedCallbacks={maunalExecuteConnectedCallbacks}
          getWalletInfo={appKit.getWalletInfo}
        >
          {children}
        </WalletKitConnectProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
