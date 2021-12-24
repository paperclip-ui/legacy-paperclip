import React from "react";
import ReactDOM from "react-dom";
import { GroceryList } from "./GroceryList";

ReactDOM.render(
  <GroceryList groceries={["Milk", "Eggs", "Ham"]} />,
  document.getElementById("app")
);
