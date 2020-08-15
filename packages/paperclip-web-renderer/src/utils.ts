export const preventDefault = (event: any) => {
  event.stopPropagation();
  event.preventDefault();
  return false;
};

export const ATTR_ALIASES = {
  className: "class"
};

export const traverseNativeNode = (
  element: Node,
  each: (node: Node, path: number[]) => void,
  cpath: number[] = []
) => {
  each(element, cpath);
  for (let i = 0, { length } = element.childNodes; i < length; i++) {
    const child = element.childNodes[i];
    traverseNativeNode(child, each, [...cpath, i]);
  }
};
