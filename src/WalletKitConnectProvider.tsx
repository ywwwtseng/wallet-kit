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
import { WalletKitContext } from './WalletKitProvider';
import * as web3 from '@ywwwtseng/web3';
import { useSwitchChain, useAccount, useChainId, type Config } from 'wagmi';
import type { Address } from 'viem';
import { ContinueInWalletModal } from './ContinueInWalletModal';
import { mainnet, sepolia, bsc, bscTestnet, solana, solanaDevnet } from './networks';
import { useAccounts, type Accounts } from './hooks/useAccounts';
import { useWagmiConfig } from './wagmi';
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
    },
    ethereum: {
      address: undefined,
      status: undefined,
    },
    solana: {
      address: undefined,
      status: undefined,
    },
  },
  balance: {},
  currentChainId: undefined,
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
  isMainnet = true,
  logo,
  config,
  children,
}: {
  isMainnet?: boolean;
  logo: React.ReactNode;
  config: Config;
  children: React.ReactNode;
}) => {
  const [connectError, setConnectError] = useState<Error | null>(null);
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

      console.log(config, 'config');

      const balance = await getWagmiBalance(config, {
        address,
        token: (token.token_address ?? undefined) as Address | undefined,
        chainId: network.id as number,
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
      if (!isEVMConnected || !address) {
        throw Error('EVM wallet not connected. Please connect an EVM wallet first.');
      }

      const chainId = network.id as number;

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
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      error: connectError,
      currentChainId,
      connect,
      getBalance,
      getNetwork,
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
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      connectError,
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
