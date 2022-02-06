import React from "react";
import * as styles from "./index.pc";

export const ComputedInspector = () => {
  return (
    <>
      <styles.ComputedStyles>
        <styles.ComputedProperty
          collapsed
          name="display"
          value="0px 0px 1px #FF00FF"
        >
          <styles.ComputedPropertySource
            selector=".Pane.Container"
            fileName="atoms.pc"
          />
        </styles.ComputedProperty>
      </styles.ComputedStyles>
    </>
  );
};
