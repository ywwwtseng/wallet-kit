import { AppKitNetwork } from '@reown/appkit/networks';
export { AppKitNetwork, bsc, bscTestnet, mainnet, sepolia, solana, solanaDevnet } from '@reown/appkit/networks';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { Views } from '@reown/appkit/react';
import { initAppKit } from './utils.js';
export { clearLocalStorageByPrefix, clearStoredJWT, getJWTExpirationTime, getSignMessage, getStoredJWT, isJWTExpired, parseJSON, storeJWT } from './utils.js';
import * as web3 from '@ywwwtseng/web3';
import { Address } from 'viem';
import '@reown/appkit-controllers';
import 'wagmi';

type Token = {
    id: string;
    symbol: string;
    name: string;
    network: string | null;
    token_address: string | null;
    decimals: number;
    token_program: string | null;
};

declare enum Status {
    PENDING = "pending",
    AUTHENTICATED = "authenticated",
    UNAUTHENTICATED = "unauthenticated"
}
declare const JWT_TOKEN_KEY = "web3_jwt_token";
declare const JWT_ADDRESS_KEY = "web3_jwt_address";

interface WalletKitAuthContextState {
    signIn: (view?: Views) => Promise<void>;
    signOut: () => Promise<void>;
    isSigningInProcessing: boolean;
    isLoggingOutProcessing: boolean;
    address: string | undefined;
    jwtToken: string | null;
    status: Status;
}
declare const WalletKitAuthContext: react.Context<WalletKitAuthContextState>;
declare const WalletKitAuthProvider: ({ url, appKey, onSignInSuccess, children, }: {
    url?: string;
    appKey: string;
    onSignInSuccess?: () => void;
    children: React.ReactNode | ((state: WalletKitAuthContextState) => React.ReactNode);
}) => react_jsx_runtime.JSX.Element;

declare const WalletKitProvider: ({ theme, debug, maunalExecuteConnectedCallbacks, isMainnet, cookies, logo, appKit, children, }: {
    theme?: "light" | "dark";
    debug?: boolean;
    maunalExecuteConnectedCallbacks?: boolean;
    isMainnet?: boolean;
    cookies?: string | null;
    logo: React.ReactNode;
    appKit: ReturnType<typeof initAppKit>;
    children: React.ReactNode;
}) => react_jsx_runtime.JSX.Element;

declare function useConnect(): {
    open: (view?: Views) => Promise<void>;
    isPending: boolean;
};

type ContinueInWalletModalType = 'signTransaction' | 'sendTransaction' | 'writeContract' | undefined;

interface Account {
    address: Address | string | undefined;
    status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
    isConnected: boolean;
}
interface Accounts {
    bsc: Account;
    ethereum: Account;
    solana: Account;
}

interface WalletKitConnectContextState {
    isMainnet: boolean;
    isConnectPending: boolean;
    isSendTxPending: boolean;
    error: Error | null;
    accounts: Accounts;
    balances: Record<string, string>;
    currentChainId: number | undefined;
    connectedCallbacks: {
        bsc: Function[];
        ethereum: Function[];
        solana: Function[];
    };
    getAccount: (network?: string | null) => Account | undefined;
    executeConnectedCallbacks: (network: string) => Promise<void>;
    openContinueInWalletModal: (type: ContinueInWalletModalType) => void;
    closeContinueInWalletModal: () => void;
    setBalances: (balances: Record<string, string>) => void;
    getNetwork: (network?: string | null) => AppKitNetwork | undefined;
    open: (options?: {
        view?: Views;
    }) => Promise<void>;
    disconnect: (clearLocalStorage?: boolean) => Promise<void>;
    signTransaction: (params: {
        feePayer: string;
        source: string;
        token: Token;
        destination: string;
        amount: bigint | string;
    }) => Promise<web3.solana.Transaction>;
    sendTransaction: (params: {
        feePayer: string;
        source: string;
        token: Token;
        destination: string;
        amount: bigint | string;
    }) => Promise<string>;
    switchNetwork: (network: string) => Promise<void>;
}

declare function useWalletKitConnect(): WalletKitConnectContextState;

declare function useWalletKitAuth(): WalletKitAuthContextState;

declare function useBalance(token?: Token | null): string;

interface AuthenticatedGuardProps {
    redirectTo: string;
    children: React.ReactNode;
}
declare function AuthenticatedGuard({ redirectTo, children }: AuthenticatedGuardProps): react.ReactNode;

export { AuthenticatedGuard, JWT_ADDRESS_KEY, JWT_TOKEN_KEY, Status, type Token, WalletKitAuthContext, type WalletKitAuthContextState, WalletKitAuthProvider, WalletKitProvider, initAppKit, useBalance, useConnect, useWalletKitAuth, useWalletKitConnect };
