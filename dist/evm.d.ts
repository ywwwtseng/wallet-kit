import { waitForTransactionReceipt } from 'wagmi/actions';

declare function useReadContract(params: any): {
    refetch: () => Promise<void>;
    isLoading: boolean;
    error: Error;
    data: any;
};
declare function useReadContracts(params: any): {
    refetch: () => Promise<void>;
    isLoading: boolean;
    error: Error;
    data: any;
};
declare function useWriteContract({ onSuccess, onError, }: {
    onSuccess?: (receipt: Awaited<ReturnType<typeof waitForTransactionReceipt>>) => void;
    onError?: (error: Error) => void;
}): {
    isLoading: boolean;
    writeContract: (params: any) => Promise<{
        [x: string]: any;
    }>;
};

export { useReadContract, useReadContracts, useWriteContract };
