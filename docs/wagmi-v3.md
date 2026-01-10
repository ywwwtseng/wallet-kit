```ts
/**
 * React Hook for Wallet using Wagmi and Reown AppKit
 * 
 * Provides easy-to-use hooks for wallet connection and contract interaction
 */

'use client';

import { useState } from 'react';
import { useConnection, useConnectors, useChainId, useReadContract, useWaitForTransactionReceipt, useBalance, useConfig } from 'wagmi';
import { switchChain, connect, disconnect, writeContract, sendTransaction } from 'wagmi/actions';
import { useAppKit } from '@reown/appkit/react';
import type { Address } from 'viem';
import type { SendTransactionParameters } from 'wagmi/actions';

export interface WalletState {
  address: Address | null;
  isConnected: boolean;
  chainId: number | null;
  chain: number | null;
}

export interface ConnectOptions {
  chain?: number;
  connectorId?: string;
  walletConnect?: boolean; // 如果为 true，直接使用 WalletConnect 显示 QR code
}

export interface UseWalletReturn {
  state: WalletState;
  currentChain: number;
  connect: (options?: ConnectOptions) => void;
  disconnect: () => void;
  switchChain: (chainId: number) => void;
  isConnecting: boolean;
  error: Error | null;
}

/**
 * Hook for using wallet with Reown AppKit and Wagmi
 */
export function useWallet(): UseWalletReturn {
  const { address, isConnected, chainId } = useConnection();
  const connectors = useConnectors();
  const currentChainId = useChainId();
  const config = useConfig();
  const { open } = useAppKit();
  
  // Get AppKit connector (usually the first one)
  const appKitConnector = connectors.find(c => c.id === 'reown') || connectors[0];
  
  // Track connection state manually
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<Error | null>(null);

  const state: WalletState = {
    address: address || null,
    isConnected: isConnected,
    chainId: chainId || null,
    chain: currentChainId,
  };

  const handleConnect = async (options?: ConnectOptions) => {
    setIsConnecting(true);
    setConnectError(null);
    
    try {
      localStorage.clear();
      // Find connector
      let targetConnector = appKitConnector;
      
      // If walletConnect is true, use AppKit's open method with WalletConnect view
      if (options?.walletConnect) {
        // Use AppKit's open method to directly open WalletConnect modal with QR code
        // The 'Connect' view will show WalletConnect as an option
        const openOptions: any = { view: 'Connect' };
        
        if (options?.chain) {
          openOptions.chainId = options.chain;
        }
        
        // Open AppKit modal - it will show WalletConnect option
        open(openOptions);
        
        // Note: The actual connection will be handled by AppKit modal
        // We set isConnecting to false here because the modal handles the connection flow
        setIsConnecting(false);
        return;
      } else if (options?.connectorId) {
        // If connectorId is specified, use it
        targetConnector = connectors.find(c => c.id === options.connectorId) || appKitConnector;
      }
      
      if (!targetConnector) {
        throw new Error('No connector found');
      }
      
      // Prepare connect options
      const connectOptions: any = { connector: targetConnector };
      
      // If chain is specified, add it to connect options
      if (options?.chain) {
        connectOptions.chainId = options.chain;
      }
      
      await connect(config, connectOptions);
    } catch (error) {
      setConnectError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchChain = (chainId: number) => {
    switchChain(config, { chainId });
  };

  const handleDisconnect = () => {
    disconnect(config);
  };

  return {
    state,
    currentChain: currentChainId,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    isConnecting,
    error: connectError ? new Error(connectError.message) : null,
  };
}

/**
 * Hook for contract interactions
 */
export function useContractCall() {
  const config = useConfig();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const readContract = useReadContract;

  const handleWriteContract = async (params: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const txHash = await writeContract(config, params as any);
      setHash(txHash);
      return txHash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    readContract,
    writeContract: handleWriteContract,
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

/**
 * Hook for sending transactions
 */
export function useSendTransaction() {
  const config = useConfig();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSendTransaction = async (params: SendTransactionParameters) => {
    setIsLoading(true);
    setError(null);
    try {
      const txHash = await sendTransaction(config, params);
      setHash(txHash);
      return txHash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction: handleSendTransaction,
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

/**
 * Hook for getting balance
 */
export function useWalletBalance(address?: Address) {
  const { address: accountAddress } = useConnection();
  const targetAddress = address || accountAddress;
  
  const { data: balance, isLoading, error } = useBalance({
    address: targetAddress,
  });

  return {
    balance: balance?.value || BigInt(0),
    formatted: balance ? `${Number(balance.value) / 10 ** balance.decimals} ${balance.symbol}` : '0',
    isLoading,
    error,
  };
}
```