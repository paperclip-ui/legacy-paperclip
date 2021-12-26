import React, { memo, useCallback, useState } from "react";
import * as styles from "./index.pc";
import { Select } from "../../../Select";
import { Button } from "tandem-design-system";
import { CommitButton } from "./index.pc";
import { useDispatch, useSelector } from "react-redux";
import { getBranchInfo, getCommitStatus } from "../../../../state";
import { Prompt } from "../../../Prompt";
import { commitMessageEntered, branchChanged } from "../../../../actions";

export const Header = () => {
  const branchInfo = useSelector(getBranchInfo);
  const branches = branchInfo?.branches || [];

  if (!branchInfo) {
    return null;
  }

  return (
    <styles.Header>
      {/* <BranchSelect /> */}
      {branchInfo && <Commit />}
      {branchInfo && (
        <styles.CurrentBranchLabel>
          Current branch: {branchInfo?.currentBranch}
        </styles.CurrentBranchLabel>
      )}
      {/* <NewBranch /> */}
    </styles.Header>
  );
};

const BranchSelect = memo(() => {
  const dispatch = useDispatch();

  const onChange = (branchName: string) => {
    dispatch(branchChanged({ branchName }));
  };

  const branchInfo = useSelector(getBranchInfo);
  const branches = branchInfo?.branches || [];

  return (
    <Select
      options={branches.map(branch => ({
        label: branch,
        value: branch
      }))}
      value={branchInfo?.currentBranch}
      onChange={onChange}
    />
  );
});

const NewBranch = memo(() => {
  const [showPrompt, setShowPrompt] = useState(false);

  const onBranchClick = () => {
    setShowPrompt(true);
  };
  const onPromptClose = (value?: string) => {
    setShowPrompt(false);
  };

  return (
    <>
      <Button onClick={onBranchClick}>Branch</Button>
      {showPrompt && (
        <Prompt
          okLabel="Create"
          title="Create new branch"
          inputPlaceholder="Branch name"
          onClose={onPromptClose}
        />
      )}
    </>
  );
});

const Commit = memo(() => {
  const [showPrompt, setShowPrompt] = useState(false);
  const status = useSelector(getCommitStatus);
  const dispatch = useDispatch();

  const onCommitClick = () => {
    setShowPrompt(true);
  };
  const onPromptClose = useCallback(
    (message?: string) => {
      setShowPrompt(false);
      if (message) {
        dispatch(commitMessageEntered({ message }));
      }
    },
    [dispatch, setShowPrompt]
  );

  return (
    <>
      <CommitButton
        onClick={onCommitClick}
        title={status?.error?.message}
        loading={status?.loaded === false}
        failed={!!status?.error}
        success={status?.loaded && !status?.error}
      >
        Save
      </CommitButton>
      {showPrompt && (
        <Prompt
          okLabel="Commit & push"
          title="Save changes"
          inputPlaceholder="Description of changes"
          onClose={onPromptClose}
        />
      )}
    </>
  );
});
