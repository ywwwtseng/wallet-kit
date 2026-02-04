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
import type { AppKitNetwork } from '@reown/appkit/networks';
import { type Provider } from '@reown/appkit-adapter-solana';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import type { Views } from '@reown/appkit/react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { WalletKitContext } from './WalletKitProvider';
import * as web3 from '@ywwwtseng/web3';
import { useSwitchChain, useConnection, useChainId, useConfig } from 'wagmi';
import type { Address } from 'viem';
import { ContinueInWalletModal, type ContinueInWalletModalType } from './ContinueInWalletModal';
import { mainnet, sepolia, bsc, bscTestnet, solana, solanaDevnet } from './networks';
import { useAccounts, type Accounts } from './hooks/useAccounts';
import { useConnect } from './hooks/useConnect';
import { getWagmiBalance, sendWagmiTransaction } from './wagmi';
import { clearLocalStorageByPrefix } from './utils';
import { Token } from './types';

export interface WalletKitConnectContextState {
  isMainnet: boolean;
  isConnectPending: boolean;
  isSendTxPending: boolean;
  error: Error | null;
  accounts: Accounts;
  balance: Record<string, string>;
  currentChainId: number | undefined;
  openContinueInWalletModal: (type: ContinueInWalletModalType) => void;
  closeContinueInWalletModal: () => void;
  getBalance: (token: Token) => Promise<void>;
  getNetwork: (network: string) => AppKitNetwork | undefined;
  connect: (options?: { view?: Views }) => Promise<void>;
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
  isMainnet: true,
  isConnectPending: false,
  isSendTxPending: false,
  error: null,
  accounts: {
    bsc: {
      address: undefined,
      status: undefined,
      isConnected: false,
    },
    ethereum: {
      address: undefined,
      status: undefined,
      isConnected: false,
    },
    solana: {
      address: undefined,
      status: undefined,
      isConnected: false,
    },
  },
  balance: {},
  currentChainId: undefined,
  openContinueInWalletModal: () => {
    throw new Error('openContinueInWalletModal is not implemented');
  },
  closeContinueInWalletModal: () => {
    throw new Error('closeContinueInWalletModal is not implemented');
  },
  getBalance: () => {
    throw new Error('getBalance is not implemented');
  },
  getNetwork: () => {
    throw new Error('getNetwork is not implemented');
  },
  connect: () => {
    throw new Error('connect is not implemented');
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
  theme = 'dark',
  debug = false,
  isMainnet = true,
  logo,
  children,
}: {
  theme?: 'light' | 'dark';
  debug?: boolean;
  isMainnet?: boolean;
  logo: React.ReactNode;
  children: React.ReactNode;
}) => {
  const config = useConfig();
  const [connectError, setConnectError] = useState<Error | null>(null);
  const { getWalletInfo } = use(WalletKitContext);
  const [balance, setBalance] = useState<Record<string, string>>({});
  const [continueInWalletModal, setContinueInWalletModal] = useState<{ open: boolean, type: ContinueInWalletModalType }>({ open: false, type: undefined });
  const [isSendTxPending, setIsSendTxPending] = useState(false);
  const { disconnect: d } = useDisconnect();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const switchChain = useSwitchChain();
  const { isConnected } = useConnection();
  const currentChainId = useChainId();

  if (debug) {
    console.log('[WalletKitConnectProvider] accounts', accounts);
  }

  const disconnect = useCallback(async (clearLocalStorage?: boolean) => {
    if (debug) {
      console.trace('[WalletKitConnectProvider] disconnect');
    }
    await d();

    if (clearLocalStorage) {
      clearLocalStorageByPrefix('@appkit/');
      clearLocalStorageByPrefix('wagmi.');
    }
    
  }, [d]);

  const openContinueInWalletModal = useCallback((type: ContinueInWalletModalType) => {
    setContinueInWalletModal({ open: true, type });
  }, [setContinueInWalletModal]);

  const closeContinueInWalletModal = useCallback(() => {
    setContinueInWalletModal({ open: false, type: undefined });
  }, [setContinueInWalletModal]);

  const solanaProvider = useAppKitProvider<Provider>('solana');

  const { open, isPending: isConnectPending } = useConnect();

  const connect = useCallback(async (options?: { view?: Views }) => {
    try {
      await open(options?.view);
    } catch (error) {
      setConnectError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [open]);

  const getNetwork = useCallback((network: string) => {
    if (network === 'bsc') {
      return isMainnet ? bsc : bscTestnet;
    }  else if (network === 'ethereum') {
      return isMainnet ? mainnet : sepolia;
    } else if (network === 'solana') {
      return isMainnet ? solana : solanaDevnet;
    }
    return undefined;
  }, [isMainnet]);

  const getAccountAddress = useCallback((network: string): Address | string | undefined => {
    if (network === 'bsc') {
      return accounts.bsc.address;
    } else if (network === 'ethereum') {
      return accounts.ethereum.address;
    } else if (network === 'solana') {
      return accounts.solana.address;
    }
    return undefined;
  }, [accounts]);

  const switchNetwork = async (network: string) => {
    if (network === 'bsc' || network === 'ethereum') {
      const targetNetwork = getNetwork(network);
      if (!targetNetwork) {
        throw new Error(`Network ${network} not found`);
      }
      // switchAppKitNetwork 会自动验证网络是否在 createAppKit 的 networks 配置中
      // 如果不在，它会抛出相应的错误
      await switchAppKitNetwork(targetNetwork);
    }
  };

  const getBalance = async (token: Token) => {
    if (token.network === 'solana') {
      if (!connection || !accounts.solana.address) {
        throw Error('user is disconnected');
      }

      const balance = await web3.getBalance({
        network: token.network,
        connection: connection,
      })({
        address: accounts.solana.address,
        tokenAddress: token.token_address,
        tokenProgram: token.token_program,
      });

      setBalance({ [token.id]: String(balance) });
    } else {
      const address = getAccountAddress(token.network) as Address;
      if (!address) {
        throw Error('user is disconnected');
      }
      const network = getNetwork(token.network);
      if (!network) {
        throw Error('network not found');
      }

      const balance = await getWagmiBalance(config, {
        address,
        token: (token.token_address ?? undefined) as Address | undefined,
        chainId: network.id as number,
      });

      setBalance({ [token.id]: String(balance) });
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

        openContinueInWalletModal('signTransaction');

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
        closeContinueInWalletModal();
      }
    },
    [accounts.solana, solanaProvider, connection, openContinueInWalletModal, closeContinueInWalletModal]
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
      openContinueInWalletModal('sendTransaction');

      // Solana 网络使用独立的逻辑
      if (token.network === 'solana') {
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

        return signature;
      }

      const network = getNetwork(token.network);
      const address = getAccountAddress(token.network) as Address;

      if (!network) {
        throw Error('network not found');
      }

      // EVM 链（ethereum、bsc）使用 wagmi
      // 检查 EVM 钱包是否已连接
      if (!isConnected || !address) {
        throw Error('EVM wallet not connected. Please connect an EVM wallet first.');
      }

      const chainId = network.id as number;

      if (!chainId) {
        throw Error(`Unsupported network: ${network}`);
      }
      // 只有在当前链不是目标链时才切换
      if (currentChainId !== chainId) {
        await switchChain.mutateAsync({ chainId });
      }

      const hash = await sendWagmiTransaction(config, {
        tokenAddress: token.token_address as Address | undefined,
        to: destination as Address,
        amount: typeof amount === 'string' ? BigInt(amount) : amount,
        chainId,
      });

      if (debug) {
        console.log('[WalletKitConnectProvider] sendTransaction:', hash);
      }

      // await waitForTransactionReceipt(config, {
      //   hash,
      //   retryCount: 10,
      //   retryDelay: ({ count }) => Math.min(1000 * 2 ** count, 5000),
      // });

      return hash;
    } catch (error) {
      console.error(error, 'error');
      throw error;
    } finally {
      setIsSendTxPending(false);
      closeContinueInWalletModal();
    }
  };

  const value = useMemo(
    () => ({
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      error: connectError,
      currentChainId,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      connect,
      getBalance,
      getNetwork,
      disconnect,
      signTransaction,
      sendTransaction,
      switchNetwork,
    }),
    [
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      connectError,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      connect,
      getBalance,
      getNetwork,
      disconnect,
      signTransaction,
      sendTransaction,
      switchNetwork,
    ]
  );

  return (
    <WalletKitConnectContext.Provider value={value}>
      {children}
      {continueInWalletModal.open && (
        <ContinueInWalletModal
          open
          type={continueInWalletModal.type}
          theme={theme}
          logo={logo}
          getWalletInfo={getWalletInfo}
          onClose={() => {
            setIsSendTxPending(false);
            closeContinueInWalletModal();
          }}
        />
      )}
    </WalletKitConnectContext.Provider>
  );
};
