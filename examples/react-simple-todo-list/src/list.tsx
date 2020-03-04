import { TodoList, TodoItem } from "./list.pc";
import React, { useState, useCallback } from "react";

type Todo = {
  done: boolean;
  id: number;
  label: string;
};

export default () => {
  const [todos, setTodos] = useState([
    createTodo("Wash car"),
    createTodo("Groceries")
  ]);

  const onNewInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();
    if (event.key === "Enter" && value) {
      setTodos([...todos, createTodo(value)]);
      target.value = "";
    }
  };

  const onDoneClick = useCallback(
    (todo: Todo) => () => {
      setTodos(todos =>
        todos.map(oldTodo => {
          return oldTodo.id === todo.id
            ? {
                ...oldTodo,
                done: !oldTodo.done
              }
            : oldTodo;
        })
      );
    },
    []
  );

  return (
    <TodoList
      onNewTodoKeyPress={onNewInputKeyPress}
      todoItems={todos.map(todo => {
        return (
          <TodoItem
            done={todo.done}
            onDoneClick={onDoneClick(todo)}
            label={todo.label}
            key={todo.id}
          />
        );
      })}
    />
  );
};

let _idCount = 0;
const createTodo = (label: string) => ({
  label,
  done: false,
  id: _idCount++
});
