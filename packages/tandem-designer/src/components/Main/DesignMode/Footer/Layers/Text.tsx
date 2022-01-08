import React, { useCallback } from "react";
import { nodePathToAry, VirtualText } from "@paperclip-ui/utils";
import * as styles from "./index.pc";

export type TextProps = {
  value: VirtualText;
  path: string;
  selectedNodePath: string;
  onLeafClick: (path: string, meta: boolean) => void;
};

export const Text = React.memo(
  ({ path, selectedNodePath, value, onLeafClick }: TextProps) => {
    const onLeafClick2 = useCallback(
      (event: React.MouseEvent<any>) => {
        onLeafClick(path, event.metaKey);
      },
      [path]
    );

    return (
      <styles.Text
        active={selectedNodePath === path}
        onLeafClick={onLeafClick2}
        depth={nodePathToAry(path).length}
      >
        {value.value}
      </styles.Text>
    );
  }
);
