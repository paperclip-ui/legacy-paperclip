import React, { useState, KeyboardEvent, useCallback } from "react";
import View, { LabelInput, TodoLabel } from "./item.pc";
import { Item } from "./data";

type Props = {
  item?: Item;
  onChange: (item: Item) => void;
};

export default React.memo(({ item, onChange }: Props) => {
  const [editing, setEditing] = useState(false);
  const onClick = useCallback(() => {
    setEditing(true);
  }, [setEditing]);

  const onBlur = useCallback(() => {
    setEditing(false);
  }, [setEditing]);

  const onLabelInputKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onChange({
          ...item,
          label: (event.target as HTMLInputElement).value
        });
        setEditing(false);
      }
    },
    [onChange, setEditing]
  );

  const toggleCompleted = () =>
    onChange({
      ...item,
      completed: !item.completed
    });

  return (
    <View completed={item.completed}>
      {editing ? (
        <LabelInput
          onBlur={onBlur}
          label={item.label}
          onKeyPress={onLabelInputKeyPress}
        />
      ) : (
        <TodoLabel
          onCheckChange={toggleCompleted}
          completed={item.completed}
          label={item.label}
          onLabelClick={onClick}
        />
      )}
    </View>
  );
});
