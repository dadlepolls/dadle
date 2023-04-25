import { useEffect, useState } from "react";

/**
 * Determines whether the browser supports the "share" dialog
 * @returns bool
 */
export const useSharingSupported = () => {
  const [sharingSupported, setSharingSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (typeof window === "undefined") return;
    if (!navigator.share) return;
    if (!navigator.canShare({ url: window.location.toString() })) return;

    //all conditions met. sharing is possible
    setSharingSupported(true);
  }, []);

  return sharingSupported;
};
