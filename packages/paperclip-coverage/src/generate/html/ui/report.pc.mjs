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

var Breadcrumbs = _vanilla.memo(
  _vanilla.forwardRef(function Breadcrumbs(props, ref) {
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
export { Breadcrumbs };

var Breadcrumb = _vanilla.memo(
  _vanilla.forwardRef(function Breadcrumb(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_7f892e6d _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref,
        href: props["href"]
      },
      _vanilla.createElement(
        "a",
        {
          className: "_3ca82f86 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
          href: props["href"]
        },
        props["children"]
      )
    );
  })
);
export { Breadcrumb };

var Row = _vanilla.memo(
  _vanilla.forwardRef(function Row(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className:
          "_91874f41 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
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
        className:
          "_763f6246 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
          " " +
          "_a69f6dc3_coverage _pub-a69f6dc3_coverage _pub-ee9c6b7b_coverage coverage " +
          (props["class"] ? " " + props["class"] : "") +
          (props["okay"]
            ? " " + "_a69f6dc3_okay _pub-a69f6dc3_okay _pub-ee9c6b7b_okay okay"
            : "") +
          (props["poor"]
            ? " " + "_a69f6dc3_poor _pub-a69f6dc3_poor _pub-ee9c6b7b_poor poor"
            : "") +
          (props["good"]
            ? " " + "_a69f6dc3_good _pub-a69f6dc3_good _pub-ee9c6b7b_good good"
            : ""),
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
        className: "_d4ccbe78 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      props["children"]
    );
  })
);
export { Table };

var PercentCell = _vanilla.memo(
  _vanilla.forwardRef(function PercentCell(props, ref) {
    return _vanilla.createElement(
      Cell,
      {
        class: "_3ac2df54",
        ref: ref,
        okay: props["okay"],
        good: props["good"],
        poor: props["poor"]
      },
      _vanilla.createElement(
        CoveragePercentInfo,
        {
          class: "_8f91156b",
          coveredCount: props["coveredCount"],
          percentage: props["percentage"],
          totalCount: props["totalCount"],
          transparent: true,
          stretch: true,
          subtle: true
        },
        null
      )
    );
  })
);
export { PercentCell };

var FileCell = _vanilla.memo(
  _vanilla.forwardRef(function FileCell(props, ref) {
    return _vanilla.createElement(
      Cell,
      {
        class: "_d3a17a61",
        ref: ref,
        okay: props["okay"],
        good: props["good"],
        poor: props["poor"]
      },
      props["children"],
      _vanilla.createElement(
        CoverageBar,
        {
          class: "_651208f5",
          percentage: props["percentage"]
        },
        null
      )
    );
  })
);
export { FileCell };

var CoverageInfo = _vanilla.memo(
  _vanilla.forwardRef(function CoverageInfo(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_3daf1b4d _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      _vanilla.createElement(
        "span",
        {
          className: "_ff9f8d21 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        props["title"]
      ),
      _vanilla.createElement(
        CoveragePercentInfo,
        {
          class: "_6696dc9b",
          percentage: props["percentage"],
          coveredCount: props["coveredCount"],
          totalCount: props["totalCount"]
        },
        null
      )
    );
  })
);
export { CoverageInfo };

