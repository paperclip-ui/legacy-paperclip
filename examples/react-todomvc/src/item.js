var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React, { useState, useCallback } from "react";
import View, { LabelInput, TodoLabel } from "./item.pc";
export default React.memo(function(_a) {
  var item = _a.item,
    onChange = _a.onChange;
  var _b = useState(false),
    editing = _b[0],
    setEditing = _b[1];
  var onClick = useCallback(
    function() {
      setEditing(true);
    },
    [setEditing]
  );
  var onBlur = useCallback(
    function() {
      setEditing(false);
    },
    [setEditing]
  );
  var onLabelInputKeyPress = useCallback(
    function(event) {
      if (event.key === "Enter") {
        onChange(__assign(__assign({}, item), { label: event.target.value }));
        setEditing(false);
      }
    },
    [onChange, setEditing]
  );
  var toggleCompleted = function() {
    return onChange(
      __assign(__assign({}, item), { completed: !item.completed })
    );
  };
  return React.createElement(
    View,
    { completed: item.completed },
    editing
      ? React.createElement(LabelInput, {
          onBlur: onBlur,
          label: item.label,
          onKeyPress: onLabelInputKeyPress
        })
      : React.createElement(TodoLabel, {
          onCheckChange: toggleCompleted,
          completed: item.completed,
          label: item.label,
          onLabelClick: onClick
        })
  );
});
