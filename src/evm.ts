import { useState } from 'react';
import { useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { writeContract } from 'wagmi/actions';

export function useWriteContract() {
  const config = useConfig();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });;

  return {
    writeContract: async (params: any) => {
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
    },
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    hash,
  };
}