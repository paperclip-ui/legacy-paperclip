(window.webpackJsonp = window.webpackJsonp || []).push([
  [18],
  {
    167: function(e, a, t) {
      "use strict";
      t.r(a),
        t.d(a, "classNames", function() {
          return r;
        });
      var b = t(0);
      const r = {},
        c = e => {
          const a = typeof e;
          return "object" === a || "string" !== a
            ? e
            : e
                .trim()
                .split(";")
                .reduce((e, a) => {
                  const [t, b] = a.split(":");
                  return (e[t.trim()] = b.trim()), e;
                }, {});
        },
        n = e => (e ? "_ba97e02b_" + e + " " + e : ""),
        l = b.memo(
          b.forwardRef(function(e, a) {
            return b.createElement(
              "div",
              {
                "data-pc-ba97e02b": !0,
                ref: a,
                key: "0",
                className: "_ba97e02b_font font " + n(e.className)
              },
              "A quick brown fox jumped over the lazy dog\n"
            );
          })
        ),
        m = b.memo(
          b.forwardRef(function(e, a) {
            return b.createElement(
              "div",
              {
                "data-pc-ba97e02b": !0,
                ref: a,
                key: "1",
                style: c("font-family: " + n(e.fontFamily))
              },
              b.createElement(l, {
                "data-pc-ba97e02b": !0,
                key: "2",
                className: "_ba97e02b_extra-light extra-light"
              }),
              b.createElement(l, {
                "data-pc-ba97e02b": !0,
                key: "3",
                className: "_ba97e02b_light light"
              }),
              b.createElement(l, { "data-pc-ba97e02b": !0, key: "4" }),
              b.createElement(l, {
                "data-pc-ba97e02b": !0,
                key: "5",
                className: "_ba97e02b_medium medium"
              }),
              b.createElement(l, {
                "data-pc-ba97e02b": !0,
                key: "6",
                className: "_ba97e02b_bold bold"
              }),
              b.createElement(l, {
                "data-pc-ba97e02b": !0,
                key: "7",
                className: "_ba97e02b_extra-bold extra-bold"
              })
            );
          })
        );
      a.default = m;
    }
  }
]);
