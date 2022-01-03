import { compilers } from "paperclip-compiler-base-jsx";
import { PaperclipConfig } from "paperclip-utils";

const CODE_PREFLIGHT = `

const encode = (value) => value.replace(/['\\u00A0-\u9999<>\\&]/gim, function(i) {
  return '&#'+i.charCodeAt(0)+';';
});

const flatten = v => v.reduce((ary, v) => {
  if (Array.isArray(v)) {
    ary.push(...flatten(v));
  } else {
    ary.push(v);
  }
  return ary;
}, []);

const VOID_TAGS = ["br", "img"];

const isVoid = (v) => VOID_TAGS.includes(v);

const createElement = (tag, attributes, ...children) => {
  if (typeof tag === "function") {
    return tag({ ...attributes, children });
  }
  const buffer = ["<" + tag + ""];

  for (let key in attributes) {
    let value = attributes[key];
    if (key === "className") {
      key = "class";
    }
    if (key === "ref") {
      continue;
    }
    if (key === "style") {
      value = stringifyStyle(value);
    } else if (typeof value === "string") {
      value = encode(value);
    }
    buffer.push(" " + key + "=\\"" + value + "\\"");
  }

  if (isVoid(tag)) {
    buffer.push("/>");
    return buffer.join("");
  }

  buffer.push(">");

  buffer.push(flatten(children).filter(v => v !== false && v != null).join(""));

  buffer.push("</" + tag + ">");

  return buffer.join("");
}

const stringifyStyle = (value) => Object.entries(value).map(([key, value]) => (
  key + ":" + value
)).join(";");

const Fragment = (props) => flatten(props.children).join("");

const _vanilla = {
  createElement,
  Fragment,
  forwardRef: v => v,
  memo: v => v
};

`.trim();

export const compile = compilers({
  code: {
    imports: `import React from "react";\n`,
    preflight: CODE_PREFLIGHT,
    vendorName: "_vanilla"
  },
  definition: {
    imports: "",
    elementType: "string"
  },
  extensionName: (config: PaperclipConfig) =>
    (config.compilerOptions as any).es5 ? "js" : "mjs"
});
