import { noop } from "lodash";
import React, { memo, useState } from "react";
import { useTextInput } from "../../../../../../paperclip-designer/src/components/TextInput";
import { Modal } from "../../Modal";
import * as styles from "./index.pc";
import crc32 from "crc32";

// eehhh, nobodie's going to look at this
// const PASSWORDS = ["34bb5e49", "c8dfce6b", "68ac01fb", "9c13dd1e"];

const PASSWORDS = ["dinosaur!", "andy", "rana", "css sucks"];
const KEY = "has_access3";

export const PasswordModal = memo(() => {
  const [hasAccess, setHasAccess] = useState(localStorage.getItem(KEY) === "yes");
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState<string>();
  const passwordInputProps = useTextInput({
    value: password,
    onValueChange: setPassword
  }).inputProps;

  if (hasAccess) {
    return null;
  }

  const onSubmit = (event) => {
    event.preventDefault();
    if (!PASSWORDS.includes(password)) {
      return setError(`Incorrect password!`);
    }

    localStorage.setItem(KEY, "yes");
    setHasAccess(true);
  };

  return <Modal secret onClose={noop} title={<styles.HeaderTitle />}>
    <styles.Content error={error} onSubmit={onSubmit} onPasswordChange={passwordInputProps.onChange} passwordInputRef={passwordInputProps.ref} />
  </Modal>
});