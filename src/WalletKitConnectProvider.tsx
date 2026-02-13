// https://docs.reown.com/appkit/next/core/multichain
// https://github.com/reown-com/appkit-web-examples/tree/main/react/react-multichain
// https://solana.com/docs/tokens/basics/transfer-tokens
'use client';

import {
  use,
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  createContext,
} from 'react';
import {
  useAppKitProvider,
  useDisconnect,
  useAppKitNetwork,
  type Views
} from '@reown/appkit/react';
import type { ConnectedWalletInfo } from '@reown/appkit';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { type Provider } from '@reown/appkit-adapter-solana';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { waitForTransactionReceipt } from 'wagmi/actions';
import * as web3 from '@ywwwtseng/web3';
import { useSwitchChain, useConnection, useChainId, useConfig } from 'wagmi';
import type { Address } from 'viem';
import { ContinueInWalletModal, type ContinueInWalletModalType } from './ContinueInWalletModal';
import { mainnet, sepolia, bsc, bscTestnet, solana, solanaDevnet } from './networks';
import { useAccounts, type Accounts, type Account } from './hooks/useAccounts';
import { useConnect } from './hooks/useConnect';
import { sendWagmiTransaction } from './wagmi';
import { clearLocalStorageByPrefix } from './utils';
import { Token } from './types';

export interface WalletKitConnectContextState {
  isMainnet: boolean;
  isConnectPending: boolean;
  isSendTxPending: boolean;
  error: Error | null;
  accounts: Accounts;
  balances: Record<string, string>;
  currentChainId: number | undefined;
  connectedCallbacks: {
    bsc: Function[];
    ethereum: Function[];
    solana: Function[];
  };
  getAccount: (network?: string | null) => Account | undefined;
  executeConnectedCallbacks: (network: string) => Promise<void>;
  openContinueInWalletModal: (type: ContinueInWalletModalType) => void;
  closeContinueInWalletModal: () => void;
  setBalances: (balances: Record<string, string>) => void;
  getNetwork: (network?: string | null) => AppKitNetwork | undefined;
  open: (options?: { view?: Views }) => Promise<void>;
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
  balances: {},
  currentChainId: undefined,
  connectedCallbacks: {
    bsc: [],
    ethereum: [],
    solana: [],
  },
  getAccount: () => {
    throw new Error('getAccount is not implemented');
  },
  executeConnectedCallbacks: () => {
    throw new Error('executeConnectedCallbacks is not implemented');
  },
  openContinueInWalletModal: () => {
    throw new Error('openContinueInWalletModal is not implemented');
  },
  closeContinueInWalletModal: () => {
    throw new Error('closeContinueInWalletModal is not implemented');
  },
  setBalances: () => {
    throw new Error('setBalances is not implemented');
  },
  getNetwork: () => {
    throw new Error('getNetwork is not implemented');
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
  theme = 'dark',
  debug = false,
  isMainnet = true,
  maunalExecuteConnectedCallbacks = false,
  logo,
  children,
  getWalletInfo,
}: {
  theme?: 'light' | 'dark';
  debug?: boolean;
  isMainnet?: boolean;
  maunalExecuteConnectedCallbacks?: boolean;
  logo: React.ReactNode;
  children: React.ReactNode;
  getWalletInfo: () => ConnectedWalletInfo;
}) => {
  const connectedCallbacksRef = useRef({
    bsc: [],
    ethereum: [],
    solana: [],
  });
  const config = useConfig();
  const [connectError, setConnectError] = useState<Error | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [continueInWalletModal, setContinueInWalletModal] = useState<{ open: boolean, type: ContinueInWalletModalType }>({ open: false, type: undefined });
  const [isSendTxPending, setIsSendTxPending] = useState(false);
  const { disconnect: _disconnect } = useDisconnect();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const switchChain = useSwitchChain();
  const { isConnected } = useConnection();
  const currentChainId = useChainId();

  const executeConnectedCallbacks = useCallback(async (network: string) => {
    if (network === 'bsc') {
      for (const callback of connectedCallbacksRef.current.bsc) {
        await callback();
      }
      connectedCallbacksRef.current.bsc = [];
    } else if (network === 'ethereum') {
      for (const callback of connectedCallbacksRef.current.ethereum) {
        await callback();
      }
      connectedCallbacksRef.current.ethereum = [];
    } else if (network === 'solana') {
      for (const callback of connectedCallbacksRef.current.solana) {
        await callback();
      }
      connectedCallbacksRef.current.solana = [];
    }
  }, [maunalExecuteConnectedCallbacks]);

  useEffect(() => {
    if (accounts.bsc.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks('bsc');
    }
  }, [accounts.bsc.isConnected, maunalExecuteConnectedCallbacks]);

  useEffect(() => {
    if (accounts.ethereum.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks('ethereum');
    }
  }, [accounts.ethereum.isConnected, maunalExecuteConnectedCallbacks]);

  useEffect(() => {
    if (accounts.solana.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks('solana');
    }
  }, [accounts.solana.isConnected, maunalExecuteConnectedCallbacks]);

  if (debug) {
    console.log('[WalletKitConnectProvider] accounts', accounts);
  }

  const disconnect = useCallback(async (clearLocalStorage?: boolean) => {
    if (debug) {
      console.trace('[WalletKitConnectProvider] disconnect');
    }
    await _disconnect();

    if (clearLocalStorage) {
      clearLocalStorageByPrefix('@appkit/');
      clearLocalStorageByPrefix('wagmi.');
    }
    
  }, [_disconnect]);

  const openContinueInWalletModal = useCallback((type: ContinueInWalletModalType) => {
    setContinueInWalletModal({ open: true, type });
  }, [setContinueInWalletModal]);

  const closeContinueInWalletModal = useCallback(() => {
    setContinueInWalletModal({ open: false, type: undefined });
  }, [setContinueInWalletModal]);

  const solanaProvider = useAppKitProvider<Provider>('solana');

  const { open: _open, isPending: isConnectPending } = useConnect();

  const open = useCallback(async (options?: { view?: Views }) => {
    try {
      await _open(options?.view);
    } catch (error) {
      setConnectError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [_open]);

  const getNetwork = useCallback((network?: string | null) => {
    if (network === 'bsc') {
      return isMainnet ? bsc : bscTestnet;
    }  else if (network === 'ethereum') {
      return isMainnet ? mainnet : sepolia;
    } else if (network === 'solana') {
      return isMainnet ? solana : solanaDevnet;
    }
    return undefined;
  }, [isMainnet]);

  const getAccount = useCallback((network?: string | null): Account | undefined => {
    if (network === 'bsc') {
      return accounts.bsc;
    } else if (network === 'ethereum') {
      return accounts.ethereum;
    } else if (network === 'solana') {
      return accounts.solana;
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
      const address = getAccount(token.network)?.address as Address;

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
      balances,
      isConnectPending,
      isSendTxPending,
      error: connectError,
      currentChainId,
      connectedCallbacks: connectedCallbacksRef.current,
      getAccount,
      executeConnectedCallbacks,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      open,
      disconnect,
      setBalances,
      getNetwork,
      signTransaction,
      sendTransaction,
      switchNetwork,
    }),
    [
      isMainnet,
      accounts,
      balances,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      connectError,
      getAccount,
      executeConnectedCallbacks,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      open,
      setBalances,
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
            console.log('[WalletKitConnectProvider] onClose');
            setIsSendTxPending(false);
            closeContinueInWalletModal();
          }}
        />
      )}
    </WalletKitConnectContext.Provider>
  );
};
