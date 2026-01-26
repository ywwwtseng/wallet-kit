import { use, useState, useEffect, useCallback } from 'react';
import { useConfig } from 'wagmi';
import { readContract, readContracts, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { WalletKitConnectContext } from './WalletKitConnectProvider';

export function useReadContract(params: any) {
  const config = useConfig();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!params) return;
    setIsLoading(true);
    setError(null);
    readContract(config, params as any)
      .then(setData).catch(setError)
      .finally(() => setIsLoading(false));
  }, [config, JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  
  return {
    refetch: fetch,
    isLoading,
    error,
    data,
  }
}

export function useReadContracts(params: any) {
  const config = useConfig();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!params) return;
    setIsLoading(true);
    setError(null);
    readContracts(config, params as any)
      .then(setData).catch(setError)
      .finally(() => setIsLoading(false));
  }, [config, JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  
  return {
    refetch: fetch,
    isLoading,
    error,
    data,
  }
}

export function useWriteContract({
  onSuccess,
  onError,
}: {
  onSuccess?: (receipt: Awaited<ReturnType<typeof waitForTransactionReceipt>>) => void;
  onError?: (error: Error) => void;
}) {
  const { openContinueInWalletModal } = use(WalletKitConnectContext);
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    isLoading,
    writeContract: async (params: any) => {
      openContinueInWalletModal(true);
      setIsLoading(true);
      try {
        const txHash = await writeContract(config, params as any);
        const receipt = await waitForTransactionReceipt(config, { hash: txHash });
        onSuccess?.(receipt);
        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
        throw error;
      } finally {
        openContinueInWalletModal(false);
        setIsLoading(false);
      }
    }
  }
}