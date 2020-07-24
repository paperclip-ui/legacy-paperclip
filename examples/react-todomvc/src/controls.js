import React from "react";
import useLocation from "./hooks/useLocation";
import View, { Filter } from "./controls.pc";
export default (function(_a) {
  var items = _a.items,
    onClearCompletedClicked = _a.onClearCompletedClicked;
  var numItemsLeft = items.filter(function(item) {
    return !item.completed;
  }).length;
  var currentLocation = useLocation("active");
  return React.createElement(View, {
    onClearCompletedClicked: onClearCompletedClicked,
    itemsLeftLabel: React.createElement(
      "span",
      null,
      React.createElement("strong", null, numItemsLeft),
      " ",
      numItemsLeft > 1 ? "items" : "item",
      " ",
      "left"
    ),
    filters: React.createElement(
      React.Fragment,
      null,
      React.createElement(Filter, {
        href: "#active",
        label: "All",
        active: currentLocation === "active"
      }),
      React.createElement(Filter, {
        href: "#complete",
        label: "Completed",
        active: currentLocation === "complete"
      }),
      React.createElement(Filter, {
        href: "#incomplete",
        label: "Incomplete",
        active: currentLocation === "incomplete"
      })
    )
  });
});
