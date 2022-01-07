import { Spinner } from "@tandemui/designer/src/components/Spinner";
import { eventNames } from "process";
import React, { memo, useEffect, useRef, useState } from "react";
import { shareModalClosed } from "../../../actions";
import { useAppStore } from "../../../hooks/useAppStore";
import { useModal, Modal } from "../../Modal";
import * as styles from "./index.pc";

export const ShareModal = memo(() => {
  const { state, dispatch } = useAppStore();
  const [copied, setCopied] = useState(false);

  const onClose = () => {
    dispatch(shareModalClosed(null));
  };

  const shareInputRef = useRef<HTMLInputElement>();

  const onCopyClick = (event: React.MouseEvent<HTMLDivElement>) => {
    shareInputRef.current.select();
    shareInputRef.current.setSelectionRange(0, 99999);

    const result = document.execCommand("copy");
    setCopied(true);

    return result;
  };

  useEffect(() => {
    if (shareInputRef.current && state.shareProjectInfo?.data?.link) {
      shareInputRef.current.value = state.shareProjectInfo?.data?.link;
    }
  }, [shareInputRef.current, state.shareProjectInfo]);

  if (!state.shareProjectInfo) {
    return null;
  }

  return (
    <Modal title="Copy this link to share" onClose={onClose}>
      <styles.Content copied={copied} loading={!state.shareProjectInfo.done}>
        {state.shareProjectInfo.data && (
          <styles.ShareInput
            shareInputRef={shareInputRef}
            onClick={onCopyClick}
          />
        )}
      </styles.Content>
    </Modal>
  );
});
