import React from "react";
import * as styles from "./index.pc";
import { EngineErrorEvent } from "paperclip-utils";

type Props = {
  error: EngineErrorEvent;
};

export const ErrorBanner = React.memo(({ error }: Props) => {
  if (!error) {
    return null;
  }
  console.log(error);
  return (
    <styles.ErrorBanner
      filePath={error.uri.replace("file://", "")}
      message={error.message || (error as any).info?.message}
    />
  );
});
