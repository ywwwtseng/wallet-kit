import { sendTransaction, writeContract } from 'wagmi/actions';
import { type Config } from '@wagmi/core';
import type { Address, Abi } from 'viem';

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
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as Abi;

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

