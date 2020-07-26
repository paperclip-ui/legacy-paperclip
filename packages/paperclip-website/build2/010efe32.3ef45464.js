(window.webpackJsonp = window.webpackJsonp || []).push([
  [4],
  {
    151: function(e, t, a) {
      "use strict";
      a.r(t),
        a.d(t, "classNames", function() {
          return c;
        });
      a(0), a(228), a(263), a(264), a(265);
      const c = {
        light: "_8906f7c6_light light",
        "semi-bold": "_8906f7c6_semi-bold semi-bold",
        "text-default": "_8906f7c6_text-default text-default",
        "text-secondary": "_8906f7c6_text-secondary text-secondary"
      };
    },
    214: function(e, t, a) {
      "use strict";
      a(130);
      var c = a(0);
      const n = e => {
          const t = typeof e;
          return "object" === t || "string" !== t
            ? e
            : e
                .trim()
                .split(";")
                .reduce((e, t) => {
                  const [a, c] = t.split(":");
                  return (e[a.trim()] = c.trim()), e;
                }, {});
        },
        r = e => (e ? "_ba97e02b_" + e + " " + e : ""),
        s = c.memo(
          c.forwardRef(function(e, t) {
            return c.createElement(
              "div",
              {
                "data-pc-ba97e02b": !0,
                ref: t,
                key: "0",
                className: "_ba97e02b_font font " + r(e.className)
              },
              "A quick brown fox jumped over the lazy dog\n"
            );
          })
        );
      c.memo(
        c.forwardRef(function(e, t) {
          return c.createElement(
            "div",
            {
              "data-pc-ba97e02b": !0,
              ref: t,
              key: "1",
              style: n("font-family: " + r(e.fontFamily))
            },
            c.createElement(s, {
              "data-pc-ba97e02b": !0,
              key: "2",
              className: "_ba97e02b_extra-light extra-light"
            }),
            c.createElement(s, {
              "data-pc-ba97e02b": !0,
              key: "3",
              className: "_ba97e02b_light light"
            }),
            c.createElement(s, { "data-pc-ba97e02b": !0, key: "4" }),
            c.createElement(s, {
              "data-pc-ba97e02b": !0,
              key: "5",
              className: "_ba97e02b_medium medium"
            }),
            c.createElement(s, {
              "data-pc-ba97e02b": !0,
              key: "6",
              className: "_ba97e02b_bold bold"
            }),
            c.createElement(s, {
              "data-pc-ba97e02b": !0,
              key: "7",
              className: "_ba97e02b_extra-bold extra-bold"
            })
          );
        })
      );
    },
    228: function(e, t, a) {
      "use strict";
      a(132), a(0);
    },
    263: function(e, t, a) {
      "use strict";
      a(136), a(0), a(214);
    },
    264: function(e, t, a) {
      "use strict";
      a(137), a(0), a(214);
    },
    265: function(e, t, a) {
      "use strict";
      a(138), a(0), a(214);
    }
  }
]);
