import React from "react";
const encode = (value) =>
  value.replace(/['<>\u00A0-香<>\&]/gim, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });

const flatten = (v) =>
  v.reduce((ary, v) => {
    if (Array.isArray(v)) {
      ary.push(...flatten(v));
    } else {
      ary.push(v);
    }
    return ary;
  }, []);

const VOID_TAGS = ["br", "img", "hr"];

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
    buffer.push(" " + key + '="' + value + '"');
  }

  if (isVoid(tag)) {
    buffer.push("/>");
    return buffer.join("");
  }

  buffer.push(">");

  buffer.push(
    flatten(children)
      .filter((v) => v !== false && v != null)
      .join("")
  );

  buffer.push("</" + tag + ">");

  return buffer.join("");
};

const stringifyStyle = (value) =>
  Object.entries(value)
    .map(([key, value]) => key + ":" + value)
    .join(";");

const Fragment = (props) => flatten(props.children).join("");

const _vanilla = {
  createElement,
  Fragment,
  forwardRef: (v) => v,
  memo: (v) => v,
};
function getDefault(module) {
  return module.default || module;
}

function castStyle(value) {
  var tov = typeof value;
  if (tov === "object" || tov !== "string" || !value) return value;
  return value
    .trim()
    .split(";")
    .reduce(function (obj, keyValue) {
      var kvp = keyValue.split(":");
      var key = kvp[0];
      var value = kvp[1];
      if (!value || value === "undefined") return obj;
      var trimmedValue = value.trim();
      if (trimmedValue === "undefined" || !trimmedValue) return obj;
      obj[key.trim()] = trimmedValue;
      return obj;
    }, {});
}

export const classNames = {};

var $$Default = _vanilla.memo(
  _vanilla.forwardRef(function $$Default(props, ref) {
    return _vanilla.createElement(
      "html",
      {
        className: "_cee54446 _3ef4ccdc _pub-3ef4ccdc",
        ref: ref,
      },
      _vanilla.createElement(
        "head",
        {
          className: "_90b8db53 _3ef4ccdc _pub-3ef4ccdc",
        },
        props["head"]
      ),
      _vanilla.createElement(
        "body",
        {
          className: "_e7bfebc5 _3ef4ccdc _pub-3ef4ccdc",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;
