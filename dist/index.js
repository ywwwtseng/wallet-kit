import {
  WalletKitConnectContext,
  WalletKitContext,
  WalletKitProvider,
  useAccounts,
  useConfig,
  useConnect
} from "./chunk-6Z3JZBOG.js";
import {
  JWT_ADDRESS_KEY,
  JWT_TOKEN_KEY,
  Status,
  clearLocalStorageByPrefix,
  clearStoredJWT,
  getJWTExpirationTime,
  getSignMessage,
  getStoredJWT,
  initAppKit,
  isJWTExpired,
  parseJSON,
  storeJWT
} from "./chunk-WAXLMAZT.js";
import {
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
  solana,
  solanaDevnet
} from "./chunk-DMT75HZL.js";

// src/WalletKitAuthProvider.tsx
import { useCallback, useEffect, useState, useMemo, createContext, useRef } from "react";
import { useDisconnect } from "@reown/appkit/react";
import { signMessage } from "wagmi/actions";
import { jsx } from "react/jsx-runtime";
var WalletKitAuthContext = createContext({
  signIn: () => {
    throw new Error("signIn is not implemented");
  },
  signOut: () => {
    throw new Error("signOut is not implemented");
  },
  address: void 0,
  isSigningInProcessing: false,
  isLoggingOutProcessing: false,
  jwtToken: null,
  status: "pending" /* PENDING */
});
var WalletKitAuthProvider = ({
  url = "/console/api",
  appKey,
  onSignInSuccess,
  children
}) => {
  const expirationTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const [jwtToken, setJwtToken] = useState(null);
  const { disconnect } = useDisconnect();
  const { open } = useConnect();
  const accounts = useAccounts();
  const config = useConfig();
  const [initialized, setInitialized] = useState(false);
  const [isLoggingOutProcessing, setIsLoggingOutProcessing] = useState(false);
  const [isSigningInProcessing, setIsSigningInProcessing] = useState(false);
  const status = useMemo(() => {
    if (!initialized || isLoggingOutProcessing || isSigningInProcessing) return "pending" /* PENDING */;
    if (!!jwtToken && !!accounts.bsc.address) return "authenticated" /* AUTHENTICATED */;
    return "unauthenticated" /* UNAUTHENTICATED */;
  }, [initialized, isLoggingOutProcessing, isSigningInProcessing, jwtToken, accounts.bsc.address]);
  const signIn = useCallback(
    async (view) => {
      try {
        await open(view ?? "ConnectingWalletConnectBasic");
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    [open, accounts.bsc.address, config]
  );
  const signOut = useCallback(async () => {
    setIsLoggingOutProcessing(true);
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
    clearStoredJWT(appKey);
    setJwtToken(null);
    await disconnect();
    setIsLoggingOutProcessing(false);
  }, [appKey, disconnect]);
  const setupExpirationTimer = useCallback((token) => {
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
    const expirationTime = getJWTExpirationTime(token);
    if (!expirationTime) {
      return;
    }
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;
    if (timeUntilExpiration <= 0) {
      clearStoredJWT(appKey);
      setJwtToken(null);
      return;
    }
    expirationTimerRef.current = setTimeout(() => {
      clearStoredJWT(appKey);
      setJwtToken(null);
      expirationTimerRef.current = null;
    }, timeUntilExpiration);
  }, [appKey]);
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (!accounts.bsc.status || accounts.bsc.status === "reconnecting" || accounts.bsc.status === "connecting") {
      return;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (!initialized && accounts.bsc.status === "disconnected") {
      logoutTimerRef.current = setTimeout(() => {
        signOut().then(() => {
          setInitialized(true);
        });
      }, 1e3);
      return;
    }
    ;
    setInitialized(false);
    const stored = getStoredJWT(appKey);
    if (stored && stored.address === accounts.bsc.address) {
      if (isJWTExpired(stored.token)) {
        clearStoredJWT(appKey);
        setJwtToken(null);
      } else {
        setJwtToken(stored.token);
        setupExpirationTimer(stored.token);
      }
    } else if (stored && stored.address !== accounts.bsc.address) {
      console.log("Wallet address mismatch, clear JWT token.", stored.address, accounts.bsc.address);
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
    setInitialized(true);
  }, [initialized, accounts.bsc, isLoggingOutProcessing, setupExpirationTimer, appKey]);
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (!accounts.bsc.address && jwtToken) {
      console.log("Wallet disconnected, JWT token cleared.", accounts.bsc.address, accounts.bsc.status);
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
  }, [accounts.bsc.address, jwtToken, isLoggingOutProcessing]);
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (accounts.bsc.status !== "connected") return;
    if (initialized && accounts.bsc.address && !jwtToken) {
      (async () => {
        try {
          if (!accounts.bsc.address) {
            throw new Error("Wallet not connected");
          }
          setIsSigningInProcessing(true);
          const { message, nonce } = await getSignMessage(url, accounts.bsc.address);
          if (!config) {
            throw new Error("Wagmi config not available");
          }
          const signature = await signMessage(config, {
            message,
            account: accounts.bsc.address
          });
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              type: "mutate",
              action: "auth:signin",
              payload: {
                address: accounts.bsc.address,
                message,
                signature,
                nonce
              }
            })
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(error.error || "Failed to sign in");
          }
          const data = await response.json();
          const result = data.data;
          storeJWT(appKey, result.token, result.address);
          setJwtToken(result.token);
          setupExpirationTimer(result.token);
          onSignInSuccess?.();
          return result;
        } catch (error) {
          disconnect();
          console.error("Sign in error:", error);
          throw error;
        } finally {
          setIsSigningInProcessing(false);
        }
      })();
    }
  }, [initialized, accounts.bsc, jwtToken, isLoggingOutProcessing, setupExpirationTimer]);
  useEffect(() => {
    return () => {
      setInitialized(false);
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
    };
  }, []);
  const value = useMemo(() => ({
    signIn,
    signOut,
    isSigningInProcessing,
    isLoggingOutProcessing,
    jwtToken,
    status,
    address: accounts.bsc.address
  }), [signIn, signOut, isSigningInProcessing, isLoggingOutProcessing, jwtToken, status, accounts.bsc.address]);
  if (!initialized) {
    return null;
  }
  return /* @__PURE__ */ jsx(WalletKitAuthContext.Provider, { value, children: typeof children === "function" ? children(value) : children });
};

