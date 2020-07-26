(window.webpackJsonp = window.webpackJsonp || []).push([
  [32],
  {
    201: function(e, t, n) {
      "use strict";
      n.r(t);
      var r = n(0),
        a = n.n(r),
        i = n(208),
        o = n(256),
        c = n(274),
        l = n(213);
      var s = function(e) {
        var t = e.metadata,
          n = t.previousPage,
          r = t.nextPage;
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
        var t = e.metadata,
          n = e.items,
          r = Object(i.a)().siteConfig.title,
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
                n.map(function(e) {
                  var t = e.content;
                  return a.a.createElement(
                    c.a,
                    {
                      key: t.metadata.permalink,
                      frontMatter: t.frontMatter,
                      metadata: t.metadata,
                      truncated: t.metadata.truncated
                    },
                    a.a.createElement(t, null)
                  );
                }),
                a.a.createElement(s, { metadata: t })
              )
            )
          )
        );
      };
    },
    204: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return d;
      }),
        n.d(t, "b", function() {
          return p;
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
      function c(e) {
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
      function l(e, t) {
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
      var s = a.a.createContext({}),
        u = function(e) {
          var t = a.a.useContext(s),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : c(c({}, t), e)), n;
        },
        d = function(e) {
          var t = u(e.components);
          return a.a.createElement(s.Provider, { value: t }, e.children);
        },
        f = {
          inlineCode: "code",
          wrapper: function(e) {
            var t = e.children;
            return a.a.createElement(a.a.Fragment, {}, t);
          }
        },
        m = a.a.forwardRef(function(e, t) {
          var n = e.components,
            r = e.mdxType,
            i = e.originalType,
            o = e.parentName,
            s = l(e, ["components", "mdxType", "originalType", "parentName"]),
            d = u(n),
            m = r,
            p = d["".concat(o, ".").concat(m)] || d[m] || f[m] || i;
          return n
            ? a.a.createElement(p, c(c({ ref: t }, s), {}, { components: n }))
            : a.a.createElement(p, c({ ref: t }, s));
        });
      function p(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var i = n.length,
            o = new Array(i);
          o[0] = m;
          var c = {};
          for (var l in t) hasOwnProperty.call(t, l) && (c[l] = t[l]);
          (c.originalType = e),
            (c.mdxType = "string" == typeof e ? e : r),
            (o[1] = c);
          for (var s = 2; s < i; s++) o[s] = n[s];
          return a.a.createElement.apply(null, o);
        }
        return a.a.createElement.apply(null, n);
      }
      m.displayName = "MDXCreateElement";
    },
    205: function(e, t, n) {
      e.exports = n(239);
    },
    209: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.paperclipSourceGlobPattern = t.stripFileProtocol = void 0);
      var r = n(207);
      (t.stripFileProtocol = function(e) {
        return e.includes("file://") ? r.fileURLToPath(e) : e;
      }),
        (t.paperclipSourceGlobPattern = function(e) {
          return "." === e ? "**/*.pc" : e + "/**/*.pc";
        });
    },
    210: function(e, t, n) {
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
    211: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return s;
      });
      n(77), n(76);
      var r = n(206),
        a = n(259),
        i = n(207),
        o = n(205),
        c = function(e) {
          return function(t) {
            return function(n, a) {
              var c = t.realpathSync(new i.URL(n)),
                s = r.dirname(c),
                u = Object(o.findPCConfigUrl)(t)(n);
              if (!u) return [];
              var d = new i.URL(u),
                f = JSON.parse(t.readFileSync(d, "utf8"));
              return e(f, r.dirname(i.fileURLToPath(d)))
                .filter(function(e) {
                  return e !== c;
                })
                .map(function(e) {
                  if (a) {
                    var t = l(u, f, e, s);
                    if (!r.isAbsolute(t)) return t;
                    var n = r.relative(s, t);
                    return "." !== n.charAt(0) && (n = "./" + n), n;
                  }
                  return i.pathToFileURL(e).href;
                })
                .map(function(e) {
                  return e.replace(/\\/g, "/");
                });
            };
          };
        },
        l =
          (c(function(e, t) {
            return a.sync(
              Object(o.paperclipSourceGlobPattern)(e.sourceDirectory),
              { cwd: t, realpath: !0 }
            );
          }),
          c(function(e, t) {
            var n = "+(jpg|jpeg|png|gif|svg)",
              r = e.sourceDirectory;
            return "." === r
              ? a.sync("**/*." + n, { cwd: t, realpath: !0 })
              : a.sync(r + "/**/*." + n, { cwd: t, realpath: !0 });
          }),
          function(e, t, n, a) {
            var o = r.dirname(i.fileURLToPath(e)),
              c = r.join(o, t.sourceDirectory) + "/";
            if (0 === n.indexOf(c)) {
              var l = n.replace(c, ""),
                s = r.join(c, l.split("/")[0]) + "/";
              if (!a || -1 === a.indexOf(s)) return l;
            }
            return n;
          }),
        s = function() {};
    },
    212: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.ATTR_ALIASES = t.preventDefault = void 0),
        (t.preventDefault = function(e) {
          return e.stopPropagation(), e.preventDefault(), !1;
        }),
        (t.ATTR_ALIASES = { className: "class" });
    },
    218: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return p;
      });
      var r = n(216),
        a = n.n(r),
        i = (n(215), n(230), n(231), n(234)),
        o = (n(52), n(53), n(19), n(237)),
        c = n(206),
        l = n(207),
        s = n(205),
        u = n(211),
        d = function(e, t, n, r) {
          return new (n || (n = Promise))(function(a, i) {
            function o(e) {
              try {
                l(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
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
                      })).then(o, c);
            }
            l((r = r.apply(e, t || [])).next());
          });
        },
        f = function(e) {
          return e ? (e.Ok ? e.Ok : { error: e.Err }) : e;
        },
        m = (function() {
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
                if (e.kind === s.EngineEventKind.Evaluated) {
                  var t = (r._rendered[e.uri] = Object.assign(
                    Object.assign({}, e.data),
                    { importedSheets: r.getImportedSheets(e) }
                  ));
                  r._dispatch({
                    kind: s.EngineEventKind.Loaded,
                    uri: e.uri,
                    data: t
                  });
                } else if (e.kind === s.EngineEventKind.Diffed) {
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
                          preview: Object(s.patchVirtNode)(
                            a.preview,
                            e.data.mutations
                          )
                        }
                      )),
                      c = [],
                      l = Object(i.a)(a.importedSheets);
                    !(n = l()).done;

                  ) {
                    var u = n.value.uri;
                    o.allDependencies.includes(u) || c.push(u);
                  }
                  for (
                    var d, f = [], m = Object(i.a)(e.data.allDependencies);
                    !(d = m()).done;

                  ) {
                    var p = d.value;
                    !a.allDependencies.includes(p) &&
                      r._rendered[p] &&
                      f.push({ uri: p, sheet: r._rendered[p].sheet });
                  }
                  (f.length || c.length) &&
                    r._dispatch({
                      uri: e.uri,
                      kind: s.EngineEventKind.ChangedSheets,
                      data: {
                        newSheets: f,
                        removedSheetUris: c,
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
                      return v(t) && o.lstatSync(t).isFile();
                    } catch (n) {
                      return console.error(n), !1;
                    }
                  },
                  resolveFile: Object(s.resolveImportUri)(o)
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
              return f(this._native.parse_file(e));
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
                return f(t._native.parse_content(e));
              });
            }),
            (t.updateVirtualFileContent = function(e, t) {
              var n = this;
              return this._tryCatch(function() {
                return f(n._native.update_virtual_file_content(e, t));
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
                    t.kind === s.EngineEventKind.Loaded &&
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
                  c = this._rendered[o];
                c
                  ? r.push({ uri: o, sheet: c.sheet })
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
                                return f(r._native.run(e));
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
        p = function(e) {
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
                        return (r.next = 2), new m(e, t, n).$$load();
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
        v = function(e) {
          var t = l.fileURLToPath(e),
            n = c.dirname(t),
            r = c.basename(t);
          return o.readdirSync(n).includes(r);
        };
    },
    219: function(e, t, n) {
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
    220: function(e, t, n) {
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
    221: function(e, t, n) {
      "use strict";
      var r, a, i;
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.getSelectorClassNames = t.traverseStyleExpression = t.isIncludeDeclarationPart = t.isStyleDeclaration = t.isRule = t.traverseSheet = t.getRuleClassNames = t.getSheetClassNames = t.StyleDeclarationKind = t.SelectorKind = t.RuleKind = void 0),
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
        })((r = t.RuleKind || (t.RuleKind = {}))),
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
        })((a = t.SelectorKind || (t.SelectorKind = {}))),
        (function(e) {
          (e.KeyValue = "KeyValue"), (e.Include = "Include");
        })((i = t.StyleDeclarationKind || (t.StyleDeclarationKind = {}))),
        (t.getSheetClassNames = function(e, t) {
          return void 0 === t && (t = []), o(e.rules, t);
        });
      var o = function(e, n) {
        void 0 === n && (n = []);
        for (var r = 0, a = e; r < a.length; r++) {
          var i = a[r];
          t.getRuleClassNames(i, n);
        }
        return n;
      };
      (t.getRuleClassNames = function(e, n) {
        switch ((void 0 === n && (n = []), e.kind)) {
          case r.Media:
            o(e.rules, n);
            break;
          case r.Style:
            t.getSelectorClassNames(e.selector, n);
        }
        return n;
      }),
        (t.traverseSheet = function(e, t) {
          return c(e.rules, t);
        });
      var c = function(e, n) {
        for (var r = 0, a = e; r < a.length; r++) {
          var i = a[r];
          if (!t.traverseStyleExpression(i, n)) return !1;
        }
        return !0;
      };
      (t.isRule = function(e) {
        return null != r[e.kind];
      }),
        (t.isStyleDeclaration = function(e) {
          return null != i[e.declarationKind];
        }),
        (t.isIncludeDeclarationPart = function(e) {
          return null != e.name;
        }),
        (t.traverseStyleExpression = function(e, n) {
          if (!1 === n(e)) return !1;
          if (t.isRule(e))
            switch (e.kind) {
              case r.Media:
              case r.Export:
                return c(e.rules, n);
              case r.Style:
                return c(e.declarations, n) && c(e.children, n);
              case r.Mixin:
                return c(e.declarations, n);
            }
          else if (t.isStyleDeclaration(e))
            switch (e.declarationKind) {
              case i.Include:
                for (var a = 0, o = e.mixins; a < o.length; a++)
                  for (var l = 0, s = o[a].parts; l < s.length; l++) {
                    var u = s[l];
                    if (!t.traverseStyleExpression(u, n)) return !1;
                  }
                return !0;
            }
          return !0;
        }),
        (t.getSelectorClassNames = function(e, n) {
          switch ((void 0 === n && (n = []), e.kind)) {
            case a.Combo:
            case a.Group:
              for (var r = 0, i = e.selectors; r < i.length; r++) {
                var o = i[r];
                t.getSelectorClassNames(o, n);
              }
              break;
            case a.Descendent:
              t.getSelectorClassNames(e.parent, n),
                t.getSelectorClassNames(e.descendent, n);
              break;
            case a.PseudoElement:
            case a.PseudoParamElement:
              t.getSelectorClassNames(e.target, n);
              break;
            case a.Not:
              t.getSelectorClassNames(e.selector, n);
              break;
            case a.Child:
              t.getSelectorClassNames(e.parent, n),
                t.getSelectorClassNames(e.child, n);
              break;
            case a.Adjacent:
              t.getSelectorClassNames(e.selector, n),
                t.getSelectorClassNames(e.nextSiblingSelector, n);
              break;
            case a.Sibling:
              t.getSelectorClassNames(e.selector, n),
                t.getSelectorClassNames(e.siblingSelector, n);
              break;
            case a.Class:
              n.push(e.className);
          }
          return n;
        });
    },
    222: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.findPCConfigUrl = t.resolveImportFile = t.resolveImportUri = void 0);
      var r = n(206),
        a = n(207),
        i = n(209),
        o = n(210);
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
                var r = c(e)(t, n);
                if (!r) throw new Error("module " + n + " not found");
                return r;
              }
              return a.resolve(t, n);
            } catch (i) {
              return null;
            }
          };
        });
      var c = function(e) {
        return function(n, o) {
          var c = t.findPCConfigUrl(e)(n);
          if (!c) return null;
          var l = new URL(c),
            s = JSON.parse(e.readFileSync(l, "utf8")),
            u = r.dirname(i.stripFileProtocol(c)),
            d = a.pathToFileURL(r.normalize(r.join(u, s.sourceDirectory, o)));
          return e.existsSync(d)
            ? a.pathToFileURL(e.realpathSync(d)).href
            : null;
        };
      };
      t.findPCConfigUrl = function(e) {
        return function(t) {
          var n = i.stripFileProtocol(t);
          do {
            var c = a.pathToFileURL(r.join(n, o.PC_CONFIG_FILE_NAME));
            if (e.existsSync(c)) return c.href;
            n = r.dirname(n);
          } while ("/" !== n && "." !== n && !/^\w+:\\$/.test(n));
          return null;
        };
      };
    },
    223: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.stringifyCSSSheet = void 0);
      var r = n(206),
        a = n(207);
      t.stringifyCSSSheet = function(e, t, n) {
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
              return s(e, t, n);
            case "Keyframes":
              return c(e, t);
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
        c = function(e, t, n) {
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
        s = function(e, t, n) {
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
                var c = o.match(/(file:\/\/.*?)(?=['")])/g) || [],
                  l = a.fileURLToPath(n),
                  s = 0,
                  u = c;
                s < u.length;
                s++
              ) {
                var d = u[s],
                  f = a.fileURLToPath(d),
                  m = r.relative(r.dirname(l), f);
                "." !== m.charAt(0) && (m = "./" + m), (o = o.replace(d, m));
              }
            t && (o = o.replace(/file:/, t));
          }
          return i + ":" + o + ";";
        };
    },
    224: function(e, t, n) {
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
    225: function(e, t, n) {
      "use strict";
      var r;
      n(24), n(20), n(19), n(234), n(227), n(52), n(205);
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
    226: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.createNativeStyleFromSheet = t.createNativeNode = t.getNativeNodePath = void 0);
      var r = n(233),
        a = n(205),
        i = n(212),
        o = new r.Html5Entities();
      (t.getNativeNodePath = function(e, t) {
        for (var n = [], r = t; r.parentNode !== e; )
          n.unshift(Array.prototype.indexOf.call(r.parentNode.childNodes, r)),
            (r = r.parentNode);
        return n;
      }),
        (t.createNativeNode = function(e, n, r, a) {
          if (!e) return n.createTextNode("");
          try {
            switch (e.kind) {
              case "Text":
                return c(e, n);
              case "Element":
                return l(e, n, r, a);
              case "StyleElement":
                return t.createNativeStyleFromSheet(e.sheet, n, r);
              case "Fragment":
                return s(e, n, r);
            }
          } catch (i) {
            return n.createTextNode(String(i.stack));
          }
        }),
        (t.createNativeStyleFromSheet = function(e, t, n) {
          var r = t.createElement("style");
          return (r.textContent = a.stringifyCSSSheet(e, n)), r;
        });
      var c = function(e, t) {
          return t.createTextNode(o.decode(e.value));
        },
        l = function(e, n, r, a) {
          var o =
              "svg" === e.tagName
                ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
                : a
                ? n.createElementNS(a, e.tagName)
                : n.createElement(e.tagName),
            c = "svg" === e.tagName ? "http://www.w3.org/2000/svg" : a;
          for (var l in e.attributes) {
            var s = e.attributes[l];
            "src" === l && r && (s = s.replace("file:", r));
            var u = i.ATTR_ALIASES[l] || l;
            o.setAttribute(u, s);
          }
          for (var d = 0, f = e.children; d < f.length; d++) {
            var m = f[d];
            o.appendChild(t.createNativeNode(m, n, r, c));
          }
          return (
            "a" === e.tagName &&
              ((o.onclick = i.preventDefault),
              (o.onmouseup = i.preventDefault),
              (o.onmousedown = i.preventDefault)),
            o
          );
        },
        s = function(e, n, r) {
          for (
            var a = n.createDocumentFragment(), i = 0, o = e.children;
            i < o.length;
            i++
          ) {
            var c = o[i];
            a.appendChild(t.createNativeNode(c, n, r, a.namespaceURI));
          }
          return a;
        };
    },
    236: function(e, t, n) {
      "use strict";
      var r = n(218);
      n.d(t, "createEngine", function() {
        return r.a;
      });
      n(225), n(205), n(211);
    },
    239: function(e, t, n) {
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
        a(n(240), t),
        a(n(219), t),
        a(n(241), t),
        a(n(220), t),
        a(n(223), t),
        a(n(221), t),
        a(n(242), t),
        a(n(243), t),
        a(n(210), t),
        a(n(244), t),
        a(n(245), t),
        a(n(224), t),
        a(n(222), t),
        a(n(246), t),
        a(n(247), t),
        a(n(248), t),
        a(n(249), t),
        a(n(209), t),
        a(n(250), t);
    },
    240: function(e, t, n) {
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
    241: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.getNestedReferences = t.getCompletionItems = t.traverseExpression = t.isAttributeValue = t.isAttribute = t.isNode = t.getMixins = t.isComponentInstance = t.flattenNodes = t.hasAttribute = t.getLogicElement = t.getDefaultPart = t.getPartIds = t.getParts = t.getVisibleChildNodes = t.isVisibleNode = t.isVisibleElement = t.getStyleElements = t.getAttributeStringValue = t.getAttributeValue = t.getAttribute = t.getMetaValue = t.findByNamespace = t.getChildrenByTagName = t.getStyleScopeId = t.getChildren = t.getImportById = t.getImportIds = t.getRelativeFilePath = t.getImports = t.DynamicStringAttributeValuePartKind = t.AttributeValueKind = t.AttributeKind = t.NodeKind = void 0);
      var r,
        a,
        i,
        o = n(220),
        c = n(221),
        l = n(266),
        s = n(222),
        u = n(206),
        d = n(210);
      !(function(e) {
        (e.Fragment = "Fragment"),
          (e.Text = "Text"),
          (e.Element = "Element"),
          (e.StyleElement = "StyleElement"),
          (e.Slot = "Slot");
      })((r = t.NodeKind || (t.NodeKind = {}))),
        (function(e) {
          (e.ShorthandAttribute = "ShorthandAttribute"),
            (e.KeyValueAttribute = "KeyValueAttribute"),
            (e.SpreadAttribute = "SpreadAttribute"),
            (e.PropertyBoundAttribute = "PropertyBoundAttribute");
        })((a = t.AttributeKind || (t.AttributeKind = {}))),
        (function(e) {
          (e.DyanmicString = "DyanmicString"),
            (e.String = "String"),
            (e.Slot = "Slot");
        })((i = t.AttributeValueKind || (t.AttributeValueKind = {}))),
        (function(e) {
          (e.Literal = "Literal"),
            (e.ClassNamePierce = "ClassNamePierce"),
            (e.Slot = "Slot");
        })(
          t.DynamicStringAttributeValuePartKind ||
            (t.DynamicStringAttributeValuePartKind = {})
        );
      (t.getImports = function(e) {
        return t.getChildrenByTagName("import", e).filter(function(e) {
          return t.hasAttribute("src", e);
        });
      }),
        (t.getRelativeFilePath = function(e) {
          return function(t, n) {
            var r = s.resolveImportFile(e)(t, n),
              a = u.relative(u.dirname(t), r);
            return "." !== a.charAt(0) && (a = "./" + a), a;
          };
        }),
        (t.getImportIds = function(e) {
          return t
            .getImports(e)
            .map(function(e) {
              return t.getAttributeStringValue(d.AS_ATTR_NAME, e);
            })
            .filter(Boolean);
        }),
        (t.getImportById = function(e, n) {
          return t.getImports(n).find(function(n) {
            return t.getAttributeStringValue(d.AS_ATTR_NAME, n) === e;
          });
        }),
        (t.getChildren = function(e) {
          return e.kind === r.Element || e.kind === r.Fragment
            ? e.children
            : [];
        }),
        (t.getStyleScopeId = function(e) {
          return l(e);
        }),
        (t.getChildrenByTagName = function(e, n) {
          return t.getChildren(n).filter(function(t) {
            return t.kind === r.Element && t.tagName === e;
          });
        }),
        (t.findByNamespace = function(e, n, a) {
          void 0 === a && (a = []),
            n.kind === r.Element && n.tagName.split(".")[0] === e && a.push(n);
          for (var i = 0, o = t.getChildren(n); i < o.length; i++) {
            var c = o[i];
            t.findByNamespace(e, c, a);
          }
          return a;
        }),
        (t.getMetaValue = function(e, n) {
          var r = t.getChildrenByTagName("meta", n).find(function(n) {
            return (
              t.hasAttribute("src", n) &&
              t.getAttributeStringValue("name", n) === e
            );
          });
          return r && t.getAttributeStringValue("content", r);
        }),
        (t.getAttribute = function(e, t) {
          return t.attributes.find(function(t) {
            return t.kind === a.KeyValueAttribute && t.name === e;
          });
        }),
        (t.getAttributeValue = function(e, n) {
          var r = t.getAttribute(e, n);
          return r && r.value;
        }),
        (t.getAttributeStringValue = function(e, n) {
          var r = t.getAttributeValue(e, n);
          return r && r.attrValueKind === i.String && r.value;
        }),
        (t.getStyleElements = function(e) {
          return t.getChildren(e).filter(function(e) {
            return e.kind === r.StyleElement;
          });
        }),
        (t.isVisibleElement = function(e) {
          return !/^(import|logic|meta|style|part|preview)$/.test(e.tagName);
        }),
        (t.isVisibleNode = function(e) {
          return (
            e.kind === r.Text ||
            e.kind === r.Fragment ||
            e.kind === r.Slot ||
            (e.kind === r.Element && t.isVisibleElement(e))
          );
        }),
        (t.getVisibleChildNodes = function(e) {
          return t.getChildren(e).filter(t.isVisibleNode);
        }),
        (t.getParts = function(e) {
          return t.getChildren(e).filter(function(e) {
            return (
              e.kind === r.Element &&
              t.hasAttribute("component", e) &&
              t.hasAttribute(d.AS_ATTR_NAME, e)
            );
          });
        }),
        (t.getPartIds = function(e) {
          return t
            .getParts(e)
            .map(function(e) {
              return t.getAttributeStringValue(d.AS_ATTR_NAME, e);
            })
            .filter(Boolean);
        }),
        (t.getDefaultPart = function(e) {
          return t.getParts(e).find(function(e) {
            return (
              t.getAttributeStringValue(d.AS_ATTR_NAME, e) === d.DEFAULT_PART_ID
            );
          });
        }),
        (t.getLogicElement = function(e) {
          return t.getChildren(e).find(function(e) {
            return e.kind === r.Element && e.tagName === d.LOGIC_TAG_NAME;
          });
        }),
        (t.hasAttribute = function(e, n) {
          return null != t.getAttribute(e, n);
        }),
        (t.flattenNodes = function(e, n) {
          if ((void 0 === n && (n = []), n.push(e), e.kind === r.Element))
            for (var c = 0, l = e.attributes; c < l.length; c++) {
              var s = l[c];
              s.kind === a.KeyValueAttribute &&
                s.value &&
                s.value.attrValueKind === i.Slot &&
                s.value.script.jsKind === o.StatementKind.Node &&
                t.flattenNodes(s.value.script, n);
            }
          for (var u = 0, d = t.getChildren(e); u < d.length; u++) {
            var f = d[u];
            t.flattenNodes(f, n);
          }
          return n;
        }),
        (t.isComponentInstance = function(e, t) {
          return (
            e.kind === r.Element &&
            -1 !== t.indexOf(e.tagName.split(".").shift())
          );
        });
      (t.getMixins = function(e) {
        for (
          var n = t.getStyleElements(e), r = {}, a = 0, i = n;
          a < i.length;
          a++
        ) {
          var o = i[a];
          c.traverseSheet(o.sheet, function(e) {
            e &&
              c.isRule(e) &&
              e.kind === c.RuleKind.Mixin &&
              (r[e.name.value] = e);
          });
        }
        return r;
      }),
        (t.isNode = function(e) {
          return null != r[e.kind];
        }),
        (t.isAttribute = function(e) {
          return null != a[e.kind];
        }),
        (t.isAttributeValue = function(e) {
          return null != i[e.attrValueKind];
        }),
        (t.traverseExpression = function(e, n) {
          if (!1 === n(e)) return !1;
          if (t.isNode(e))
            switch (e.kind) {
              case r.Element:
                return f(e.attributes, n) && f(e.children, n);
              case r.Fragment:
                return f(e.children, n);
              case r.StyleElement:
                return c.traverseSheet(e.sheet, n);
            }
          return !0;
        }),
        (t.getCompletionItems = function(e, n) {
          t.traverseExpression(e, function(e) {
            e.location || console.error("ERRRR", e);
          });
        });
      var f = function(e, n) {
        for (var r = 0, a = e; r < a.length; r++) {
          var i = a[r];
          if (!t.traverseExpression(i, n)) return !1;
        }
        return !0;
      };
      t.getNestedReferences = function(e, n) {
        if ((void 0 === n && (n = []), e.kind === r.Slot))
          !(function(e, t) {
            void 0 === t && (t = []),
              e.jsKind === o.StatementKind.Reference && t.push([e, null]);
          })(e.script, n);
        else {
          if (e.kind === r.Element)
            for (var c = 0, l = e.attributes; c < l.length; c++) {
              var s = l[c];
              s.kind == a.KeyValueAttribute &&
              s.value &&
              s.value.attrValueKind === i.Slot
                ? s.value.script.jsKind === o.StatementKind.Node
                  ? t.getNestedReferences(s.value.script, n)
                  : s.value.script.jsKind === o.StatementKind.Reference &&
                    n.push([s.value.script, s.name])
                : s.kind === a.ShorthandAttribute &&
                  s.reference.jsKind === o.StatementKind.Reference
                ? n.push([s.reference, s.reference[0]])
                : s.kind === a.SpreadAttribute &&
                  s.script.jsKind === o.StatementKind.Reference &&
                  n.push([s.script, s.script[0]]);
            }
          for (var u = 0, f = t.getChildren(e); u < f.length; u++) {
            var m = f[u];
            (m.kind === r.Element && t.hasAttribute(d.PREVIEW_ATTR_NAME, m)) ||
              t.getNestedReferences(m, n);
          }
        }
        return n;
      };
    },
    242: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    243: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    244: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.getPrettyMessage = void 0),
        (t.getPrettyMessage = function(e, t, n) {
          var a = e.location,
            i = "";
          (i += "Error: " + e.message + "\n"), (i += "In " + n + ":\n");
          var o = r(t, a.start, a.end),
            c = o.lineStart;
          o.lines;
          return (i += "L" + c + " " + t.substr(a.start, a.end));
        });
      var r = function(e, t, n) {
        for (
          var r = e.split("\n"), a = -1, i = -1, o = 0, c = 0, l = r.length;
          c < l;
          c++
        ) {
          (o += r[c].length),
            -1 === a && o >= t && (a = c),
            -1 !== a && -1 === i && o <= n && (i = c);
        }
        return { lineStart: a, lines: r.slice(a, i + 1) };
      };
    },
    245: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.DependencyContentKind = void 0),
        (function(e) {
          (e.Node = "Node"), (e.Stylsheet = "Stylesheet");
        })(t.DependencyContentKind || (t.DependencyContentKind = {}));
    },
    246: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.stringifyVirtualNode = void 0);
      var r = n(223),
        a = new (n(267).Html5Entities)();
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
    247: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.VirtRuleKind = void 0),
        (function(e) {
          (e.Style = "Style"), (e.Media = "Media");
        })(t.VirtRuleKind || (t.VirtRuleKind = {}));
    },
    248: function(e, t, n) {
      "use strict";
      var r =
          (this && this.__assign) ||
          function() {
            return (r =
              Object.assign ||
              function(e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var a in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
                return e;
              }).apply(this, arguments);
          },
        a =
          (this && this.__spreadArrays) ||
          function() {
            for (var e = 0, t = 0, n = arguments.length; t < n; t++)
              e += arguments[t].length;
            var r = Array(e),
              a = 0;
            for (t = 0; t < n; t++)
              for (var i = arguments[t], o = 0, c = i.length; o < c; o++, a++)
                r[a] = i[o];
            return r;
          };
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.getVirtTarget = t.patchVirtNode = void 0);
      var i = n(224),
        o = n(219);
      (t.patchVirtNode = function(e, n) {
        for (var a = 0, o = n; a < o.length; a++) {
          var l = o[a],
            s = t.getVirtTarget(e, l.nodePath),
            u = l.action;
          switch (u.kind) {
            case i.ActionKind.DeleteChild:
              (d = s.children.concat()).splice(u.index, 1),
                (s = r(r({}, s), { children: d }));
              break;
            case i.ActionKind.InsertChild:
              var d;
              (d = s.children.concat()).splice(u.index, 0, u.child),
                (s = r(r({}, s), { children: d }));
              break;
            case i.ActionKind.ReplaceNode:
              s = u.replacement;
              break;
            case i.ActionKind.RemoveAttribute:
              ((f = r({}, s.attributes))[u.name] = void 0),
                (s = r(r({}, s), { attributes: f }));
              break;
            case i.ActionKind.SetAttribute:
              var f;
              ((f = r({}, s.attributes))[u.name] = u.value),
                (s = r(r({}, s), { attributes: f }));
              break;
            case i.ActionKind.SetText:
              s = r(r({}, s), { value: u.value });
              break;
            case i.ActionKind.SourceChanged:
          }
          e = c(e, l.nodePath, s);
        }
        return e;
      }),
        (t.getVirtTarget = function(e, t) {
          return t.reduce(function(e, t) {
            return e.children[t];
          }, e);
        });
      var c = function(e, t, n, i) {
        return (
          void 0 === i && (i = 0),
          i === t.length ||
          e.kind === o.VirtualNodeKind.Text ||
          e.kind === o.VirtualNodeKind.StyleElement
            ? n
            : r(r({}, e), {
                children: a(
                  e.children.slice(0, t[i]),
                  [c(e.children[t[i]], t, n, i + 1)],
                  e.children.slice(t[i] + 1)
                )
              })
        );
      };
    },
    249: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
    },
    250: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.PaperclipSourceWatcher = t.ChangeKind = void 0);
      var r,
        a = n(268),
        i = n(206),
        o = n(207),
        c = n(229),
        l = n(209);
      !(function(e) {
        (e[(e.Removed = 0)] = "Removed"),
          (e[(e.Added = 1)] = "Added"),
          (e[(e.Changed = 2)] = "Changed");
      })((r = t.ChangeKind || (t.ChangeKind = {})));
      var s = { add: r.Added, unlink: r.Removed, change: r.Changed },
        u = (function() {
          function e(e, t) {
            (this.config = e),
              (this.cwd = t),
              (this._em = new c.EventEmitter()),
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
                  a = s[t];
                a && e._em.emit("change", a, o.pathToFileURL(r).href);
              });
            }),
            e
          );
        })();
      t.PaperclipSourceWatcher = u;
    },
    251: function(e, t, n) {
      e.exports = n(252);
    },
    252: function(e, t, n) {
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
      Object.defineProperty(t, "__esModule", { value: !0 }), a(n(253), t);
    },
    253: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.Renderer = void 0);
      var r,
        a = n(226),
        i = n(205),
        o = n(229),
        c = n(212),
        l = n(254);
      !(function(e) {
        (e.META_CLICK = "META_CLICK"),
          (e.ERROR_BANNER_CLICK = "ERROR_BANNER_CLICK");
      })(r || (r = {}));
      var s = (function() {
        function e(e, t, n) {
          var s = this;
          void 0 === n && (n = document),
            (this.protocol = e),
            (this.targetUri = t),
            (this._domFactory = n),
            (this._dependencies = []),
            (this.onMetaClick = function(e) {
              s._em.addListener(r.META_CLICK, e);
            }),
            (this.onErrorBannerClick = function(e) {
              s._em.addListener(r.ERROR_BANNER_CLICK, e);
            }),
            (this.initialize = function(e) {
              var t = e.sheet,
                n = e.preview,
                r = e.importedSheets;
              u(s._stage),
                u(s._mainStyleContainer),
                u(s._importedStylesContainer),
                (s._virtualRootNode = n);
              var i = a.createNativeNode(n, s._domFactory, s.protocol, null);
              (s._dependencies = r.map(function(e) {
                return e.uri;
              })),
                s._addSheets(r);
              var o = a.createNativeStyleFromSheet(
                t,
                s._domFactory,
                s.protocol
              );
              s._mainStyleContainer.appendChild(o), s._stage.appendChild(i);
            }),
            (this._onErrorBannerClick = function(e) {
              s._clearErrors(), s._em.emit(r.ERROR_BANNER_CLICK, e);
            }),
            (this.handleEngineEvent = function(e) {
              switch ((s._clearErrors(), e.kind)) {
                case i.EngineEventKind.Error:
                  s.handleError(e);
                  break;
                case i.EngineEventKind.ChangedSheets:
                  e.uri === s.targetUri &&
                    ((s._dependencies = e.data.allDependencies),
                    s._addSheets(e.data.newSheets),
                    s._removeSheets(e.data.removedSheetUris));
                  break;
                case i.EngineEventKind.Loaded:
                  e.uri === s.targetUri &&
                    ((s._dependencies = e.data.allDependencies),
                    s.initialize(e.data));
                  break;
                case i.EngineEventKind.Evaluated:
                  if (e.uri === s.targetUri)
                    s._dependencies = e.data.allDependencies;
                  else if (s._dependencies.includes(e.uri)) {
                    (o = s._importedStyles[e.uri]) && o.remove();
                    var t = (s._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      s._domFactory,
                      s.protocol
                    ));
                    s._importedStylesContainer.appendChild(t);
                  }
                  break;
                case i.EngineEventKind.Diffed:
                  if (e.uri === s.targetUri) {
                    if (
                      (l.patchNativeNode(
                        s._stage,
                        e.data.mutations,
                        s._domFactory,
                        s.protocol
                      ),
                      (s._virtualRootNode = i.patchVirtNode(
                        s._virtualRootNode,
                        e.data.mutations
                      )),
                      e.data.sheet)
                    ) {
                      u(s._mainStyleContainer);
                      var n = a.createNativeStyleFromSheet(
                        e.data.sheet,
                        s._domFactory,
                        s.protocol
                      );
                      s._mainStyleContainer.appendChild(n);
                    }
                    for (var r in s._importedStyles) {
                      if (!e.data.allDependencies.includes(r))
                        (n = s._importedStyles[r]).remove(),
                          delete s._importedStyles[r];
                    }
                  } else if (e.data.sheet) {
                    var o;
                    (o = s._importedStyles[e.uri]) && o.remove();
                    var c = (s._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      s._domFactory,
                      s.protocol
                    ));
                    s._importedStylesContainer.appendChild(c);
                  }
              }
            }),
            (this._onStageMouseDown = function(e) {
              e.preventDefault(), e.stopImmediatePropagation();
              var t = e.target;
              if (1 === t.nodeType && e.metaKey) {
                var n = a.getNativeNodePath(s.mount, t),
                  o = i.getVirtTarget(s._virtualRootNode, n);
                o && s._em.emit(r.META_CLICK, o);
              }
            }),
            (this._onStageMouseOver = function(e) {
              var t = e.target,
                n = t.ownerDocument.defaultView;
              if (1 === t.nodeType && e.metaKey) {
                s.mount.style.cursor = "pointer";
                var r = t.getBoundingClientRect();
                Object.assign(s._hoverOverlay.style, {
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
                ((s.mount.style.cursor = "default"),
                Object.assign(s._hoverOverlay.style, { display: "none" }));
            }),
            (this._importedStyles = {}),
            (this._em = new o.EventEmitter()),
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
            this._stage.addEventListener("mouseup", c.preventDefault, !0),
            this._stage.addEventListener("mouseover", this._onStageMouseOver),
            this._stage.addEventListener("mouseout", this._onStageMouseOut);
        }
        return (
          (e.prototype._addSheets = function(e) {
            for (var t = 0, n = e; t < n.length; t++) {
              var r = n[t],
                i = r.uri,
                o = r.sheet,
                c = a.createNativeStyleFromSheet(
                  o,
                  this._domFactory,
                  this.protocol
                );
              (this._importedStyles[i] = c),
                this._importedStylesContainer.appendChild(c);
            }
          }),
          (e.prototype._removeSheets = function(e) {
            for (var t = 0, n = e; t < n.length; t++) {
              var r = n[t];
              this._importedStyles[r].remove(), delete this._importedStyles[r];
            }
          }),
          (e.prototype._clearErrors = function() {
            u(this._errorOverlay);
          }),
          (e.prototype.handleError = function(e) {
            var t,
              n = e.uri;
            if ("undefined" != typeof window && n !== this.targetUri) {
              switch (e.errorKind) {
                case i.EngineErrorKind.Graph:
                  t = e.info.message;
                  break;
                default:
                  t = e.message;
              }
              var r = this._domFactory.createElement("div");
              try {
                (r.innerHTML =
                  '\n      <div style="position: fixed; cursor: pointer; bottom: 0; width: 100%; word-break: break-word; box-sizing: border-box; font-family: Helvetica; padding: 10px; background: rgb(255, 152, 152); color: rgb(138, 31, 31); line-height: 1.1em">\n        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">\n          Error&nbsp;in&nbsp;' +
                  String(n).replace("file://", "") +
                  ':\n        </div>\n        <div style="font-size: 14px;">\n        ' +
                  t +
                  "\n        </div>\n      </div>\n      "),
                  (r.onclick = this._onErrorBannerClick.bind(this, e)),
                  this._errorOverlay.appendChild(r);
              } catch (a) {
                console.warn(a);
              }
            }
          }),
          e
        );
      })();
      t.Renderer = s;
      var u = function(e) {
        for (; e.childNodes.length; ) e.removeChild(e.childNodes[0]);
      };
    },
    254: function(e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.patchNativeNode = void 0);
      var r = n(233),
        a = n(226),
        i = n(205),
        o = n(212),
        c = new r.Html5Entities();
      t.patchNativeNode = function(e, t, n, r) {
        for (var s = 0, u = t; s < u.length; s++) {
          var d = u[s],
            f = l(e, d),
            m = d.action;
          switch (m.kind) {
            case i.ActionKind.DeleteChild:
              var p = f.childNodes[m.index];
              f.removeChild(p);
              break;
            case i.ActionKind.InsertChild:
              var v = a.createNativeNode(m.child, n, r, f.namespaceURI);
              m.index >= f.childNodes.length
                ? f.appendChild(v)
                : f.insertBefore(v, f.childNodes[m.index]);
              break;
            case i.ActionKind.ReplaceNode:
              var h = f.parentNode;
              h.insertBefore(
                a.createNativeNode(m.replacement, n, r, h.namespaceURI),
                f
              ),
                f.remove();
              break;
            case i.ActionKind.RemoveAttribute:
              (g = f).removeAttribute(o.ATTR_ALIASES[m.name] || m.name);
              break;
            case i.ActionKind.SetAttribute:
              var g = f,
                _ = o.ATTR_ALIASES[m.name] || m.name,
                b = m.value || "";
              0 === b.indexOf("file:") && (b = b.replace("file:", r)),
                g.setAttribute(_, b);
              break;
            case i.ActionKind.SetText:
              f.nodeValue = c.decode(m.value);
          }
        }
      };
      var l = function(e, t) {
        return t.nodePath.reduce(function(e, t) {
          return e.childNodes[t];
        }, e);
      };
    },
    255: function(e, t, n) {
      "use strict";
      n.d(t, "a", function() {
        return J;
      });
      n(131), n(24);
      var r = n(257);
      const a = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "div",
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
                "div",
                {
                  "data-pc-fab8095a": !0,
                  key: "2",
                  className: "_fab8095a_tabs tabs"
                },
                e.tabs,
                r.createElement("div", {
                  "data-pc-fab8095a": !0,
                  key: "3",
                  className: "_fab8095a_shadow shadow"
                })
              ),
              r.createElement(
                "div",
                {
                  "data-pc-fab8095a": !0,
                  key: "4",
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
                key: "5",
                className: "_fab8095a_Preview Preview"
              },
              r.createElement(
                "div",
                {
                  "data-pc-fab8095a": !0,
                  key: "6",
                  className: "_fab8095a_header header"
                },
                r.createElement(
                  "span",
                  {
                    "data-pc-fab8095a": !0,
                    key: "7",
                    className: "_fab8095a_bolt bolt"
                  },
                  "\u26a1\ufe0f"
                ),
                " Preview\n  "
              ),
              r.createElement("iframe", {
                "data-pc-fab8095a": !0,
                key: "8",
                ref: e.iframeRef
              })
            );
          })
        ),
        c = r.memo(
          r.forwardRef(function(e, t) {
            return r.createElement(
              "div",
              {
                "data-pc-fab8095a": !0,
                ref: t,
                key: "9",
                style: e.style,
                className:
                  "_fab8095a_Editor Editor" +
                  (e.responsive
                    ? " _fab8095a_Editor--responsive Editor--responsive"
                    : "")
              },
              e.children
            );
          })
        );
      var l,
        s = n(216),
        u = n.n(s),
        d = (n(215), n(232)),
        f = n(236),
        m =
          (n(76),
          n(227),
          n(269),
          n(270),
          n(271),
          new TextDecoder("utf-8", { ignoreBOM: !0, fatal: !0 }));
      m.decode();
      var p = null;
      function v() {
        return (
          (null !== p && p.buffer === l.memory.buffer) ||
            (p = new Uint8Array(l.memory.buffer)),
          p
        );
      }
      function h(e, t) {
        return m.decode(v().subarray(e, e + t));
      }
      var g = new Array(32).fill(void 0);
      g.push(void 0, null, !0, !1);
      var _ = g.length;
      function b(e) {
        _ === g.length && g.push(g.length + 1);
        var t = _;
        return (_ = g[t]), (g[t] = e), t;
      }
      function y(e) {
        return g[e];
      }
      function E(e) {
        var t = y(e);
        return (
          (function(e) {
            e < 36 || ((g[e] = _), (_ = e));
          })(e),
          t
        );
      }
      var S = 0,
        N = new TextEncoder("utf-8"),
        w =
          "function" == typeof N.encodeInto
            ? function(e, t) {
                return N.encodeInto(e, t);
              }
            : function(e, t) {
                var n = N.encode(e);
                return t.set(n), { read: e.length, written: n.length };
              };
      function A(e, t, n) {
        if (void 0 === n) {
          var r = N.encode(e),
            a = t(r.length);
          return (
            v()
              .subarray(a, a + r.length)
              .set(r),
            (S = r.length),
            a
          );
        }
        for (var i = e.length, o = t(i), c = v(), l = 0; l < i; l++) {
          var s = e.charCodeAt(l);
          if (s > 127) break;
          c[o + l] = s;
        }
        if (l !== i) {
          0 !== l && (e = e.slice(l)), (o = n(o, i, (i = l + 3 * e.length)));
          var u = v().subarray(o + l, o + i);
          l += w(e, u).written;
        }
        return (S = l), o;
      }
      function C(e) {
        return null == e;
      }
      var O = null;
      function k() {
        return (
          (null !== O && O.buffer === l.memory.buffer) ||
            (O = new Int32Array(l.memory.buffer)),
          O
        );
      }
      function P(e) {
        var t = typeof e;
        if ("number" == t || "boolean" == t || null == e) return "" + e;
        if ("string" == t) return '"' + e + '"';
        if ("symbol" == t) {
          var n = e.description;
          return null == n ? "Symbol" : "Symbol(" + n + ")";
        }
        if ("function" == t) {
          var r = e.name;
          return "string" == typeof r && r.length > 0
            ? "Function(" + r + ")"
            : "Function";
        }
        if (Array.isArray(e)) {
          var a = e.length,
            i = "[";
          a > 0 && (i += P(e[0]));
          for (var o = 1; o < a; o++) i += ", " + P(e[o]);
          return (i += "]");
        }
        var c,
          l = /\[object ([^\]]+)\]/.exec(toString.call(e));
        if (!(l.length > 1)) return toString.call(e);
        if ("Object" == (c = l[1]))
          try {
            return "Object(" + JSON.stringify(e) + ")";
          } catch (s) {
            return "Object";
          }
        return e instanceof Error
          ? e.name + ": " + e.message + "\n" + e.stack
          : c;
      }
      function R(e) {
        return function() {
          try {
            return e.apply(this, arguments);
          } catch (t) {
            l.__wbindgen_exn_store(b(t));
          }
        };
      }
      var x = (function() {
        function e() {}
        e.__wrap = function(t) {
          var n = Object.create(e.prototype);
          return (n.ptr = t), n;
        };
        var t = e.prototype;
        return (
          (t.free = function() {
            var e = this.ptr;
            (this.ptr = 0), l.__wbg_nativeengine_free(e);
          }),
          (e.new = function(t, n, r) {
            var a = l.nativeengine_new(b(t), b(n), b(r));
            return e.__wrap(a);
          }),
          (t.load = function(e) {
            var t = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              n = S;
            return E(l.nativeengine_load(this.ptr, t, n));
          }),
          (t.run = function(e) {
            var t = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              n = S;
            return E(l.nativeengine_run(this.ptr, t, n));
          }),
          (t.add_listener = function(e) {
            l.nativeengine_add_listener(this.ptr, b(e));
          }),
          (t.get_loaded_ast = function(e) {
            var t = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              n = S;
            return E(l.nativeengine_get_loaded_ast(this.ptr, t, n));
          }),
          (t.parse_content = function(e) {
            var t = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              n = S;
            return E(l.nativeengine_parse_content(this.ptr, t, n));
          }),
          (t.parse_file = function(e) {
            var t = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              n = S;
            return E(l.nativeengine_parse_file(this.ptr, t, n));
          }),
          (t.update_virtual_file_content = function(e, t) {
            var n = A(e, l.__wbindgen_malloc, l.__wbindgen_realloc),
              r = S,
              a = A(t, l.__wbindgen_malloc, l.__wbindgen_realloc),
              i = S;
            l.nativeengine_update_virtual_file_content(this.ptr, n, r, a, i);
          }),
          e
        );
      })();
      function j(e, t) {
        return T.apply(this, arguments);
      }
      function T() {
        return (T = Object(d.a)(
          u.a.mark(function e(t, n) {
            var r, a;
            return u.a.wrap(
              function(e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      if (
                        !(
                          "function" == typeof Response && t instanceof Response
                        )
                      ) {
                        e.next = 23;
                        break;
                      }
                      if (
                        "function" != typeof WebAssembly.instantiateStreaming
                      ) {
                        e.next = 15;
                        break;
                      }
                      return (
                        (e.prev = 2),
                        (e.next = 5),
                        WebAssembly.instantiateStreaming(t, n)
                      );
                    case 5:
                      return e.abrupt("return", e.sent);
                    case 8:
                      if (
                        ((e.prev = 8),
                        (e.t0 = e.catch(2)),
                        "application/wasm" == t.headers.get("Content-Type"))
                      ) {
                        e.next = 14;
                        break;
                      }
                      console.warn(
                        "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
                        e.t0
                      ),
                        (e.next = 15);
                      break;
                    case 14:
                      throw e.t0;
                    case 15:
                      return (e.next = 17), t.arrayBuffer();
                    case 17:
                      return (
                        (r = e.sent),
                        (e.next = 20),
                        WebAssembly.instantiate(r, n)
                      );
                    case 20:
                      return e.abrupt("return", e.sent);
                    case 23:
                      return (e.next = 25), WebAssembly.instantiate(t, n);
                    case 25:
                      if (!((a = e.sent) instanceof WebAssembly.Instance)) {
                        e.next = 30;
                        break;
                      }
                      return e.abrupt("return", { instance: a, module: t });
                    case 30:
                      return e.abrupt("return", a);
                    case 31:
                    case "end":
                      return e.stop();
                  }
              },
              e,
              null,
              [[2, 8]]
            );
          })
        )).apply(this, arguments);
      }
      function K(e) {
        return F.apply(this, arguments);
      }
      function F() {
        return (F = Object(d.a)(
          u.a.mark(function e(t) {
            var n, r, a, i;
            return u.a.wrap(function(e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    return (
                      void 0 === t && (t = _NOOP_.replace(/\.js$/, "_bg.wasm")),
                      ((n = {}).wbg = {}),
                      (n.wbg.__wbindgen_json_parse = function(e, t) {
                        return b(JSON.parse(h(e, t)));
                      }),
                      (n.wbg.__wbindgen_object_drop_ref = function(e) {
                        E(e);
                      }),
                      (n.wbg.__wbindgen_string_new = function(e, t) {
                        return b(h(e, t));
                      }),
                      (n.wbg.__wbg_call_0d50cec2d58307ad = R(function(e, t, n) {
                        return b(y(e).call(y(t), y(n)));
                      })),
                      (n.wbg.__wbg_call_56e03f05ec7df758 = R(function(
                        e,
                        t,
                        n,
                        r
                      ) {
                        return b(y(e).call(y(t), y(n), y(r)));
                      })),
                      (n.wbg.__wbg_new_59cb74e423758ede = function() {
                        return b(new Error());
                      }),
                      (n.wbg.__wbg_stack_558ba5917b466edd = function(e, t) {
                        var n = A(
                            y(t).stack,
                            l.__wbindgen_malloc,
                            l.__wbindgen_realloc
                          ),
                          r = S;
                        (k()[e / 4 + 1] = r), (k()[e / 4 + 0] = n);
                      }),
                      (n.wbg.__wbg_error_4bb6c2a97407129a = function(e, t) {
                        try {
                          console.error(h(e, t));
                        } finally {
                          l.__wbindgen_free(e, t);
                        }
                      }),
                      (n.wbg.__wbindgen_string_get = function(e, t) {
                        var n = y(t),
                          r = "string" == typeof n ? n : void 0,
                          a = C(r)
                            ? 0
                            : A(r, l.__wbindgen_malloc, l.__wbindgen_realloc),
                          i = S;
                        (k()[e / 4 + 1] = i), (k()[e / 4 + 0] = a);
                      }),
                      (n.wbg.__wbindgen_boolean_get = function(e) {
                        var t = y(e);
                        return "boolean" == typeof t ? (t ? 1 : 0) : 2;
                      }),
                      (n.wbg.__wbindgen_debug_string = function(e, t) {
                        var n = A(
                            P(y(t)),
                            l.__wbindgen_malloc,
                            l.__wbindgen_realloc
                          ),
                          r = S;
                        (k()[e / 4 + 1] = r), (k()[e / 4 + 0] = n);
                      }),
                      (n.wbg.__wbindgen_throw = function(e, t) {
                        throw new Error(h(e, t));
                      }),
                      ("string" == typeof t ||
                        ("function" == typeof Request &&
                          t instanceof Request) ||
                        ("function" == typeof URL && t instanceof URL)) &&
                        (t = fetch(t)),
                      (e.t0 = j),
                      (e.next = 19),
                      t
                    );
                  case 19:
                    return (
                      (e.t1 = e.sent),
                      (e.t2 = n),
                      (e.next = 23),
                      (0, e.t0)(e.t1, e.t2)
                    );
                  case 23:
                    return (
                      (r = e.sent),
                      (a = r.instance),
                      (i = r.module),
                      (l = a.exports),
                      (K.__wbindgen_wasm_module = i),
                      e.abrupt("return", l)
                    );
                  case 29:
                  case "end":
                    return e.stop();
                }
            }, e);
          })
        )).apply(this, arguments);
      }
      var I = K("/paperclip_bg.wasm"),
        M = Object(f.createEngine)(
          Object(d.a)(
            u.a.mark(function e() {
              var t = arguments;
              return u.a.wrap(function(e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (e.next = 2), I;
                    case 2:
                      return e.abrupt("return", x.new.apply(x, t));
                    case 3:
                    case "end":
                      return e.stop();
                  }
              }, e);
            })
          )
        ),
        D = n(272),
        L = n.n(D),
        V = n(276),
        U = n(292),
        B = n(251),
        G = n(273),
        W = n.n(G),
        z = function(e, t, n, r) {
          return new (n || (n = Promise))(function(a, i) {
            function o(e) {
              try {
                l(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
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
                      })).then(o, c);
            }
            l((r = r.apply(e, t || [])).next());
          });
        };
      const J = ({ React: e, useState: t, useEffect: n, useRef: r }) => {
        const l = W()(e => e, { serializer: e => JSON.stringify(e) }),
          s = (t, n, r) =>
            e.createElement(
              V.a,
              { Prism: U.a, code: t, theme: r, language: n },
              ({ tokens: t, getLineProps: n, getTokenProps: r }) =>
                e.createElement(
                  e.Fragment,
                  null,
                  t.map((t, a) =>
                    e.createElement(
                      "div",
                      Object.assign({}, n({ line: t, key: a })),
                      t.map((t, n) =>
                        e.createElement(
                          "span",
                          Object.assign({}, r({ token: t, key: n }))
                        )
                      )
                    )
                  )
                )
            ),
          u = ({ engine: a, currentUri: i }) => {
            const [c, l] = t();
            let s;
            const u = r();
            return (
              n(() => {
                if (!a || !c) return;
                let e;
                s = new B.Renderer("http://", i);
                const t = () =>
                  z(void 0, void 0, void 0, function*() {
                    try {
                      s.initialize(yield a.run(i)),
                        (e = a.onEvent(s.handleEngineEvent));
                    } catch (n) {
                      console.warn(n);
                      const e = a.onEvent(n => {
                        e(), t();
                      });
                    }
                  });
                return (
                  t(),
                  c.appendChild(s.mount),
                  () => {
                    e && e(), c.removeChild(s.mount);
                  }
                );
              }, [a, i, c]),
              n(() => {
                if (c) return;
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
              }, [c]),
              e.createElement(o, { iframeRef: u })
            );
          };
        return ({ graph: r, defaultUri: o, theme: d, responsive: f = !0 }) => {
          var m;
          const p = l(r),
            [v, h] = t(p),
            [g, _] = t(o),
            b = v[g],
            y = (e => {
              const [r, a] = t(null);
              return (
                n(() => {
                  M({
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
            })(p),
            E = d && "object" == typeof d.plain ? d.plain : {};
          return e.createElement(
            c,
            {
              responsive: f,
              style: {
                "--background":
                  null === (m = d.plain) || void 0 === m
                    ? void 0
                    : m.backgroundColor
              }
            },
            e.createElement(
              i,
              {
                tabs: e.createElement(
                  e.Fragment,
                  null,
                  Object.keys(v).map(t =>
                    e.createElement(
                      a,
                      { selected: t === g, onClick: () => _(t) },
                      t
                    )
                  )
                )
              },
              e.createElement(L.a, {
                value: b,
                style: Object.assign(
                  { width: "100%", minHeight: "100%", padding: "8px" },
                  E
                ),
                preClassName: "language-html",
                onValueChange: e => {
                  h(Object.assign(Object.assign({}, v), { [g]: e })),
                    y && y.updateVirtualFileContent(g, e);
                },
                highlight: e => s(e, "html", d)
              })
            ),
            e.createElement(u, { engine: y, currentUri: g })
          );
        };
      };
    },
    258: function(e, t, n) {
      "use strict";
      var r = n(2),
        a = (n(230), n(231), n(0)),
        i = n.n(a),
        o = n(213),
        c = n(255),
        l = n(275),
        s = n(260);
      const u = Object(c.a)({
        React: i.a,
        useState: a.useState,
        useEffect: a.useEffect,
        useRef: a.useRef
      });
      var d = e => {
          const t = Object(s.a)();
          if (e.live) {
            const n = String(e.children)
                .split(/\/\/\s*file:\s*/g)
                .filter(Boolean),
              r = {};
            let a;
            for (const e of n) {
              const t = (e.match(/(.*?\.pc)/) || [, "main.pc"])[1];
              a || (a = t);
              const n = e.replace(t, "").trim();
              r[t] = n;
            }
            return i.a.createElement(
              i.a.Fragment,
              null,
              i.a.createElement(u, { graph: r, defaultUri: a, theme: t })
            );
          }
          return console.log(e), i.a.createElement(l.a, e);
        },
        f = n(9),
        m = n(217),
        p = n(208),
        v = (n(133), n(134)),
        h = n.n(v),
        g = function(e) {
          return function(t) {
            var n,
              r = t.id,
              a = Object(f.a)(t, ["id"]),
              o = Object(p.a)().siteConfig,
              c = (o = void 0 === o ? {} : o).themeConfig,
              l = (c = void 0 === c ? {} : c).navbar,
              s = (l = void 0 === l ? {} : l).hideOnScroll,
              u = void 0 !== s && s;
            return r
              ? i.a.createElement(
                  e,
                  a,
                  i.a.createElement("a", {
                    "aria-hidden": "true",
                    tabIndex: "-1",
                    className: Object(m.a)(
                      "anchor",
                      ((n = {}), (n[h.a.enhancedAnchor] = !u), n)
                    ),
                    id: r
                  }),
                  a.children,
                  i.a.createElement(
                    "a",
                    {
                      "aria-hidden": "true",
                      tabIndex: "-1",
                      className: "hash-link",
                      href: "#" + r,
                      title: "Direct link to heading"
                    },
                    "#"
                  )
                )
              : i.a.createElement(e, a);
          };
        },
        _ = n(135),
        b = n.n(_);
      t.a = {
        code: function(e) {
          var t = e.children;
          return "string" == typeof t
            ? t.includes("\n")
              ? i.a.createElement(d, e)
              : i.a.createElement("code", e)
            : t;
        },
        a: function(e) {
          return /\.[^./]+$/.test(e.href)
            ? i.a.createElement("a", e)
            : i.a.createElement(o.a, e);
        },
        pre: function(e) {
          return i.a.createElement(
            "div",
            Object(r.a)({ className: b.a.mdxCodeBlock }, e)
          );
        },
        h1: g("h1"),
        h2: g("h2"),
        h3: g("h3"),
        h4: g("h4"),
        h5: g("h5"),
        h6: g("h6")
      };
    },
    274: function(e, t, n) {
      "use strict";
      n(77);
      var r = n(0),
        a = n.n(r),
        i = n(217),
        o = n(204),
        c = n(261),
        l = n(213),
        s = n(258),
        u = n(235),
        d = n(139),
        f = n.n(d),
        m = [
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
        var t,
          n,
          r,
          d,
          p,
          v = e.children,
          h = e.frontMatter,
          g = e.metadata,
          _ = e.truncated,
          b = e.isBlogPostPage,
          y = void 0 !== b && b,
          E = g.date,
          S = g.permalink,
          N = g.tags,
          w = g.readingTime,
          A = h.author,
          C = h.title,
          O = h.image,
          k = h.author_url || h.authorURL,
          P = h.author_title || h.authorTitle,
          R = h.author_image_url || h.authorImageURL,
          x = Object(u.a)(O, { absolute: !0 });
        return a.a.createElement(
          a.a.Fragment,
          null,
          a.a.createElement(
            c.a,
            null,
            O &&
              a.a.createElement("meta", { property: "og:image", content: x }),
            O &&
              a.a.createElement("meta", {
                property: "twitter:image",
                content: x
              }),
            O &&
              a.a.createElement("meta", {
                name: "twitter:image:alt",
                content: "Image for " + C
              })
          ),
          a.a.createElement(
            "article",
            { className: y ? void 0 : "margin-bottom--xl" },
            ((t = y ? "h1" : "h2"),
            (n = E.substring(0, 10).split("-")),
            (r = n[0]),
            (d = m[parseInt(n[1], 10) - 1]),
            (p = parseInt(n[2], 10)),
            a.a.createElement(
              "header",
              null,
              a.a.createElement(
                t,
                {
                  className: Object(i.a)("margin-bottom--sm", f.a.blogPostTitle)
                },
                y ? C : a.a.createElement(l.a, { to: S }, C)
              ),
              a.a.createElement(
                "div",
                { className: "margin-vert--md" },
                a.a.createElement(
                  "time",
                  { dateTime: E, className: f.a.blogPostDate },
                  d,
                  " ",
                  p,
                  ", ",
                  r,
                  " ",
                  w &&
                    a.a.createElement(
                      a.a.Fragment,
                      null,
                      " \xb7 ",
                      Math.ceil(w),
                      " min read"
                    )
                )
              ),
              a.a.createElement(
                "div",
                { className: "avatar margin-vert--md" },
                R &&
                  a.a.createElement(
                    "a",
                    {
                      className: "avatar__photo-link avatar__photo",
                      href: k,
                      target: "_blank",
                      rel: "noreferrer noopener"
                    },
                    a.a.createElement("img", { src: R, alt: A })
                  ),
                a.a.createElement(
                  "div",
                  { className: "avatar__intro" },
                  A &&
                    a.a.createElement(
                      a.a.Fragment,
                      null,
                      a.a.createElement(
                        "h4",
                        { className: "avatar__name" },
                        a.a.createElement(
                          "a",
                          {
                            href: k,
                            target: "_blank",
                            rel: "noreferrer noopener"
                          },
                          A
                        )
                      ),
                      a.a.createElement(
                        "small",
                        { className: "avatar__subtitle" },
                        P
                      )
                    )
                )
              )
            )),
            a.a.createElement(
              "section",
              { className: "markdown" },
              a.a.createElement(o.a, { components: s.a }, v)
            ),
            (N.length > 0 || _) &&
              a.a.createElement(
                "footer",
                { className: "row margin-vert--lg" },
                N.length > 0 &&
                  a.a.createElement(
                    "div",
                    { className: "col" },
                    a.a.createElement("strong", null, "Tags:"),
                    N.map(function(e) {
                      var t = e.label,
                        n = e.permalink;
                      return a.a.createElement(
                        l.a,
                        { key: n, className: "margin-horiz--sm", to: n },
                        t
                      );
                    })
                  ),
                _ &&
                  a.a.createElement(
                    "div",
                    { className: "col text--right" },
                    a.a.createElement(
                      l.a,
                      { to: g.permalink, "aria-label": "Read more about " + C },
                      a.a.createElement("strong", null, "Read More")
                    )
                  )
              )
          )
        );
      };
    }
  }
]);
