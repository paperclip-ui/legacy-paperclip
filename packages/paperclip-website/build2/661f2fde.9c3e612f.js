(window.webpackJsonp = window.webpackJsonp || []).push([
  [22],
  {
    171: function(e, n, r) {
      "use strict";
      r.r(n),
        r.d(n, "frontMatter", function() {
          return a;
        }),
        r.d(n, "metadata", function() {
          return c;
        }),
        r.d(n, "rightToc", function() {
          return p;
        }),
        r.d(n, "default", function() {
          return u;
        });
      var t = r(2),
        i = r(9),
        o = (r(0), r(204)),
        a = {
          id: "configuring-paperclip",
          title: "Configuring Paperclip",
          sidebar_label: "Configuring Paperclip"
        },
        c = {
          id: "configuring-paperclip",
          isDocsHomePage: !1,
          title: "Configuring Paperclip",
          description:
            "Paperclip uses a paperclip.config.json file which provides information about your project, and how",
          source: "@site/docs/configuring-paperclip.md",
          permalink: "/docs/configuring-paperclip",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/configuring-paperclip.md",
          sidebar_label: "Configuring Paperclip",
          sidebar: "docs",
          previous: {
            title: "Command line tools",
            permalink: "/docs/usage-cli"
          },
          next: {
            title: "Setting up Webpack",
            permalink: "/docs/configuring-webpack"
          }
        },
        p = [{ value: "Options", id: "options", children: [] }],
        l = { rightToc: p };
      function u(e) {
        var n = e.components,
          r = Object(i.a)(e, ["components"]);
        return Object(o.b)(
          "wrapper",
          Object(t.a)({}, l, r, { components: n, mdxType: "MDXLayout" }),
          Object(o.b)(
            "p",
            null,
            "Paperclip uses a ",
            Object(o.b)(
              "inlineCode",
              { parentName: "p" },
              "paperclip.config.json"
            ),
            " file which provides information about your project, and how\nto compile your ",
            Object(o.b)("inlineCode", { parentName: "p" }, "*.pc"),
            " files. Here's an example of what it might look like:"
          ),
          Object(o.b)(
            "pre",
            null,
            Object(o.b)(
              "code",
              Object(t.a)(
                { parentName: "pre" },
                { className: "language-json" }
              ),
              '{\n  "compilerOptions": {\n    "name": "paperclip-compiler-react"\n  },\n  "sourceDirectory": "./src"\n}\n'
            )
          ),
          Object(o.b)("h3", { id: "options" }, "Options"),
          Object(o.b)(
            "ul",
            null,
            Object(o.b)(
              "li",
              { parentName: "ul" },
              Object(o.b)(
                "inlineCode",
                { parentName: "li" },
                "compilerOptions"
              ),
              " ",
              Object(o.b)(
                "ul",
                { parentName: "li" },
                Object(o.b)(
                  "li",
                  { parentName: "ul" },
                  Object(o.b)("inlineCode", { parentName: "li" }, "name"),
                  " is the name of the compiler to use that translates ",
                  Object(o.b)("inlineCode", { parentName: "li" }, "*.pc"),
                  " files into code."
                )
              )
            ),
            Object(o.b)(
              "li",
              { parentName: "ul" },
              Object(o.b)(
                "inlineCode",
                { parentName: "li" },
                "sourceDirectory"
              ),
              " is your where all of your ",
              Object(o.b)("inlineCode", { parentName: "li" }, "*.pc"),
              " files are."
            )
          )
        );
      }
      u.isMDXComponent = !0;
    },
    204: function(e, n, r) {
      "use strict";
      r.d(n, "a", function() {
        return s;
      }),
        r.d(n, "b", function() {
          return m;
        });
      var t = r(0),
        i = r.n(t);
      function o(e, n, r) {
        return (
          n in e
            ? Object.defineProperty(e, n, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[n] = r),
          e
        );
      }
      function a(e, n) {
        var r = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var t = Object.getOwnPropertySymbols(e);
          n &&
            (t = t.filter(function(n) {
              return Object.getOwnPropertyDescriptor(e, n).enumerable;
            })),
            r.push.apply(r, t);
        }
        return r;
      }
      function c(e) {
        for (var n = 1; n < arguments.length; n++) {
          var r = null != arguments[n] ? arguments[n] : {};
          n % 2
            ? a(Object(r), !0).forEach(function(n) {
                o(e, n, r[n]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
            : a(Object(r)).forEach(function(n) {
                Object.defineProperty(
                  e,
                  n,
                  Object.getOwnPropertyDescriptor(r, n)
                );
              });
        }
        return e;
      }
      function p(e, n) {
        if (null == e) return {};
        var r,
          t,
          i = (function(e, n) {
            if (null == e) return {};
            var r,
              t,
              i = {},
              o = Object.keys(e);
            for (t = 0; t < o.length; t++)
              (r = o[t]), n.indexOf(r) >= 0 || (i[r] = e[r]);
            return i;
          })(e, n);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          for (t = 0; t < o.length; t++)
            (r = o[t]),
              n.indexOf(r) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
        }
        return i;
      }
      var l = i.a.createContext({}),
        u = function(e) {
          var n = i.a.useContext(l),
            r = n;
          return e && (r = "function" == typeof e ? e(n) : c(c({}, n), e)), r;
        },
        s = function(e) {
          var n = u(e.components);
          return i.a.createElement(l.Provider, { value: n }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var n = e.children;
            return i.a.createElement(i.a.Fragment, {}, n);
          }
        },
        f = i.a.forwardRef(function(e, n) {
          var r = e.components,
            t = e.mdxType,
            o = e.originalType,
            a = e.parentName,
            l = p(e, ["components", "mdxType", "originalType", "parentName"]),
            s = u(r),
            f = t,
            m = s["".concat(a, ".").concat(f)] || s[f] || b[f] || o;
          return r
            ? i.a.createElement(m, c(c({ ref: n }, l), {}, { components: r }))
            : i.a.createElement(m, c({ ref: n }, l));
        });
      function m(e, n) {
        var r = arguments,
          t = n && n.mdxType;
        if ("string" == typeof e || t) {
          var o = r.length,
            a = new Array(o);
          a[0] = f;
          var c = {};
          for (var p in n) hasOwnProperty.call(n, p) && (c[p] = n[p]);
          (c.originalType = e),
            (c.mdxType = "string" == typeof e ? e : t),
            (a[1] = c);
          for (var l = 2; l < o; l++) a[l] = r[l];
          return i.a.createElement.apply(null, a);
        }
        return i.a.createElement.apply(null, r);
      }
      f.displayName = "MDXCreateElement";
    }
  }
]);
