export const EMBEDDED =
  typeof window === "undefined" || !/^http/.test(window.location.protocol);
