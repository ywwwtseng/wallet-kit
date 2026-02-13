import { useWriteContract, useSendTransaction } from 'wagmi';
import type { Address } from 'viem';
import { ERC20_ABI } from '../abi';

export function useTransfer() {
  const writeContract = useWriteContract();
  const sendTransaction = useSendTransaction();

  const transfer = async ({
    account,
    tokenAddress,
    to,
    amount,
    chainId,
  }: {
    account?: Address;
    tokenAddress?: Address;
    to: Address;
    amount: bigint | string;
    chainId: number;
  }) => {
    if (tokenAddress) {
      const hash = await writeContract.mutateAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        chainId,
        args: [to, typeof amount === 'string' ? BigInt(amount) : amount],
        chain: undefined,
        account,
      });

      writeContract.reset();

      return hash;
    } else {
      const hash = await sendTransaction.mutateAsync({
        to,
        value: typeof amount === 'string' ? BigInt(amount) : amount,
        chainId,
        account,
      });

      sendTransaction.reset();

      return hash;
    }
  };

  return {
    transfer,
  };
}