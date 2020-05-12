import React from "react";
import { Item } from "./data";
import useLocation from "./hooks/useLocation";
import View, { Filter } from "./controls.pc";


type Props = {
  items: Item[];
  onClearCompletedClicked: () => void;
};

export default ({ items, onClearCompletedClicked }: Props) => {
  const numItemsLeft = items.filter(item => !item.completed).length;
  const currentLocation = useLocation("active");
  return (
    <View
      onClearCompletedClicked={onClearCompletedClicked}
      itemsLeftLabel={
        <span>
          <strong>{numItemsLeft}</strong> {numItemsLeft > 1 ? "items" : "item"}{" "}
          left
        </span>
      }
      filters={
        <>
          <Filter
            href="#active"
            label="Active"
            active={currentLocation === "active"}
          />
          <Filter
            href="#complete"
            label="Completed"
            active={currentLocation === "complete"}
          />
          <Filter
            href="#incomplete"
            label="Incomplete"
            active={currentLocation === "incomplete"}
          />
        </>
      }
    />
  );
};
