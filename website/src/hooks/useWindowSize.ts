import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function useIsMobile(breakpoint = 768): boolean {
  const { width } = useWindowSize();
  return width < breakpoint;
}

export function useIsTablet(breakpoint = 1024): boolean {
  const { width } = useWindowSize();
  return width >= 768 && width < breakpoint;
}

export function useIsDesktop(breakpoint = 1024): boolean {
  const { width } = useWindowSize();
  return width >= breakpoint;
}
