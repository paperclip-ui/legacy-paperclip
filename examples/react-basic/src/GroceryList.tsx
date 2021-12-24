// PC files are compiled to plain code & can
// be imported as regular modules
import React from "react";
import * as styles from "./GroceryList.pc";

export function GroceryList({ groceries }) {
  return (
    <styles.List>
      {groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>
      ))}
    </styles.List>
  );
}
