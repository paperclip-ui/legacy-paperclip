import * as React from "react";
import * as ReactDOM from "react-dom";
import * as cx from "classnames";
import { classNames } from "./design-generated/test/interface-public-copy.pc";
import styled from "styled-components";

const StyledButton = styled.div`
  cursor: pointer;
  display: inline-block;
  padding: 8px 14px;
  margin: 10px;
`;

type EnhancedButtonProps = {
  disabled?: boolean;
  primary?: boolean;
  secondary?: boolean;
  pressed?: boolean;
  children?: React.ReactNode;
};

const EnhancedButton = ({
  disabled,
  pressed,
  secondary,
  children
}: EnhancedButtonProps) => (
  <StyledButton
    className={cx({
      [classNames.buttonTextIdle]: !disabled,
      [classNames.buttonTextDisabled]: disabled,
      [classNames.buttonTextPressed]: pressed,
      [classNames.buttonTextHover]: false
    })}
  >
    <span
      className={cx(
        classNames.buttonTextIdle_button,
        classNames.buttonTextDisabled_button,
        classNames.buttonTextPressed_button
      )}
    >
      {children}
    </span>
  </StyledButton>
);

const App = () => {
  return (
    <>
      <EnhancedButton>Primary</EnhancedButton>
      <EnhancedButton secondary>Secondary</EnhancedButton>
      <EnhancedButton disabled>Disabled</EnhancedButton>
      <EnhancedButton disabled secondary>
        Disabled Secondary
      </EnhancedButton>
    </>
  );
};

const mount = document.createElement("div");
document.body.appendChild(mount);
ReactDOM.render(<App />, mount);
