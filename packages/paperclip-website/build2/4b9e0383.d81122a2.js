(window.webpackJsonp = window.webpackJsonp || []).push([
  [17],
  {
    166: function(e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "frontMatter", function() {
          return l;
        }),
        n.d(t, "metadata", function() {
          return s;
        }),
        n.d(t, "rightToc", function() {
          return i;
        }),
        n.d(t, "default", function() {
          return p;
        });
      var r = n(2),
        a = n(9),
        o = (n(0), n(204)),
        l = {
          id: "usage-troubleshooting",
          title: "Troubleshooting",
          sidebar_label: "Troubleshooting"
        },
        s = {
          id: "usage-troubleshooting",
          isDocsHomePage: !1,
          title: "Troubleshooting",
          description: "Can't override variant styles",
          source: "@site/docs/usage-troubleshooting.md",
          permalink: "/docs/usage-troubleshooting",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/usage-troubleshooting.md",
          sidebar_label: "Troubleshooting",
          sidebar: "docs",
          previous: {
            title: "Setting up Webpack",
            permalink: "/docs/configuring-webpack"
          },
          next: {
            title: "Setting up visual regression tests",
            permalink: "/docs/safety-visual-regression"
          }
        },
        i = [
          {
            value: "Can&#39;t override variant styles",
            id: "cant-override-variant-styles",
            children: []
          }
        ],
        c = { rightToc: i };
      function p(e) {
        var t = e.components,
          n = Object(a.a)(e, ["components"]);
        return Object(o.b)(
          "wrapper",
          Object(r.a)({}, c, n, { components: t, mdxType: "MDXLayout" }),
          Object(o.b)(
            "h2",
            { id: "cant-override-variant-styles" },
            "Can't override variant styles"
          ),
          Object(o.b)(
            "p",
            null,
            "You may be dealing with CSS specificity issues. Suppose that you have an input:"
          ),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .input {\n    &.xsmall {\n      color: blue;\n    }\n  }\n</style>\n\n<input export component as="default" className="input {className?}" className:xsmall>\n'
            )
          ),
          Object(o.b)(
            "p",
            null,
            "And then you have another component that's using TextInput:"
          ),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<import as="TextInput" src="./text-input.pc">\n\n<style>\n  .TextColorOverride {\n    color: red;\n  }\n</style>\n\n<TextInput className=">>>TextColorOverride" xsmall>\n'
            )
          ),
          Object(o.b)(
            "p",
            null,
            "\u261d\ud83c\udffb ",
            Object(o.b)("inlineCode", { parentName: "p" }, "TextColorOverride"),
            " won't actually be applied. This is because to native CSS, the xsmall selector has a ",
            Object(o.b)("em", { parentName: "p" }, "higher priority"),
            ". Here's an example to illustrate this:"
          ),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .input.small {\n    color: red;\n  }\n  .input-override {\n    color: blue;\n  }\n</style>\n\n<input type="text" class="input small input-override" value="I should be blue!">\n'
            )
          ),
          Object(o.b)(
            "blockquote",
            null,
            Object(o.b)(
              "p",
              { parentName: "blockquote" },
              Object(o.b)(
                "a",
                Object(r.a)(
                  { parentName: "p" },
                  { href: "https://jsfiddle.net/hL20se4m/" }
                ),
                "https://jsfiddle.net/hL20se4m/"
              )
            )
          ),
          Object(o.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This HTML has the same effect as our Paperclip UI code above. Basically, style rules that have more class & attribute selectors have a higher priority. "
          ),
          Object(o.b)(
            "h4",
            { id: "how-do-you-fix-this" },
            "How do you fix this?"
          ),
          Object(o.b)("p", null, "Just flatten your variants. For example:"),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<style>\n  .input {\n    &-xsmall {\n      color: blue;\n    }\n  }\n</style>\n\n<input export component as="default" className="input {className?}" className:xsmall="input-xsmall">\n'
            )
          ),
          Object(o.b)(
            "p",
            null,
            "And ",
            Object(o.b)("em", { parentName: "p" }, "then"),
            " you can apply style overrides:"
          ),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-html" }
              ),
              '<import as="TextInput" src="./text-input.pc">\n\n<style>\n  .TextColorOverride {\n    color: red;\n  }\n</style>\n\n<TextInput className=">>>TextColorOverride" xsmall>\n'
            )
          ),
          Object(o.b)(
            "p",
            null,
            "\u261d\ud83c\udffb In this case, ",
            Object(o.b)("inlineCode", { parentName: "p" }, "TextColorOverride"),
            " properties will be applied. "
          )
        );
      }
      p.isMDXComponent = !0;
    },
    204: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return u;
      }),
        n.d(t, "b", function() {
          return d;
        });
      var r = n(0),
        a = n.n(r);
      function o(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = n),
          e
        );
      }
      function l(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          t &&
            (r = r.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r);
        }
        return n;
      }
      function s(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? l(Object(n), !0).forEach(function(t) {
                o(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
            : l(Object(n)).forEach(function(t) {
                Object.defineProperty(
                  e,
                  t,
                  Object.getOwnPropertyDescriptor(n, t)
                );
              });
        }
        return e;
      }
      function i(e, t) {
        if (null == e) return {};
        var n,
          r,
          a = (function(e, t) {
            if (null == e) return {};
            var n,
              r,
              a = {},
              o = Object.keys(e);
            for (r = 0; r < o.length; r++)
              (n = o[r]), t.indexOf(n) >= 0 || (a[n] = e[n]);
            return a;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          for (r = 0; r < o.length; r++)
            (n = o[r]),
              t.indexOf(n) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, n) &&
                  (a[n] = e[n]));
        }
        return a;
      }
      var c = a.a.createContext({}),
        p = function(e) {
          var t = a.a.useContext(c),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : s(s({}, t), e)), n;
        },
        u = function(e) {
          var t = p(e.components);
          return a.a.createElement(c.Provider, { value: t }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return a.a.createElement(a.a.Fragment, {}, t);
          }
        },
        m = a.a.forwardRef(function(e, t) {
          var n = e.components,
            r = e.mdxType,
            o = e.originalType,
            l = e.parentName,
            c = i(e, ["components", "mdxType", "originalType", "parentName"]),
            u = p(n),
            m = r,
            d = u["".concat(l, ".").concat(m)] || u[m] || b[m] || o;
          return n
            ? a.a.createElement(d, s(s({ ref: t }, c), {}, { components: n }))
            : a.a.createElement(d, s({ ref: t }, c));
        });
      function d(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var o = n.length,
            l = new Array(o);
          l[0] = m;
          var s = {};
          for (var i in t) hasOwnProperty.call(t, i) && (s[i] = t[i]);
          (s.originalType = e),
            (s.mdxType = "string" == typeof e ? e : r),
            (l[1] = s);
          for (var c = 2; c < o; c++) l[c] = n[c];
          return a.a.createElement.apply(null, l);
        }
        return a.a.createElement.apply(null, n);
      }
      m.displayName = "MDXCreateElement";
    }
  }
]);
