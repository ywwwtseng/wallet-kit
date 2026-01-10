// https://docs.reown.com/appkit/next/core/multichain
// https://github.com/reown-com/appkit-web-examples/tree/main/react/react-multichain
// https://solana.com/docs/tokens/basics/transfer-tokens
'use client';

import {
  use,
  useState,
  useMemo,
  useCallback,
  createContext,
} from 'react';
import {
  useAppKitProvider,
  useDisconnect,
  useAppKitNetwork,
} from '@reown/appkit/react';
import { type Provider } from '@reown/appkit-adapter-solana';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { WalletKitContext } from './WalletKitProvider';
import * as web3 from '@ywwwtseng/web3';
import { useSwitchChain, useAccount, useChainId } from 'wagmi';
import type { Address } from 'viem';
import { ContinueInWalletModal } from './ContinueInWalletModal';
import { mainnet, bsc } from './networks';
import { useAccounts } from './hooks/useAccounts';
import { config, useWagmiConfig } from './wagmi';
import { useConnect } from './hooks/useConnect';
import { getWagmiBalance, sendWagmiTransaction } from './wagmi';
import { Token } from './types';

export function clearLocalStorageByPrefix(prefix: string) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}

export interface WalletKitConnectContextState {
  isConnectPending: boolean;
  isSendTxPending: boolean;
  accounts: {
    status:
    | 'connected'
    | 'disconnected'
    | 'connecting'
    | 'reconnecting'
    | undefined;
    solana: string | undefined;
    bsc: string | undefined;
    ethereum: string | undefined;
  };
  balance: Record<string, string>;
  currentChainId: number | undefined;
  getBalance: (token: Token) => Promise<void>;
  open: () => Promise<void>;
  disconnect: (clearLocalStorage?: boolean) => Promise<void>;
  signTransaction: (params: {
    feePayer: string;
    source: string;
    token: Token;
    destination: string;
    amount: bigint | string;
  }) => Promise<web3.solana.Transaction>;
  sendTransaction: (params: {
    feePayer: string;
    source: string;
    token: Token;
    destination: string;
    amount: bigint | string;
  }) => Promise<string>;
  switchNetwork: (network: string) => Promise<void>;
}

export const WalletKitConnectContext = createContext<WalletKitConnectContextState>({
  isConnectPending: false,
  isSendTxPending: false,
  accounts: {
    status: undefined,
    solana: undefined,
    bsc: undefined,
    ethereum: undefined,
  },
  balance: {},
  currentChainId: undefined,
  getBalance: () => {
    throw new Error('getBalance is not implemented');
  },
  open: () => {
    throw new Error('open is not implemented');
  },
  disconnect: () => {
    throw new Error('disconnect is not implemented');
  },
  signTransaction: () => {
    throw new Error('createTransaction is not implemented');
  },
  sendTransaction: () => {
    throw new Error('sendTransaction is not implemented');
  },
  switchNetwork: () => {
    throw new Error('switchNetwork is not implemented');
  },
});

