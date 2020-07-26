(window.webpackJsonp = window.webpackJsonp || []).push([
  [26],
  {
    175: function(e, t, r) {
      "use strict";
      r.r(t),
        r.d(t, "frontMatter", function() {
          return a;
        }),
        r.d(t, "metadata", function() {
          return c;
        }),
        r.d(t, "rightToc", function() {
          return p;
        }),
        r.d(t, "default", function() {
          return f;
        });
      var n = r(2),
        o = r(9),
        i = (r(0), r(204)),
        a = {
          id: "safety-typescript",
          title: "Generating Typed Definition files",
          sidebar_label: "Typed definition files"
        },
        c = {
          id: "safety-typescript",
          isDocsHomePage: !1,
          title: "Generating Typed Definition files",
          description: "TODO",
          source: "@site/docs/safety-typescript.md",
          permalink: "/docs/safety-typescript",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/safety-typescript.md",
          sidebar_label: "Typed definition files"
        },
        p = [],
        u = { rightToc: p };
      function f(e) {
        var t = e.components,
          r = Object(o.a)(e, ["components"]);
        return Object(i.b)(
          "wrapper",
          Object(n.a)({}, u, r, { components: t, mdxType: "MDXLayout" }),
          Object(i.b)("p", null, "TODO")
        );
      }
      f.isMDXComponent = !0;
    },
    204: function(e, t, r) {
      "use strict";
      r.d(t, "a", function() {
        return l;
      }),
        r.d(t, "b", function() {
          return d;
        });
      var n = r(0),
        o = r.n(n);
      function i(e, t, r) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = r),
          e
        );
      }
      function a(e, t) {
        var r = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e);
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            r.push.apply(r, n);
        }
        return r;
      }
      function c(e) {
        for (var t = 1; t < arguments.length; t++) {
          var r = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? a(Object(r), !0).forEach(function(t) {
                i(e, t, r[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
            : a(Object(r)).forEach(function(t) {
                Object.defineProperty(
                  e,
                  t,
                  Object.getOwnPropertyDescriptor(r, t)
                );
              });
        }
        return e;
      }
      function p(e, t) {
        if (null == e) return {};
        var r,
          n,
          o = (function(e, t) {
            if (null == e) return {};
            var r,
              n,
              o = {},
              i = Object.keys(e);
            for (n = 0; n < i.length; n++)
              (r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]);
            return o;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          for (n = 0; n < i.length; n++)
            (r = i[n]),
              t.indexOf(r) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, r) &&
                  (o[r] = e[r]));
        }
        return o;
      }
      var u = o.a.createContext({}),
        f = function(e) {
          var t = o.a.useContext(u),
            r = t;
          return e && (r = "function" == typeof e ? e(t) : c(c({}, t), e)), r;
        },
        l = function(e) {
          var t = f(e.components);
          return o.a.createElement(u.Provider, { value: t }, e.children);
        },
        s = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return o.a.createElement(o.a.Fragment, {}, t);
          }
        },
        y = o.a.forwardRef(function(e, t) {
          var r = e.components,
            n = e.mdxType,
            i = e.originalType,
            a = e.parentName,
            u = p(e, ["components", "mdxType", "originalType", "parentName"]),
            l = f(r),
            y = n,
            d = l["".concat(a, ".").concat(y)] || l[y] || s[y] || i;
          return r
            ? o.a.createElement(d, c(c({ ref: t }, u), {}, { components: r }))
            : o.a.createElement(d, c({ ref: t }, u));
        });
      function d(e, t) {
        var r = arguments,
          n = t && t.mdxType;
        if ("string" == typeof e || n) {
          var i = r.length,
            a = new Array(i);
          a[0] = y;
          var c = {};
          for (var p in t) hasOwnProperty.call(t, p) && (c[p] = t[p]);
          (c.originalType = e),
            (c.mdxType = "string" == typeof e ? e : n),
            (a[1] = c);
          for (var u = 2; u < i; u++) a[u] = r[u];
          return o.a.createElement.apply(null, a);
        }
        return o.a.createElement.apply(null, r);
      }
      y.displayName = "MDXCreateElement";
    }
  }
]);
