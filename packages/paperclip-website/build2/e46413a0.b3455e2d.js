(window.webpackJsonp = window.webpackJsonp || []).push([
  [49],
  {
    195: function(e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "frontMatter", function() {
          return o;
        }),
        n.d(t, "metadata", function() {
          return s;
        }),
        n.d(t, "rightToc", function() {
          return c;
        }),
        n.d(t, "default", function() {
          return l;
        });
      var r = n(2),
        a = n(9),
        i = (n(0), n(204)),
        o = {
          id: "safety-visual-regression",
          title: "Setting up visual regression tests",
          sidebar_label: "Visual regression testing"
        },
        s = {
          id: "safety-visual-regression",
          isDocsHomePage: !1,
          title: "Setting up visual regression tests",
          description: "Installation",
          source: "@site/docs/safety-visual-regresion.md",
          permalink: "/docs/safety-visual-regression",
          editUrl:
            "https://github.com/crcn/paperclip/packages/edit/master/website/docs/safety-visual-regresion.md",
          sidebar_label: "Visual regression testing",
          sidebar: "docs",
          previous: {
            title: "Troubleshooting",
            permalink: "/docs/usage-troubleshooting"
          },
          next: {
            title: "Type definition files",
            permalink: "/docs/safety-type-definitions"
          }
        },
        c = [
          { value: "Installation", id: "installation", children: [] },
          {
            value: "Setting up with GitHub actions",
            id: "setting-up-with-github-actions",
            children: []
          }
        ],
        p = { rightToc: c };
      function l(e) {
        var t = e.components,
          n = Object(a.a)(e, ["components"]);
        return Object(i.b)(
          "wrapper",
          Object(r.a)({}, p, n, { components: t, mdxType: "MDXLayout" }),
          Object(i.b)("h2", { id: "installation" }, "Installation"),
          Object(i.b)(
            "p",
            null,
            "Paperclip integrates with ",
            Object(i.b)(
              "a",
              Object(r.a)({ parentName: "p" }, { href: "https://percy.io" }),
              "Percy"
            ),
            " to allow you test for CSS bugs in your Paperclip UI files. To get started, install the NPM module:"
          ),
          Object(i.b)(
            "pre",
            null,
            Object(i.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, {}),
              "npm install percy percy-paperclip --save-dev\n"
            )
          ),
          Object(i.b)(
            "p",
            null,
            "Next, grab your percy token, then run the following command in the same directory as your ",
            Object(i.b)(
              "inlineCode",
              { parentName: "p" },
              "paperclip.config.json"
            ),
            " file:"
          ),
          Object(i.b)(
            "pre",
            null,
            Object(i.b)(
              "code",
              Object(r.a)(
                { parentName: "pre" },
                { className: "language-bash" }
              ),
              "PERCY_TOKEN=[TOKEN] percy exec -- percy-paperclip\n"
            )
          ),
          Object(i.b)(
            "p",
            null,
            "After that, you should see something like this:"
          ),
          Object(i.b)(
            "p",
            null,
            Object(i.b)(
              "img",
              Object(r.a)(
                { parentName: "p" },
                { src: "assets/percy-snapshots.gif", alt: "Percy demo" }
              )
            )
          ),
          Object(i.b)(
            "h2",
            { id: "setting-up-with-github-actions" },
            "Setting up with GitHub actions"
          ),
          Object(i.b)(
            "p",
            null,
            Object(i.b)("inlineCode", { parentName: "p" }, "percy-paperclip"),
            " pairs nicely with GitHub actions, especially for PR checks. Here's a GitHub action you can use: "
          ),
          Object(i.b)(
            "pre",
            null,
            Object(i.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-yml" }),
              'name: PR Checks\non:  \n  pull_request\n\njobs:\n  visual-regression-test:\n    name: Visual Regression Test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - uses: actions/setup-node@v1\n      - uses: actions/checkout@v2\n        with:\n          fetch-depth: 0 # fetches all branches\n      - name: Maybe snapshot\n        run: |\n          CHANGED_PC_FILES=$(git diff --name-only origin/${{ github.base_ref }} origin/${{ github.head_ref }} -- "./**/*.pc")\n          if [ -n "$CHANGED_PC_FILES" ]; then\n            yarn add percy percy-paperclip\n            percy exec -- percy-paperclip\n          fi\n        working-directory: ./path/to/frontend\n        env: \n          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}\n'
            )
          ),
          Object(i.b)(
            "blockquote",
            null,
            Object(i.b)(
              "p",
              { parentName: "blockquote" },
              "Be sure to change ",
              Object(i.b)(
                "inlineCode",
                { parentName: "p" },
                "working-directory"
              ),
              " to point to where your ",
              Object(i.b)(
                "inlineCode",
                { parentName: "p" },
                "paperclip.config.json"
              ),
              " file is. "
            )
          ),
          Object(i.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This script will run only when PC files change, so if you're working with people working on the back-end, for instance, they won't get this check (since we're assuming they won't touch PC files). "
          ),
          Object(i.b)(
            "p",
            null,
            "To go along with the script above, you'll need to set up a ",
            Object(i.b)(
              "a",
              Object(r.a)(
                { parentName: "p" },
                { href: "https://docs.percy.io/docs/baseline-picking-logic" }
              ),
              "baseline"
            ),
            " for your master branch. Here's a script for that:"
          ),
          Object(i.b)(
            "pre",
            null,
            Object(i.b)(
              "code",
              Object(r.a)({ parentName: "pre" }, { className: "language-yml" }),
              'name: Master Checks\non:\n  push:\n    branches:\n      - master\n    \njobs:\n  visual-regression-test:\n    name: Visual Regression Test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - uses: actions/setup-node@v1\n      - uses: actions/checkout@v2\n        with:\n          fetch-depth: 0\n      - name: Maybe snapshot\n        run: |\n          CHANGED_PC_FILES=$(git diff --name-only origin/master^ origin/master -- "./**/*.pc")\n          if [ -n "$CHANGED_PC_FILES" ]; then\n            yarn add percy\n            yarn snapshot\n          fi\n        working-directory: ./path/to/frontend\n        env: \n          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}\n          \n'
            )
          ),
          Object(i.b)(
            "blockquote",
            null,
            Object(i.b)(
              "p",
              { parentName: "blockquote" },
              "Again, be sure to change ",
              Object(i.b)(
                "inlineCode",
                { parentName: "p" },
                "working-directory"
              ),
              " to point to where your ",
              Object(i.b)(
                "inlineCode",
                { parentName: "p" },
                "paperclip.config.json"
              ),
              " file is. "
            )
          ),
          Object(i.b)(
            "p",
            null,
            "\u261d\ud83c\udffb This script runs whenever a ",
            Object(i.b)("inlineCode", { parentName: "p" }, "*.pc"),
            " file changes on master, and ensures that subsequent PRs are visually testing against the correct baseline."
          )
        );
      }
      l.isMDXComponent = !0;
    },
    204: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return u;
      }),
        n.d(t, "b", function() {
          return g;
        });
      var r = n(0),
        a = n.n(r);
      function i(e, t, n) {
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
      function o(e, t) {
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
            ? o(Object(n), !0).forEach(function(t) {
                i(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
            : o(Object(n)).forEach(function(t) {
                Object.defineProperty(
                  e,
                  t,
                  Object.getOwnPropertyDescriptor(n, t)
                );
              });
        }
        return e;
      }
      function c(e, t) {
        if (null == e) return {};
        var n,
          r,
          a = (function(e, t) {
            if (null == e) return {};
            var n,
              r,
              a = {},
              i = Object.keys(e);
            for (r = 0; r < i.length; r++)
              (n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n]);
            return a;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          for (r = 0; r < i.length; r++)
            (n = i[r]),
              t.indexOf(n) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, n) &&
                  (a[n] = e[n]));
        }
        return a;
      }
      var p = a.a.createContext({}),
        l = function(e) {
          var t = a.a.useContext(p),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : s(s({}, t), e)), n;
        },
        u = function(e) {
          var t = l(e.components);
          return a.a.createElement(p.Provider, { value: t }, e.children);
        },
        b = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return a.a.createElement(a.a.Fragment, {}, t);
          }
        },
        f = a.a.forwardRef(function(e, t) {
          var n = e.components,
            r = e.mdxType,
            i = e.originalType,
            o = e.parentName,
            p = c(e, ["components", "mdxType", "originalType", "parentName"]),
            u = l(n),
            f = r,
            g = u["".concat(o, ".").concat(f)] || u[f] || b[f] || i;
          return n
            ? a.a.createElement(g, s(s({ ref: t }, p), {}, { components: n }))
            : a.a.createElement(g, s({ ref: t }, p));
        });
      function g(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var i = n.length,
            o = new Array(i);
          o[0] = f;
          var s = {};
          for (var c in t) hasOwnProperty.call(t, c) && (s[c] = t[c]);
          (s.originalType = e),
            (s.mdxType = "string" == typeof e ? e : r),
            (o[1] = s);
          for (var p = 2; p < i; p++) o[p] = n[p];
          return a.a.createElement.apply(null, o);
        }
        return a.a.createElement.apply(null, n);
      }
      f.displayName = "MDXCreateElement";
    }
  }
]);
