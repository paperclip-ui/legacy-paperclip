import { motion } from "framer-motion";
import * as ui from "./demo.pc";
import * as React from "react";
import * as ReactDOM from "react-dom";

const mv = {
  Box: motion.custom(ui.Box)
};

const mount = document.createElement("div");
document.body.appendChild(mount);

ReactDOM.render(
  <mv.Box drag="x" animate={{ scale: 2 }}>
    I'm a box
  </mv.Box>,
  mount
);
