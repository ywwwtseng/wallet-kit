import {
  WalletKitConnectContext
} from "./chunk-VIGTB2FE.js";
import "./chunk-WAXLMAZT.js";
import "./chunk-DMT75HZL.js";

// src/evm.ts
import { use, useState, useEffect, useCallback } from "react";
import { useConfig } from "wagmi";
import { readContract, readContracts, writeContract, waitForTransactionReceipt } from "wagmi/actions";
function useReadContract(params) {
  const config = useConfig();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    if (!params) return;
    setIsLoading(true);
    setError(null);
    readContract(config, params).then(setData).catch(setError).finally(() => setIsLoading(false));
  }, [config, JSON.stringify(params)]);
  useEffect(() => {
    fetch();
  }, [fetch]);
  return {
    refetch: fetch,
    isLoading,
    error,
    data
  };
}
function useReadContracts(params) {
  const config = useConfig();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    if (!params) return;
    setIsLoading(true);
    setError(null);
    readContracts(config, params).then(setData).catch(setError).finally(() => setIsLoading(false));
  }, [config, JSON.stringify(params)]);
  useEffect(() => {
    fetch();
  }, [fetch]);
  return {
    refetch: fetch,
    isLoading,
    error,
    data
  };
}
function useWriteContract({
  onSuccess,
  onError
}) {
  const { openContinueInWalletModal, closeContinueInWalletModal } = use(WalletKitConnectContext);
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  return {
    isLoading,
    writeContract: async (params) => {
      openContinueInWalletModal("writeContract");
      setIsLoading(true);
      try {
        const txHash = await writeContract(config, params);
        const receipt = await waitForTransactionReceipt(config, { hash: txHash });
        onSuccess?.(receipt);
        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
        throw error;
      } finally {
        closeContinueInWalletModal();
        setIsLoading(false);
      }
    }
  };
}
export {
  useReadContract,
  useReadContracts,
  useWriteContract
};
