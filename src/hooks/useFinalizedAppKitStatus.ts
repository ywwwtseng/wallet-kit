import { useEffect, useMemo, useRef, useState } from 'react';

type Status = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
type Stable = 'connected' | 'disconnected';

// 邏輯改成當 connected, disconnected 出現兩次才定案，只有一次超過 settleMs 就定案

export function useFinalizedAppKitStatus(
  status?: Status,
  opts?: { settleMs?: number }
): Status | undefined {
  const settleMs = opts?.settleMs ?? 600;
  const [stable, setStable] = useState<Stable | undefined>(undefined);
  
  // 跟踪状态出现的次数（状态变化时计数）
  const countRef = useRef<{ status: Stable; count: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<Status | undefined>(undefined);

  useEffect(() => {
    // 如果没有状态，重置
    if (!status) {
      countRef.current = null;
      lastStatusRef.current = undefined;
      setStable(undefined);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const lastStatus = lastStatusRef.current;
    const statusChanged = lastStatus !== status;

    // 只处理 connected 和 disconnected
    if (status !== 'connected' && status !== 'disconnected') {
      // 如果之前有计数，清除它
      if (countRef.current) {
        countRef.current = null;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
      lastStatusRef.current = status;
      return;
    }

    const stableStatus = status as Stable;

    // 如果状态变化了（从其他状态变成 connected/disconnected）
    if (statusChanged) {
      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // 如果之前有不同状态的计数，重置
      if (countRef.current && countRef.current.status !== stableStatus) {
        countRef.current = null;
      }

      // 开始新的计数或增加计数
      if (!countRef.current) {
        // 第一次看到这个稳定状态
        countRef.current = {
          status: stableStatus,
          count: 1,
        };
        
        // 设置定时器：如果只有一次，超过 settleMs 就定案
        const savedStatus = stableStatus;
        timerRef.current = setTimeout(() => {
          if (countRef.current && countRef.current.count === 1 && countRef.current.status === savedStatus) {
            setStable(countRef.current.status);
            countRef.current = null;
            timerRef.current = null;
          }
        }, settleMs);
      } else if (countRef.current.status === stableStatus) {
        // 同一个稳定状态再次出现（第二次），立即定案
        countRef.current.count += 1;
        setStable(stableStatus);
        countRef.current = null;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    } else {
      // 状态没有变化（保持 connected/disconnected）
      // 如果已经有计数但定时器被清除了（比如因为 settleMs 变化），需要重新设置定时器
      if (countRef.current && countRef.current.status === stableStatus && !timerRef.current) {
        // 重新设置定时器：如果只有一次，超过 settleMs 就定案
        const savedStatus = stableStatus;
        timerRef.current = setTimeout(() => {
          if (countRef.current && countRef.current.count === 1 && countRef.current.status === savedStatus) {
            setStable(countRef.current.status);
            countRef.current = null;
            timerRef.current = null;
          }
        }, settleMs);
      } else if (!countRef.current && !timerRef.current) {
        // 如果还没有计数，说明这是第一次（可能是初始化时就是稳定状态）
        countRef.current = {
          status: stableStatus,
          count: 1,
        };
        
        // 设置定时器：如果只有一次，超过 settleMs 就定案
        const savedStatus = stableStatus;
        timerRef.current = setTimeout(() => {
          if (countRef.current && countRef.current.count === 1 && countRef.current.status === savedStatus) {
            setStable(countRef.current.status);
            countRef.current = null;
            timerRef.current = null;
          }
        }, settleMs);
      }
      // 如果已经有计数和定时器，保持它们运行（不做任何操作）
    }

    lastStatusRef.current = status;

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, settleMs]);

  return useMemo(() => {
    if (stable) {
      return stable;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const connection_status = localStorage.getItem('@appkit/connection_status');

    if (connection_status) {
      return connection_status === 'disconnected' ? 'reconnecting' : 'connecting';
    }

    return undefined;
  }, [stable]);
}