export const WalletKitConnectProvider = ({
  logo,
  children,
}: {
  logo: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { getWalletInfo } = use(WalletKitContext);
  const [balance, setBalance] = useState<Record<string, string>>({});
  const [continueInWalletModal, openContinueInWalletModal] = useState(false);
  const [isSendTxPending, setIsSendTxPending] = useState(false);
  const { disconnect } = useDisconnect();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const { switchChainAsync } = useSwitchChain();
  const { isConnected: isEVMConnected } = useAccount();
  const currentChainId = useChainId();

  const config = useWagmiConfig();

  const solanaProvider = useAppKitProvider<Provider>('solana');

  const { open, isPending: isConnectPending } = useConnect();

  const switchNetwork = async (network: string) => {
    if (network === 'bsc') {
      await switchAppKitNetwork(bsc);
    } else if (network === 'ethereum') {
      await switchAppKitNetwork(mainnet);
    }
  };

  const getBalance = async (token: Token) => {
    if (token.network === 'solana') {
      if (!connection || !accounts.solana) {
        return;
      }

      const balance = await web3.getBalance({
        network: token.network,
        connection: connection,
      })({
        address: accounts.solana,
        tokenAddress: token.token_address,
        tokenProgram: token.token_program,
      });

      setBalance({ [token.id]: String(balance) });
    } else if (token.network === 'bsc') {
      if (!connection || !accounts.ethereum) {
        return;
      }

      const balance = await getWagmiBalance(config, {
        address: accounts.ethereum as Address,
        token: (token.token_address ?? undefined) as Address | undefined,
        chainId: bsc.id,
      });

      setBalance({ [token.id]: String(balance.value) });
    } else if (token.network === 'ethereum') {
      if (!connection || !accounts.ethereum) {
        return;
      }

      const balance = await getWagmiBalance(config, {
        address: accounts.ethereum as Address,
        token: (token.token_address ?? undefined) as Address | undefined,
        chainId: mainnet.id,
      });

      setBalance({ [token.id]: String(balance.value) });
    }
  };

  const createTransaction = useCallback(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount,
    }: {
      feePayer: string;
      source: string;
      token: Token;
      destination: string;
      amount: bigint | string;
    }) => {
      if (!accounts.solana || !connection)
        throw Error('user is disconnected');

      const transaction = await web3.utils.solana.createTransaction(
        connection,
        {
          feePayer,
          source,
          destination,
          mint: token.token_address,
          amount,
          tokenProgram: token.token_program,
        }
      );

      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      transaction.feePayer = new web3.solana.PublicKey(feePayer);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
      return transaction;
    },
    [accounts.solana, solanaProvider, connection]
  );

  const signTransaction = useCallback(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount,
    }: {
      feePayer: string;
      source: string;
      token: Token;
      destination: string;
      amount: bigint | string;
    }) => {
      try {
        if (!accounts.solana || !connection)
          throw Error('user is disconnected');

        openContinueInWalletModal(true);

        const transaction = await createTransaction({
          feePayer,
          source,
          token,
          destination,
          amount,
        });

        const signedTransaction =
          await solanaProvider.walletProvider.signTransaction(transaction);

        return signedTransaction;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        openContinueInWalletModal(false);
      }
    },
    [accounts.solana, solanaProvider, connection]
  );

  const sendTransaction = async ({
    feePayer,
    source,
    token,
    destination,
    amount,
  }: {
    feePayer: string;
    source: string;
    token: Token;
    destination: string;
    amount: bigint | string;
  }) => {
    try {
      setIsSendTxPending(true);
      openContinueInWalletModal(true);

      const network = token.network;

      // if (network === 'solana') {
      //   await switchNetwork(solana);
      // } else if (network === 'bsc') {
      //   console.log('switch bsc')
      //   await switchNetwork(bsc);
      // } else if (network === 'ethereum') {
      //   await switchNetwork(mainnet);
      // }

      // Solana 网络使用独立的逻辑
      if (network === 'solana') {
        if (!connection) {
          throw Error('Solana connection not available');
        }

        const signature = await solanaProvider.walletProvider.sendTransaction(
          await createTransaction({
            feePayer,
            source,
            token,
            destination,
            amount,
          }),
          connection
        );

        console.log('signature', signature);

        return signature;
      }





      // EVM 链（ethereum、bsc）使用 wagmi
      // 检查 EVM 钱包是否已连接
      if (!isEVMConnected || !accounts.ethereum) {
        throw Error('EVM wallet not connected. Please connect an EVM wallet first.');
      }

      const chainIds = {
        bsc: bsc.id,
        ethereum: mainnet.id,
      };
      const chainId = chainIds[network as keyof typeof chainIds] as number | undefined;

      if (!chainId) {
        throw Error(`Unsupported network: ${network}`);
      }
      // 只有在当前链不是目标链时才切换
      if (currentChainId !== chainId) {
        await switchChainAsync({ chainId });
      }

      return await sendWagmiTransaction(config, {
        tokenAddress: token.token_address as Address | undefined,
        to: destination as Address,
        amount: typeof amount === 'string' ? BigInt(amount) : amount,
        chainId,
      });
    } catch (error) {
      console.error(error, 'error');
      throw error;
    } finally {
      setIsSendTxPending(false);
      openContinueInWalletModal(false);
    }
  };

  const value = useMemo(
    () => ({
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      open,
      getBalance,
      currentChainId,
      disconnect: async (clearLocalStorage?: boolean) => {
        await disconnect();

        if (clearLocalStorage) {
          clearLocalStorageByPrefix('@appkit/');
          clearLocalStorageByPrefix('wagmi.');
        }
      },
      signTransaction,
      sendTransaction,
      switchNetwork,
    }),
    [
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      open,
      getBalance,
      disconnect,
      signTransaction,
      sendTransaction,
      switchNetwork,
    ]
  );

  return (
    <WalletKitConnectContext.Provider value={value}>
      {children}
      {continueInWalletModal && (
        <ContinueInWalletModal
          open
          logo={logo}
          getWalletInfoAction={() => getWalletInfo?.()}
          onCloseAction={() => {
            openContinueInWalletModal(false);
          }}
        />
      )}
    </WalletKitConnectContext.Provider>
  );
};
