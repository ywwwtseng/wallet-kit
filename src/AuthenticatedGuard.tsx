import { useEffect } from 'react';
import { useNavigate } from '@ywwwtseng/react-kit';
import { useWalletKitAuth } from './hooks/useWalletKitAuth';
import { Status } from './constants';

interface AuthenticatedGuardProps {
  redirectTo: string;
  children: React.ReactNode;
}

export function AuthenticatedGuard({ redirectTo, children }: AuthenticatedGuardProps) {
  const { status } = useWalletKitAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === Status.UNAUTHENTICATED) {
      navigate(redirectTo);
    }
  }, [status]);

  if (status === Status.UNAUTHENTICATED || status === Status.PENDING) {
    return null;
  }

  return children;
}