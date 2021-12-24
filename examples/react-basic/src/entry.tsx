import React from "react";
import ReactDOM from "react-dom";
import { GroceryList } from "./GroceryList";
import * as groceryListStyles from "./CustomGroceryList.pc";

ReactDOM.render(
  <>
    <GroceryList groceries={["Milk", "Eggs", "Ham"]} />

    {/* example of how you can theme components that use PC styles */}
    <GroceryList
      groceries={["Milk", "Eggs", "Ham"]}
      styles={groceryListStyles}
    />
  </>,
  document.getElementById("app")
);
