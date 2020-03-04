import BaseCounter from "./counter.pc";
import React, { useState } from "react";

export default () => {
  const [currentCount, setCount] = useState(0);
  const onClick = () => setCount(currentCount + 1);
  return <BaseCounter onClick={onClick} currentCount={currentCount} />;
};
