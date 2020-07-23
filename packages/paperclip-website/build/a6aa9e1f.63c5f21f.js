(window.webpackJsonp = window.webpackJsonp || []).push([
  [25],
  {
    141: function(e, t, n) {
      "use strict";
      n.r(t);
      var r = n(0),
        a = n.n(r),
        i = n(148),
        o = n(175),
        s = n(196),
        l = n(156);
      var c = function(e) {
        const { metadata: t } = e,
          { previousPage: n, nextPage: r } = t;
        return a.a.createElement(
          "nav",
          {
            className: "pagination-nav",
            "aria-label": "Blog list page navigation"
          },
          a.a.createElement(
            "div",
            { className: "pagination-nav__item" },
            n &&
              a.a.createElement(
                l.a,
                { className: "pagination-nav__link", to: n },
                a.a.createElement(
                  "h4",
                  { className: "pagination-nav__label" },
                  "\xab Newer Entries"
                )
              )
          ),
          a.a.createElement(
            "div",
            { className: "pagination-nav__item pagination-nav__item--next" },
            r &&
              a.a.createElement(
                l.a,
                { className: "pagination-nav__link", to: r },
                a.a.createElement(
                  "h4",
                  { className: "pagination-nav__label" },
                  "Older Entries \xbb"
                )
              )
          )
        );
      };
      t.default = function(e) {
        const { metadata: t, items: n } = e,
          {
            siteConfig: { title: r }
          } = Object(i.a)(),
          l = "/" === t.permalink ? r : "Blog";
        return a.a.createElement(
          o.a,
          { title: l, description: "Blog" },
          a.a.createElement(
            "div",
            { className: "container margin-vert--lg" },
            a.a.createElement(
              "div",
              { className: "row" },
              a.a.createElement(
                "main",
                { className: "col col--8 col--offset-2" },
                n.map(({ content: e }) =>
                  a.a.createElement(
                    s.a,
                    {
                      key: e.metadata.permalink,
                      frontMatter: e.frontMatter,
                      metadata: e.metadata,
                      truncated: e.metadata.truncated
                    },
                    a.a.createElement(e, null)
                  )
                ),
                a.a.createElement(c, { metadata: t })
              )
            )
          )
        );
      };
    },
    144: function(e, t, n) {
      e.exports = n(177);
    },
    152: function(e, t, n) {
      "use strict";
      n.r(t);
      n(157), n(158);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.paperclipSourceGlobPattern = exports.stripFileProtocol = void 0);
      var r = n(145);
      (exports.stripFileProtocol = function(e) {
        return e.includes("file://") ? r.fileURLToPath(e) : e;
      }),
        (exports.paperclipSourceGlobPattern = function(e) {
          return "." === e ? "**/*.pc" : e + "/**/*.pc";
        });
    },
    153: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.LOGIC_TAG_NAME = t.AS_ATTR_NAME = t.FRAGMENT_TAG_NAME = t.PREVIEW_ATTR_NAME = t.COMPONENT_ATTR_NAME = t.EXPORT_TAG_NAME = t.DEFAULT_PART_ID = t.PC_CONFIG_FILE_NAME = void 0),
        (t.PC_CONFIG_FILE_NAME = "paperclip.config.json"),
        (t.DEFAULT_PART_ID = "default"),
        (t.EXPORT_TAG_NAME = "export"),
        (t.COMPONENT_ATTR_NAME = "component"),
        (t.PREVIEW_ATTR_NAME = "preview"),
        (t.FRAGMENT_TAG_NAME = "fragment"),
        (t.AS_ATTR_NAME = "as"),
        (t.LOGIC_TAG_NAME = "logic");
    },
    154: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return c;
      });
      var r = n(146),
        a = n(92),
        i = n(145),
        o = n(144);
      const s = e => t => (n, a) => {
          const s = t.realpathSync(new i.URL(n)),
            c = r.dirname(s),
            u = Object(o.findPCConfigUrl)(t)(n);
          if (!u) return [];
          const d = new i.URL(u),
            p = JSON.parse(t.readFileSync(d, "utf8"));
          return e(p, r.dirname(i.fileURLToPath(d)))
            .filter(e => e !== s)
            .map(e => {
              if (a) {
                const t = l(u, p, e, c);
                if (!r.isAbsolute(t)) return t;
                let n = r.relative(c, t);
                return "." !== n.charAt(0) && (n = "./" + n), n;
              }
              return i.pathToFileURL(e).href;
            })
            .map(e => e.replace(/\\/g, "/"));
        },
        l =
          (s((e, t) =>
            a.sync(Object(o.paperclipSourceGlobPattern)(e.sourceDirectory), {
              cwd: t,
              realpath: !0
            })
          ),
          s((e, t) => {
            const n = "+(jpg|jpeg|png|gif|svg)",
              r = e.sourceDirectory;
            return "." === r
              ? a.sync("**/*." + n, { cwd: t, realpath: !0 })
              : a.sync(`${r}/**/*.${n}`, { cwd: t, realpath: !0 });
          }),
          (e, t, n, a) => {
            const o = r.dirname(i.fileURLToPath(e)),
              s = r.join(o, t.sourceDirectory) + "/";
            if (0 === n.indexOf(s)) {
              const e = n.replace(s, ""),
                t = r.join(s, e.split("/")[0]) + "/";
              if (!a || -1 === a.indexOf(t)) return e;
            }
            return n;
          }),
        c = () => {};
    },
    155: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ATTR_ALIASES = t.preventDefault = void 0),
        (t.preventDefault = function(e) {
          return e.stopPropagation(), e.preventDefault(), !1;
        }),
        (t.ATTR_ALIASES = { className: "class" });
    },
    161: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return m;
      });
      var r = n(200),
        a = n.n(r),
        i = (n(201), n(157), n(158), n(159)),
        o = (n(151), n(202), n(172), n(92)),
        s = n(146),
        l = n(145),
        c = n(144),
        u = n(154),
        d = function(e, t, n, r) {
          return new (n || (n = Promise))(function(a, i) {
            function o(e) {
              try {
                l(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
              try {
                l(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function l(e) {
              var t;
              e.done
                ? a(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function(e) {
                        e(t);
                      })).then(o, s);
            }
            l((r = r.apply(e, t || [])).next());
          });
        },
        p = function(e) {
          return e ? (e.Ok ? e.Ok : { error: e.Err }) : e;
        },
        f = (function() {
          function e(e, t, n) {
            var r = this;
            void 0 === t && (t = {}),
              void 0 === n && (n = u.a),
              (this._createNativeEngine = e),
              (this._options = t),
              (this._onCrash = n),
              (this._listeners = []),
              (this._rendered = {}),
              (this._onEngineEvent = function(e) {
                if (e.kind === c.EngineEventKind.Evaluated) {
                  var t = (r._rendered[e.uri] = Object.assign(
                    Object.assign({}, e.data),
                    { importedSheets: r.getImportedSheets(e) }
                  ));
                  r._dispatch({
                    kind: c.EngineEventKind.Loaded,
                    uri: e.uri,
                    data: t
                  });
                } else if (e.kind === c.EngineEventKind.Diffed) {
                  for (
                    var n,
                      a = r._rendered[e.uri],
                      o = (r._rendered[e.uri] = Object.assign(
                        Object.assign({}, a),
                        {
                          imports: e.data.imports,
                          exports: e.data.exports,
                          importedSheets: r.getImportedSheets(e),
                          allDependencies: e.data.allDependencies,
                          sheet: e.data.sheet || a.sheet,
                          preview: Object(c.patchVirtNode)(
                            a.preview,
                            e.data.mutations
                          )
                        }
                      )),
                      s = [],
                      l = Object(i.a)(a.importedSheets);
                    !(n = l()).done;

                  ) {
                    var u = n.value.uri;
                    o.allDependencies.includes(u) || s.push(u);
                  }
                  for (
                    var d, p = [], f = Object(i.a)(e.data.allDependencies);
                    !(d = f()).done;

                  ) {
                    var m = d.value;
                    !a.allDependencies.includes(m) &&
                      r._rendered[m] &&
                      p.push({ uri: m, sheet: r._rendered[m].sheet });
                  }
                  (p.length || s.length) &&
                    r._dispatch({
                      uri: e.uri,
                      kind: c.EngineEventKind.ChangedSheets,
                      data: {
                        newSheets: p,
                        removedSheetUris: s,
                        allDependencies: e.data.allDependencies
                      }
                    });
                }
              }),
              (this._tryCatch = function(e) {
                try {
                  return e();
                } catch (t) {
                  return r._onCrash(t), null;
                }
              }),
              (this._dispatch = function(e) {
                for (var t, n = Object(i.a)(r._listeners); !(t = n()).done; ) {
                  (0, t.value)(e);
                }
              }),
              (this._io = Object.assign(
                {
                  readFile: function(e) {
                    return o.readFileSync(new URL(e), "utf8");
                  },
                  fileExists: function(e) {
                    try {
                      var t = new URL(e);
                      return h(t) && o.lstatSync(t).isFile();
                    } catch (n) {
                      return console.error(n), !1;
                    }
                  },
                  resolveFile: Object(c.resolveImportUri)(o)
                },
                t.io
              ));
          }
          var t = e.prototype;
          return (
            (t.$$load = function() {
              return d(
                this,
                void 0,
                void 0,
                a.a.mark(function e() {
                  var t;
                  return a.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = this._io),
                              (e.next = 3),
                              this._createNativeEngine(
                                t.readFile,
                                t.fileExists,
                                t.resolveFile
                              )
                            );
                          case 3:
                            return (
                              (this._native = e.sent),
                              this._native.add_listener(this._dispatch),
                              this.onEvent(this._onEngineEvent),
                              e.abrupt("return", this)
                            );
                          case 7:
                          case "end":
                            return e.stop();
                        }
                    },
                    e,
                    this
                  );
                })
              );
            }),
            (t.onEvent = function(e) {
              var t = this;
              if (null == e) throw new Error("listener cannot be undefined");
              return (
                this._listeners.push(e),
                function() {
                  var n = t._listeners.indexOf(e);
                  -1 !== n && t._listeners.splice(n, 1);
                }
              );
            }),
            (t.parseFile = function(e) {
              return p(this._native.parse_file(e));
            }),
            (t.getLoadedAst = function(e) {
              var t = this;
              return this._tryCatch(function() {
                return t._native.get_loaded_ast(e);
              });
            }),
            (t.parseContent = function(e) {
              var t = this;
              return this._tryCatch(function() {
                return p(t._native.parse_content(e));
              });
            }),
            (t.updateVirtualFileContent = function(e, t) {
              var n = this;
              return this._tryCatch(function() {
                return p(n._native.update_virtual_file_content(e, t));
              });
            }),
            (t.getLoadedData = function(e) {
              return this._rendered[e];
            }),
            (t._waitForLoadedData = function(e) {
              return this._rendered[e]
                ? Promise.resolve(this._rendered[e])
                : this._waitForLoadedData2(e);
            }),
            (t._waitForLoadedData2 = function(e) {
              var t = this;
              return new Promise(function(n) {
                var r = t.onEvent(function(t) {
                  t.uri === e &&
                    t.kind === c.EngineEventKind.Loaded &&
                    (r(), n(t.data));
                });
              });
            }),
            (t.getImportedSheets = function(e) {
              for (
                var t, n = e.data.allDependencies, r = [], a = Object(i.a)(n);
                !(t = a()).done;

              ) {
                var o = t.value,
                  s = this._rendered[o];
                s
                  ? r.push({ uri: o, sheet: s.sheet })
                  : console.error(
                      "data not loaded, this shouldn't happen \ud83d\ude2c."
                    );
              }
              return r;
            }),
            (t.run = function(e) {
              return d(
                this,
                void 0,
                void 0,
                a.a.mark(function t() {
                  var n,
                    r = this;
                  return a.a.wrap(
                    function(t) {
                      for (;;)
                        switch ((t.prev = t.next)) {
                          case 0:
                            if (
                              !(n = this._tryCatch(function() {
                                return p(r._native.run(e));
                              })) ||
                              !n.error
                            ) {
                              t.next = 3;
                              break;
                            }
                            return t.abrupt("return", Promise.reject(n.error));
                          case 3:
                            return t.abrupt(
                              "return",
                              this._waitForLoadedData(e)
                            );
                          case 4:
                          case "end":
                            return t.stop();
                        }
                    },
                    t,
                    this
                  );
                })
              );
            }),
            e
          );
        })(),
        m = function(e) {
          return function(t, n) {
            return d(
              void 0,
              void 0,
              void 0,
              a.a.mark(function r() {
                return a.a.wrap(function(r) {
                  for (;;)
                    switch ((r.prev = r.next)) {
                      case 0:
                        return (r.next = 2), new f(e, t, n).$$load();
                      case 2:
                        return r.abrupt("return", r.sent);
                      case 3:
                      case "end":
                        return r.stop();
                    }
                }, r);
              })
            );
          };
        },
        h = function(e) {
          var t = l.fileURLToPath(e),
            n = s.dirname(t),
            r = s.basename(t);
          return o.readdirSync(n).includes(r);
        };
    },
    162: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.VirtualNodeKind = void 0),
        (function(e) {
          (e.Element = "Element"),
            (e.Text = "Text"),
            (e.Fragment = "Fragment"),
            (e.StyleElement = "StyleElement");
        })(t.VirtualNodeKind || (t.VirtualNodeKind = {}));
    },
    163: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.StatementKind = void 0),
        (function(e) {
          (e.Node = "Node"),
            (e.Reference = "Reference"),
            (e.Array = "Array"),
            (e.Object = "Object"),
            (e.String = "String"),
            (e.Number = "Number"),
            (e.Boolean = "Boolean");
        })(t.StatementKind || (t.StatementKind = {}));
    },
    164: function(e, t, n) {
      "use strict";
      n.r(t);
      var r, a, i;
      n(147);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.getSelectorClassNames = exports.traverseStyleExpression = exports.isIncludeDeclarationPart = exports.isStyleDeclaration = exports.isRule = exports.traverseSheet = exports.getRuleClassNames = exports.getSheetClassNames = exports.StyleDeclarationKind = exports.SelectorKind = exports.RuleKind = void 0),
        (function(e) {
          (e.Style = "Style"),
            (e.Charset = "Charset"),
            (e.Namespace = "Namespace"),
            (e.FontFace = "FontFace"),
            (e.Media = "Media"),
            (e.Mixin = "Mixin"),
            (e.Export = "Export"),
            (e.Supports = "Supports"),
            (e.Page = "Page"),
            (e.Document = "Document"),
            (e.Keyframes = "Keyframes");
        })((r = exports.RuleKind || (exports.RuleKind = {}))),
        (function(e) {
          (e.Group = "Group"),
            (e.Combo = "Combo"),
            (e.Descendent = "Descendent"),
            (e.PseudoElement = "PseudoElement"),
            (e.PseudoParamElement = "PseudoParamElement"),
            (e.Not = "Not"),
            (e.Child = "Child"),
            (e.Adjacent = "Adjacent"),
            (e.Sibling = "Sibling"),
            (e.Id = "Id"),
            (e.Element = "Element"),
            (e.Attribute = "Attribute"),
            (e.Class = "Class"),
            (e.AllSelector = "AllSelector");
        })((a = exports.SelectorKind || (exports.SelectorKind = {}))),
        (function(e) {
          (e.KeyValue = "KeyValue"), (e.Include = "Include");
        })(
          (i =
            exports.StyleDeclarationKind || (exports.StyleDeclarationKind = {}))
        ),
        (exports.getSheetClassNames = function(e, t) {
          return void 0 === t && (t = []), o(e.rules, t);
        });
      var o = function(e, t) {
        void 0 === t && (t = []);
        for (var n = 0, r = e; n < r.length; n++) {
          var a = r[n];
          exports.getRuleClassNames(a, t);
        }
        return t;
      };
      (exports.getRuleClassNames = function(e, t) {
        switch ((void 0 === t && (t = []), e.kind)) {
          case r.Media:
            o(e.rules, t);
            break;
          case r.Style:
            exports.getSelectorClassNames(e.selector, t);
        }
        return t;
      }),
        (exports.traverseSheet = function(e, t) {
          return s(e.rules, t);
        });
      var s = function(e, t) {
        for (var n = 0, r = e; n < r.length; n++) {
          var a = r[n];
          if (!exports.traverseStyleExpression(a, t)) return !1;
        }
        return !0;
      };
      (exports.isRule = function(e) {
        return null != r[e.kind];
      }),
        (exports.isStyleDeclaration = function(e) {
          return null != i[e.declarationKind];
        }),
        (exports.isIncludeDeclarationPart = function(e) {
          return null != e.name;
        }),
        (exports.traverseStyleExpression = function(e, t) {
          if (!1 === t(e)) return !1;
          if (exports.isRule(e))
            switch (e.kind) {
              case r.Media:
              case r.Export:
                return s(e.rules, t);
              case r.Style:
                return s(e.declarations, t) && s(e.children, t);
              case r.Mixin:
                return s(e.declarations, t);
            }
          else if (exports.isStyleDeclaration(e))
            switch (e.declarationKind) {
              case i.Include:
                for (var n = 0, a = e.mixins; n < a.length; n++)
                  for (var o = 0, l = a[n].parts; o < l.length; o++) {
                    var c = l[o];
                    if (!exports.traverseStyleExpression(c, t)) return !1;
                  }
                return !0;
            }
          return !0;
        }),
        (exports.getSelectorClassNames = function(e, t) {
          switch ((void 0 === t && (t = []), e.kind)) {
            case a.Combo:
            case a.Group:
              for (var n = 0, r = e.selectors; n < r.length; n++) {
                var i = r[n];
                exports.getSelectorClassNames(i, t);
              }
              break;
            case a.Descendent:
              exports.getSelectorClassNames(e.parent, t),
                exports.getSelectorClassNames(e.descendent, t);
              break;
            case a.PseudoElement:
            case a.PseudoParamElement:
              exports.getSelectorClassNames(e.target, t);
              break;
            case a.Not:
              exports.getSelectorClassNames(e.selector, t);
              break;
            case a.Child:
              exports.getSelectorClassNames(e.parent, t),
                exports.getSelectorClassNames(e.child, t);
              break;
            case a.Adjacent:
              exports.getSelectorClassNames(e.selector, t),
                exports.getSelectorClassNames(e.nextSiblingSelector, t);
              break;
            case a.Sibling:
              exports.getSelectorClassNames(e.selector, t),
                exports.getSelectorClassNames(e.siblingSelector, t);
              break;
            case a.Class:
              t.push(e.className);
          }
          return t;
        });
    },
    165: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.findPCConfigUrl = t.resolveImportFile = t.resolveImportUri = void 0);
      var r = n(146),
        a = n(145),
        i = n(152),
        o = n(153);
      (t.resolveImportUri = function(e) {
        return function(n, r) {
          return t.resolveImportFile(e)(n, r);
        };
      }),
        (t.resolveImportFile = function(e) {
          return function(t, n) {
            try {
              if (/\w+:\/\//.test(n)) return n;
              if ("." !== n.charAt(0)) {
                var r = s(e)(t, n);
                if (!r) throw new Error("module " + n + " not found");
                return r;
              }
              return a.resolve(t, n);
            } catch (i) {
              return null;
            }
          };
        });
      var s = function(e) {
        return function(n, o) {
          var s = t.findPCConfigUrl(e)(n);
          if (!s) return null;
          var l = new URL(s),
            c = JSON.parse(e.readFileSync(l, "utf8")),
            u = r.dirname(i.stripFileProtocol(s)),
            d = a.pathToFileURL(r.normalize(r.join(u, c.sourceDirectory, o)));
          return e.existsSync(d)
            ? a.pathToFileURL(e.realpathSync(d)).href
            : null;
        };
      };
      t.findPCConfigUrl = function(e) {
        return function(t) {
          var n = i.stripFileProtocol(t);
          do {
            var s = a.pathToFileURL(r.join(n, o.PC_CONFIG_FILE_NAME));
            if (e.existsSync(s)) return s.href;
            n = r.dirname(n);
          } while ("/" !== n && "." !== n && !/^\w+:\\$/.test(n));
          return null;
        };
      };
    },
    166: function(e, t, n) {
      "use strict";
      n.r(t);
      n(149), n(171), n(147);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.stringifyCSSSheet = void 0);
      var r = n(146),
        a = n(145);
      exports.stringifyCSSSheet = function(e, t, n) {
        return e.rules
          .map(function(e) {
            return i(e, t, n);
          })
          .join("\n");
      };
      var i = function(e, t, n) {
          switch (e.kind) {
            case "Style":
              return u(e, t, n);
            case "Page":
            case "Supports":
            case "Media":
              return o(e, t, n);
            case "FontFace":
              return c(e, t, n);
            case "Keyframes":
              return s(e, t);
          }
        },
        o = function(e, t, n) {
          return (
            "@" +
            e.name +
            " " +
            e.condition_text +
            " {\n    " +
            e.rules
              .map(function(e) {
                return u(e, t, n);
              })
              .join("\n") +
            "\n  }"
          );
        },
        s = function(e, t, n) {
          return (
            "@keyframes " +
            e.name +
            " {\n    " +
            e.rules
              .map(function(e) {
                return l(e, t);
              })
              .join("\n") +
            "\n  }"
          );
        },
        l = function(e, t, n) {
          return (
            e.key +
            " {\n    " +
            e.style
              .map(function(e) {
                return d(e, t, n);
              })
              .join("\n") +
            "\n  }"
          );
        },
        c = function(e, t, n) {
          return (
            "@font-face {\n    " +
            e.style
              .map(function(e) {
                return d(e, t, n);
              })
              .join("\n") +
            "\n  }"
          );
        },
        u = function(e, t, n) {
          return (
            e.selector_text +
            " {\n    " +
            e.style
              .map(function(e) {
                return d(e, t, n);
              })
              .join("\n") +
            "\n  }"
          );
        },
        d = function(e, t, n) {
          var i = e.name,
            o = e.value;
          if (o) {
            if (n)
              for (
                var s = o.match(/(file:\/\/.*?)(?=['")])/g) || [],
                  l = a.fileURLToPath(n),
                  c = 0,
                  u = s;
                c < u.length;
                c++
              ) {
                var d = u[c],
                  p = a.fileURLToPath(d),
                  f = r.relative(r.dirname(l), p);
                "." !== f.charAt(0) && (f = "./" + f), (o = o.replace(d, f));
              }
            t && (o = o.replace(/file:/, t));
          }
          return i + ":" + o + ";";
        };
    },
    167: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ActionKind = void 0),
        (function(e) {
          (e.ReplaceNode = "ReplaceNode"),
            (e.InsertChild = "InsertChild"),
            (e.DeleteChild = "DeleteChild"),
            (e.SetAttribute = "SetAttribute"),
            (e.SourceChanged = "SourceChanged"),
            (e.SourceUriChanged = "SourceUriChanged"),
            (e.SetText = "SetText"),
            (e.RemoveAttribute = "RemoveAttribute");
        })(t.ActionKind || (t.ActionKind = {}));
    },
    168: function(e, t, n) {
      "use strict";
      var r;
      n(12), n(55), n(172), n(159), n(147), n(151), n(144);
      !(function(e) {
        (e[(e.Shape = 0)] = "Shape"),
          (e[(e.Array = 1)] = "Array"),
          (e[(e.Any = 2)] = "Any");
      })(r || (r = {}));
      var a = function(e, t) {
        return (
          void 0 === e && (e = {}),
          void 0 === t && (t = !1),
          { kind: r.Shape, fromSpread: t, properties: e }
        );
      };
      r.Any, a({}, !0);
    },
    169: function(e, t, n) {
      "use strict";
      n.r(t);
      n(149);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.createNativeStyleFromSheet = exports.createNativeNode = exports.getNativeNodePath = void 0);
      var r = n(174),
        a = n(144),
        i = n(155),
        o = new r.Html5Entities();
      (exports.getNativeNodePath = function(e, t) {
        for (var n = [], r = t; r.parentNode !== e; )
          n.unshift(Array.prototype.indexOf.call(r.parentNode.childNodes, r)),
            (r = r.parentNode);
        return n;
      }),
        (exports.createNativeNode = function(e, t, n, r) {
          if (!e) return t.createTextNode("");
          try {
            switch (e.kind) {
              case "Text":
                return s(e, t);
              case "Element":
                return l(e, t, n, r);
              case "StyleElement":
                return exports.createNativeStyleFromSheet(e.sheet, t, n);
              case "Fragment":
                return c(e, t, n);
            }
          } catch (a) {
            return t.createTextNode(String(a.stack));
          }
        }),
        (exports.createNativeStyleFromSheet = function(e, t, n) {
          var r = t.createElement("style");
          return (r.textContent = a.stringifyCSSSheet(e, n)), r;
        });
      var s = function(e, t) {
          return t.createTextNode(o.decode(e.value));
        },
        l = function(e, t, n, r) {
          var a =
              "svg" === e.tagName
                ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
                : r
                ? t.createElementNS(r, e.tagName)
                : t.createElement(e.tagName),
            o = "svg" === e.tagName ? "http://www.w3.org/2000/svg" : r;
          for (var s in e.attributes) {
            var l = e.attributes[s];
            "src" === s && n && (l = l.replace("file:", n));
            var c = i.ATTR_ALIASES[s] || s;
            a.setAttribute(c, l);
          }
          for (var u = 0, d = e.children; u < d.length; u++) {
            var p = d[u];
            a.appendChild(exports.createNativeNode(p, t, n, o));
          }
          return (
            "a" === e.tagName &&
              ((a.onclick = i.preventDefault),
              (a.onmouseup = i.preventDefault),
              (a.onmousedown = i.preventDefault)),
            a
          );
        },
        c = function(e, t, n) {
          for (
            var r = t.createDocumentFragment(), a = 0, i = e.children;
            a < i.length;
            a++
          ) {
            var o = i[a];
            r.appendChild(exports.createNativeNode(o, t, n, r.namespaceURI));
          }
          return r;
        };
    },
    176: function(e, t, n) {
      "use strict";
      var r = n(161);
      n.d(t, "createEngine", function() {
        return r.a;
      });
      n(168), n(144), n(154);
    },
    177: function(e, t, n) {
      "use strict";
      var r =
          (this && this.__createBinding) ||
          (Object.create
            ? function(e, t, n, r) {
                void 0 === r && (r = n),
                  Object.defineProperty(e, r, {
                    enumerable: !0,
                    get: function() {
                      return t[n];
                    }
                  });
              }
            : function(e, t, n, r) {
                void 0 === r && (r = n), (e[r] = t[n]);
              }),
        a =
          (this && this.__exportStar) ||
          function(e, t) {
            for (var n in e)
              "default" === n || t.hasOwnProperty(n) || r(t, e, n);
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        a(n(178), t),
        a(n(162), t),
        a(n(179), t),
        a(n(163), t),
        a(n(166), t),
        a(n(164), t),
        a(n(180), t),
        a(n(181), t),
        a(n(153), t),
        a(n(182), t),
        a(n(183), t),
        a(n(167), t),
        a(n(165), t),
        a(n(184), t),
        a(n(185), t),
        a(n(186), t),
        a(n(187), t),
        a(n(152), t),
        a(n(188), t);
    },
    178: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.GraphErrorInfoType = t.ParseErrorKind = t.EngineErrorKind = t.EngineEventKind = void 0),
        (function(e) {
          (e.Loading = "Loading"),
            (e.Loaded = "Loaded"),
            (e.Updating = "Updating"),
            (e.Evaluated = "Evaluated"),
            (e.Error = "Error"),
            (e.NodeParsed = "NodeParsed"),
            (e.Diffed = "Diffed"),
            (e.ChangedSheets = "ChangedSheets");
        })(t.EngineEventKind || (t.EngineEventKind = {})),
        (function(e) {
          (e.Graph = "Graph"), (e.Runtime = "Runtime");
        })(t.EngineErrorKind || (t.EngineErrorKind = {})),
        (function(e) {
          e.EndOfFile = "EndOfFile";
        })(t.ParseErrorKind || (t.ParseErrorKind = {})),
        (function(e) {
          (e.Syntax = "Syntax"),
            (e.IncludeNotFound = "IncludeNotFound"),
            (e.NotFound = "NotFound");
        })(t.GraphErrorInfoType || (t.GraphErrorInfoType = {}));
    },
    179: function(e, t, n) {
      "use strict";
      n.r(t);
      n(147), n(150), n(203);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.getNestedReferences = exports.getCompletionItems = exports.traverseExpression = exports.isAttributeValue = exports.isAttribute = exports.isNode = exports.getMixins = exports.isComponentInstance = exports.flattenNodes = exports.hasAttribute = exports.getLogicElement = exports.getDefaultPart = exports.getPartIds = exports.getParts = exports.getVisibleChildNodes = exports.isVisibleNode = exports.isVisibleElement = exports.getStyleElements = exports.getAttributeStringValue = exports.getAttributeValue = exports.getAttribute = exports.getMetaValue = exports.findByNamespace = exports.getChildrenByTagName = exports.getStyleScopeId = exports.getChildren = exports.getImportById = exports.getImportIds = exports.getRelativeFilePath = exports.getImports = exports.DynamicStringAttributeValuePartKind = exports.AttributeValueKind = exports.AttributeKind = exports.NodeKind = void 0);
      var r,
        a,
        i,
        o = n(163),
        s = n(164),
        l = n(204),
        c = n(165),
        u = n(146),
        d = n(153);
      !(function(e) {
        (e.Fragment = "Fragment"),
          (e.Text = "Text"),
          (e.Element = "Element"),
          (e.StyleElement = "StyleElement"),
          (e.Slot = "Slot");
      })((r = exports.NodeKind || (exports.NodeKind = {}))),
        (function(e) {
          (e.ShorthandAttribute = "ShorthandAttribute"),
            (e.KeyValueAttribute = "KeyValueAttribute"),
            (e.SpreadAttribute = "SpreadAttribute"),
            (e.PropertyBoundAttribute = "PropertyBoundAttribute");
        })((a = exports.AttributeKind || (exports.AttributeKind = {}))),
        (function(e) {
          (e.DyanmicString = "DyanmicString"),
            (e.String = "String"),
            (e.Slot = "Slot");
        })(
          (i = exports.AttributeValueKind || (exports.AttributeValueKind = {}))
        ),
        (function(e) {
          (e.Literal = "Literal"),
            (e.ClassNamePierce = "ClassNamePierce"),
            (e.Slot = "Slot");
        })(
          exports.DynamicStringAttributeValuePartKind ||
            (exports.DynamicStringAttributeValuePartKind = {})
        );
      (exports.getImports = function(e) {
        return exports.getChildrenByTagName("import", e).filter(function(e) {
          return exports.hasAttribute("src", e);
        });
      }),
        (exports.getRelativeFilePath = function(e) {
          return function(t, n) {
            var r = c.resolveImportFile(e)(t, n),
              a = u.relative(u.dirname(t), r);
            return "." !== a.charAt(0) && (a = "./" + a), a;
          };
        }),
        (exports.getImportIds = function(e) {
          return exports
            .getImports(e)
            .map(function(e) {
              return exports.getAttributeStringValue(d.AS_ATTR_NAME, e);
            })
            .filter(Boolean);
        }),
        (exports.getImportById = function(e, t) {
          return exports.getImports(t).find(function(t) {
            return exports.getAttributeStringValue(d.AS_ATTR_NAME, t) === e;
          });
        }),
        (exports.getChildren = function(e) {
          return e.kind === r.Element || e.kind === r.Fragment
            ? e.children
            : [];
        }),
        (exports.getStyleScopeId = function(e) {
          return l(e);
        }),
        (exports.getChildrenByTagName = function(e, t) {
          return exports.getChildren(t).filter(function(t) {
            return t.kind === r.Element && t.tagName === e;
          });
        }),
        (exports.findByNamespace = function(e, t, n) {
          void 0 === n && (n = []),
            t.kind === r.Element && t.tagName.split(".")[0] === e && n.push(t);
          for (var a = 0, i = exports.getChildren(t); a < i.length; a++) {
            var o = i[a];
            exports.findByNamespace(e, o, n);
          }
          return n;
        }),
        (exports.getMetaValue = function(e, t) {
          var n = exports.getChildrenByTagName("meta", t).find(function(t) {
            return (
              exports.hasAttribute("src", t) &&
              exports.getAttributeStringValue("name", t) === e
            );
          });
          return n && exports.getAttributeStringValue("content", n);
        }),
        (exports.getAttribute = function(e, t) {
          return t.attributes.find(function(t) {
            return t.kind === a.KeyValueAttribute && t.name === e;
          });
        }),
        (exports.getAttributeValue = function(e, t) {
          var n = exports.getAttribute(e, t);
          return n && n.value;
        }),
        (exports.getAttributeStringValue = function(e, t) {
          var n = exports.getAttributeValue(e, t);
          return n && n.attrValueKind === i.String && n.value;
        }),
        (exports.getStyleElements = function(e) {
          return exports.getChildren(e).filter(function(e) {
            return e.kind === r.StyleElement;
          });
        }),
        (exports.isVisibleElement = function(e) {
          return !/^(import|logic|meta|style|part|preview)$/.test(e.tagName);
        }),
        (exports.isVisibleNode = function(e) {
          return (
            e.kind === r.Text ||
            e.kind === r.Fragment ||
            e.kind === r.Slot ||
            (e.kind === r.Element && exports.isVisibleElement(e))
          );
        }),
        (exports.getVisibleChildNodes = function(e) {
          return exports.getChildren(e).filter(exports.isVisibleNode);
        }),
        (exports.getParts = function(e) {
          return exports.getChildren(e).filter(function(e) {
            return (
              e.kind === r.Element &&
              exports.hasAttribute("component", e) &&
              exports.hasAttribute(d.AS_ATTR_NAME, e)
            );
          });
        }),
        (exports.getPartIds = function(e) {
          return exports
            .getParts(e)
            .map(function(e) {
              return exports.getAttributeStringValue(d.AS_ATTR_NAME, e);
            })
            .filter(Boolean);
        }),
        (exports.getDefaultPart = function(e) {
          return exports.getParts(e).find(function(e) {
            return (
              exports.getAttributeStringValue(d.AS_ATTR_NAME, e) ===
              d.DEFAULT_PART_ID
            );
          });
        }),
        (exports.getLogicElement = function(e) {
          return exports.getChildren(e).find(function(e) {
            return e.kind === r.Element && e.tagName === d.LOGIC_TAG_NAME;
          });
        }),
        (exports.hasAttribute = function(e, t) {
          return null != exports.getAttribute(e, t);
        }),
        (exports.flattenNodes = function(e, t) {
          if ((void 0 === t && (t = []), t.push(e), e.kind === r.Element))
            for (var n = 0, s = e.attributes; n < s.length; n++) {
              var l = s[n];
              l.kind === a.KeyValueAttribute &&
                l.value &&
                l.value.attrValueKind === i.Slot &&
                l.value.script.jsKind === o.StatementKind.Node &&
                exports.flattenNodes(l.value.script, t);
            }
          for (var c = 0, u = exports.getChildren(e); c < u.length; c++) {
            var d = u[c];
            exports.flattenNodes(d, t);
          }
          return t;
        }),
        (exports.isComponentInstance = function(e, t) {
          return (
            e.kind === r.Element &&
            -1 !== t.indexOf(e.tagName.split(".").shift())
          );
        });
      (exports.getMixins = function(e) {
        for (
          var t = exports.getStyleElements(e), n = {}, r = 0, a = t;
          r < a.length;
          r++
        ) {
          var i = a[r];
          s.traverseSheet(i.sheet, function(e) {
            e &&
              s.isRule(e) &&
              e.kind === s.RuleKind.Mixin &&
              (n[e.name.value] = e);
          });
        }
        return n;
      }),
        (exports.isNode = function(e) {
          return null != r[e.kind];
        }),
        (exports.isAttribute = function(e) {
          return null != a[e.kind];
        }),
        (exports.isAttributeValue = function(e) {
          return null != i[e.attrValueKind];
        }),
        (exports.traverseExpression = function(e, t) {
          if (!1 === t(e)) return !1;
          if (exports.isNode(e))
            switch (e.kind) {
              case r.Element:
                return p(e.attributes, t) && p(e.children, t);
              case r.Fragment:
                return p(e.children, t);
              case r.StyleElement:
                return s.traverseSheet(e.sheet, t);
            }
          return !0;
        }),
        (exports.getCompletionItems = function(e, t) {
          exports.traverseExpression(e, function(e) {
            e.location || console.error("ERRRR", e);
          });
        });
      var p = function(e, t) {
        for (var n = 0, r = e; n < r.length; n++) {
          var a = r[n];
          if (!exports.traverseExpression(a, t)) return !1;
        }
        return !0;
      };
      exports.getNestedReferences = function(e, t) {
        if ((void 0 === t && (t = []), e.kind === r.Slot))
          !(function(e, t) {
            void 0 === t && (t = []),
              e.jsKind === o.StatementKind.Reference && t.push([e, null]);
          })(e.script, t);
        else {
          if (e.kind === r.Element)
            for (var n = 0, s = e.attributes; n < s.length; n++) {
              var l = s[n];
              l.kind == a.KeyValueAttribute &&
              l.value &&
              l.value.attrValueKind === i.Slot
                ? l.value.script.jsKind === o.StatementKind.Node
                  ? exports.getNestedReferences(l.value.script, t)
                  : l.value.script.jsKind === o.StatementKind.Reference &&
                    t.push([l.value.script, l.name])
                : l.kind === a.ShorthandAttribute &&
                  l.reference.jsKind === o.StatementKind.Reference
                ? t.push([l.reference, l.reference[0]])
                : l.kind === a.SpreadAttribute &&
                  l.script.jsKind === o.StatementKind.Reference &&
                  t.push([l.script, l.script[0]]);
            }
          for (var c = 0, u = exports.getChildren(e); c < u.length; c++) {
            var p = u[c];
            (p.kind === r.Element &&
              exports.hasAttribute(d.PREVIEW_ATTR_NAME, p)) ||
              exports.getNestedReferences(p, t);
          }
        }
        return t;
      };
    },
    180: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    181: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    182: function(e, t, n) {
      "use strict";
      n.r(t);
      n(150);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.getPrettyMessage = void 0),
        (exports.getPrettyMessage = function(e, t, n) {
          var a = e.location,
            i = "";
          (i += "Error: " + e.message + "\n"), (i += "In " + n + ":\n");
          var o = r(t, a.start, a.end),
            s = o.lineStart;
          o.lines;
          return (i += "L" + s + " " + t.substr(a.start, a.end));
        });
      var r = function(e, t, n) {
        for (
          var r = e.split("\n"), a = -1, i = -1, o = 0, s = 0, l = r.length;
          s < l;
          s++
        ) {
          (o += r[s].length),
            -1 === a && o >= t && (a = s),
            -1 !== a && -1 === i && o <= n && (i = s);
        }
        return { lineStart: a, lines: r.slice(a, i + 1) };
      };
    },
    183: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.DependencyContentKind = void 0),
        (function(e) {
          (e.Node = "Node"), (e.Stylsheet = "Stylesheet");
        })(t.DependencyContentKind || (t.DependencyContentKind = {}));
    },
    184: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.stringifyVirtualNode = void 0);
      var r = n(166),
        a = new (n(205).Html5Entities)();
      t.stringifyVirtualNode = function(e) {
        switch (e.kind) {
          case "Fragment":
            return i(e);
          case "Element":
            var t = "<" + e.tagName;
            for (var n in e.attributes) {
              var o = e.attributes[n];
              t += o ? " " + n + '="' + o + '"' : " " + n;
            }
            return (t += ">" + i(e) + "</" + e.tagName + ">");
          case "StyleElement":
            return "<style>" + r.stringifyCSSSheet(e.sheet, null) + "</style>";
          case "Text":
            return a.decode(e.value);
          default:
            throw new Error("can't handle " + e.kind);
        }
      };
      var i = function(e) {
        return e.children.map(t.stringifyVirtualNode).join("");
      };
    },
    185: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.VirtRuleKind = void 0),
        (function(e) {
          (e.Style = "Style"), (e.Media = "Media");
        })(t.VirtRuleKind || (t.VirtRuleKind = {}));
    },
    186: function(e, t, n) {
      "use strict";
      n.r(t);
      n(147), n(151);
      var r = function() {
          return (r =
            Object.assign ||
            function(e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var a in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
              return e;
            }).apply(this, arguments);
        },
        a = function() {
          for (var e = 0, t = 0, n = arguments.length; t < n; t++)
            e += arguments[t].length;
          var r = Array(e),
            a = 0;
          for (t = 0; t < n; t++)
            for (var i = arguments[t], o = 0, s = i.length; o < s; o++, a++)
              r[a] = i[o];
          return r;
        };
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.getVirtTarget = exports.patchVirtNode = void 0);
      var i = n(167),
        o = n(162);
      (exports.patchVirtNode = function(e, t) {
        for (var n = 0, a = t; n < a.length; n++) {
          var o = a[n],
            l = exports.getVirtTarget(e, o.nodePath),
            c = o.action;
          switch (c.kind) {
            case i.ActionKind.DeleteChild:
              (u = l.children.concat()).splice(c.index, 1),
                (l = r(r({}, l), { children: u }));
              break;
            case i.ActionKind.InsertChild:
              var u;
              (u = l.children.concat()).splice(c.index, 0, c.child),
                (l = r(r({}, l), { children: u }));
              break;
            case i.ActionKind.ReplaceNode:
              l = c.replacement;
              break;
            case i.ActionKind.RemoveAttribute:
              ((d = r({}, l.attributes))[c.name] = void 0),
                (l = r(r({}, l), { attributes: d }));
              break;
            case i.ActionKind.SetAttribute:
              var d;
              ((d = r({}, l.attributes))[c.name] = c.value),
                (l = r(r({}, l), { attributes: d }));
              break;
            case i.ActionKind.SetText:
              l = r(r({}, l), { value: c.value });
              break;
            case i.ActionKind.SourceChanged:
          }
          e = s(e, o.nodePath, l);
        }
        return e;
      }),
        (exports.getVirtTarget = function(e, t) {
          return t.reduce(function(e, t) {
            return e.children[t];
          }, e);
        });
      var s = function e(t, n, i, s) {
        return (
          void 0 === s && (s = 0),
          s === n.length ||
          t.kind === o.VirtualNodeKind.Text ||
          t.kind === o.VirtualNodeKind.StyleElement
            ? i
            : r(r({}, t), {
                children: a(
                  t.children.slice(0, n[s]),
                  [e(t.children[n[s]], n, i, s + 1)],
                  t.children.slice(n[s] + 1)
                )
              })
        );
      };
    },
    187: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    188: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.PaperclipSourceWatcher = t.ChangeKind = void 0);
      var r,
        a = n(92),
        i = n(146),
        o = n(145),
        s = n(173),
        l = n(152);
      !(function(e) {
        (e[(e.Removed = 0)] = "Removed"),
          (e[(e.Added = 1)] = "Added"),
          (e[(e.Changed = 2)] = "Changed");
      })((r = t.ChangeKind || (t.ChangeKind = {})));
      var c = { add: r.Added, unlink: r.Removed, change: r.Changed },
        u = (function() {
          function e(e, t) {
            (this.config = e),
              (this.cwd = t),
              (this._em = new s.EventEmitter()),
              this._init();
          }
          return (
            (e.prototype.onChange = function(e) {
              var t = this;
              return (
                this._em.on("change", e),
                function() {
                  return t._em.off("change", e);
                }
              );
            }),
            (e.prototype.dispose = function() {
              this._watcher.close();
            }),
            (e.prototype._init = function() {
              var e = this;
              (this._watcher = a.watch(
                l.paperclipSourceGlobPattern(this.config.sourceDirectory),
                { cwd: this.cwd, ignoreInitial: !0 }
              )).on("all", function(t, n) {
                var r = "/" !== n.charAt(0) ? i.join(e.cwd, n) : n,
                  a = c[t];
                a && e._em.emit("change", a, o.pathToFileURL(r).href);
              });
            }),
            e
          );
        })();
      t.PaperclipSourceWatcher = u;
    },
    189: function(e, t, n) {
      e.exports = n(190);
    },
    190: function(e, t, n) {
      "use strict";
      var r =
          (this && this.__createBinding) ||
          (Object.create
            ? function(e, t, n, r) {
                void 0 === r && (r = n),
                  Object.defineProperty(e, r, {
                    enumerable: !0,
                    get: function() {
                      return t[n];
                    }
                  });
              }
            : function(e, t, n, r) {
                void 0 === r && (r = n), (e[r] = t[n]);
              }),
        a =
          (this && this.__exportStar) ||
          function(e, t) {
            for (var n in e)
              "default" === n || t.hasOwnProperty(n) || r(t, e, n);
          };
      Object.defineProperty(t, "__esModule", { value: !0 }), a(n(191), t);
    },
    191: function(e, t, n) {
      "use strict";
      n.r(t);
      n(151), n(157), n(158);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.Renderer = void 0);
      var r,
        a = n(169),
        i = n(145),
        o = n(144),
        s = n(173),
        l = n(155),
        c = n(192);
      !(function(e) {
        (e.META_CLICK = "META_CLICK"),
          (e.ERROR_BANNER_CLICK = "ERROR_BANNER_CLICK");
      })(r || (r = {}));
      var u = (function() {
        function e(e, t, n) {
          var i = this;
          void 0 === n && (n = document),
            (this.protocol = e),
            (this.targetUri = t),
            (this._domFactory = n),
            (this._dependencies = []),
            (this.onMetaClick = function(e) {
              i._em.addListener(r.META_CLICK, e);
            }),
            (this.onErrorBannerClick = function(e) {
              i._em.addListener(r.ERROR_BANNER_CLICK, e);
            }),
            (this.initialize = function(e) {
              var t = e.sheet,
                n = e.preview,
                r = e.importedSheets;
              d(i._stage),
                d(i._mainStyleContainer),
                d(i._importedStylesContainer),
                (i._virtualRootNode = n);
              var o = a.createNativeNode(n, i._domFactory, i.protocol, null);
              (i._dependencies = r.map(function(e) {
                return e.uri;
              })),
                i._addSheets(r);
              var s = a.createNativeStyleFromSheet(
                t,
                i._domFactory,
                i.protocol
              );
              i._mainStyleContainer.appendChild(s), i._stage.appendChild(o);
            }),
            (this._onErrorBannerClick = function(e) {
              i._clearErrors(), i._em.emit(r.ERROR_BANNER_CLICK, e);
            }),
            (this.handleEngineEvent = function(e) {
              switch ((i._clearErrors(), e.kind)) {
                case o.EngineEventKind.Error:
                  i.handleError(e);
                  break;
                case o.EngineEventKind.ChangedSheets:
                  e.uri === i.targetUri &&
                    ((i._dependencies = e.data.allDependencies),
                    i._addSheets(e.data.newSheets),
                    i._removeSheets(e.data.removedSheetUris));
                  break;
                case o.EngineEventKind.Loaded:
                  e.uri === i.targetUri &&
                    ((i._dependencies = e.data.allDependencies),
                    i.initialize(e.data));
                  break;
                case o.EngineEventKind.Evaluated:
                  if (e.uri === i.targetUri)
                    i._dependencies = e.data.allDependencies;
                  else if (i._dependencies.includes(e.uri)) {
                    (s = i._importedStyles[e.uri]) && s.remove();
                    var t = (i._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      i._domFactory,
                      i.protocol
                    ));
                    i._importedStylesContainer.appendChild(t);
                  }
                  break;
                case o.EngineEventKind.Diffed:
                  if (e.uri === i.targetUri) {
                    if (
                      (c.patchNativeNode(
                        i._stage,
                        e.data.mutations,
                        i._domFactory,
                        i.protocol
                      ),
                      (i._virtualRootNode = o.patchVirtNode(
                        i._virtualRootNode,
                        e.data.mutations
                      )),
                      e.data.sheet)
                    ) {
                      d(i._mainStyleContainer);
                      var n = a.createNativeStyleFromSheet(
                        e.data.sheet,
                        i._domFactory,
                        i.protocol
                      );
                      i._mainStyleContainer.appendChild(n);
                    }
                    for (var r in i._importedStyles) {
                      if (!e.data.allDependencies.includes(r))
                        (n = i._importedStyles[r]).remove(),
                          delete i._importedStyles[r];
                    }
                  } else if (e.data.sheet) {
                    var s;
                    (s = i._importedStyles[e.uri]) && s.remove();
                    var l = (i._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      i._domFactory,
                      i.protocol
                    ));
                    i._importedStylesContainer.appendChild(l);
                  }
              }
            }),
            (this._onStageMouseDown = function(e) {
              e.preventDefault(), e.stopImmediatePropagation();
              var t = e.target;
              if (1 === t.nodeType && e.metaKey) {
                var n = a.getNativeNodePath(i.mount, t),
                  s = o.getVirtTarget(i._virtualRootNode, n);
                s && i._em.emit(r.META_CLICK, s);
              }
            }),
            (this._onStageMouseOver = function(e) {
              var t = e.target,
                n = t.ownerDocument.defaultView;
              if (1 === t.nodeType && e.metaKey) {
                i.mount.style.cursor = "pointer";
                var r = t.getBoundingClientRect();
                Object.assign(i._hoverOverlay.style, {
                  display: "block",
                  left: n.document.body.scrollLeft + r.left + "px",
                  top: n.document.body.scrollTop + r.top + "px",
                  width: r.width + "px",
                  height: r.height + "px"
                });
              }
            }),
            (this._onStageMouseOut = function(e) {
              1 === e.target.nodeType &&
                ((i.mount.style.cursor = "default"),
                Object.assign(i._hoverOverlay.style, { display: "none" }));
            }),
            (this._importedStyles = {}),
            (this._em = new s.EventEmitter()),
            (this._errorOverlay = n.createElement("div")),
            Object.assign(this._errorOverlay.style, {
              zIndex: 1024,
              position: "fixed",
              top: 0,
              left: 0
            }),
            (this._hoverOverlay = n.createElement("div")),
            Object.assign(this._hoverOverlay.style, {
              position: "absolute",
              zIndex: 1024,
              display: "none",
              background: "rgba(124, 154, 236, 0.5)",
              width: "100px",
              height: "100px",
              cursor: "pointer",
              pointerEvents: "none",
              top: "0px",
              left: "0px"
            }),
            (this._stage = this._domFactory.createElement("div")),
            (this.mount = this._domFactory.createElement("div")),
            (this._mainStyleContainer = this._domFactory.createElement("div")),
            (this._importedStylesContainer = this._domFactory.createElement(
              "div"
            )),
            this.mount.appendChild(this._importedStylesContainer),
            this.mount.appendChild(this._mainStyleContainer),
            this.mount.appendChild(this._stage),
            this.mount.appendChild(this._hoverOverlay),
            this.mount.appendChild(this._errorOverlay),
            this._stage.addEventListener(
              "mousedown",
              this._onStageMouseDown,
              !0
            ),
            this._stage.addEventListener("mouseup", l.preventDefault, !0),
            this._stage.addEventListener("mouseover", this._onStageMouseOver),
            this._stage.addEventListener("mouseout", this._onStageMouseOut);
        }
        return (
          (e.prototype._addSheets = function(e) {
            for (var t = 0, n = e; t < n.length; t++) {
              var r = n[t],
                i = r.uri,
                o = r.sheet,
                s = a.createNativeStyleFromSheet(
                  o,
                  this._domFactory,
                  this.protocol
                );
              (this._importedStyles[i] = s),
                this._importedStylesContainer.appendChild(s);
            }
          }),
          (e.prototype._removeSheets = function(e) {
            for (var t = 0, n = e; t < n.length; t++) {
              var r = n[t];
              this._importedStyles[r].remove(), delete this._importedStyles[r];
            }
          }),
          (e.prototype._clearErrors = function() {
            d(this._errorOverlay);
          }),
          (e.prototype.handleError = function(e) {
            var t,
              n = e.uri;
            if ("undefined" != typeof window && n !== this.targetUri) {
              switch (e.errorKind) {
                case o.EngineErrorKind.Graph:
                  t = e.info.message;
                  break;
                default:
                  t = e.message;
              }
              var r = this._domFactory.createElement("div");
              try {
                (r.innerHTML =
                  '\n      <div style="position: fixed; cursor: pointer; bottom: 0; width: 100%; word-break: break-word; box-sizing: border-box; font-family: Helvetica; padding: 10px; background: rgb(255, 152, 152); color: rgb(138, 31, 31); line-height: 1.1em">\n        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">\n          Error&nbsp;in&nbsp;' +
                  i.fileURLToPath(n) +
                  ':\n        </div>\n        <div style="font-size: 14px;">\n        ' +
                  t +
                  "\n        </div>\n      </div>\n      "),
                  (r.onclick = this._onErrorBannerClick.bind(this, e)),
                  this._errorOverlay.appendChild(r);
              } catch (a) {}
            }
          }),
          e
        );
      })();
      exports.Renderer = u;
      var d = function(e) {
        for (; e.childNodes.length; ) e.removeChild(e.childNodes[0]);
      };
    },
    192: function(e, t, n) {
      "use strict";
      n.r(t);
      n(149), n(147);
      Object.defineProperty(exports, "__esModule", { value: !0 }),
        (exports.patchNativeNode = void 0);
      var r = n(174),
        a = n(169),
        i = n(144),
        o = n(155),
        s = new r.Html5Entities();
      exports.patchNativeNode = function(e, t, n, r) {
        for (var c = 0, u = t; c < u.length; c++) {
          var d = u[c],
            p = l(e, d),
            f = d.action;
          switch (f.kind) {
            case i.ActionKind.DeleteChild:
              var m = p.childNodes[f.index];
              p.removeChild(m);
              break;
            case i.ActionKind.InsertChild:
              var h = a.createNativeNode(f.child, n, r, p.namespaceURI);
              f.index >= p.childNodes.length
                ? p.appendChild(h)
                : p.insertBefore(h, p.childNodes[f.index]);
              break;
            case i.ActionKind.ReplaceNode:
              var v = p.parentNode;
              v.insertBefore(
                a.createNativeNode(f.replacement, n, r, v.namespaceURI),
                p
              ),
                p.remove();
              break;
            case i.ActionKind.RemoveAttribute:
              (g = p).removeAttribute(o.ATTR_ALIASES[f.name] || f.name);
              break;
            case i.ActionKind.SetAttribute:
              var g = p,
                _ = o.ATTR_ALIASES[f.name] || f.name,
                b = f.value || "";
              0 === b.indexOf("file:") && (b = b.replace("file:", r)),
                g.setAttribute(_, b);
              break;
            case i.ActionKind.SetText:
              p.nodeValue = s.decode(f.value);
          }
        }
      };
      var l = function(e, t) {
        return t.nodePath.reduce(function(e, t) {
          return e.childNodes[t];
        }, e);
      };
    },
    193: function(e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "createComponentClass", function() {
          return j;
        });
      n(93), n(12), n(150);
      var r = n(195),
        a = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "li",
              {
                "data-pc-fab8095a": !0,
                ref: t,
                key: "0",
                className:
                  "_fab8095a_tab tab" +
                  (e.selected ? " _fab8095a_tab--selected tab--selected" : ""),
                onClick: e.onClick
              },
              e.children
            );
          })
        ),
        i = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "div",
              {
                "data-pc-fab8095a": !0,
                ref: t,
                key: "1",
                className: "_fab8095a_code code"
              },
              r.createElement(
                "ul",
                {
                  "data-pc-fab8095a": !0,
                  key: "2",
                  className: "_fab8095a_tabs tabs"
                },
                e.tabs
              ),
              r.createElement(
                "div",
                {
                  "data-pc-fab8095a": !0,
                  key: "3",
                  className: "_fab8095a_content content"
                },
                e.children
              )
            );
          })
        ),
        o = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "div",
              {
                "data-pc-fab8095a": !0,
                ref: t,
                key: "4",
                className: "_fab8095a_Preview Preview"
              },
              r.createElement(
                "div",
                {
                  "data-pc-fab8095a": !0,
                  key: "5",
                  className: "_fab8095a_header header"
                },
                r.createElement(
                  "span",
                  {
                    "data-pc-fab8095a": !0,
                    key: "6",
                    className: "_fab8095a_bolt bolt"
                  },
                  "\u26a1\ufe0f"
                ),
                " Preview\n  "
              ),
              r.createElement("iframe", {
                "data-pc-fab8095a": !0,
                key: "7",
                ref: e.iframeRef
              })
            );
          })
        ),
        s = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "div",
              {
                "data-pc-fab8095a": !0,
                ref: t,
                key: "8",
                className: "_fab8095a_Editor Editor"
              },
              e.children
            );
          })
        ),
        l = n(176);
      let c;
      const u = new Array(32).fill(void 0);
      function d(e) {
        return u[e];
      }
      u.push(void 0, null, !0, !1);
      let p = u.length;
      function f(e) {
        const t = d(e);
        return (
          (function(e) {
            e < 36 || ((u[e] = p), (p = e));
          })(e),
          t
        );
      }
      let m = new TextDecoder("utf-8", { ignoreBOM: !0, fatal: !0 });
      m.decode();
      let h = null;
      function v() {
        return (
          (null !== h && h.buffer === c.memory.buffer) ||
            (h = new Uint8Array(c.memory.buffer)),
          h
        );
      }
      function g(e, t) {
        return m.decode(v().subarray(e, e + t));
      }
      function _(e) {
        p === u.length && u.push(u.length + 1);
        const t = p;
        return (p = u[t]), (u[t] = e), t;
      }
      let b = 0,
        y = new TextEncoder("utf-8");
      const E =
        "function" == typeof y.encodeInto
          ? function(e, t) {
              return y.encodeInto(e, t);
            }
          : function(e, t) {
              const n = y.encode(e);
              return t.set(n), { read: e.length, written: n.length };
            };
      function x(e, t, n) {
        if (void 0 === n) {
          const n = y.encode(e),
            r = t(n.length);
          return (
            v()
              .subarray(r, r + n.length)
              .set(n),
            (b = n.length),
            r
          );
        }
        let r = e.length,
          a = t(r);
        const i = v();
        let o = 0;
        for (; o < r; o++) {
          const t = e.charCodeAt(o);
          if (t > 127) break;
          i[a + o] = t;
        }
        if (o !== r) {
          0 !== o && (e = e.slice(o)), (a = n(a, r, (r = o + 3 * e.length)));
          const t = v().subarray(a + o, a + r);
          o += E(e, t).written;
        }
        return (b = o), a;
      }
      let S = null;
      function N() {
        return (
          (null !== S && S.buffer === c.memory.buffer) ||
            (S = new Int32Array(c.memory.buffer)),
          S
        );
      }
      function w(e) {
        return function() {
          try {
            return e.apply(this, arguments);
          } catch (t) {
            c.__wbindgen_exn_store(_(t));
          }
        };
      }
      class A {
        static __wrap(e) {
          const t = Object.create(A.prototype);
          return (t.ptr = e), t;
        }
        free() {
          const e = this.ptr;
          (this.ptr = 0), c.__wbg_nativeengine_free(e);
        }
        static new(e, t, n) {
          var r = c.nativeengine_new(_(e), _(t), _(n));
          return A.__wrap(r);
        }
        load(e) {
          var t = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            n = b;
          return f(c.nativeengine_load(this.ptr, t, n));
        }
        run(e) {
          var t = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            n = b;
          return f(c.nativeengine_run(this.ptr, t, n));
        }
        add_listener(e) {
          c.nativeengine_add_listener(this.ptr, _(e));
        }
        get_loaded_ast(e) {
          var t = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            n = b;
          return f(c.nativeengine_get_loaded_ast(this.ptr, t, n));
        }
        parse_content(e) {
          var t = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            n = b;
          return f(c.nativeengine_parse_content(this.ptr, t, n));
        }
        parse_file(e) {
          var t = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            n = b;
          return f(c.nativeengine_parse_file(this.ptr, t, n));
        }
        update_virtual_file_content(e, t) {
          var n = x(e, c.__wbindgen_malloc, c.__wbindgen_realloc),
            r = b,
            a = x(t, c.__wbindgen_malloc, c.__wbindgen_realloc),
            i = b;
          c.nativeengine_update_virtual_file_content(this.ptr, n, r, a, i);
        }
      }
      const C = (async function e(t) {
          void 0 === t && (t = _NOOP_.replace(/\.js$/, "_bg.wasm"));
          const n = { wbg: {} };
          (n.wbg.__wbindgen_object_drop_ref = function(e) {
            f(e);
          }),
            (n.wbg.__wbindgen_string_new = function(e, t) {
              return _(g(e, t));
            }),
            (n.wbg.__wbindgen_json_parse = function(e, t) {
              return _(JSON.parse(g(e, t)));
            }),
            (n.wbg.__wbg_call_0d50cec2d58307ad = w(function(e, t, n) {
              return _(d(e).call(d(t), d(n)));
            })),
            (n.wbg.__wbg_call_56e03f05ec7df758 = w(function(e, t, n, r) {
              return _(d(e).call(d(t), d(n), d(r)));
            })),
            (n.wbg.__wbg_new_59cb74e423758ede = function() {
              return _(new Error());
            }),
            (n.wbg.__wbg_stack_558ba5917b466edd = function(e, t) {
              var n = x(d(t).stack, c.__wbindgen_malloc, c.__wbindgen_realloc),
                r = b;
              (N()[e / 4 + 1] = r), (N()[e / 4 + 0] = n);
            }),
            (n.wbg.__wbg_error_4bb6c2a97407129a = function(e, t) {
              try {
                console.error(g(e, t));
              } finally {
                c.__wbindgen_free(e, t);
              }
            }),
            (n.wbg.__wbindgen_string_get = function(e, t) {
              const n = d(t);
              var r = "string" == typeof n ? n : void 0,
                a =
                  null == r
                    ? 0
                    : x(r, c.__wbindgen_malloc, c.__wbindgen_realloc),
                i = b;
              (N()[e / 4 + 1] = i), (N()[e / 4 + 0] = a);
            }),
            (n.wbg.__wbindgen_boolean_get = function(e) {
              const t = d(e);
              return "boolean" == typeof t ? (t ? 1 : 0) : 2;
            }),
            (n.wbg.__wbindgen_debug_string = function(e, t) {
              var n = x(
                  (function e(t) {
                    const n = typeof t;
                    if ("number" == n || "boolean" == n || null == t)
                      return "" + t;
                    if ("string" == n) return `"${t}"`;
                    if ("symbol" == n) {
                      const e = t.description;
                      return null == e ? "Symbol" : `Symbol(${e})`;
                    }
                    if ("function" == n) {
                      const e = t.name;
                      return "string" == typeof e && e.length > 0
                        ? `Function(${e})`
                        : "Function";
                    }
                    if (Array.isArray(t)) {
                      const n = t.length;
                      let r = "[";
                      n > 0 && (r += e(t[0]));
                      for (let a = 1; a < n; a++) r += ", " + e(t[a]);
                      return (r += "]"), r;
                    }
                    const r = /\[object ([^\]]+)\]/.exec(toString.call(t));
                    let a;
                    if (!(r.length > 1)) return toString.call(t);
                    if (((a = r[1]), "Object" == a))
                      try {
                        return "Object(" + JSON.stringify(t) + ")";
                      } catch (i) {
                        return "Object";
                      }
                    return t instanceof Error
                      ? `${t.name}: ${t.message}\n${t.stack}`
                      : a;
                  })(d(t)),
                  c.__wbindgen_malloc,
                  c.__wbindgen_realloc
                ),
                r = b;
              (N()[e / 4 + 1] = r), (N()[e / 4 + 0] = n);
            }),
            (n.wbg.__wbindgen_throw = function(e, t) {
              throw new Error(g(e, t));
            }),
            ("string" == typeof t ||
              ("function" == typeof Request && t instanceof Request) ||
              ("function" == typeof URL && t instanceof URL)) &&
              (t = fetch(t));
          const { instance: r, module: a } = await (async function(e, t) {
            if ("function" == typeof Response && e instanceof Response) {
              if ("function" == typeof WebAssembly.instantiateStreaming)
                try {
                  return await WebAssembly.instantiateStreaming(e, t);
                } catch (n) {
                  if ("application/wasm" == e.headers.get("Content-Type"))
                    throw n;
                  console.warn(
                    "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
                    n
                  );
                }
              const r = await e.arrayBuffer();
              return await WebAssembly.instantiate(r, t);
            }
            {
              const n = await WebAssembly.instantiate(e, t);
              return n instanceof WebAssembly.Instance
                ? { instance: n, module: e }
                : n;
            }
          })(await t, n);
          return (c = r.exports), (e.__wbindgen_wasm_module = a), c;
        })("/paperclip_bg.wasm"),
        R = Object(l.createEngine)(async (...e) => (await C, A.new(...e)));
      var P = n(206),
        k = n.n(P),
        O = n(207),
        K = n(189),
        T = n(208),
        F = n.n(T),
        I =
          (n(209),
          n(210),
          n(211),
          n(212),
          n(94),
          function(e, t, n, r) {
            return new (n || (n = Promise))(function(a, i) {
              function o(e) {
                try {
                  l(r.next(e));
                } catch (t) {
                  i(t);
                }
              }
              function s(e) {
                try {
                  l(r.throw(e));
                } catch (t) {
                  i(t);
                }
              }
              function l(e) {
                var t;
                e.done
                  ? a(e.value)
                  : ((t = e.value),
                    t instanceof n
                      ? t
                      : new n(function(e) {
                          e(t);
                        })).then(o, s);
              }
              l((r = r.apply(e, t || [])).next());
            });
          });
      const j = ({ React: e, useState: t, useEffect: n, useRef: r }) => {
        const l = F()(e => e, { serializer: e => JSON.stringify(e) }),
          c = ({ engine: a, currentUri: i }) => {
            const [s, l] = t();
            let c;
            const u = r();
            return (
              n(() => {
                if (!a || !s) return;
                let e;
                c = new K.Renderer("http://", i);
                const t = () =>
                  I(void 0, void 0, void 0, function*() {
                    try {
                      c.initialize(yield a.run(i)),
                        (e = a.onEvent(c.handleEngineEvent));
                    } catch (n) {
                      console.warn(n);
                      const e = a.onEvent(n => {
                        e(), t();
                      });
                    }
                  });
                return (
                  t(),
                  s.appendChild(c.mount),
                  () => {
                    e && e(), s.removeChild(c.mount);
                  }
                );
              }, [a, i, s]),
              n(() => {
                if (s) return;
                const e = setInterval(() => {
                  var e, t;
                  (null ===
                    (t =
                      null === (e = u.current) || void 0 === e
                        ? void 0
                        : e.contentDocument) || void 0 === t
                    ? void 0
                    : t.body) && l(u.current.contentDocument.body);
                }, 500);
                return () => {
                  clearInterval(e);
                };
              }, [s]),
              e.createElement(o, { iframeRef: u })
            );
          };
        return ({ graph: r, defaultUri: o }) => {
          const u = l(r),
            [d, p] = t(u),
            [f, m] = t(o),
            h = d[f],
            v = (e => {
              const [r, a] = t(null);
              return (
                n(() => {
                  R({
                    io: {
                      readFile: t => e[t],
                      resolveFile: (e, t) => t.replace("./", ""),
                      fileExists: t => Boolean(e[t])
                    }
                  }).then(e => {
                    a(e);
                  });
                }, [e]),
                r
              );
            })(u);
          return e.createElement(
            s,
            null,
            e.createElement(
              i,
              {
                tabs: e.createElement(
                  e.Fragment,
                  null,
                  Object.keys(d).map(t =>
                    e.createElement(
                      a,
                      { selected: t === f, onClick: () => m(t) },
                      t
                    )
                  )
                )
              },
              e.createElement(k.a, {
                value: h,
                style: { width: "100%", minHeight: "100%" },
                preClassName: "language-html",
                onValueChange: e => {
                  p(Object.assign(Object.assign({}, d), { [f]: e })),
                    v && v.updateVirtualFileContent(f, e);
                },
                highlight: e => Object(O.highlight)(e, O.languages.html)
              })
            ),
            e.createElement(c, { engine: v, currentUri: f })
          );
        };
      };
    },
    196: function(e, t, n) {
      "use strict";
      var r = n(0),
        a = n.n(r),
        i = n(160),
        o = n(143),
        s = n(194),
        l = n(156),
        c = n(214),
        u = n(170),
        d = n(95),
        p = n.n(d);
      const f = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      t.a = function(e) {
        const {
            children: t,
            frontMatter: n,
            metadata: r,
            truncated: d,
            isBlogPostPage: m = !1
          } = e,
          { date: h, permalink: v, tags: g, readingTime: _ } = r,
          { author: b, title: y, image: E } = n,
          x = n.author_url || n.authorURL,
          S = n.author_title || n.authorTitle,
          N = n.author_image_url || n.authorImageURL,
          w = Object(u.a)(E, { absolute: !0 });
        return a.a.createElement(
          a.a.Fragment,
          null,
          a.a.createElement(
            s.a,
            null,
            E &&
              a.a.createElement("meta", { property: "og:image", content: w }),
            E &&
              a.a.createElement("meta", {
                property: "twitter:image",
                content: w
              }),
            E &&
              a.a.createElement("meta", {
                name: "twitter:image:alt",
                content: "Image for " + y
              })
          ),
          a.a.createElement(
            "article",
            { className: m ? void 0 : "margin-bottom--xl" },
            (() => {
              const e = m ? "h1" : "h2",
                t = h.substring(0, 10).split("-"),
                n = t[0],
                r = f[parseInt(t[1], 10) - 1],
                o = parseInt(t[2], 10);
              return a.a.createElement(
                "header",
                null,
                a.a.createElement(
                  e,
                  {
                    className: Object(i.a)(
                      "margin-bottom--sm",
                      p.a.blogPostTitle
                    )
                  },
                  m ? y : a.a.createElement(l.a, { to: v }, y)
                ),
                a.a.createElement(
                  "div",
                  { className: "margin-vert--md" },
                  a.a.createElement(
                    "time",
                    { dateTime: h, className: p.a.blogPostDate },
                    r,
                    " ",
                    o,
                    ", ",
                    n,
                    " ",
                    _ &&
                      a.a.createElement(
                        a.a.Fragment,
                        null,
                        " \xb7 ",
                        Math.ceil(_),
                        " min read"
                      )
                  )
                ),
                a.a.createElement(
                  "div",
                  { className: "avatar margin-vert--md" },
                  N &&
                    a.a.createElement(
                      "a",
                      {
                        className: "avatar__photo-link avatar__photo",
                        href: x,
                        target: "_blank",
                        rel: "noreferrer noopener"
                      },
                      a.a.createElement("img", { src: N, alt: b })
                    ),
                  a.a.createElement(
                    "div",
                    { className: "avatar__intro" },
                    b &&
                      a.a.createElement(
                        a.a.Fragment,
                        null,
                        a.a.createElement(
                          "h4",
                          { className: "avatar__name" },
                          a.a.createElement(
                            "a",
                            {
                              href: x,
                              target: "_blank",
                              rel: "noreferrer noopener"
                            },
                            b
                          )
                        ),
                        a.a.createElement(
                          "small",
                          { className: "avatar__subtitle" },
                          S
                        )
                      )
                  )
                )
              );
            })(),
            a.a.createElement(
              "section",
              { className: "markdown" },
              a.a.createElement(o.a, { components: c.a }, t)
            ),
            (g.length > 0 || d) &&
              a.a.createElement(
                "footer",
                { className: "row margin-vert--lg" },
                g.length > 0 &&
                  a.a.createElement(
                    "div",
                    { className: "col" },
                    a.a.createElement("strong", null, "Tags:"),
                    g.map(({ label: e, permalink: t }) =>
                      a.a.createElement(
                        l.a,
                        { key: t, className: "margin-horiz--sm", to: t },
                        e
                      )
                    )
                  ),
                d &&
                  a.a.createElement(
                    "div",
                    { className: "col text--right" },
                    a.a.createElement(
                      l.a,
                      { to: r.permalink, "aria-label": "Read more about " + y },
                      a.a.createElement("strong", null, "Read More")
                    )
                  )
              )
          )
        );
      };
    },
    198: function(e, t, n) {
      "use strict";
      n(149), n(171);
      var r = n(159),
        a = (n(150), n(0)),
        i = n.n(a),
        o = n(213),
        s = (0, n(193).createComponentClass)({
          React: i.a,
          useState: a.useState,
          useEffect: a.useEffect,
          useRef: a.useRef
        });
      t.a = function(e) {
        if (e.live) {
          for (
            var t,
              n,
              a = String(e.children)
                .split(/\/\/\s*file:\s*/g)
                .filter(Boolean),
              l = {},
              c = Object(r.a)(a);
            !(n = c()).done;

          ) {
            var u = n.value;
            u.match(/(.*?\.pc)/) || console.log("ERR", u);
            var d = (u.match(/(.*?\.pc)/) || [, "entry.pc"])[1];
            t || (t = d);
            var p = u.replace(d, "").trim();
            l[d] = p;
          }
          return (
            console.log(l),
            console.log(e.children),
            i.a.createElement(
              i.a.Fragment,
              null,
              i.a.createElement(s, { graph: l, defaultUri: t })
            )
          );
        }
        return i.a.createElement(o.a, e);
      };
    }
  }
]);
