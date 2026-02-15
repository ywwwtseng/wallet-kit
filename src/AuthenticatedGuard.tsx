import { useEffect } from 'react';
import { useNavigate, useRoute } from '@ywwwtseng/react-kit';
import { useWalletKitAuth } from './hooks/useWalletKitAuth';
import { Status } from './constants';

interface AuthenticatedGuardProps {
  redirectTo: string;
  children: React.ReactNode;
}

export function AuthenticatedGuard({ redirectTo, children }: AuthenticatedGuardProps) {
  const { status } = useWalletKitAuth();
  const navigate = useNavigate();
  const route = useRoute();

  useEffect(() => {
    if (route.name === redirectTo) {
      return;
    }
  
    if (status === Status.UNAUTHENTICATED || status === Status.WAITING_FOR_AUTHENTICATION) {
      navigate(redirectTo);
    }
  }, [status, redirectTo, route.name]);

  if (status !== Status.AUTHENTICATED) {
    return null;
  }

  return children;
}