export type { AppKitNetwork } from '@reown/appkit/networks';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  network: string | null;
  token_address: string | null;
  decimals: number;
  token_program: string | null;
};