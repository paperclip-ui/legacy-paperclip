export const createListener = (
  em: any,
  type: string,
  listener: (...args: any[]) => void
) => {
  em.on(type, listener);
  return () => em.off(type, listener);
};
