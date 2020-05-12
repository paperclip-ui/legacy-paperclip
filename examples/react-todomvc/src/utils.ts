import {createElement} from "react";

export const styled = (tag: any, defaultClassName: string) => ({ className, ...rest }: any) => {
  return createElement(tag, {...rest, className: className ? className + " " + defaultClassName : defaultClassName});
}