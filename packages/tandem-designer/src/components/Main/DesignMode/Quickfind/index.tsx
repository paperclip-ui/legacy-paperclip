import { TextInput } from "@tandem-ui/design-system";
import React from "react";
import * as styles from "./index.pc";

export const Quickfind = () => {
  const { visible, onFilterChange } = useQuickfind();

  if (!visible) {
    return null;
  }

  return (
    <styles.Container
      filterInput={
        <TextInput big secondary wide onValueChange={onFilterChange} />
      }
      items={null}
    />
  );
};

const useQuickfind = () => {
  const visible = true;
  const onFilterChange = (value: string) => {};

  return { visible, onFilterChange };
};
