import { useState, useEffect } from "react";

export function useScreenWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export function useIsMobile() {
  const width = useScreenWidth();
  return width < 768;
}

export function useIsTablet() {
  const width = useScreenWidth();
  return width >= 768 && width < 1024;
}

export function useIsDesktop() {
  const width = useScreenWidth();
  return width >= 1024;
}
