(window.webpackJsonp = window.webpackJsonp || []).push([
  [23],
  {
    172: function(e, t, n) {
      "use strict";
      n.r(t);
      n(227);
      var r = n(0),
        a = n.n(r),
        i = n(256),
        o = n(274),
        c = n(213);
      t.default = function(e) {
        var t = e.metadata,
          n = e.items,
          r = t.allTagsPath,
          s = t.name,
          l = t.count;
        return a.a.createElement(
          i.a,
          {
            title: 'Posts tagged "' + s + '"',
            description: 'Blog | Tagged "' + s + '"'
          },
          a.a.createElement(
            "div",
            { className: "container margin-vert--lg" },
            a.a.createElement(
              "div",
              { className: "row" },
              a.a.createElement(
                "main",
                { className: "col col--8 col--offset-2" },
                a.a.createElement(
                  "h1",
                  null,
                  l,
                  " ",
                  (function(e, t) {
                    return e > 1 ? t + "s" : t;
                  })(l, "post"),
                  ' tagged with "',
                  s,
                  '"'
                ),
                a.a.createElement(c.a, { href: r }, "View All Tags"),
                a.a.createElement(
                  "div",
                  { className: "margin-vert--xl" },
                  n.map(function(e) {
                    var t = e.content;
                    return a.a.createElement(
                      o.a,
                      {
                        key: t.metadata.permalink,
                        frontMatter: t.frontMatter,
                        metadata: t.metadata,
                        truncated: !0
                      },
                      a.a.createElement(t, null)
                    );
                  })
                )
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
      function s(e, t) {
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
      var l = a.a.createContext({}),
        u = function(e) {
          var t = a.a.useContext(l),
            n = t;
          return e && (n = "function" == typeof e ? e(t) : c(c({}, t), e)), n;
        },
        d = function(e) {
          var t = u(e.components);
          return a.a.createElement(l.Provider, { value: t }, e.children);
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
            l = s(e, ["components", "mdxType", "originalType", "parentName"]),
            d = u(n),
            m = r,
            p = d["".concat(o, ".").concat(m)] || d[m] || f[m] || i;
          return n
            ? a.a.createElement(p, c(c({ ref: t }, l), {}, { components: n }))
            : a.a.createElement(p, c({ ref: t }, l));
        });
      function p(e, t) {
        var n = arguments,
          r = t && t.mdxType;
        if ("string" == typeof e || r) {
          var i = n.length,
            o = new Array(i);
          o[0] = m;
          var c = {};
          for (var s in t) hasOwnProperty.call(t, s) && (c[s] = t[s]);
          (c.originalType = e),
            (c.mdxType = "string" == typeof e ? e : r),
            (o[1] = c);
          for (var l = 2; l < i; l++) o[l] = n[l];
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
        return l;
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
                l = r.dirname(c),
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
                    var t = s(u, f, e, l);
                    if (!r.isAbsolute(t)) return t;
                    var n = r.relative(l, t);
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
        s =
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
              var s = n.replace(c, ""),
                l = r.join(c, s.split("/")[0]) + "/";
              if (!a || -1 === a.indexOf(l)) return s;
            }
            return n;
          }),
        l = function() {};
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
        s = n(207),
        l = n(205),
        u = n(211),
        d = function(e, t, n, r) {
          return new (n || (n = Promise))(function(a, i) {
            function o(e) {
              try {
                s(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
              try {
                s(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
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
            s((r = r.apply(e, t || [])).next());
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
                if (e.kind === l.EngineEventKind.Evaluated) {
                  var t = (r._rendered[e.uri] = Object.assign(
                    Object.assign({}, e.data),
                    { importedSheets: r.getImportedSheets(e) }
                  ));
                  r._dispatch({
                    kind: l.EngineEventKind.Loaded,
                    uri: e.uri,
                    data: t
                  });
                } else if (e.kind === l.EngineEventKind.Diffed) {
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
                          preview: Object(l.patchVirtNode)(
                            a.preview,
                            e.data.mutations
                          )
                        }
                      )),
                      c = [],
                      s = Object(i.a)(a.importedSheets);
                    !(n = s()).done;

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
                      kind: l.EngineEventKind.ChangedSheets,
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
                      return h(t) && o.lstatSync(t).isFile();
                    } catch (n) {
                      return console.error(n), !1;
                    }
                  },
                  resolveFile: Object(l.resolveImportUri)(o)
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
                    t.kind === l.EngineEventKind.Loaded &&
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
        h = function(e) {
          var t = s.fileURLToPath(e),
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
                  for (var s = 0, l = o[a].parts; s < l.length; s++) {
                    var u = l[s];
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
          var s = new URL(c),
            l = JSON.parse(e.readFileSync(s, "utf8")),
            u = r.dirname(i.stripFileProtocol(c)),
            d = a.pathToFileURL(r.normalize(r.join(u, l.sourceDirectory, o)));
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
              return l(e, t, n);
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
                return s(e, t);
              })
              .join("\n") +
            "\n  }"
          );
        },
        s = function(e, t, n) {
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
        l = function(e, t, n) {
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
                  s = a.fileURLToPath(n),
                  l = 0,
                  u = c;
                l < u.length;
                l++
              ) {
                var d = u[l],
                  f = a.fileURLToPath(d),
                  m = r.relative(r.dirname(s), f);
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
                return s(e, n, r, a);
              case "StyleElement":
                return t.createNativeStyleFromSheet(e.sheet, n, r);
              case "Fragment":
                return l(e, n, r);
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
        s = function(e, n, r, a) {
          var o =
              "svg" === e.tagName
                ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
                : a
                ? n.createElementNS(a, e.tagName)
                : n.createElement(e.tagName),
            c = "svg" === e.tagName ? "http://www.w3.org/2000/svg" : a;
          for (var s in e.attributes) {
            var l = e.attributes[s];
            "src" === s && r && (l = l.replace("file:", r));
            var u = i.ATTR_ALIASES[s] || s;
            o.setAttribute(u, l);
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
        l = function(e, n, r) {
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
        s = n(266),
        l = n(222),
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
            var r = l.resolveImportFile(e)(t, n),
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
          return s(e);
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
            for (var c = 0, s = e.attributes; c < s.length; c++) {
              var l = s[c];
              l.kind === a.KeyValueAttribute &&
                l.value &&
                l.value.attrValueKind === i.Slot &&
                l.value.script.jsKind === o.StatementKind.Node &&
                t.flattenNodes(l.value.script, n);
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
            for (var c = 0, s = e.attributes; c < s.length; c++) {
              var l = s[c];
              l.kind == a.KeyValueAttribute &&
              l.value &&
              l.value.attrValueKind === i.Slot
                ? l.value.script.jsKind === o.StatementKind.Node
                  ? t.getNestedReferences(l.value.script, n)
                  : l.value.script.jsKind === o.StatementKind.Reference &&
                    n.push([l.value.script, l.name])
                : l.kind === a.ShorthandAttribute &&
                  l.reference.jsKind === o.StatementKind.Reference
                ? n.push([l.reference, l.reference[0]])
                : l.kind === a.SpreadAttribute &&
                  l.script.jsKind === o.StatementKind.Reference &&
                  n.push([l.script, l.script[0]]);
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
          var r = e.split("\n"), a = -1, i = -1, o = 0, c = 0, s = r.length;
          c < s;
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
          var s = o[a],
            l = t.getVirtTarget(e, s.nodePath),
            u = s.action;
          switch (u.kind) {
            case i.ActionKind.DeleteChild:
              (d = l.children.concat()).splice(u.index, 1),
                (l = r(r({}, l), { children: d }));
              break;
            case i.ActionKind.InsertChild:
              var d;
              (d = l.children.concat()).splice(u.index, 0, u.child),
                (l = r(r({}, l), { children: d }));
              break;
            case i.ActionKind.ReplaceNode:
              l = u.replacement;
              break;
            case i.ActionKind.RemoveAttribute:
              ((f = r({}, l.attributes))[u.name] = void 0),
                (l = r(r({}, l), { attributes: f }));
              break;
            case i.ActionKind.SetAttribute:
              var f;
              ((f = r({}, l.attributes))[u.name] = u.value),
                (l = r(r({}, l), { attributes: f }));
              break;
            case i.ActionKind.SetText:
              l = r(r({}, l), { value: u.value });
              break;
            case i.ActionKind.SourceChanged:
          }
          e = c(e, s.nodePath, l);
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
        s = n(209);
      !(function(e) {
        (e[(e.Removed = 0)] = "Removed"),
          (e[(e.Added = 1)] = "Added"),
          (e[(e.Changed = 2)] = "Changed");
      })((r = t.ChangeKind || (t.ChangeKind = {})));
      var l = { add: r.Added, unlink: r.Removed, change: r.Changed },
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
                s.paperclipSourceGlobPattern(this.config.sourceDirectory),
                { cwd: this.cwd, ignoreInitial: !0 }
              )).on("all", function(t, n) {
                var r = "/" !== n.charAt(0) ? i.join(e.cwd, n) : n,
                  a = l[t];
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
        s = n(254);
      !(function(e) {
        (e.META_CLICK = "META_CLICK"),
          (e.ERROR_BANNER_CLICK = "ERROR_BANNER_CLICK");
      })(r || (r = {}));
      var l = (function() {
        function e(e, t, n) {
          var l = this;
          void 0 === n && (n = document),
            (this.protocol = e),
            (this.targetUri = t),
            (this._domFactory = n),
            (this._dependencies = []),
            (this.onMetaClick = function(e) {
              l._em.addListener(r.META_CLICK, e);
            }),
            (this.onErrorBannerClick = function(e) {
              l._em.addListener(r.ERROR_BANNER_CLICK, e);
            }),
            (this.initialize = function(e) {
              var t = e.sheet,
                n = e.preview,
                r = e.importedSheets;
              u(l._stage),
                u(l._mainStyleContainer),
                u(l._importedStylesContainer),
                (l._virtualRootNode = n);
              var i = a.createNativeNode(n, l._domFactory, l.protocol, null);
              (l._dependencies = r.map(function(e) {
                return e.uri;
              })),
                l._addSheets(r);
              var o = a.createNativeStyleFromSheet(
                t,
                l._domFactory,
                l.protocol
              );
              l._mainStyleContainer.appendChild(o), l._stage.appendChild(i);
            }),
            (this._onErrorBannerClick = function(e) {
              l._clearErrors(), l._em.emit(r.ERROR_BANNER_CLICK, e);
            }),
            (this.handleEngineEvent = function(e) {
              switch ((l._clearErrors(), e.kind)) {
                case i.EngineEventKind.Error:
                  l.handleError(e);
                  break;
                case i.EngineEventKind.ChangedSheets:
                  e.uri === l.targetUri &&
                    ((l._dependencies = e.data.allDependencies),
                    l._addSheets(e.data.newSheets),
                    l._removeSheets(e.data.removedSheetUris));
                  break;
                case i.EngineEventKind.Loaded:
                  e.uri === l.targetUri &&
                    ((l._dependencies = e.data.allDependencies),
                    l.initialize(e.data));
                  break;
                case i.EngineEventKind.Evaluated:
                  if (e.uri === l.targetUri)
                    l._dependencies = e.data.allDependencies;
                  else if (l._dependencies.includes(e.uri)) {
                    (o = l._importedStyles[e.uri]) && o.remove();
                    var t = (l._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      l._domFactory,
                      l.protocol
                    ));
                    l._importedStylesContainer.appendChild(t);
                  }
                  break;
                case i.EngineEventKind.Diffed:
                  if (e.uri === l.targetUri) {
                    if (
                      (s.patchNativeNode(
                        l._stage,
                        e.data.mutations,
                        l._domFactory,
                        l.protocol
                      ),
                      (l._virtualRootNode = i.patchVirtNode(
                        l._virtualRootNode,
                        e.data.mutations
                      )),
                      e.data.sheet)
                    ) {
                      u(l._mainStyleContainer);
                      var n = a.createNativeStyleFromSheet(
                        e.data.sheet,
                        l._domFactory,
                        l.protocol
                      );
                      l._mainStyleContainer.appendChild(n);
                    }
                    for (var r in l._importedStyles) {
                      if (!e.data.allDependencies.includes(r))
                        (n = l._importedStyles[r]).remove(),
                          delete l._importedStyles[r];
                    }
                  } else if (e.data.sheet) {
                    var o;
                    (o = l._importedStyles[e.uri]) && o.remove();
                    var c = (l._importedStyles[
                      e.uri
                    ] = a.createNativeStyleFromSheet(
                      e.data.sheet,
                      l._domFactory,
                      l.protocol
                    ));
                    l._importedStylesContainer.appendChild(c);
                  }
              }
            }),
            (this._onStageMouseDown = function(e) {
              e.preventDefault(), e.stopImmediatePropagation();
              var t = e.target;
              if (1 === t.nodeType && e.metaKey) {
                var n = a.getNativeNodePath(l.mount, t),
                  o = i.getVirtTarget(l._virtualRootNode, n);
                o && l._em.emit(r.META_CLICK, o);
              }
            }),
            (this._onStageMouseOver = function(e) {
              var t = e.target,
                n = t.ownerDocument.defaultView;
              if (1 === t.nodeType && e.metaKey) {
                l.mount.style.cursor = "pointer";
                var r = t.getBoundingClientRect();
                Object.assign(l._hoverOverlay.style, {
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
                ((l.mount.style.cursor = "default"),
                Object.assign(l._hoverOverlay.style, { display: "none" }));
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
      t.Renderer = l;
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
        for (var l = 0, u = t; l < u.length; l++) {
          var d = u[l],
            f = s(e, d),
            m = d.action;
          switch (m.kind) {
            case i.ActionKind.DeleteChild:
              var p = f.childNodes[m.index];
              f.removeChild(p);
              break;
            case i.ActionKind.InsertChild:
              var h = a.createNativeNode(m.child, n, r, f.namespaceURI);
              m.index >= f.childNodes.length
                ? f.appendChild(h)
                : f.insertBefore(h, f.childNodes[m.index]);
              break;
            case i.ActionKind.ReplaceNode:
              var v = f.parentNode;
              v.insertBefore(
                a.createNativeNode(m.replacement, n, r, v.namespaceURI),
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
      var s = function(e, t) {
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
      var s,
        l = n(216),
        u = n.n(l),
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
      function h() {
        return (
          (null !== p && p.buffer === s.memory.buffer) ||
            (p = new Uint8Array(s.memory.buffer)),
          p
        );
      }
      function v(e, t) {
        return m.decode(h().subarray(e, e + t));
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
            h()
              .subarray(a, a + r.length)
              .set(r),
            (S = r.length),
            a
          );
        }
        for (var i = e.length, o = t(i), c = h(), s = 0; s < i; s++) {
          var l = e.charCodeAt(s);
          if (l > 127) break;
          c[o + s] = l;
        }
        if (s !== i) {
          0 !== s && (e = e.slice(s)), (o = n(o, i, (i = s + 3 * e.length)));
          var u = h().subarray(o + s, o + i);
          s += w(e, u).written;
        }
        return (S = s), o;
      }
      function C(e) {
        return null == e;
      }
      var O = null;
      function k() {
        return (
          (null !== O && O.buffer === s.memory.buffer) ||
            (O = new Int32Array(s.memory.buffer)),
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
          s = /\[object ([^\]]+)\]/.exec(toString.call(e));
        if (!(s.length > 1)) return toString.call(e);
        if ("Object" == (c = s[1]))
          try {
            return "Object(" + JSON.stringify(e) + ")";
          } catch (l) {
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
            s.__wbindgen_exn_store(b(t));
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
            (this.ptr = 0), s.__wbg_nativeengine_free(e);
          }),
          (e.new = function(t, n, r) {
            var a = s.nativeengine_new(b(t), b(n), b(r));
            return e.__wrap(a);
          }),
          (t.load = function(e) {
            var t = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              n = S;
            return E(s.nativeengine_load(this.ptr, t, n));
          }),
          (t.run = function(e) {
            var t = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              n = S;
            return E(s.nativeengine_run(this.ptr, t, n));
          }),
          (t.add_listener = function(e) {
            s.nativeengine_add_listener(this.ptr, b(e));
          }),
          (t.get_loaded_ast = function(e) {
            var t = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              n = S;
            return E(s.nativeengine_get_loaded_ast(this.ptr, t, n));
          }),
          (t.parse_content = function(e) {
            var t = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              n = S;
            return E(s.nativeengine_parse_content(this.ptr, t, n));
          }),
          (t.parse_file = function(e) {
            var t = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              n = S;
            return E(s.nativeengine_parse_file(this.ptr, t, n));
          }),
          (t.update_virtual_file_content = function(e, t) {
            var n = A(e, s.__wbindgen_malloc, s.__wbindgen_realloc),
              r = S,
              a = A(t, s.__wbindgen_malloc, s.__wbindgen_realloc),
              i = S;
            s.nativeengine_update_virtual_file_content(this.ptr, n, r, a, i);
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
                        return b(JSON.parse(v(e, t)));
                      }),
                      (n.wbg.__wbindgen_object_drop_ref = function(e) {
                        E(e);
                      }),
                      (n.wbg.__wbindgen_string_new = function(e, t) {
                        return b(v(e, t));
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
                            s.__wbindgen_malloc,
                            s.__wbindgen_realloc
                          ),
                          r = S;
                        (k()[e / 4 + 1] = r), (k()[e / 4 + 0] = n);
                      }),
                      (n.wbg.__wbg_error_4bb6c2a97407129a = function(e, t) {
                        try {
                          console.error(v(e, t));
                        } finally {
                          s.__wbindgen_free(e, t);
                        }
                      }),
                      (n.wbg.__wbindgen_string_get = function(e, t) {
                        var n = y(t),
                          r = "string" == typeof n ? n : void 0,
                          a = C(r)
                            ? 0
                            : A(r, s.__wbindgen_malloc, s.__wbindgen_realloc),
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
                            s.__wbindgen_malloc,
                            s.__wbindgen_realloc
                          ),
                          r = S;
                        (k()[e / 4 + 1] = r), (k()[e / 4 + 0] = n);
                      }),
                      (n.wbg.__wbindgen_throw = function(e, t) {
                        throw new Error(v(e, t));
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
                      (s = a.exports),
                      (K.__wbindgen_wasm_module = i),
                      e.abrupt("return", s)
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
                s(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
              try {
                s(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
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
            s((r = r.apply(e, t || [])).next());
          });
        };
      const J = ({ React: e, useState: t, useEffect: n, useRef: r }) => {
        const s = W()(e => e, { serializer: e => JSON.stringify(e) }),
          l = (t, n, r) =>
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
            const [c, s] = t();
            let l;
            const u = r();
            return (
              n(() => {
                if (!a || !c) return;
                let e;
                l = new B.Renderer("http://", i);
                const t = () =>
                  z(void 0, void 0, void 0, function*() {
                    try {
                      l.initialize(yield a.run(i)),
                        (e = a.onEvent(l.handleEngineEvent));
                    } catch (n) {
                      console.warn(n);
                      const e = a.onEvent(n => {
                        e(), t();
                      });
                    }
                  });
                return (
                  t(),
                  c.appendChild(l.mount),
                  () => {
                    e && e(), c.removeChild(l.mount);
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
                    : t.body) && s(u.current.contentDocument.body);
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
          const p = s(r),
            [h, v] = t(p),
            [g, _] = t(o),
            b = h[g],
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
                  Object.keys(h).map(t =>
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
                  v(Object.assign(Object.assign({}, h), { [g]: e })),
                    y && y.updateVirtualFileContent(g, e);
                },
                highlight: e => l(e, "html", d)
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
        s = n(275),
        l = n(260);
      const u = Object(c.a)({
        React: i.a,
        useState: a.useState,
        useEffect: a.useEffect,
        useRef: a.useRef
      });
      var d = e => {
          const t = Object(l.a)();
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
          return console.log(e), i.a.createElement(s.a, e);
        },
        f = n(9),
        m = n(217),
        p = n(208),
        h = (n(133), n(134)),
        v = n.n(h),
        g = function(e) {
          return function(t) {
            var n,
              r = t.id,
              a = Object(f.a)(t, ["id"]),
              o = Object(p.a)().siteConfig,
              c = (o = void 0 === o ? {} : o).themeConfig,
              s = (c = void 0 === c ? {} : c).navbar,
              l = (s = void 0 === s ? {} : s).hideOnScroll,
              u = void 0 !== l && l;
            return r
              ? i.a.createElement(
                  e,
                  a,
                  i.a.createElement("a", {
                    "aria-hidden": "true",
                    tabIndex: "-1",
                    className: Object(m.a)(
                      "anchor",
                      ((n = {}), (n[v.a.enhancedAnchor] = !u), n)
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
        s = n(213),
        l = n(258),
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
          h = e.children,
          v = e.frontMatter,
          g = e.metadata,
          _ = e.truncated,
          b = e.isBlogPostPage,
          y = void 0 !== b && b,
          E = g.date,
          S = g.permalink,
          N = g.tags,
          w = g.readingTime,
          A = v.author,
          C = v.title,
          O = v.image,
          k = v.author_url || v.authorURL,
          P = v.author_title || v.authorTitle,
          R = v.author_image_url || v.authorImageURL,
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
                y ? C : a.a.createElement(s.a, { to: S }, C)
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
              a.a.createElement(o.a, { components: l.a }, h)
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
                        s.a,
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
                      s.a,
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
