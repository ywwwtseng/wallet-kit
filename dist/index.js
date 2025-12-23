// src/networks.ts
import { mainnet, bsc, solana } from "@reown/appkit/networks";

// src/constants.ts
var Status = /* @__PURE__ */ ((Status2) => {
  Status2["PENDING"] = "pending";
  Status2["AUTHENTICATED"] = "authenticated";
  Status2["UNAUTHENTICATED"] = "unauthenticated";
  return Status2;
})(Status || {});
var JWT_TOKEN_KEY = "web3_jwt_token";
var JWT_ADDRESS_KEY = "web3_jwt_address";

// src/WalletKitAuthContext.tsx
import { useCallback as useCallback2, useEffect, useState as useState2, useMemo, createContext, useRef } from "react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { signMessage } from "wagmi/actions";

// src/hooks/useConnect.ts
import { useCallback, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
function useConnect() {
  const appKit = useAppKit();
  const [isPending, setIsPending] = useState(false);
  const open = useCallback(async (view) => {
    setIsPending(true);
    await appKit.open({
      view: view ?? "AllWallets"
    });
    setIsPending(false);
  }, []);
  return {
    open,
    isPending
  };
}

// src/wagmi.ts
import { createConfig, http } from "wagmi";
import { mainnet as mainnet2, bsc as bsc2 } from "wagmi/chains";
import { sendTransaction } from "wagmi/actions";
import { writeContract } from "@wagmi/core";
import { useConfig } from "wagmi";
import { getBalance } from "wagmi/actions";
var ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  }
];
var config = createConfig({
  chains: [mainnet2, bsc2],
  transports: {
    [mainnet2.id]: http(),
    [bsc2.id]: http()
  }
});
var sendWagmiTransaction = async (config3, {
  tokenAddress,
  to,
  amount,
  chainId
}) => {
  if (tokenAddress) {
    return await writeContract(config3, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      chainId,
      args: [to, typeof amount === "string" ? BigInt(amount) : amount]
    });
  } else {
    return await sendTransaction(config3, {
      to,
      value: typeof amount === "string" ? BigInt(amount) : amount,
      chainId
    });
  }
};

// src/utils.ts
import { createAppKit as createReownAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
var parseJSON = (src) => {
  try {
    if (typeof src !== "string") {
      return src;
    }
    return JSON.parse(src);
  } catch {
    return null;
  }
};
var createAppKit = /* @__PURE__ */ (() => {
  let instance = null;
  return ({
    themeMode,
    projectId,
    networks,
    ...config3
  }) => {
    if (instance) {
      return instance;
    }
    const wagmiAdapter = new WagmiAdapter({
      projectId,
      networks,
      ssr: true
    });
    const solanaAdapter = new SolanaAdapter();
    const modal = createReownAppKit({
      themeMode,
      projectId,
      networks,
      adapters: [wagmiAdapter, solanaAdapter],
      ...config3
    });
    instance = {
      config: wagmiAdapter.wagmiConfig,
      getWalletInfo: () => modal?.getWalletInfo()
    };
    return instance;
  };
})();
async function getSignMessage(url, address) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "mutate",
      action: "auth:signin:nonce",
      payload: { address }
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to get sign message");
  }
  const data = await response.json();
  return data.data;
}
function getStoredJWT(appKey) {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem(`${appKey}_${JWT_TOKEN_KEY}`);
  const address = localStorage.getItem(`${appKey}_${JWT_ADDRESS_KEY}`);
  if (token && address) {
    return { token, address };
  }
  return null;
}
function storeJWT(appKey, token, address) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(`${appKey}_${JWT_TOKEN_KEY}`, token);
  localStorage.setItem(`${appKey}_${JWT_ADDRESS_KEY}`, address);
}
function clearStoredJWT(appKey) {
  console.trace("clearStoredJWT");
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(`${appKey}_${JWT_TOKEN_KEY}`);
  localStorage.removeItem(`${appKey}_${JWT_ADDRESS_KEY}`);
}
function getJWTExpirationTime(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return null;
    }
    return payload.exp * 1e3;
  } catch (error) {
    console.error("Error getting JWT expiration time:", error);
    return null;
  }
}
function isJWTExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1e3);
    return payload.exp < currentTime + 5;
  } catch (error) {
    console.error("Error checking JWT expiration:", error);
    return true;
  }
}

