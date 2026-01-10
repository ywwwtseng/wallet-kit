import { AppKitNetwork } from '@reown/appkit/networks';
export { AppKitNetwork, bsc, mainnet, solana } from '@reown/appkit/networks';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { Views, CreateAppKit, createAppKit as createAppKit$1 } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ConnectedWalletInfo } from '@reown/appkit';
import * as web3 from '@ywwwtseng/web3';

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

type AppKitConfig = {
    networks?: [AppKitNetwork, ...AppKitNetwork[]];
    includeWalletIds?: string[];
};
interface WalletKitContextType {
    getWalletInfo?: () => ConnectedWalletInfo | undefined;
}
declare const WalletKitContext: react.Context<WalletKitContextType>;
declare const WalletKitProvider: ({ config, cookies, logo, children, getWalletInfo, }: {
    config: typeof WagmiAdapter.prototype.wagmiConfig;
    cookies?: string | null;
    logo: React.ReactNode;
    children: React.ReactNode;
    getWalletInfo?: () => ConnectedWalletInfo | undefined;
}) => react_jsx_runtime.JSX.Element;

declare function useConnect(): {
    open: (view?: Views) => Promise<void>;
    isPending: boolean;
};

interface WalletKitConnectContextState {
    isConnectPending: boolean;
    isSendTxPending: boolean;
    accounts: {
        status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | undefined;
        solana: string | undefined;
        bsc: string | undefined;
        ethereum: string | undefined;
    };
    balance: Record<string, string>;
    currentChainId: number | undefined;
    getBalance: (token: Token) => Promise<void>;
    open: () => Promise<void>;
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

interface AuthenticatedGuardProps {
    redirectTo: string;
    children: React.ReactNode;
}
declare function AuthenticatedGuard({ redirectTo, children }: AuthenticatedGuardProps): react.ReactNode;

declare const parseJSON: (src: unknown) => unknown;
declare const createAppKit: ({ themeMode, projectId, networks, ssr, ...config }: {
    themeMode?: "light" | "dark";
    projectId: string;
    networks: [AppKitNetwork, ...AppKitNetwork[]];
    ssr: boolean;
} & CreateAppKit) => {
    config: typeof WagmiAdapter.prototype.wagmiConfig;
    getWalletInfo: () => ReturnType<ReturnType<typeof createAppKit$1>["getWalletInfo"]>;
};
/**
 * 从后端获取签名消息和 nonce
 */
declare function getSignMessage(url: string, address: string): Promise<{
    message: string;
    nonce: string;
    expiresAt: number;
}>;
/**
 * 获取存储的 JWT token
 */
declare function getStoredJWT(appKey: string): {
    token: string;
    address: string;
} | null;
/**
 * 存储 JWT token
 */
declare function storeJWT(appKey: string, token: string, address: string): void;
/**
 * 清除存储的 JWT token
 */
declare function clearStoredJWT(appKey: string): void;
/**
 * 获取 JWT token 的过期时间（毫秒）
 */
declare function getJWTExpirationTime(token: string): number | null;
/**
 * 检查 JWT token 是否过期
 */
declare function isJWTExpired(token: string): boolean;

export { type AppKitConfig, AuthenticatedGuard, JWT_ADDRESS_KEY, JWT_TOKEN_KEY, Status, type Token, WalletKitAuthContext, type WalletKitAuthContextState, WalletKitAuthProvider, WalletKitContext, WalletKitProvider, clearStoredJWT, createAppKit, getJWTExpirationTime, getSignMessage, getStoredJWT, isJWTExpired, parseJSON, storeJWT, useConnect, useWalletKitAuth, useWalletKitConnect };
