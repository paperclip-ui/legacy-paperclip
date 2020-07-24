var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
import React, { useCallback, useReducer } from "react";
import View from "./app.pc";
import ItemComponent from "./item";
import useLocation from "./hooks/useLocation";
import { useState } from "react";
import Controls from "./controls";
var DEFAULT_ITEMS = [
  { id: 1, label: "Walk dog" },
  { id: 2, label: "take out trash" },
  { id: 3, label: "clean car", completed: true }
];
var ITEM_FILTERS = {
  active: function(item) {
    return true;
  },
  incomplete: function(item) {
    return !item.completed;
  },
  complete: function(item) {
    return item.completed;
  }
};
useReducer;
export default (function() {
  var _a = useState(DEFAULT_ITEMS),
    items = _a[0],
    setItems = _a[1];
  var currentLocation = useLocation("active");
  var itemFilter = ITEM_FILTERS[currentLocation] || ITEM_FILTERS.active;
  var onItemChange = useCallback(function(newItem) {
    setItems(function(items) {
      return items.map(function(item) {
        return item.id === newItem.id ? newItem : item;
      });
    });
  }, []);
  var onNewTodoInputKeyPress = function(event) {
    if (event.key === "Enter") {
      var label = String(event.target.value).trim();
      if (label) {
        setItems(__spreadArrays(items, [{ id: Date.now(), label: label }]));
      }
      event.target.value = "";
    }
  };
  var onClearCompletedClicked = function() {
    setItems(
      items.filter(function(item) {
        return !item.completed;
      })
    );
  };
  return React.createElement(View, {
    onNewTodoKeyPress: onNewTodoInputKeyPress,
    controls: React.createElement(Controls, {
      items: items,
      onClearCompletedClicked: onClearCompletedClicked
    }),
    items: items.filter(itemFilter).map(function(item, id) {
      return React.createElement(ItemComponent, {
        onChange: onItemChange,
        item: item,
        key: id
      });
    })
  });
});
