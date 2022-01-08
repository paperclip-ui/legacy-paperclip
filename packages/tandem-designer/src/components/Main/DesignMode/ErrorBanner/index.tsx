import React from "react";
import * as styles from "./index.pc";
import { EngineErrorEvent, EngineErrorKind } from "@paperclip-ui/utils";
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
  let message = `${error.message || (error as any).info?.message}`;

  return (
    <styles.ErrorBanner
      onClick={onClick}
      filePath={error.uri.replace("file://", "")}
      message={message}
    />
  );
});
