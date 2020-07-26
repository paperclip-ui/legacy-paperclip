(window.webpackJsonp = window.webpackJsonp || []).push([
  [11],
  {
    160: function(e, a, t) {
      "use strict";
      t.r(a),
        t.d(a, "classNames", function() {
          return c;
        });
      t(0), t(214);
      const c = {};
    },
    214: function(e, a, t) {
      "use strict";
      t(130);
      var c = t(0);
      const r = e => {
          const a = typeof e;
          return "object" === a || "string" !== a
            ? e
            : e
                .trim()
                .split(";")
                .reduce((e, a) => {
                  const [t, c] = a.split(":");
                  return (e[t.trim()] = c.trim()), e;
                }, {});
        },
        b = e => (e ? "_ba97e02b_" + e + " " + e : ""),
        n = c.memo(
          c.forwardRef(function(e, a) {
            return c.createElement(
              "div",
              {
                "data-pc-ba97e02b": !0,
                ref: a,
                key: "0",
                className: "_ba97e02b_font font " + b(e.className)
              },
              "A quick brown fox jumped over the lazy dog\n"
            );
          })
        );
      c.memo(
        c.forwardRef(function(e, a) {
          return c.createElement(
            "div",
            {
              "data-pc-ba97e02b": !0,
              ref: a,
              key: "1",
              style: r("font-family: " + b(e.fontFamily))
            },
            c.createElement(n, {
              "data-pc-ba97e02b": !0,
              key: "2",
              className: "_ba97e02b_extra-light extra-light"
            }),
            c.createElement(n, {
              "data-pc-ba97e02b": !0,
              key: "3",
              className: "_ba97e02b_light light"
            }),
            c.createElement(n, { "data-pc-ba97e02b": !0, key: "4" }),
            c.createElement(n, {
              "data-pc-ba97e02b": !0,
              key: "5",
              className: "_ba97e02b_medium medium"
            }),
            c.createElement(n, {
              "data-pc-ba97e02b": !0,
              key: "6",
              className: "_ba97e02b_bold bold"
            }),
            c.createElement(n, {
              "data-pc-ba97e02b": !0,
              key: "7",
              className: "_ba97e02b_extra-bold extra-bold"
            })
          );
        })
      );
    }
  }
]);
