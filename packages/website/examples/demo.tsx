import React, {useState} from "react";
import {Counter as CounterView} from "./demo.pc";

export function Counter() {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <CounterView onClick={onClick} currentCount={currentCount} />;
}