var CoveragePercentInfo = _vanilla.memo(
  _vanilla.forwardRef(function CoveragePercentInfo(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className:
          "_da17364a _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
          (props["transparent"]
            ? " " +
              "_a69f6dc3_transparent _pub-a69f6dc3_transparent _pub-ee9c6b7b_transparent transparent"
            : "") +
          (props["stretch"]
            ? " " +
              "_a69f6dc3_stretch _pub-a69f6dc3_stretch _pub-ee9c6b7b_stretch stretch"
            : "") +
          (props["subtle"]
            ? " " +
              "_a69f6dc3_subtle _pub-a69f6dc3_subtle _pub-ee9c6b7b_subtle subtle"
            : ""),
        ref: ref
      },
      _vanilla.createElement(
        "span",
        {
          className: "_f501a02b _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        props["percentage"],
        "%\n  "
      ),
      _vanilla.createElement(
        "span",
        {
          className: "_6c08f191 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        "\n    (",
        props["coveredCount"],
        " / ",
        props["totalCount"],
        ")\n  "
      )
    );
  })
);
export { CoveragePercentInfo };

var CoverageBar = _vanilla.memo(
  _vanilla.forwardRef(function CoverageBar(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_ffe1edbb _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      _vanilla.createElement(
        "div",
        {
          className: "_e9a75e7d _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
          style: castStyle("width: " + props["percentage"] + "%")
        },
        null
      )
    );
  })
);
export { CoverageBar };

var Report = _vanilla.memo(
  _vanilla.forwardRef(function Report(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_11ef8c97 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      _vanilla.createElement(
        "div",
        {
          className: "_9d24ba85 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
        },
        _vanilla.createElement(
          "div",
          {
            className: "_5d6de392 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
          },
          _vanilla.createElement(
            "h3",
            {
              className: "_4a594e1d _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
            },
            props["title"]
          ),
          _vanilla.createElement(
            Breadcrumbs,
            {
              class: "_d3501fa7"
            },
            props["breadcrumbs"]
          )
        ),
        _vanilla.createElement(
          "div",
          {
            className: "_c464b228 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b"
          },
          props["coverage"]
        )
      ),
      _vanilla.createElement(
        "div",
        {
          className:
            "_ea238a13 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
            " " +
            "_a69f6dc3_coverage _pub-a69f6dc3_coverage _pub-ee9c6b7b_coverage coverage" +
            (props["good"]
              ? " " +
                "_a69f6dc3_good _pub-a69f6dc3_good _pub-ee9c6b7b_good good"
              : "") +
            (props["poor"]
              ? " " +
                "_a69f6dc3_poor _pub-a69f6dc3_poor _pub-ee9c6b7b_poor poor"
              : "") +
            (props["okay"]
              ? " " +
                "_a69f6dc3_okay _pub-a69f6dc3_okay _pub-ee9c6b7b_okay okay"
              : "")
        },
        null
      ),
      props["children"]
    );
  })
);
export { Report };

var FileReportContent = _vanilla.memo(
  _vanilla.forwardRef(function FileReportContent(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className: "_8f8b1934 _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b",
        ref: ref
      },
      props["children"]
    );
  })
);
export { FileReportContent };

var LineNumber = _vanilla.memo(
  _vanilla.forwardRef(function LineNumber(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className:
          "_1682488e _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
          " " +
          "_a69f6dc3_coverage _pub-a69f6dc3_coverage _pub-ee9c6b7b_coverage coverage" +
          (props["good"]
            ? " " + "_a69f6dc3_good _pub-a69f6dc3_good _pub-ee9c6b7b_good good"
            : ""),
        ref: ref
      },
      props["children"]
    );
  })
);

var Line = _vanilla.memo(
  _vanilla.forwardRef(function Line(props, ref) {
    return _vanilla.createElement(
      "div",
      {
        className:
          "_863d551f _a69f6dc3 _pub-a69f6dc3 _pub-ee9c6b7b" +
          " " +
          "_a69f6dc3_coverage _pub-a69f6dc3_coverage _pub-ee9c6b7b_coverage coverage" +
          (props["poor"]
            ? " " + "_a69f6dc3_poor _pub-a69f6dc3_poor _pub-ee9c6b7b_poor poor"
            : "") +
          (props["okay"]
            ? " " + "_a69f6dc3_okay _pub-a69f6dc3_okay _pub-ee9c6b7b_okay okay"
            : ""),
        ref: ref
      },
      _vanilla.createElement(
        LineNumber,
        {
          class: "_e67665f2",
          good: props["good"]
        },
        props["number"]
      ),
      props["children"]
    );
  })
);
export { Line };
