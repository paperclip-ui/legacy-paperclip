import React, { memo, useCallback, useMemo, useState } from "react";
import { Button, TextInput } from "@tandem-ui/design-system";
import { Modal } from "../Modal";

export type PromptProps = {
  title: string;
  okLabel: string;
  inputPlaceholder?: string;
  onClose: (value?: string) => void;
};

export const Prompt = memo(
  ({ title, inputPlaceholder, onClose, okLabel }: PromptProps) => {
    const [value, setValue] = useState<string>();
    const onOK = useCallback(() => {
      onClose(value);
    }, [value, onClose]);
    const onCancel = useCallback(() => {
      onClose();
    }, [onClose]);

    const onEnterPressed = useCallback(() => {
      if (value) {
        onOK();
      }
    }, [onOK]);
    return (
      <>
        <Modal
          onClose={onCancel}
          title={title}
          footer={
            <>
              <Button onClick={onCancel}>Cancel</Button>
              <Button onClick={onOK}>{okLabel}</Button>
            </>
          }
        >
          <TextInput
            placeholder={inputPlaceholder}
            value={value}
            autoFocus
            onEnterPressed={onEnterPressed}
            onValueChange={setValue}
          />
        </Modal>
      </>
    );
  }
);
