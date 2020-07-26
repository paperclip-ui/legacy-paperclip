(window.webpackJsonp = window.webpackJsonp || []).push([
  [33],
  {
    180: function(e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "frontMatter", function() {
          return a;
        }),
        n.d(t, "metadata", function() {
          return c;
        }),
        n.d(t, "rightToc", function() {
          return p;
        }),
        n.d(t, "default", function() {
          return f;
        });
      var r = n(2),
        i = n(9),
        o = (n(0), n(204)),
        a = {
          id: "safety-type-definitions",
          title: "Type definition files",
          sidebar_label: "Type Definitions"
        },
        c = {
          id: "safety-type-definitions",
          isDocsHomePage: !1,
          title: "Type definition files",
          description: "Types",
          source: "@site/docs/safety-definition-files.md",
          permalink: "/docs/safety-type-definitions",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/safety-definition-files.md",
          sidebar_label: "Type Definitions",
          sidebar: "docs",
          previous: {
            title: "Setting up visual regression tests",
            permalink: "/docs/safety-visual-regression"
          }
        },
        p = [],
        s = { rightToc: p };
      function f(e) {
        var t = e.components,
          n = Object(i.a)(e, ["components"]);
        return Object(o.b)(
          "wrapper",
          Object(r.a)({}, s, n, { components: t, mdxType: "MDXLayout" }),
          Object(o.b)("p", null, "Types")
        );
      }
      f.isMDXComponent = !0;
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
        i = n.n(r);
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
      function a(e, t) {
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
      function c(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? a(Object(n), !0).forEach(function(t) {
                o(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
            : a(Object(n)).forEach(function(t) {
                Object.defineProperty(
                  e,
                  t,
                  Object.getOwnPropertyDescriptor(n, t)
                );
              });
        }
        return e;
      }
      function p(e, t) {
        if (null == e) return {};
        var n,
          r,
          i = (function(e, t) {
            if (null == e) return {};
            var n,
              r,
              i = {},
              o = Object.keys(e);
            for (r = 0; r < o.length; r++)
              (n = o[r]), t.indexOf(n) >= 0 || (i[n] = e[n]);
            return i;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          for (r = 0; r < o.length; r++)
            (n = o[r]),
              t.indexOf(n) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, n) &&
                  (i[n] = e[n]));
        }
        return i;
      }
      var s = i.a.createContext({}),
        f = function(e) {
          var t = i.a.useContext(s),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : c(c({}, t), e)), n;
        },
        u = function(e) {
          var t = f(e.components);
          return i.a.createElement(s.Provider, { value: t }, e.children);
        },
        l = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return i.a.createElement(i.a.Fragment, {}, t);
          }
        },
        y = i.a.forwardRef(function(e, t) {
          var n = e.components,
            r = e.mdxType,
            o = e.originalType,
            a = e.parentName,
            s = p(e, ["components", "mdxType", "originalType", "parentName"]),
            u = f(n),
            y = r,
            d = u["".concat(a, ".").concat(y)] || u[y] || l[y] || o;
          return n
            ? i.a.createElement(d, c(c({ ref: t }, s), {}, { components: n }))
            : i.a.createElement(d, c({ ref: t }, s));
        });
      function d(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var o = n.length,
            a = new Array(o);
          a[0] = y;
          var c = {};
          for (var p in t) hasOwnProperty.call(t, p) && (c[p] = t[p]);
          (c.originalType = e),
            (c.mdxType = "string" == typeof e ? e : r),
            (a[1] = c);
          for (var s = 2; s < o; s++) a[s] = n[s];
          return i.a.createElement.apply(null, a);
        }
        return i.a.createElement.apply(null, n);
      }
      y.displayName = "MDXCreateElement";
    }
  }
]);
