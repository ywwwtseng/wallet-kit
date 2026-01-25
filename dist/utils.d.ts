import * as _reown_appkit_controllers from '@reown/appkit-controllers';
import * as wagmi from 'wagmi';
import { AppKitNetwork } from '@reown/appkit/networks';

declare const parseJSON: (src: unknown) => unknown;
declare function initAppKit({ projectId, themeMode, networks, ssr, ...rest }: {
    projectId: string;
    themeMode?: 'light' | 'dark';
    networks: [AppKitNetwork, ...AppKitNetwork[]];
    ssr?: boolean;
    includeWalletIds?: string[];
}): {
    networks: [AppKitNetwork, ...AppKitNetwork[]];
    config: wagmi.Config;
    getWalletInfo: () => _reown_appkit_controllers.ConnectedWalletInfo;
};
declare function clearLocalStorageByPrefix(prefix: string): void;
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

export { clearLocalStorageByPrefix, clearStoredJWT, getJWTExpirationTime, getSignMessage, getStoredJWT, initAppKit, isJWTExpired, parseJSON, storeJWT };
