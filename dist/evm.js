// src/evm.ts
import { useState } from "react";
import { useWaitForTransactionReceipt, useConfig } from "wagmi";
import { writeContract } from "wagmi/actions";
function useWriteContract() {
  const config = useConfig();
  const [hash, setHash] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });
  ;
  return {
    writeContract: async (params) => {
      setIsLoading(true);
      setError(null);
      try {
        const txHash = await writeContract(config, params);
        setHash(txHash);
        return txHash;
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error(String(err));
        setError(error2);
        throw error2;
      } finally {
        setIsLoading(false);
      }
    },
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    hash
  };
}
export {
  useWriteContract
};
