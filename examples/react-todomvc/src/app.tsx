import React, { useCallback, useReducer } from "react";
import View from "./app.pc";
import ItemComponent from "./item";
import { Item } from "./data";
import useLocation from "./hooks/useLocation";
import { useState } from "react";
import Controls from "./controls";

const DEFAULT_ITEMS: Item[] = [
  { id: 1, label: "Walk dog" },
  { id: 2, label: "take out trash" },
  { id: 3, label: "clean car", completed: true }
];

const ITEM_FILTERS: {
  [identifier: string]: (item: Item) => boolean;
} = {
  active: (item: Item) => true,
  incomplete: (item: Item) => !item.completed,
  complete: (item: Item) => item.completed
};

useReducer;

export default () => {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const currentLocation = useLocation("active");
  const itemFilter = ITEM_FILTERS[currentLocation] || ITEM_FILTERS.active;

  const onItemChange = useCallback((newItem: Item) => {
    setItems(items =>
      items.map(item => {
        return item.id === newItem.id ? newItem : item;
      })
    );
  }, []);

  const onNewTodoInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      const label = String((event.target as any).value).trim();
      if (label) {
        setItems([...items, { id: Date.now(), label }]);
      }
      (event.target as any).value = "";
    }
  };

  const onClearCompletedClicked = () => {
    setItems(items.filter(item => !item.completed));
  };

  return (
    <View
      onNewTodoKeyPress={onNewTodoInputKeyPress}
      controls={
        <Controls
          items={items}
          onClearCompletedClicked={onClearCompletedClicked}
        />
      }
      items={items.filter(itemFilter).map((item, id) => (
        <ItemComponent onChange={onItemChange} item={item} key={id} />
      ))}
    />
  );
};
