// PC files are compiled to plain code & can
// be imported as regular modules
import React from "react";
import * as defaultStyles from "./GroceryList.pc";

export type GroceryListProps = {
  styles?: Partial<typeof defaultStyles>;
  groceries: string[];
};

export function GroceryList({
  groceries,
  styles: styleOverrides
}: GroceryListProps) {
  const styles = { ...defaultStyles, ...styleOverrides };

  return (
    <styles.List>
      {groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>
      ))}
    </styles.List>
  );
}
