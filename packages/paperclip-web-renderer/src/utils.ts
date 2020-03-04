export const preventDefault = (event: any) => {
  event.stopPropagation();
  event.preventDefault();
  return false;
};
