import { VirtualNode } from "./virt";

export type PCEvalInfo = {
  sheet: any;
  preview: VirtualNode;
  exports: {
    components: string[];
    style: {
      mixins: any;
      classNames: string[];
    };
  };
};
