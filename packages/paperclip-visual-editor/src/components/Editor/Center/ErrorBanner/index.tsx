import React from "react";
import * as styles from "./index.pc";
import { EngineErrorEvent } from "paperclip-utils";
import { useAppStore } from "../../../../hooks/useAppStore";
import { Dispatch } from "redux";
import { Action, errorBannerClicked } from "../../../../actions";

type Props = {
  error: EngineErrorEvent;
  dispatch: Dispatch<Action>;
};

export const ErrorBanner = React.memo(({ error, dispatch }: Props) => {
  if (!error) {
    return null;
  }
  const onClick = () => {
    dispatch(errorBannerClicked(error));
  };
  return (
    <styles.ErrorBanner
      onClick={onClick}
      filePath={error.uri.replace("file://", "")}
      message={error.message || (error as any).info?.message}
    />
  );
});
