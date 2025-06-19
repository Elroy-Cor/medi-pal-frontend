import { useState, useEffect, useMemo } from 'react';

const DEFAULT_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

export function useBreakpoint(customBreakpoints = {}) {
  const breakpoints = useMemo(() => {
    // Merge default and custom breakpoints, sorting them by value
    const merged = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };
    return Object.entries(merged)
      .sort(([, valueA], [, valueB]) => valueA - valueB)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }, [customBreakpoints]);

  const [breakpoint, setBreakpoint] = useState<string | null>(null);

  useEffect(() => {
    // Only run on the client-side
    if (typeof window === 'undefined') {
      return;
    }

    const getBreakpoint = () => {
      const currentWidth = window.innerWidth;
      let activeBreakpoint = null;

      // Iterate through breakpoints to find the largest one that matches
      for (const [name, width] of Object.entries(breakpoints)) {
        if (currentWidth >= (width as number)) {
          activeBreakpoint = name;
        }
      }
      return activeBreakpoint;
    };

    const handleResize = () => {
      setBreakpoint(getBreakpoint());
    };

    // Set initial breakpoint
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints]); // Re-run effect if breakpoints change

  return breakpoint;
}
