import React from "react";
import _pubEe9C6B7B from "./atoms.pc";
const encode = value =>
  value.replace(/['\u00A0-香<>\&]/gim, function(i) {
    return "&#" + i.charCodeAt(0) + ";";
  });

const flatten = v =>
  v.reduce((ary, v) => {
    if (Array.isArray(v)) {
      ary.push(...flatten(v));
    } else {
      ary.push(v);
    }
    return ary;
  }, []);

const VOID_TAGS = ["br", "img"];

const isVoid = v => VOID_TAGS.includes(v);

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
      .filter(v => v !== false && v != null)
      .join("")
  );

  buffer.push("</" + tag + ">");

  return buffer.join("");
};

const stringifyStyle = value =>
  Object.entries(value)
    .map(([key, value]) => key + ":" + value)
    .join(";");

const Fragment = props => flatten(props.children).join("");

const _vanilla = {
  createElement,
  Fragment,
  forwardRef: v => v,
  memo: v => v
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
    .reduce(function(obj, keyValue) {
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

var Row = _vanilla.memo(
  _vanilla.forwardRef(function Row(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className:
          "_e1edbbce _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
          (props["header"]
            ? " " +
              "_a69f6dc3_header _pub-a69f6dc3_header _pub-ee9c6b7b_header header"
            : ""),
        ref: ref
      },
      props["children"]
    );
  })
);
export { Row };

var Cell = _vanilla.memo(
  _vanilla.forwardRef(function Cell(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_96ea8b58 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      props["children"]
    );
  })
);
export { Cell };

var Table = _vanilla.memo(
  _vanilla.forwardRef(function Table(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_88e1efb _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      props["children"]
    );
  })
);
export { Table };

var CoverageInfo = _vanilla.memo(
  _vanilla.forwardRef(function CoverageInfo(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_7f892e6d _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      _vanilla.createElement(
        "span",
        {
          className: "_3ca82f86 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        props["title"]
      ),
      _vanilla.createElement(
        "div",
        {
          className: "_a5a17e3c _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        _vanilla.createElement(
          "span",
          {
            className: "_f463c84f _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
          },
          props["percentage"],
          "%\n    "
        ),
        _vanilla.createElement(
          "span",
          {
            className: "_6d6a99f5 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
          },
          "\n      (",
          props["coveredCount"],
          " / ",
          props["totalCount"],
          ")\n    "
        )
      )
    );
  })
);
export { CoverageInfo };