// src/WalletKitAuthContext.tsx
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
  const reconnectTimerRef = useRef(null);
  const [jwtToken, setJwtToken] = useState2(null);
  const { disconnect } = useDisconnect();
  const { open } = useConnect();
  const ethersAccount = useAppKitAccount({ namespace: "eip155" });
  const config3 = useConfig();
  const [initialized, setInitialized] = useState2(false);
  const [isLoggingOutProcessing, setIsLoggingOutProcessing] = useState2(false);
  const [isSigningInProcessing, setIsSigningInProcessing] = useState2(false);
  const status = useMemo(() => {
    if (!initialized || isLoggingOutProcessing || isSigningInProcessing) return "pending" /* PENDING */;
    if (!!jwtToken && !!ethersAccount.address) return "authenticated" /* AUTHENTICATED */;
    return "unauthenticated" /* UNAUTHENTICATED */;
  }, [initialized, isLoggingOutProcessing, isSigningInProcessing, jwtToken, ethersAccount.address]);
  const signIn = useCallback2(
    async (view) => {
      try {
        await open(view ?? "ConnectingWalletConnectBasic");
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    [open, ethersAccount.address, config3]
  );
  const signOut = useCallback2(async () => {
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
  const setupExpirationTimer = useCallback2((token) => {
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
    if (ethersAccount.status === "connecting") {
      reconnectTimerRef.current = setTimeout(async () => {
        await signOut();
        setInitialized(true);
      }, 5e3);
      return;
    }
    ;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setInitialized(false);
    const stored = getStoredJWT(appKey);
    if (stored && stored.address === ethersAccount.address) {
      if (isJWTExpired(stored.token)) {
        clearStoredJWT(appKey);
        setJwtToken(null);
      } else {
        setJwtToken(stored.token);
        setupExpirationTimer(stored.token);
      }
    } else if (stored && stored.address !== ethersAccount.address) {
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
    setInitialized(true);
  }, [ethersAccount.status, ethersAccount.address, isLoggingOutProcessing, setupExpirationTimer, appKey]);
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (!ethersAccount.address && jwtToken) {
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
  }, [ethersAccount.address, jwtToken, isLoggingOutProcessing]);
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (ethersAccount.status !== "connected") return;
    if (initialized && ethersAccount.address && !jwtToken) {
      (async () => {
        try {
          if (!ethersAccount.address) {
            throw new Error("Wallet not connected");
          }
          setIsSigningInProcessing(true);
          const { message, nonce } = await getSignMessage(url, ethersAccount.address);
          if (!config3) {
            throw new Error("Wagmi config not available");
          }
          const signature = await signMessage(config3, {
            message,
            account: ethersAccount.address
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
                address: ethersAccount.address,
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
  }, [initialized, ethersAccount.status, jwtToken, isLoggingOutProcessing, setupExpirationTimer]);
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
    address: ethersAccount.address
  }), [signIn, signOut, isSigningInProcessing, isLoggingOutProcessing, jwtToken, status, ethersAccount.address]);
  if (!initialized) {
    return null;
  }
  return /* @__PURE__ */ jsx(WalletKitAuthContext.Provider, { value, children: typeof children === "function" ? children(value) : children });
};

// src/WalletKitContext.tsx
import {
  useMemo as useMemo4,
  createContext as createContext3
} from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// src/WalletKitConnectContext.tsx
import {
  use,
  useState as useState3,
  useMemo as useMemo3,
  useCallback as useCallback3,
  createContext as createContext2
} from "react";
import {
  useAppKitProvider,
  useDisconnect as useDisconnect2,
  useAppKitNetwork
} from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import * as web3 from "@ywwwtseng/web3";
import { useSwitchChain, useAccount, useChainId } from "wagmi";

// src/ContinueInWalletModal.tsx
import { Modal, Typography } from "@ywwwtseng/react-kit";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function ContinueInWalletModal({
  logo,
  open,
  onCloseAction,
  getWalletInfoAction
}) {
  const walletInfo = getWalletInfoAction();
  const redirect = walletInfo?.redirect;
  const deepLink = redirect?.native;
  return /* @__PURE__ */ jsxs(Modal, { title: "wallet kit modal", open, onClose: onCloseAction, children: [
    /* @__PURE__ */ jsx2(Typography, { size: "1", children: walletInfo?.name }),
    /* @__PURE__ */ jsx2("style", { children: `
        @keyframes breathe {

          0%,
          100% {
            transform: translateX(15px);
          }

          50% {
            transform: translateX(-15px);
          }
        }
      ` }),
    /* @__PURE__ */ jsx2("style", { children: `
        @keyframes breathe-negative {

          0%,
          100% {
            transform: translateX(-15px);
          }

          50% {
            transform: translateX(15px);
          }
        }
      ` }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          gap: "16px",
          paddingTop: "16px",
          paddingBottom: "16px"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              },
              children: [
                /* @__PURE__ */ jsx2(
                  "div",
                  {
                    style: {
                      borderRadius: "8px",
                      border: "4px solid",
                      animation: "breathe 2s ease-in-out infinite"
                    },
                    children: logo
                  }
                ),
                walletInfo && /* @__PURE__ */ jsx2(
                  "img",
                  {
                    style: {
                      borderRadius: "8px",
                      border: "4px solid",
                      animation: "breathe-negative 2s ease-in-out infinite"
                    },
                    width: 48,
                    height: 48,
                    src: walletInfo.icon,
                    alt: "wallet icon"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "2px"
              },
              children: [
                /* @__PURE__ */ jsxs(Typography, { size: "1", children: [
                  "Continue in ",
                  walletInfo?.name
                ] }),
                /* @__PURE__ */ jsx2(Typography, { size: "1", color: "var(--color-default, rgba(255, 255, 255, 0.50))", weight: 400, children: "Confirm transaction in your wallet" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "6px",
                paddingBottom: "6px",
                fontSize: "12px",
                border: "1px solid",
                borderColor: "var(--color-secondary, #d1d5db)",
                borderRadius: "4px",
                textDecoration: "none",
                color: "inherit"
              },
              href: deepLink,
              target: "_blank",
              rel: "noopener noreferrer",
              children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
                  /* @__PURE__ */ jsx2("path", { d: "M15 3h6v6" }),
                  /* @__PURE__ */ jsx2("path", { d: "M10 14 21 3" }),
                  /* @__PURE__ */ jsx2("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })
                ] }),
                "Open"
              ]
            }
          )
        ]
      }
    )
  ] });
}

