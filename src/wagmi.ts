import { createConfig, http } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { sendTransaction } from 'wagmi/actions';
import { writeContract, type Config } from '@wagmi/core';
import type { Address, Abi } from 'viem';

export { useConfig as useWagmiConfig, useAccount as useWagmiAccount } from 'wagmi';
export { getBalance as getWagmiBalance } from 'wagmi/actions';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as Abi;

export const config = createConfig({
  chains: [mainnet, bsc],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
  },
});

export const sendWagmiTransaction = async (
  config: Config,
  {
    tokenAddress,
    to,
    amount,
    chainId,
  }: {
    tokenAddress?: Address;
    to: Address;
    amount: bigint | string;
    chainId: number;
  }
) => {
  if (tokenAddress) {
    return await writeContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      chainId,
      args: [to, typeof amount === 'string' ? BigInt(amount) : amount],
    } as any);
  } else {
    return await sendTransaction(config, {
      to,
      value: typeof amount === 'string' ? BigInt(amount) : amount,
      chainId,
    });
  }
};