// src/hooks/useWalletKitConnect.ts
import { use } from "react";
function useWalletKitConnect() {
  const context = use(WalletKitConnectContext);
  if (!context) {
    throw new Error("useWalletKitConnect must be used within a WalletKitProvider");
  }
  return context;
}

// src/hooks/useWalletKitAuth.ts
import { use as use2 } from "react";
function useWalletKitAuth() {
  const context = use2(WalletKitAuthContext);
  if (!context) {
    throw new Error("useWalletKitAuth must be used within a WalletKitAuthProvider");
  }
  return context;
}

// src/AuthenticatedGuard.tsx
import { useEffect as useEffect2 } from "react";
import { useNavigate } from "@ywwwtseng/react-kit";
function AuthenticatedGuard({ redirectTo, children }) {
  const { status } = useWalletKitAuth();
  const navigate = useNavigate();
  useEffect2(() => {
    if (status === "unauthenticated" /* UNAUTHENTICATED */) {
      navigate(redirectTo);
    }
  }, [status]);
  if (status === "unauthenticated" /* UNAUTHENTICATED */ || status === "pending" /* PENDING */) {
    return null;
  }
  return children;
}
export {
  AuthenticatedGuard,
  JWT_ADDRESS_KEY,
  JWT_TOKEN_KEY,
  Status,
  WalletKitAuthContext,
  WalletKitAuthProvider,
  WalletKitContext,
  WalletKitProvider,
  bsc,
  bscTestnet,
  clearLocalStorageByPrefix,
  clearStoredJWT,
  getJWTExpirationTime,
  getSignMessage,
  getStoredJWT,
  initAppKit,
  isJWTExpired,
  mainnet,
  parseJSON,
  sepolia,
  solana,
  solanaDevnet,
  storeJWT,
  useConnect,
  useWalletKitAuth,
  useWalletKitConnect
};
