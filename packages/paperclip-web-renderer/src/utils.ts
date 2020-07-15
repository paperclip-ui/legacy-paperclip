export const preventDefault = (event: any) => {
  event.stopPropagation();
  event.preventDefault();
  return false;
};

export const ATTR_ALIASES = {
  className: "class"
};
