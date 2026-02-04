'use client';

import { useEffect } from 'react';
import { Modal, Typography } from '@ywwwtseng/react-kit';
import type { ConnectedWalletInfo } from '@reown/appkit';

export type ContinueInWalletModalType = 'signTransaction' | 'sendTransaction' | 'writeContract' | undefined;

export function ContinueInWalletModal({
  theme = 'dark',
  type,
  logo,
  open,
  onClose,
  getWalletInfo,
}: {
  theme?: 'light' | 'dark';
  type: ContinueInWalletModalType;
  logo: React.ReactNode;
  open: boolean;
  onClose: () => void;
  getWalletInfo?: () => ConnectedWalletInfo | undefined;
}) {
  const walletInfo = getWalletInfo?.();
  const redirect = walletInfo?.redirect as { universal?: string; native?: string; } | undefined;
  // const link = redirect?.universal || redirect?.native;
  const link = redirect?.native;

  if (walletInfo.type === 'INJECTED' || type === 'writeContract') {
    return null;
  }

  return (
    <Modal title="wallet kit modal" open={open} onClose={onClose}>
      <Typography size="1">{walletInfo?.name}</Typography>
      <style>{`
        @keyframes breathe {

          0%,
          100% {
            transform: translateX(15px);
          }

          50% {
            transform: translateX(-15px);
          }
        }
      `}</style>
      <style>{`
        @keyframes breathe-negative {

          0%,
          100% {
            transform: translateX(-15px);
          }

          50% {
            transform: translateX(15px);
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: '16px',
          paddingTop: '16px',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              animation: 'breathe 2s ease-in-out infinite',
            }}
          >
            {logo}
          </div>
          {walletInfo && (
            <img
              style={{
                animation: 'breathe-negative 2s ease-in-out infinite',
              }}
              width={48}
              height={48}
              src={walletInfo.icon}
              alt="wallet icon"
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <Typography size="1">Continue in {walletInfo?.name}</Typography>
          <Typography size="1" color={theme === 'dark' ? 'rgba(255, 255, 255, 0.50)' : 'rgba(0, 0, 0, 0.50)'} weight={400}>
            Confirm transaction in your wallet
          </Typography>
        </div>
        <a
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '6px',
            paddingBottom: '6px',
            fontSize: '12px',
            border: '1px solid',
            borderColor: theme === 'dark' ? '#d1d5db' : '#d1d5db',
            borderRadius: '4px',
            textDecoration: 'none',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}
          href={link as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
          Open
        </a>
      </div>
    </Modal>
  );
}
