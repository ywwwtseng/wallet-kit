declare function useWriteContract(): {
    writeContract: (params: any) => Promise<`0x${string}`>;
    isLoading: boolean;
    isConfirmed: boolean;
    error: Error;
    hash: `0x${string}`;
};

export { useWriteContract };