// src/hooks/useAccounts.ts
import { useMemo as useMemo2 } from "react";
import { useAppKitAccount as useAppKitAccount2 } from "@reown/appkit/react";
function useAccounts() {
  const solanaAccount = useAppKitAccount2({ namespace: "solana" });
  const ethersAccount = useAppKitAccount2({ namespace: "eip155" });
  return useMemo2(() => {
    return {
      status: solanaAccount.status,
      solana: solanaAccount.address,
      bsc: ethersAccount.address,
      ethereum: ethersAccount.address
    };
  }, [solanaAccount, ethersAccount]);
}

// src/WalletKitConnectContext.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function clearLocalStorageByPrefix(prefix) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}
var WalletKitConnectContext = createContext2({
  isConnectPending: false,
  isSendTxPending: false,
  accounts: {
    status: void 0,
    solana: void 0,
    bsc: void 0,
    ethereum: void 0
  },
  balance: {},
  currentChainId: void 0,
  getBalance: () => {
    throw new Error("getBalance is not implemented");
  },
  open: () => {
    throw new Error("open is not implemented");
  },
  disconnect: () => {
    throw new Error("disconnect is not implemented");
  },
  signTransaction: () => {
    throw new Error("createTransaction is not implemented");
  },
  sendTransaction: () => {
    throw new Error("sendTransaction is not implemented");
  },
  switchNetwork: () => {
    throw new Error("switchNetwork is not implemented");
  }
});
var WalletKitConnectProvider = ({
  logo,
  children
}) => {
  const { getWalletInfo } = use(WalletKitContext);
  const [balance, setBalance] = useState3({});
  const [continueInWalletModal, openContinueInWalletModal] = useState3(false);
  const [isSendTxPending, setIsSendTxPending] = useState3(false);
  const { disconnect } = useDisconnect2();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const { switchChainAsync } = useSwitchChain();
  const { isConnected: isEVMConnected } = useAccount();
  const currentChainId = useChainId();
  const config3 = useConfig();
  const solanaProvider = useAppKitProvider("solana");
  const { open, isPending: isConnectPending } = useConnect();
  const switchNetwork = async (network) => {
    if (network === "bsc") {
      await switchAppKitNetwork(bsc);
    } else if (network === "ethereum") {
      await switchAppKitNetwork(mainnet);
    }
  };
  const getBalance3 = async (token) => {
    if (token.network === "solana") {
      if (!connection || !accounts.solana) {
        return;
      }
      const balance2 = await web3.getBalance({
        network: token.network,
        connection
      })({
        address: accounts.solana,
        tokenAddress: token.token_address,
        tokenProgram: token.token_program
      });
      setBalance({ [token.id]: String(balance2) });
    } else if (token.network === "bsc") {
      if (!connection || !accounts.ethereum) {
        return;
      }
      const balance2 = await getBalance(config3, {
        address: accounts.ethereum,
        token: token.token_address ?? void 0,
        chainId: bsc.id
      });
      setBalance({ [token.id]: String(balance2.value) });
    } else if (token.network === "ethereum") {
      if (!connection || !accounts.ethereum) {
        return;
      }
      const balance2 = await getBalance(config3, {
        address: accounts.ethereum,
        token: token.token_address ?? void 0,
        chainId: mainnet.id
      });
      setBalance({ [token.id]: String(balance2.value) });
    }
  };
  const createTransaction = useCallback3(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount
    }) => {
      if (!accounts.solana || !connection)
        throw Error("user is disconnected");
      const transaction = await web3.utils.solana.createTransaction(
        connection,
        {
          feePayer,
          source,
          destination,
          mint: token.token_address,
          amount,
          tokenProgram: token.token_program
        }
      );
      const latestBlockhash = await connection.getLatestBlockhash("finalized");
      transaction.feePayer = new web3.solana.PublicKey(feePayer);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
      return transaction;
    },
    [accounts.solana, solanaProvider, connection]
  );
  const signTransaction = useCallback3(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount
    }) => {
      try {
        if (!accounts.solana || !connection)
          throw Error("user is disconnected");
        openContinueInWalletModal(true);
        const transaction = await createTransaction({
          feePayer,
          source,
          token,
          destination,
          amount
        });
        const signedTransaction = await solanaProvider.walletProvider.signTransaction(transaction);
        return signedTransaction;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        openContinueInWalletModal(false);
      }
    },
    [accounts.solana, solanaProvider, connection]
  );
  const sendTransaction2 = async ({
    feePayer,
    source,
    token,
    destination,
    amount
  }) => {
    try {
      setIsSendTxPending(true);
      openContinueInWalletModal(true);
      const network = token.network;
      if (network === "solana") {
        if (!connection) {
          throw Error("Solana connection not available");
        }
        const signature = await solanaProvider.walletProvider.sendTransaction(
          await createTransaction({
            feePayer,
            source,
            token,
            destination,
            amount
          }),
          connection
        );
        console.log("signature", signature);
        return signature;
      }
      if (!isEVMConnected || !accounts.ethereum) {
        throw Error("EVM wallet not connected. Please connect an EVM wallet first.");
      }
      const chainIds = {
        bsc: bsc.id,
        ethereum: mainnet.id
      };
      const chainId = chainIds[network];
      if (!chainId) {
        throw Error(`Unsupported network: ${network}`);
      }
      if (currentChainId !== chainId) {
        await switchChainAsync({ chainId });
      }
      return await sendWagmiTransaction(config3, {
        tokenAddress: token.token_address,
        to: destination,
        amount: typeof amount === "string" ? BigInt(amount) : amount,
        chainId
      });
    } catch (error) {
      console.error(error, "error");
      throw error;
    } finally {
      setIsSendTxPending(false);
      openContinueInWalletModal(false);
    }
  };
  const value = useMemo3(
    () => ({
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      open,
      getBalance: getBalance3,
      currentChainId,
      disconnect: async (clearLocalStorage) => {
        await disconnect();
        if (clearLocalStorage) {
          clearLocalStorageByPrefix("@appkit/");
          clearLocalStorageByPrefix("wagmi.");
        }
      },
      signTransaction,
      sendTransaction: sendTransaction2,
      switchNetwork
    }),
    [
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      open,
      getBalance3,
      disconnect,
      signTransaction,
      sendTransaction2,
      switchNetwork
    ]
  );
  return /* @__PURE__ */ jsxs2(WalletKitConnectContext.Provider, { value, children: [
    children,
    continueInWalletModal && /* @__PURE__ */ jsx3(
      ContinueInWalletModal,
      {
        open: true,
        logo,
        getWalletInfoAction: () => getWalletInfo?.(),
        onCloseAction: () => {
          openContinueInWalletModal(false);
        }
      }
    )
  ] });
};

