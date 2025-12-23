import { useCallback, useState } from 'react';
import { type Views, useAppKit } from '@reown/appkit/react';

export function useConnect() {
  const appKit = useAppKit();
  const [isPending, setIsPending] = useState(false);

  const open = useCallback(async (view?: Views) => {
    setIsPending(true);

    await appKit.open({
      view: view ?? 'AllWallets',
    });

    setIsPending(false);
  }, []);

  return {
    open,
    isPending,
  };
}