// src/WalletKitContext.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var queryClient = new QueryClient();
var WalletKitContext = createContext3({
  getWalletInfo: () => void 0
});
var WalletKitProvider = ({
  config: config3,
  logo,
  children,
  getWalletInfo
}) => {
  const value = useMemo4(
    () => ({
      getWalletInfo
    }),
    [
      getWalletInfo
    ]
  );
  return /* @__PURE__ */ jsx4(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx4(WagmiProvider, { config: config3, children: /* @__PURE__ */ jsx4(WalletKitContext.Provider, { value, children: /* @__PURE__ */ jsx4(WalletKitConnectProvider, { logo, children }) }) }) });
};

// src/hooks/useWalletKitConnect.ts
import { use as use2 } from "react";
function useWalletKitConnect() {
  const context = use2(WalletKitConnectContext);
  if (!context) {
    throw new Error("useWalletKitConnect must be used within a WalletKitProvider");
  }
  return context;
}

// src/hooks/useWalletKitAuth.ts
import { use as use3 } from "react";
function useWalletKitAuth() {
  const context = use3(WalletKitAuthContext);
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
  clearStoredJWT,
  createAppKit,
  getJWTExpirationTime,
  getSignMessage,
  getStoredJWT,
  isJWTExpired,
  mainnet,
  parseJSON,
  solana,
  storeJWT,
  useConnect,
  useWalletKitAuth,
  useWalletKitConnect
};
