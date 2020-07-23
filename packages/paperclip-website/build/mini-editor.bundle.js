window["__MINI_PC_EDITOR__"] = /******/ (function(modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {}
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ); // Flag the module as loaded
    /******/
    /******/ /******/ module.l = true; // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } // expose the modules object (__webpack_modules__)
  /******/
  /******/
  /******/ /******/ __webpack_require__.m = modules; // expose the module cache
  /******/
  /******/ /******/ __webpack_require__.c = installedModules; // define getter function for harmony exports
  /******/
  /******/ /******/ __webpack_require__.d = function(exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
      /******/
    }
    /******/
  }; // define __esModule on exports
  /******/
  /******/ /******/ __webpack_require__.r = function(exports) {
    /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      /******/ Object.defineProperty(exports, Symbol.toStringTag, {
        value: "Module"
      });
      /******/
    }
    /******/ Object.defineProperty(exports, "__esModule", { value: true });
    /******/
  }; // create a fake namespace object // mode & 1: value is a module id, require it // mode & 2: merge all properties of value into the ns // mode & 4: return value when already ns object // mode & 8|1: behave like require
  /******/
  /******/ /******/ /******/ /******/ /******/ /******/ __webpack_require__.t = function(
    value,
    mode
  ) {
    /******/ if (mode & 1) value = __webpack_require__(value);
    /******/ if (mode & 8) return value;
    /******/ if (
      mode & 4 &&
      typeof value === "object" &&
      value &&
      value.__esModule
    )
      return value;
    /******/ var ns = Object.create(null);
    /******/ __webpack_require__.r(ns);
    /******/ Object.defineProperty(ns, "default", {
      enumerable: true,
      value: value
    });
    /******/ if (mode & 2 && typeof value != "string")
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function(key) {
            return value[key];
          }.bind(null, key)
        );
    /******/ return ns;
    /******/
  }; // getDefaultExport function for compatibility with non-harmony modules
  /******/
  /******/ /******/ __webpack_require__.n = function(module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module["default"];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, "a", getter);
    /******/ return getter;
    /******/
  }; // Object.prototype.hasOwnProperty.call
  /******/
  /******/ /******/ __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }; // __webpack_public_path__
  /******/
  /******/ /******/ __webpack_require__.p = ""; // Load entry module and return exports
  /******/
  /******/
  /******/ /******/ return __webpack_require__(
    (__webpack_require__.s = "./src/index.ts")
  );
  /******/
})(
  /************************************************************************/
  /******/ {
    /***/ "../paperclip-utils/index.js":
      /*!***********************************!*\
  !*** ../paperclip-utils/index.js ***!
  \***********************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(
          /*! ./lib */ "../paperclip-utils/lib/index.js"
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/ast.js":
      /*!*************************************!*\
  !*** ../paperclip-utils/lib/ast.js ***!
  \*************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getNestedReferences = exports.getCompletionItems = exports.traverseExpression = exports.isAttributeValue = exports.isAttribute = exports.isNode = exports.getMixins = exports.isComponentInstance = exports.flattenNodes = exports.hasAttribute = exports.getLogicElement = exports.getDefaultPart = exports.getPartIds = exports.getParts = exports.getVisibleChildNodes = exports.isVisibleNode = exports.isVisibleElement = exports.getStyleElements = exports.getAttributeStringValue = exports.getAttributeValue = exports.getAttribute = exports.getMetaValue = exports.findByNamespace = exports.getChildrenByTagName = exports.getStyleScopeId = exports.getChildren = exports.getImportById = exports.getImportIds = exports.getRelativeFilePath = exports.getImports = exports.DynamicStringAttributeValuePartKind = exports.AttributeValueKind = exports.AttributeKind = exports.NodeKind = void 0;
        var js_ast_1 = __webpack_require__(
          /*! ./js-ast */ "../paperclip-utils/lib/js-ast.js"
        );
        var css_ast_1 = __webpack_require__(
          /*! ./css-ast */ "../paperclip-utils/lib/css-ast.js"
        );
        var crc32 = __webpack_require__(
          /*! crc32 */ "../paperclip-utils/node_modules/crc32/lib/crc32.js"
        );
        var resolve_1 = __webpack_require__(
          /*! ./resolve */ "../paperclip-utils/lib/resolve.js"
        );
        var path = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        var constants_1 = __webpack_require__(
          /*! ./constants */ "../paperclip-utils/lib/constants.js"
        );
        var NodeKind;
        (function(NodeKind) {
          NodeKind["Fragment"] = "Fragment";
          NodeKind["Text"] = "Text";
          NodeKind["Element"] = "Element";
          NodeKind["StyleElement"] = "StyleElement";
          NodeKind["Slot"] = "Slot";
        })((NodeKind = exports.NodeKind || (exports.NodeKind = {})));
        var AttributeKind;
        (function(AttributeKind) {
          AttributeKind["ShorthandAttribute"] = "ShorthandAttribute";
          AttributeKind["KeyValueAttribute"] = "KeyValueAttribute";
          AttributeKind["SpreadAttribute"] = "SpreadAttribute";
          AttributeKind["PropertyBoundAttribute"] = "PropertyBoundAttribute";
        })(
          (AttributeKind =
            exports.AttributeKind || (exports.AttributeKind = {}))
        );
        var AttributeValueKind;
        (function(AttributeValueKind) {
          AttributeValueKind["DyanmicString"] = "DyanmicString";
          AttributeValueKind["String"] = "String";
          AttributeValueKind["Slot"] = "Slot";
        })(
          (AttributeValueKind =
            exports.AttributeValueKind || (exports.AttributeValueKind = {}))
        );
        var DynamicStringAttributeValuePartKind;
        (function(DynamicStringAttributeValuePartKind) {
          DynamicStringAttributeValuePartKind["Literal"] = "Literal";
          DynamicStringAttributeValuePartKind["ClassNamePierce"] =
            "ClassNamePierce";
          DynamicStringAttributeValuePartKind["Slot"] = "Slot";
        })(
          (DynamicStringAttributeValuePartKind =
            exports.DynamicStringAttributeValuePartKind ||
            (exports.DynamicStringAttributeValuePartKind = {}))
        );
        var a = null;
        exports.getImports = function(ast) {
          return exports
            .getChildrenByTagName("import", ast)
            .filter(function(child) {
              return exports.hasAttribute("src", child);
            });
        };
        exports.getRelativeFilePath = function(fs) {
          return function(fromFilePath, importFilePath) {
            var logicPath = resolve_1.resolveImportFile(fs)(
              fromFilePath,
              importFilePath
            );
            var relativePath = path.relative(
              path.dirname(fromFilePath),
              logicPath
            );
            if (relativePath.charAt(0) !== ".") {
              relativePath = "./" + relativePath;
            }
            return relativePath;
          };
        };
        exports.getImportIds = function(ast) {
          return exports
            .getImports(ast)
            .map(function(node) {
              return exports.getAttributeStringValue(
                constants_1.AS_ATTR_NAME,
                node
              );
            })
            .filter(Boolean);
        };
        exports.getImportById = function(id, ast) {
          return exports.getImports(ast).find(function(imp) {
            return (
              exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, imp) ===
              id
            );
          });
        };
        exports.getChildren = function(ast) {
          if (ast.kind === NodeKind.Element || ast.kind === NodeKind.Fragment) {
            return ast.children;
          }
          return [];
        };
        exports.getStyleScopeId = function(filePath) {
          return crc32(filePath);
        };
        exports.getChildrenByTagName = function(tagName, parent) {
          return exports.getChildren(parent).filter(function(child) {
            return child.kind === NodeKind.Element && child.tagName === tagName;
          });
        };
        exports.findByNamespace = function(
          namespace,
          current,
          allChildrenByNamespace
        ) {
          if (allChildrenByNamespace === void 0) {
            allChildrenByNamespace = [];
          }
          if (current.kind === NodeKind.Element) {
            if (current.tagName.split(".")[0] === namespace) {
              allChildrenByNamespace.push(current);
            }
          }
          for (
            var _i = 0, _a = exports.getChildren(current);
            _i < _a.length;
            _i++
          ) {
            var child = _a[_i];
            exports.findByNamespace(namespace, child, allChildrenByNamespace);
          }
          return allChildrenByNamespace;
        };
        exports.getMetaValue = function(name, root) {
          var metaElement = exports
            .getChildrenByTagName("meta", root)
            .find(function(meta) {
              return (
                exports.hasAttribute("src", meta) &&
                exports.getAttributeStringValue("name", meta) === name
              );
            });
          return (
            metaElement &&
            exports.getAttributeStringValue("content", metaElement)
          );
        };
        exports.getAttribute = function(name, element) {
          return element.attributes.find(function(attr) {
            return (
              attr.kind === AttributeKind.KeyValueAttribute &&
              attr.name === name
            );
          });
        };
        exports.getAttributeValue = function(name, element) {
          var attr = exports.getAttribute(name, element);
          return attr && attr.value;
        };
        exports.getAttributeStringValue = function(name, element) {
          var value = exports.getAttributeValue(name, element);
          return (
            value &&
            value.attrValueKind === AttributeValueKind.String &&
            value.value
          );
        };
        exports.getStyleElements = function(ast) {
          return exports.getChildren(ast).filter(function(child) {
            return child.kind === NodeKind.StyleElement;
          });
        };
        exports.isVisibleElement = function(ast) {
          return !/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);
        };
        exports.isVisibleNode = function(node) {
          return (
            node.kind === NodeKind.Text ||
            node.kind === NodeKind.Fragment ||
            node.kind === NodeKind.Slot ||
            (node.kind === NodeKind.Element && exports.isVisibleElement(node))
          );
        };
        exports.getVisibleChildNodes = function(ast) {
          return exports.getChildren(ast).filter(exports.isVisibleNode);
        };
        exports.getParts = function(ast) {
          return exports.getChildren(ast).filter(function(child) {
            return (
              child.kind === NodeKind.Element &&
              exports.hasAttribute("component", child) &&
              exports.hasAttribute(constants_1.AS_ATTR_NAME, child)
            );
          });
        };
        exports.getPartIds = function(ast) {
          return exports
            .getParts(ast)
            .map(function(node) {
              return exports.getAttributeStringValue(
                constants_1.AS_ATTR_NAME,
                node
              );
            })
            .filter(Boolean);
        };
        exports.getDefaultPart = function(ast) {
          return exports.getParts(ast).find(function(part) {
            return (
              exports.getAttributeStringValue(
                constants_1.AS_ATTR_NAME,
                part
              ) === constants_1.DEFAULT_PART_ID
            );
          });
        };
        exports.getLogicElement = function(ast) {
          return exports.getChildren(ast).find(function(child) {
            return (
              child.kind === NodeKind.Element &&
              child.tagName === constants_1.LOGIC_TAG_NAME
            );
          });
        };
        exports.hasAttribute = function(name, element) {
          return exports.getAttribute(name, element) != null;
        };
        exports.flattenNodes = function(node, _allNodes) {
          if (_allNodes === void 0) {
            _allNodes = [];
          }
          _allNodes.push(node);
          if (node.kind === NodeKind.Element) {
            for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
              var attr = _a[_i];
              if (attr.kind === AttributeKind.KeyValueAttribute && attr.value) {
                if (attr.value.attrValueKind === AttributeValueKind.Slot) {
                  if (
                    attr.value.script.jsKind === js_ast_1.StatementKind.Node
                  ) {
                    exports.flattenNodes(attr.value.script, _allNodes);
                  }
                }
              }
            }
          }
          for (
            var _b = 0, _c = exports.getChildren(node);
            _b < _c.length;
            _b++
          ) {
            var child = _c[_b];
            exports.flattenNodes(child, _allNodes);
          }
          return _allNodes;
        };
        exports.isComponentInstance = function(node, importIds) {
          return (
            node.kind === NodeKind.Element &&
            importIds.indexOf(node.tagName.split(".").shift()) !== -1
          );
        };
        var maybeAddReference = function(stmt, _statements) {
          if (_statements === void 0) {
            _statements = [];
          }
          if (stmt.jsKind === js_ast_1.StatementKind.Reference) {
            _statements.push([stmt, null]);
          }
        };
        exports.getMixins = function(ast) {
          var styles = exports.getStyleElements(ast);
          var mixins = {};
          for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
            var style = styles_1[_i];
            css_ast_1.traverseSheet(style.sheet, function(rule) {
              if (
                rule &&
                css_ast_1.isRule(rule) &&
                rule.kind === css_ast_1.RuleKind.Mixin
              ) {
                mixins[rule.name.value] = rule;
              }
            });
          }
          return mixins;
        };
        exports.isNode = function(ast) {
          return NodeKind[ast.kind] != null;
        };
        exports.isAttribute = function(ast) {
          return AttributeKind[ast.kind] != null;
        };
        exports.isAttributeValue = function(ast) {
          return AttributeValueKind[ast.attrValueKind] != null;
        };
        exports.traverseExpression = function(ast, each) {
          if (each(ast) === false) {
            return false;
          }
          if (exports.isNode(ast)) {
            switch (ast.kind) {
              case NodeKind.Element: {
                return (
                  traverseExpressions(ast.attributes, each) &&
                  traverseExpressions(ast.children, each)
                );
              }
              case NodeKind.Fragment: {
                return traverseExpressions(ast.children, each);
              }
              case NodeKind.StyleElement: {
                return css_ast_1.traverseSheet(ast.sheet, each);
              }
            }
          }
          return true;
        };
        exports.getCompletionItems = function(root, position) {
          var parent;
          var previousSibling;
          exports.traverseExpression(root, function(expr) {
            if (!expr.location) {
              console.error("ERRRR", expr);
            }
          });
        };
        var traverseExpressions = function(expressions, each) {
          for (
            var _i = 0, expressions_1 = expressions;
            _i < expressions_1.length;
            _i++
          ) {
            var child = expressions_1[_i];
            if (!exports.traverseExpression(child, each)) {
              return false;
            }
          }
          return true;
        };
        exports.getNestedReferences = function(node, _statements) {
          if (_statements === void 0) {
            _statements = [];
          }
          if (node.kind === NodeKind.Slot) {
            maybeAddReference(node.script, _statements);
          } else {
            if (node.kind === NodeKind.Element) {
              for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
                var attr = _a[_i];
                if (
                  attr.kind == AttributeKind.KeyValueAttribute &&
                  attr.value &&
                  attr.value.attrValueKind === AttributeValueKind.Slot
                ) {
                  if (
                    attr.value.script.jsKind === js_ast_1.StatementKind.Node
                  ) {
                    exports.getNestedReferences(attr.value.script, _statements);
                  } else if (
                    attr.value.script.jsKind ===
                    js_ast_1.StatementKind.Reference
                  ) {
                    _statements.push([attr.value.script, attr.name]);
                  }
                } else if (
                  attr.kind === AttributeKind.ShorthandAttribute &&
                  attr.reference.jsKind === js_ast_1.StatementKind.Reference
                ) {
                  _statements.push([attr.reference, attr.reference[0]]);
                } else if (
                  attr.kind === AttributeKind.SpreadAttribute &&
                  attr.script.jsKind === js_ast_1.StatementKind.Reference
                ) {
                  _statements.push([attr.script, attr.script[0]]);
                }
              }
            }
            for (
              var _b = 0, _c = exports.getChildren(node);
              _b < _c.length;
              _b++
            ) {
              var child = _c[_b];
              if (
                child.kind === NodeKind.Element &&
                exports.hasAttribute(constants_1.PREVIEW_ATTR_NAME, child)
              ) {
                continue;
              }
              exports.getNestedReferences(child, _statements);
            }
          }
          return _statements;
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/base-ast.js":
      /*!******************************************!*\
  !*** ../paperclip-utils/lib/base-ast.js ***!
  \******************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });

        /***/
      },

    /***/ "../paperclip-utils/lib/config.js":
      /*!****************************************!*\
  !*** ../paperclip-utils/lib/config.js ***!
  \****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });

        /***/
      },

    /***/ "../paperclip-utils/lib/constants.js":
      /*!*******************************************!*\
  !*** ../paperclip-utils/lib/constants.js ***!
  \*******************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.LOGIC_TAG_NAME = exports.AS_ATTR_NAME = exports.FRAGMENT_TAG_NAME = exports.PREVIEW_ATTR_NAME = exports.COMPONENT_ATTR_NAME = exports.EXPORT_TAG_NAME = exports.DEFAULT_PART_ID = exports.PC_CONFIG_FILE_NAME = void 0;
        exports.PC_CONFIG_FILE_NAME = "paperclip.config.json";
        exports.DEFAULT_PART_ID = "default";
        exports.EXPORT_TAG_NAME = "export";
        exports.COMPONENT_ATTR_NAME = "component";
        exports.PREVIEW_ATTR_NAME = "preview";
        exports.FRAGMENT_TAG_NAME = "fragment";
        exports.AS_ATTR_NAME = "as";
        // deprecated
        exports.LOGIC_TAG_NAME = "logic";

        /***/
      },

    /***/ "../paperclip-utils/lib/css-ast.js":
      /*!*****************************************!*\
  !*** ../paperclip-utils/lib/css-ast.js ***!
  \*****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getSelectorClassNames = exports.traverseStyleExpression = exports.isIncludeDeclarationPart = exports.isStyleDeclaration = exports.isRule = exports.traverseSheet = exports.getRuleClassNames = exports.getSheetClassNames = exports.StyleDeclarationKind = exports.SelectorKind = exports.RuleKind = void 0;
        var RuleKind;
        (function(RuleKind) {
          RuleKind["Style"] = "Style";
          RuleKind["Charset"] = "Charset";
          RuleKind["Namespace"] = "Namespace";
          RuleKind["FontFace"] = "FontFace";
          RuleKind["Media"] = "Media";
          RuleKind["Mixin"] = "Mixin";
          RuleKind["Export"] = "Export";
          RuleKind["Supports"] = "Supports";
          RuleKind["Page"] = "Page";
          RuleKind["Document"] = "Document";
          RuleKind["Keyframes"] = "Keyframes";
        })((RuleKind = exports.RuleKind || (exports.RuleKind = {})));
        var SelectorKind;
        (function(SelectorKind) {
          SelectorKind["Group"] = "Group";
          SelectorKind["Combo"] = "Combo";
          SelectorKind["Descendent"] = "Descendent";
          SelectorKind["PseudoElement"] = "PseudoElement";
          SelectorKind["PseudoParamElement"] = "PseudoParamElement";
          SelectorKind["Not"] = "Not";
          SelectorKind["Child"] = "Child";
          SelectorKind["Adjacent"] = "Adjacent";
          SelectorKind["Sibling"] = "Sibling";
          SelectorKind["Id"] = "Id";
          SelectorKind["Element"] = "Element";
          SelectorKind["Attribute"] = "Attribute";
          SelectorKind["Class"] = "Class";
          SelectorKind["AllSelector"] = "AllSelector";
        })(
          (SelectorKind = exports.SelectorKind || (exports.SelectorKind = {}))
        );
        var StyleDeclarationKind;
        (function(StyleDeclarationKind) {
          StyleDeclarationKind["KeyValue"] = "KeyValue";
          StyleDeclarationKind["Include"] = "Include";
        })(
          (StyleDeclarationKind =
            exports.StyleDeclarationKind || (exports.StyleDeclarationKind = {}))
        );
        exports.getSheetClassNames = function(sheet, allClassNames) {
          if (allClassNames === void 0) {
            allClassNames = [];
          }
          return getRulesClassNames(sheet.rules, allClassNames);
        };
        var getRulesClassNames = function(rules, allClassNames) {
          if (allClassNames === void 0) {
            allClassNames = [];
          }
          for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            exports.getRuleClassNames(rule, allClassNames);
          }
          return allClassNames;
        };
        exports.getRuleClassNames = function(rule, allClassNames) {
          if (allClassNames === void 0) {
            allClassNames = [];
          }
          switch (rule.kind) {
            case RuleKind.Media: {
              getRulesClassNames(rule.rules, allClassNames);
              break;
            }
            case RuleKind.Style: {
              exports.getSelectorClassNames(rule.selector, allClassNames);
              break;
            }
          }
          return allClassNames;
        };
        exports.traverseSheet = function(sheet, each) {
          return traverseStyleExpressions(sheet.rules, each);
        };
        var traverseStyleExpressions = function(rules, each) {
          for (var _i = 0, rules_2 = rules; _i < rules_2.length; _i++) {
            var rule = rules_2[_i];
            if (!exports.traverseStyleExpression(rule, each)) {
              return false;
            }
          }
          return true;
        };
        exports.isRule = function(expression) {
          return RuleKind[expression.kind] != null;
        };
        exports.isStyleDeclaration = function(expression) {
          return StyleDeclarationKind[expression.declarationKind] != null;
        };
        exports.isIncludeDeclarationPart = function(expression) {
          return expression.name != null;
        };
        exports.traverseStyleExpression = function(rule, each) {
          if (each(rule) === false) {
            return false;
          }
          if (exports.isRule(rule)) {
            switch (rule.kind) {
              case RuleKind.Media: {
                return traverseStyleExpressions(rule.rules, each);
              }
              case RuleKind.Export: {
                return traverseStyleExpressions(rule.rules, each);
              }
              case RuleKind.Style: {
                return (
                  traverseStyleExpressions(rule.declarations, each) &&
                  traverseStyleExpressions(rule.children, each)
                );
              }
              case RuleKind.Mixin: {
                return traverseStyleExpressions(rule.declarations, each);
              }
            }
          } else if (exports.isStyleDeclaration(rule)) {
            switch (rule.declarationKind) {
              case StyleDeclarationKind.Include: {
                for (var _i = 0, _a = rule.mixins; _i < _a.length; _i++) {
                  var mixin = _a[_i];
                  for (var _b = 0, _c = mixin.parts; _b < _c.length; _b++) {
                    var part = _c[_b];
                    if (!exports.traverseStyleExpression(part, each)) {
                      return false;
                    }
                  }
                }
                return true;
              }
            }
          }
          return true;
        };
        exports.getSelectorClassNames = function(selector, allClassNames) {
          if (allClassNames === void 0) {
            allClassNames = [];
          }
          switch (selector.kind) {
            case SelectorKind.Combo:
            case SelectorKind.Group: {
              for (var _i = 0, _a = selector.selectors; _i < _a.length; _i++) {
                var child = _a[_i];
                exports.getSelectorClassNames(child, allClassNames);
              }
              break;
            }
            case SelectorKind.Descendent: {
              exports.getSelectorClassNames(selector.parent, allClassNames);
              exports.getSelectorClassNames(selector.descendent, allClassNames);
              break;
            }
            case SelectorKind.PseudoElement: {
              exports.getSelectorClassNames(selector.target, allClassNames);
              break;
            }
            case SelectorKind.PseudoParamElement: {
              exports.getSelectorClassNames(selector.target, allClassNames);
              break;
            }
            case SelectorKind.Not: {
              exports.getSelectorClassNames(selector.selector, allClassNames);
              break;
            }
            case SelectorKind.Child: {
              exports.getSelectorClassNames(selector.parent, allClassNames);
              exports.getSelectorClassNames(selector.child, allClassNames);
              break;
            }
            case SelectorKind.Adjacent: {
              exports.getSelectorClassNames(selector.selector, allClassNames);
              exports.getSelectorClassNames(
                selector.nextSiblingSelector,
                allClassNames
              );
              break;
            }
            case SelectorKind.Sibling: {
              exports.getSelectorClassNames(selector.selector, allClassNames);
              exports.getSelectorClassNames(
                selector.siblingSelector,
                allClassNames
              );
              break;
            }
            case SelectorKind.Class: {
              allClassNames.push(selector.className);
              break;
            }
          }
          return allClassNames;
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/css-virt.js":
      /*!******************************************!*\
  !*** ../paperclip-utils/lib/css-virt.js ***!
  \******************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.VirtRuleKind = void 0;
        var VirtRuleKind;
        (function(VirtRuleKind) {
          VirtRuleKind["Style"] = "Style";
          VirtRuleKind["Media"] = "Media";
        })(
          (VirtRuleKind = exports.VirtRuleKind || (exports.VirtRuleKind = {}))
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/errors.js":
      /*!****************************************!*\
  !*** ../paperclip-utils/lib/errors.js ***!
  \****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getPrettyMessage = void 0;
        exports.getPrettyMessage = function(_a, content, filePath) {
          var location = _a.location,
            message = _a.message;
          var buffer = "";
          buffer += "Error: " + message + "\n";
          buffer += "In " + filePath + ":\n";
          var _b = getLines(content, location.start, location.end),
            lineStart = _b.lineStart,
            lines = _b.lines;
          buffer +=
            "L" +
            lineStart +
            " " +
            content.substr(location.start, location.end);
          return buffer;
        };
        var getLines = function(content, start, end) {
          var lines = content.split("\n");
          var startLineIndex = -1;
          var endLineIndex = -1;
          var cpos = 0;
          for (var i = 0, length_1 = lines.length; i < length_1; i++) {
            var line = lines[i];
            cpos += line.length;
            if (startLineIndex === -1 && cpos >= start) {
              startLineIndex = i;
            }
            if (startLineIndex !== -1 && endLineIndex === -1 && cpos <= end) {
              endLineIndex = i;
            }
          }
          return {
            lineStart: startLineIndex,
            lines: lines.slice(startLineIndex, endLineIndex + 1)
          };
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/events.js":
      /*!****************************************!*\
  !*** ../paperclip-utils/lib/events.js ***!
  \****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        // TODO  - move all non-specific event stuff to payload, or data prop so that
        // event can remain ephemeral.
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.GraphErrorInfoType = exports.ParseErrorKind = exports.EngineErrorKind = exports.EngineEventKind = void 0;
        var EngineEventKind;
        (function(EngineEventKind) {
          EngineEventKind["Loading"] = "Loading";
          EngineEventKind["Loaded"] = "Loaded";
          EngineEventKind["Updating"] = "Updating";
          EngineEventKind["Evaluated"] = "Evaluated";
          EngineEventKind["Error"] = "Error";
          EngineEventKind["NodeParsed"] = "NodeParsed";
          EngineEventKind["Diffed"] = "Diffed";
          EngineEventKind["ChangedSheets"] = "ChangedSheets";
        })(
          (EngineEventKind =
            exports.EngineEventKind || (exports.EngineEventKind = {}))
        );
        var EngineErrorKind;
        (function(EngineErrorKind) {
          EngineErrorKind["Graph"] = "Graph";
          EngineErrorKind["Runtime"] = "Runtime";
        })(
          (EngineErrorKind =
            exports.EngineErrorKind || (exports.EngineErrorKind = {}))
        );
        var ParseErrorKind;
        (function(ParseErrorKind) {
          ParseErrorKind["EndOfFile"] = "EndOfFile";
        })(
          (ParseErrorKind =
            exports.ParseErrorKind || (exports.ParseErrorKind = {}))
        );
        var GraphErrorInfoType;
        (function(GraphErrorInfoType) {
          GraphErrorInfoType["Syntax"] = "Syntax";
          GraphErrorInfoType["IncludeNotFound"] = "IncludeNotFound";
          GraphErrorInfoType["NotFound"] = "NotFound";
        })(
          (GraphErrorInfoType =
            exports.GraphErrorInfoType || (exports.GraphErrorInfoType = {}))
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/exports.js":
      /*!*****************************************!*\
  !*** ../paperclip-utils/lib/exports.js ***!
  \*****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });

        /***/
      },

    /***/ "../paperclip-utils/lib/graph.js":
      /*!***************************************!*\
  !*** ../paperclip-utils/lib/graph.js ***!
  \***************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.DependencyContentKind = void 0;
        var DependencyContentKind;
        (function(DependencyContentKind) {
          DependencyContentKind["Node"] = "Node";
          DependencyContentKind["Stylsheet"] = "Stylesheet";
        })(
          (DependencyContentKind =
            exports.DependencyContentKind ||
            (exports.DependencyContentKind = {}))
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/index.js":
      /*!***************************************!*\
  !*** ../paperclip-utils/lib/index.js ***!
  \***************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function(o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function() {
                    return m[k];
                  }
                });
              }
            : function(o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function(m, exports) {
            for (var p in m)
              if (p !== "default" && !exports.hasOwnProperty(p))
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, "__esModule", { value: true });
        __exportStar(
          __webpack_require__(
            /*! ./events */ "../paperclip-utils/lib/events.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(/*! ./virt */ "../paperclip-utils/lib/virt.js"),
          exports
        );
        __exportStar(
          __webpack_require__(/*! ./ast */ "../paperclip-utils/lib/ast.js"),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./js-ast */ "../paperclip-utils/lib/js-ast.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./css-ast */ "../paperclip-utils/lib/css-ast.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./base-ast */ "../paperclip-utils/lib/base-ast.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./config */ "../paperclip-utils/lib/config.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./constants */ "../paperclip-utils/lib/constants.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./errors */ "../paperclip-utils/lib/errors.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(/*! ./graph */ "../paperclip-utils/lib/graph.js"),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./resolve */ "../paperclip-utils/lib/resolve.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./stringify-virt-node */ "../paperclip-utils/lib/stringify-virt-node.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./css-virt */ "../paperclip-utils/lib/css-virt.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./virt-patcher */ "../paperclip-utils/lib/virt-patcher.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./exports */ "../paperclip-utils/lib/exports.js"
          ),
          exports
        );
        __exportStar(
          __webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js"),
          exports
        );
        __exportStar(
          __webpack_require__(
            /*! ./source-watcher */ "../paperclip-utils/lib/source-watcher.js"
          ),
          exports
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/js-ast.js":
      /*!****************************************!*\
  !*** ../paperclip-utils/lib/js-ast.js ***!
  \****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.StatementKind = void 0;
        var StatementKind;
        (function(StatementKind) {
          StatementKind["Node"] = "Node";
          StatementKind["Reference"] = "Reference";
          StatementKind["Array"] = "Array";
          StatementKind["Object"] = "Object";
          StatementKind["String"] = "String";
          StatementKind["Number"] = "Number";
          StatementKind["Boolean"] = "Boolean";
        })(
          (StatementKind =
            exports.StatementKind || (exports.StatementKind = {}))
        );

        /***/
      },

    /***/ "../paperclip-utils/lib/resolve.js":
      /*!*****************************************!*\
  !*** ../paperclip-utils/lib/resolve.js ***!
  \*****************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.findPCConfigUrl = exports.resolveImportFile = exports.resolveImportUri = void 0;
        var path = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
        var utils_1 = __webpack_require__(
          /*! ./utils */ "../paperclip-utils/lib/utils.js"
        );
        var constants_1 = __webpack_require__(
          /*! ./constants */ "../paperclip-utils/lib/constants.js"
        );
        exports.resolveImportUri = function(fs) {
          return function(fromPath, toPath) {
            var filePath = exports.resolveImportFile(fs)(fromPath, toPath);
            return filePath;
          };
        };
        exports.resolveImportFile = function(fs) {
          return function(fromPath, toPath) {
            try {
              if (/\w+:\/\//.test(toPath)) {
                return toPath;
              }
              if (toPath.charAt(0) !== ".") {
                var uri = resolveModule(fs)(fromPath, toPath);
                if (!uri) {
                  throw new Error("module " + toPath + " not found");
                }
                return uri;
              }
              return url.resolve(fromPath, toPath);
            } catch (e) {
              return null;
            }
          };
        };
        var resolveModule = function(fs) {
          return function(fromPath, moduleRelativePath) {
            var configUrl = exports.findPCConfigUrl(fs)(fromPath);
            if (!configUrl) return null;
            var uri = new URL(configUrl);
            // need to parse each time in case config changed.
            var config = JSON.parse(fs.readFileSync(uri, "utf8"));
            var configPathDir = path.dirname(
              utils_1.stripFileProtocol(configUrl)
            );
            var moduleFileUrl = url.pathToFileURL(
              path.normalize(
                path.join(
                  configPathDir,
                  config.sourceDirectory,
                  moduleRelativePath
                )
              )
            );
            if (fs.existsSync(moduleFileUrl)) {
              // Need to follow symlinks
              return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
            }
            return null;
          };
        };
        exports.findPCConfigUrl = function(fs) {
          return function(fromUri) {
            var cdir = utils_1.stripFileProtocol(fromUri);
            // can't cache in case PC config was moved.
            do {
              var configUrl = url.pathToFileURL(
                path.join(cdir, constants_1.PC_CONFIG_FILE_NAME)
              );
              if (fs.existsSync(configUrl)) {
                return configUrl.href;
              }
              cdir = path.dirname(cdir);
            } while (cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir));
            return null;
          };
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/source-watcher.js":
      /*!************************************************!*\
  !*** ../paperclip-utils/lib/source-watcher.js ***!
  \************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.PaperclipSourceWatcher = exports.ChangeKind = void 0;
        var chokidar = __webpack_require__(/*! chokidar */ "fs");
        var path = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
        var events_1 = __webpack_require__(
          /*! events */ "./node_modules/events/events.js"
        );
        var utils_1 = __webpack_require__(
          /*! ./utils */ "../paperclip-utils/lib/utils.js"
        );
        var ChangeKind;
        (function(ChangeKind) {
          ChangeKind[(ChangeKind["Removed"] = 0)] = "Removed";
          ChangeKind[(ChangeKind["Added"] = 1)] = "Added";
          ChangeKind[(ChangeKind["Changed"] = 2)] = "Changed";
        })((ChangeKind = exports.ChangeKind || (exports.ChangeKind = {})));
        var CHOKIDAR_EVENT_MAP = {
          add: ChangeKind.Added,
          unlink: ChangeKind.Removed,
          change: ChangeKind.Changed
        };
        var PaperclipSourceWatcher = /** @class */ (function() {
          function PaperclipSourceWatcher(config, cwd) {
            this.config = config;
            this.cwd = cwd;
            this._em = new events_1.EventEmitter();
            this._init();
          }
          PaperclipSourceWatcher.prototype.onChange = function(listener) {
            var _this = this;
            this._em.on("change", listener);
            return function() {
              return _this._em.off("change", listener);
            };
          };
          PaperclipSourceWatcher.prototype.dispose = function() {
            this._watcher.close();
          };
          PaperclipSourceWatcher.prototype._init = function() {
            var _this = this;
            var watcher = (this._watcher = chokidar.watch(
              utils_1.paperclipSourceGlobPattern(this.config.sourceDirectory),
              { cwd: this.cwd, ignoreInitial: true }
            ));
            watcher.on("all", function(eventName, relativePath) {
              var filePath =
                relativePath.charAt(0) !== "/"
                  ? path.join(_this.cwd, relativePath)
                  : relativePath;
              var changeKind = CHOKIDAR_EVENT_MAP[eventName];
              if (changeKind) {
                _this._em.emit(
                  "change",
                  changeKind,
                  url.pathToFileURL(filePath).href
                );
              }
            });
          };
          return PaperclipSourceWatcher;
        })();
        exports.PaperclipSourceWatcher = PaperclipSourceWatcher;

        /***/
      },

    /***/ "../paperclip-utils/lib/stringify-sheet.js":
      /*!*************************************************!*\
  !*** ../paperclip-utils/lib/stringify-sheet.js ***!
  \*************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.stringifyCSSSheet = void 0;
        var path = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
        exports.stringifyCSSSheet = function(sheet, protocol, uri) {
          return sheet.rules
            .map(function(rule) {
              return stringifyCSSRule(rule, protocol, uri);
            })
            .join("\n");
        };
        var stringifyCSSRule = function(rule, protocol, uri) {
          switch (rule.kind) {
            case "Style":
              return stringifyStyleRule(rule, protocol, uri);
            case "Page":
            case "Supports":
            case "Media":
              return stringifyConditionRule(rule, protocol, uri);
            case "FontFace":
              return stringifyFontFaceRule(rule, protocol, uri);
            case "Keyframes":
              return stringifyKeyframesRule(rule, protocol);
          }
        };
        var stringifyConditionRule = function(_a, protocol, uri) {
          var name = _a.name,
            condition_text = _a.condition_text,
            rules = _a.rules;
          return (
            "@" +
            name +
            " " +
            condition_text +
            " {\n    " +
            rules
              .map(function(style) {
                return stringifyStyleRule(style, protocol, uri);
              })
              .join("\n") +
            "\n  }"
          );
        };
        var stringifyKeyframesRule = function(_a, protocol, uri) {
          var name = _a.name,
            rules = _a.rules;
          return (
            "@keyframes " +
            name +
            " {\n    " +
            rules
              .map(function(style) {
                return stringifyKeyframeRule(style, protocol);
              })
              .join("\n") +
            "\n  }"
          );
        };
        var stringifyKeyframeRule = function(_a, protocol, uri) {
          var key = _a.key,
            style = _a.style;
          return (
            key +
            " {\n    " +
            style
              .map(function(style) {
                return stringifyStyle(style, protocol, uri);
              })
              .join("\n") +
            "\n  }"
          );
        };
        var stringifyFontFaceRule = function(_a, protocol, uri) {
          var style = _a.style;
          return (
            "@font-face {\n    " +
            style
              .map(function(style) {
                return stringifyStyle(style, protocol, uri);
              })
              .join("\n") +
            "\n  }"
          );
        };
        var stringifyStyleRule = function(_a, protocol, uri) {
          var selector_text = _a.selector_text,
            style = _a.style;
          return (
            selector_text +
            " {\n    " +
            style
              .map(function(style) {
                return stringifyStyle(style, protocol, uri);
              })
              .join("\n") +
            "\n  }"
          );
        };
        var stringifyStyle = function(_a, protocol, uri) {
          var name = _a.name,
            value = _a.value;
          if (value) {
            // required for bundling, otherwise file protocol is maintained
            if (uri) {
              var urls = value.match(/(file:\/\/.*?)(?=['")])/g) || [];
              var selfPathname = url.fileURLToPath(uri);
              for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var foundUrl = urls_1[_i];
                var pathname = url.fileURLToPath(foundUrl);
                var relativePath = path.relative(
                  path.dirname(selfPathname),
                  pathname
                );
                if (relativePath.charAt(0) !== ".") {
                  relativePath = "./" + relativePath;
                }
                value = value.replace(foundUrl, relativePath);
              }
            }
            if (protocol) {
              value = value.replace(/file:/, protocol);
            }
          }
          return name + ":" + value + ";";
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/stringify-virt-node.js":
      /*!*****************************************************!*\
  !*** ../paperclip-utils/lib/stringify-virt-node.js ***!
  \*****************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.stringifyVirtualNode = void 0;
        var stringify_sheet_1 = __webpack_require__(
          /*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js"
        );
        var html_entities_1 = __webpack_require__(
          /*! html-entities */ "../paperclip-utils/node_modules/html-entities/lib/index.js"
        );
        var entities = new html_entities_1.Html5Entities();
        exports.stringifyVirtualNode = function(node) {
          switch (node.kind) {
            case "Fragment":
              return stringifyChildren(node);
            case "Element": {
              var buffer = "<" + node.tagName;
              for (var key in node.attributes) {
                var value = node.attributes[key];
                if (value) {
                  buffer += " " + key + '="' + value + '"';
                } else {
                  buffer += " " + key;
                }
              }
              buffer +=
                ">" + stringifyChildren(node) + "</" + node.tagName + ">";
              return buffer;
            }
            case "StyleElement": {
              return (
                "<style>" +
                stringify_sheet_1.stringifyCSSSheet(node.sheet, null) +
                "</style>"
              );
            }
            case "Text": {
              return entities.decode(node.value);
            }
            default: {
              throw new Error("can't handle " + node.kind);
            }
          }
        };
        var stringifyChildren = function(node) {
          return node.children.map(exports.stringifyVirtualNode).join("");
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/utils.js":
      /*!***************************************!*\
  !*** ../paperclip-utils/lib/utils.js ***!
  \***************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.paperclipSourceGlobPattern = exports.stripFileProtocol = void 0;
        var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
        exports.stripFileProtocol = function(filePath) {
          return filePath.includes("file://")
            ? url.fileURLToPath(filePath)
            : filePath;
        };
        exports.paperclipSourceGlobPattern = function(dir) {
          return dir === "." ? "**/*.pc" : dir + "/**/*.pc";
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/virt-mtuation.js":
      /*!***********************************************!*\
  !*** ../paperclip-utils/lib/virt-mtuation.js ***!
  \***********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.ActionKind = void 0;
        var ActionKind;
        (function(ActionKind) {
          ActionKind["ReplaceNode"] = "ReplaceNode";
          ActionKind["InsertChild"] = "InsertChild";
          ActionKind["DeleteChild"] = "DeleteChild";
          ActionKind["SetAttribute"] = "SetAttribute";
          ActionKind["SourceChanged"] = "SourceChanged";
          ActionKind["SourceUriChanged"] = "SourceUriChanged";
          ActionKind["SetText"] = "SetText";
          ActionKind["RemoveAttribute"] = "RemoveAttribute";
        })((ActionKind = exports.ActionKind || (exports.ActionKind = {})));

        /***/
      },

    /***/ "../paperclip-utils/lib/virt-patcher.js":
      /*!**********************************************!*\
  !*** ../paperclip-utils/lib/virt-patcher.js ***!
  \**********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        var __assign =
          (this && this.__assign) ||
          function() {
            __assign =
              Object.assign ||
              function(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                  s = arguments[i];
                  for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
              };
            return __assign.apply(this, arguments);
          };
        var __spreadArrays =
          (this && this.__spreadArrays) ||
          function() {
            for (var s = 0, i = 0, il = arguments.length; i < il; i++)
              s += arguments[i].length;
            for (var r = Array(s), k = 0, i = 0; i < il; i++)
              for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
            return r;
          };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getVirtTarget = exports.patchVirtNode = void 0;
        var virt_mtuation_1 = __webpack_require__(
          /*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js"
        );
        var virt_1 = __webpack_require__(
          /*! ./virt */ "../paperclip-utils/lib/virt.js"
        );
        exports.patchVirtNode = function(root, mutations) {
          for (
            var _i = 0, mutations_1 = mutations;
            _i < mutations_1.length;
            _i++
          ) {
            var mutation = mutations_1[_i];
            var target = exports.getVirtTarget(root, mutation.nodePath);
            var action = mutation.action;
            switch (action.kind) {
              case virt_mtuation_1.ActionKind.DeleteChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 1);
                target = __assign(__assign({}, target), { children: children });
                break;
              }
              case virt_mtuation_1.ActionKind.InsertChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 0, action.child);
                target = __assign(__assign({}, target), { children: children });
                break;
              }
              case virt_mtuation_1.ActionKind.ReplaceNode: {
                target = action.replacement;
                break;
              }
              case virt_mtuation_1.ActionKind.RemoveAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = undefined;
                target = __assign(__assign({}, target), {
                  attributes: attributes
                });
                break;
              }
              case virt_mtuation_1.ActionKind.SetAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = action.value;
                target = __assign(__assign({}, target), {
                  attributes: attributes
                });
                break;
              }
              case virt_mtuation_1.ActionKind.SetText: {
                target = __assign(__assign({}, target), {
                  value: action.value
                });
                break;
              }
              case virt_mtuation_1.ActionKind.SourceChanged: {
                var element = target;
                // target = {...element, a: element.attributes}
              }
            }
            root = updateNode(root, mutation.nodePath, target);
          }
          return root;
        };
        exports.getVirtTarget = function(mount, nodePath) {
          return nodePath.reduce(function(current, i) {
            return current.children[i];
          }, mount);
        };
        var updateNode = function(ancestor, nodePath, newNode, depth) {
          if (depth === void 0) {
            depth = 0;
          }
          if (depth === nodePath.length) {
            return newNode;
          }
          if (
            ancestor.kind === virt_1.VirtualNodeKind.Text ||
            ancestor.kind === virt_1.VirtualNodeKind.StyleElement
          ) {
            return newNode;
          }
          return __assign(__assign({}, ancestor), {
            children: __spreadArrays(
              ancestor.children.slice(0, nodePath[depth]),
              [
                updateNode(
                  ancestor.children[nodePath[depth]],
                  nodePath,
                  newNode,
                  depth + 1
                )
              ],
              ancestor.children.slice(nodePath[depth] + 1)
            )
          });
        };

        /***/
      },

    /***/ "../paperclip-utils/lib/virt.js":
      /*!**************************************!*\
  !*** ../paperclip-utils/lib/virt.js ***!
  \**************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.VirtualNodeKind = void 0;
        var VirtualNodeKind;
        (function(VirtualNodeKind) {
          VirtualNodeKind["Element"] = "Element";
          VirtualNodeKind["Text"] = "Text";
          VirtualNodeKind["Fragment"] = "Fragment";
          VirtualNodeKind["StyleElement"] = "StyleElement";
        })(
          (VirtualNodeKind =
            exports.VirtualNodeKind || (exports.VirtualNodeKind = {}))
        );

        /***/
      },

    /***/ "../paperclip-utils/node_modules/crc32/lib/crc32.js":
      /*!**********************************************************!*\
  !*** ../paperclip-utils/node_modules/crc32/lib/crc32.js ***!
  \**********************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        (function() {
          "use strict";

          var table = [],
            poly = 0xedb88320; // reverse polynomial

          // build the table
          function makeTable() {
            var c, n, k;

            for (n = 0; n < 256; n += 1) {
              c = n;
              for (k = 0; k < 8; k += 1) {
                if (c & 1) {
                  c = poly ^ (c >>> 1);
                } else {
                  c = c >>> 1;
                }
              }
              table[n] = c >>> 0;
            }
          }

          function strToArr(str) {
            // sweet hack to turn string into a 'byte' array
            return Array.prototype.map.call(str, function(c) {
              return c.charCodeAt(0);
            });
          }

          /*
           * Compute CRC of array directly.
           *
           * This is slower for repeated calls, so append mode is not supported.
           */
          function crcDirect(arr) {
            var crc = -1, // initial contents of LFBSR
              i,
              j,
              l,
              temp;

            for (i = 0, l = arr.length; i < l; i += 1) {
              temp = (crc ^ arr[i]) & 0xff;

              // read 8 bits one at a time
              for (j = 0; j < 8; j += 1) {
                if ((temp & 1) === 1) {
                  temp = (temp >>> 1) ^ poly;
                } else {
                  temp = temp >>> 1;
                }
              }
              crc = (crc >>> 8) ^ temp;
            }

            // flip bits
            return crc ^ -1;
          }

          /*
           * Compute CRC with the help of a pre-calculated table.
           *
           * This supports append mode, if the second parameter is set.
           */
          function crcTable(arr, append) {
            var crc, i, l;

            // if we're in append mode, don't reset crc
            // if arr is null or undefined, reset table and return
            if (typeof crcTable.crc === "undefined" || !append || !arr) {
              crcTable.crc = 0 ^ -1;

              if (!arr) {
                return;
              }
            }

            // store in temp variable for minor speed gain
            crc = crcTable.crc;

            for (i = 0, l = arr.length; i < l; i += 1) {
              crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
            }

            crcTable.crc = crc;

            return crc ^ -1;
          }

          // build the table
          // this isn't that costly, and most uses will be for table assisted mode
          makeTable();

          module.exports = function(val, direct) {
            var val = typeof val === "string" ? strToArr(val) : val,
              ret = direct ? crcDirect(val) : crcTable(val);

            // convert to 2's complement hex
            return (ret >>> 0).toString(16);
          };
          module.exports.direct = crcDirect;
          module.exports.table = crcTable;
        })();

        /***/
      },

    /***/ "../paperclip-utils/node_modules/html-entities/lib/html4-entities.js":
      /*!***************************************************************************!*\
  !*** ../paperclip-utils/node_modules/html-entities/lib/html4-entities.js ***!
  \***************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var HTML_ALPHA = [
          "apos",
          "nbsp",
          "iexcl",
          "cent",
          "pound",
          "curren",
          "yen",
          "brvbar",
          "sect",
          "uml",
          "copy",
          "ordf",
          "laquo",
          "not",
          "shy",
          "reg",
          "macr",
          "deg",
          "plusmn",
          "sup2",
          "sup3",
          "acute",
          "micro",
          "para",
          "middot",
          "cedil",
          "sup1",
          "ordm",
          "raquo",
          "frac14",
          "frac12",
          "frac34",
          "iquest",
          "Agrave",
          "Aacute",
          "Acirc",
          "Atilde",
          "Auml",
          "Aring",
          "Aelig",
          "Ccedil",
          "Egrave",
          "Eacute",
          "Ecirc",
          "Euml",
          "Igrave",
          "Iacute",
          "Icirc",
          "Iuml",
          "ETH",
          "Ntilde",
          "Ograve",
          "Oacute",
          "Ocirc",
          "Otilde",
          "Ouml",
          "times",
          "Oslash",
          "Ugrave",
          "Uacute",
          "Ucirc",
          "Uuml",
          "Yacute",
          "THORN",
          "szlig",
          "agrave",
          "aacute",
          "acirc",
          "atilde",
          "auml",
          "aring",
          "aelig",
          "ccedil",
          "egrave",
          "eacute",
          "ecirc",
          "euml",
          "igrave",
          "iacute",
          "icirc",
          "iuml",
          "eth",
          "ntilde",
          "ograve",
          "oacute",
          "ocirc",
          "otilde",
          "ouml",
          "divide",
          "oslash",
          "ugrave",
          "uacute",
          "ucirc",
          "uuml",
          "yacute",
          "thorn",
          "yuml",
          "quot",
          "amp",
          "lt",
          "gt",
          "OElig",
          "oelig",
          "Scaron",
          "scaron",
          "Yuml",
          "circ",
          "tilde",
          "ensp",
          "emsp",
          "thinsp",
          "zwnj",
          "zwj",
          "lrm",
          "rlm",
          "ndash",
          "mdash",
          "lsquo",
          "rsquo",
          "sbquo",
          "ldquo",
          "rdquo",
          "bdquo",
          "dagger",
          "Dagger",
          "permil",
          "lsaquo",
          "rsaquo",
          "euro",
          "fnof",
          "Alpha",
          "Beta",
          "Gamma",
          "Delta",
          "Epsilon",
          "Zeta",
          "Eta",
          "Theta",
          "Iota",
          "Kappa",
          "Lambda",
          "Mu",
          "Nu",
          "Xi",
          "Omicron",
          "Pi",
          "Rho",
          "Sigma",
          "Tau",
          "Upsilon",
          "Phi",
          "Chi",
          "Psi",
          "Omega",
          "alpha",
          "beta",
          "gamma",
          "delta",
          "epsilon",
          "zeta",
          "eta",
          "theta",
          "iota",
          "kappa",
          "lambda",
          "mu",
          "nu",
          "xi",
          "omicron",
          "pi",
          "rho",
          "sigmaf",
          "sigma",
          "tau",
          "upsilon",
          "phi",
          "chi",
          "psi",
          "omega",
          "thetasym",
          "upsih",
          "piv",
          "bull",
          "hellip",
          "prime",
          "Prime",
          "oline",
          "frasl",
          "weierp",
          "image",
          "real",
          "trade",
          "alefsym",
          "larr",
          "uarr",
          "rarr",
          "darr",
          "harr",
          "crarr",
          "lArr",
          "uArr",
          "rArr",
          "dArr",
          "hArr",
          "forall",
          "part",
          "exist",
          "empty",
          "nabla",
          "isin",
          "notin",
          "ni",
          "prod",
          "sum",
          "minus",
          "lowast",
          "radic",
          "prop",
          "infin",
          "ang",
          "and",
          "or",
          "cap",
          "cup",
          "int",
          "there4",
          "sim",
          "cong",
          "asymp",
          "ne",
          "equiv",
          "le",
          "ge",
          "sub",
          "sup",
          "nsub",
          "sube",
          "supe",
          "oplus",
          "otimes",
          "perp",
          "sdot",
          "lceil",
          "rceil",
          "lfloor",
          "rfloor",
          "lang",
          "rang",
          "loz",
          "spades",
          "clubs",
          "hearts",
          "diams"
        ];
        var HTML_CODES = [
          39,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          174,
          175,
          176,
          177,
          178,
          179,
          180,
          181,
          182,
          183,
          184,
          185,
          186,
          187,
          188,
          189,
          190,
          191,
          192,
          193,
          194,
          195,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          210,
          211,
          212,
          213,
          214,
          215,
          216,
          217,
          218,
          219,
          220,
          221,
          222,
          223,
          224,
          225,
          226,
          227,
          228,
          229,
          230,
          231,
          232,
          233,
          234,
          235,
          236,
          237,
          238,
          239,
          240,
          241,
          242,
          243,
          244,
          245,
          246,
          247,
          248,
          249,
          250,
          251,
          252,
          253,
          254,
          255,
          34,
          38,
          60,
          62,
          338,
          339,
          352,
          353,
          376,
          710,
          732,
          8194,
          8195,
          8201,
          8204,
          8205,
          8206,
          8207,
          8211,
          8212,
          8216,
          8217,
          8218,
          8220,
          8221,
          8222,
          8224,
          8225,
          8240,
          8249,
          8250,
          8364,
          402,
          913,
          914,
          915,
          916,
          917,
          918,
          919,
          920,
          921,
          922,
          923,
          924,
          925,
          926,
          927,
          928,
          929,
          931,
          932,
          933,
          934,
          935,
          936,
          937,
          945,
          946,
          947,
          948,
          949,
          950,
          951,
          952,
          953,
          954,
          955,
          956,
          957,
          958,
          959,
          960,
          961,
          962,
          963,
          964,
          965,
          966,
          967,
          968,
          969,
          977,
          978,
          982,
          8226,
          8230,
          8242,
          8243,
          8254,
          8260,
          8472,
          8465,
          8476,
          8482,
          8501,
          8592,
          8593,
          8594,
          8595,
          8596,
          8629,
          8656,
          8657,
          8658,
          8659,
          8660,
          8704,
          8706,
          8707,
          8709,
          8711,
          8712,
          8713,
          8715,
          8719,
          8721,
          8722,
          8727,
          8730,
          8733,
          8734,
          8736,
          8743,
          8744,
          8745,
          8746,
          8747,
          8756,
          8764,
          8773,
          8776,
          8800,
          8801,
          8804,
          8805,
          8834,
          8835,
          8836,
          8838,
          8839,
          8853,
          8855,
          8869,
          8901,
          8968,
          8969,
          8970,
          8971,
          9001,
          9002,
          9674,
          9824,
          9827,
          9829,
          9830
        ];
        var alphaIndex = {};
        var numIndex = {};
        (function() {
          var i = 0;
          var length = HTML_ALPHA.length;
          while (i < length) {
            var a = HTML_ALPHA[i];
            var c = HTML_CODES[i];
            alphaIndex[a] = String.fromCharCode(c);
            numIndex[c] = a;
            i++;
          }
        })();
        var Html4Entities = /** @class */ (function() {
          function Html4Entities() {}
          Html4Entities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
              var chr;
              if (entity.charAt(0) === "#") {
                var code =
                  entity.charAt(1).toLowerCase() === "x"
                    ? parseInt(entity.substr(2), 16)
                    : parseInt(entity.substr(1));
                if (!(isNaN(code) || code < -32768 || code > 65535)) {
                  chr = String.fromCharCode(code);
                }
              } else {
                chr = alphaIndex[entity];
              }
              return chr || s;
            });
          };
          Html4Entities.decode = function(str) {
            return new Html4Entities().decode(str);
          };
          Html4Entities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var alpha = numIndex[str.charCodeAt(i)];
              result += alpha ? "&" + alpha + ";" : str.charAt(i);
              i++;
            }
            return result;
          };
          Html4Entities.encode = function(str) {
            return new Html4Entities().encode(str);
          };
          Html4Entities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var cc = str.charCodeAt(i);
              var alpha = numIndex[cc];
              if (alpha) {
                result += "&" + alpha + ";";
              } else if (cc < 32 || cc > 126) {
                result += "&#" + cc + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          Html4Entities.encodeNonUTF = function(str) {
            return new Html4Entities().encodeNonUTF(str);
          };
          Html4Entities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          Html4Entities.encodeNonASCII = function(str) {
            return new Html4Entities().encodeNonASCII(str);
          };
          return Html4Entities;
        })();
        exports.Html4Entities = Html4Entities;

        /***/
      },

    /***/ "../paperclip-utils/node_modules/html-entities/lib/html5-entities.js":
      /*!***************************************************************************!*\
  !*** ../paperclip-utils/node_modules/html-entities/lib/html5-entities.js ***!
  \***************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var ENTITIES = [
          ["Aacute", [193]],
          ["aacute", [225]],
          ["Abreve", [258]],
          ["abreve", [259]],
          ["ac", [8766]],
          ["acd", [8767]],
          ["acE", [8766, 819]],
          ["Acirc", [194]],
          ["acirc", [226]],
          ["acute", [180]],
          ["Acy", [1040]],
          ["acy", [1072]],
          ["AElig", [198]],
          ["aelig", [230]],
          ["af", [8289]],
          ["Afr", [120068]],
          ["afr", [120094]],
          ["Agrave", [192]],
          ["agrave", [224]],
          ["alefsym", [8501]],
          ["aleph", [8501]],
          ["Alpha", [913]],
          ["alpha", [945]],
          ["Amacr", [256]],
          ["amacr", [257]],
          ["amalg", [10815]],
          ["amp", [38]],
          ["AMP", [38]],
          ["andand", [10837]],
          ["And", [10835]],
          ["and", [8743]],
          ["andd", [10844]],
          ["andslope", [10840]],
          ["andv", [10842]],
          ["ang", [8736]],
          ["ange", [10660]],
          ["angle", [8736]],
          ["angmsdaa", [10664]],
          ["angmsdab", [10665]],
          ["angmsdac", [10666]],
          ["angmsdad", [10667]],
          ["angmsdae", [10668]],
          ["angmsdaf", [10669]],
          ["angmsdag", [10670]],
          ["angmsdah", [10671]],
          ["angmsd", [8737]],
          ["angrt", [8735]],
          ["angrtvb", [8894]],
          ["angrtvbd", [10653]],
          ["angsph", [8738]],
          ["angst", [197]],
          ["angzarr", [9084]],
          ["Aogon", [260]],
          ["aogon", [261]],
          ["Aopf", [120120]],
          ["aopf", [120146]],
          ["apacir", [10863]],
          ["ap", [8776]],
          ["apE", [10864]],
          ["ape", [8778]],
          ["apid", [8779]],
          ["apos", [39]],
          ["ApplyFunction", [8289]],
          ["approx", [8776]],
          ["approxeq", [8778]],
          ["Aring", [197]],
          ["aring", [229]],
          ["Ascr", [119964]],
          ["ascr", [119990]],
          ["Assign", [8788]],
          ["ast", [42]],
          ["asymp", [8776]],
          ["asympeq", [8781]],
          ["Atilde", [195]],
          ["atilde", [227]],
          ["Auml", [196]],
          ["auml", [228]],
          ["awconint", [8755]],
          ["awint", [10769]],
          ["backcong", [8780]],
          ["backepsilon", [1014]],
          ["backprime", [8245]],
          ["backsim", [8765]],
          ["backsimeq", [8909]],
          ["Backslash", [8726]],
          ["Barv", [10983]],
          ["barvee", [8893]],
          ["barwed", [8965]],
          ["Barwed", [8966]],
          ["barwedge", [8965]],
          ["bbrk", [9141]],
          ["bbrktbrk", [9142]],
          ["bcong", [8780]],
          ["Bcy", [1041]],
          ["bcy", [1073]],
          ["bdquo", [8222]],
          ["becaus", [8757]],
          ["because", [8757]],
          ["Because", [8757]],
          ["bemptyv", [10672]],
          ["bepsi", [1014]],
          ["bernou", [8492]],
          ["Bernoullis", [8492]],
          ["Beta", [914]],
          ["beta", [946]],
          ["beth", [8502]],
          ["between", [8812]],
          ["Bfr", [120069]],
          ["bfr", [120095]],
          ["bigcap", [8898]],
          ["bigcirc", [9711]],
          ["bigcup", [8899]],
          ["bigodot", [10752]],
          ["bigoplus", [10753]],
          ["bigotimes", [10754]],
          ["bigsqcup", [10758]],
          ["bigstar", [9733]],
          ["bigtriangledown", [9661]],
          ["bigtriangleup", [9651]],
          ["biguplus", [10756]],
          ["bigvee", [8897]],
          ["bigwedge", [8896]],
          ["bkarow", [10509]],
          ["blacklozenge", [10731]],
          ["blacksquare", [9642]],
          ["blacktriangle", [9652]],
          ["blacktriangledown", [9662]],
          ["blacktriangleleft", [9666]],
          ["blacktriangleright", [9656]],
          ["blank", [9251]],
          ["blk12", [9618]],
          ["blk14", [9617]],
          ["blk34", [9619]],
          ["block", [9608]],
          ["bne", [61, 8421]],
          ["bnequiv", [8801, 8421]],
          ["bNot", [10989]],
          ["bnot", [8976]],
          ["Bopf", [120121]],
          ["bopf", [120147]],
          ["bot", [8869]],
          ["bottom", [8869]],
          ["bowtie", [8904]],
          ["boxbox", [10697]],
          ["boxdl", [9488]],
          ["boxdL", [9557]],
          ["boxDl", [9558]],
          ["boxDL", [9559]],
          ["boxdr", [9484]],
          ["boxdR", [9554]],
          ["boxDr", [9555]],
          ["boxDR", [9556]],
          ["boxh", [9472]],
          ["boxH", [9552]],
          ["boxhd", [9516]],
          ["boxHd", [9572]],
          ["boxhD", [9573]],
          ["boxHD", [9574]],
          ["boxhu", [9524]],
          ["boxHu", [9575]],
          ["boxhU", [9576]],
          ["boxHU", [9577]],
          ["boxminus", [8863]],
          ["boxplus", [8862]],
          ["boxtimes", [8864]],
          ["boxul", [9496]],
          ["boxuL", [9563]],
          ["boxUl", [9564]],
          ["boxUL", [9565]],
          ["boxur", [9492]],
          ["boxuR", [9560]],
          ["boxUr", [9561]],
          ["boxUR", [9562]],
          ["boxv", [9474]],
          ["boxV", [9553]],
          ["boxvh", [9532]],
          ["boxvH", [9578]],
          ["boxVh", [9579]],
          ["boxVH", [9580]],
          ["boxvl", [9508]],
          ["boxvL", [9569]],
          ["boxVl", [9570]],
          ["boxVL", [9571]],
          ["boxvr", [9500]],
          ["boxvR", [9566]],
          ["boxVr", [9567]],
          ["boxVR", [9568]],
          ["bprime", [8245]],
          ["breve", [728]],
          ["Breve", [728]],
          ["brvbar", [166]],
          ["bscr", [119991]],
          ["Bscr", [8492]],
          ["bsemi", [8271]],
          ["bsim", [8765]],
          ["bsime", [8909]],
          ["bsolb", [10693]],
          ["bsol", [92]],
          ["bsolhsub", [10184]],
          ["bull", [8226]],
          ["bullet", [8226]],
          ["bump", [8782]],
          ["bumpE", [10926]],
          ["bumpe", [8783]],
          ["Bumpeq", [8782]],
          ["bumpeq", [8783]],
          ["Cacute", [262]],
          ["cacute", [263]],
          ["capand", [10820]],
          ["capbrcup", [10825]],
          ["capcap", [10827]],
          ["cap", [8745]],
          ["Cap", [8914]],
          ["capcup", [10823]],
          ["capdot", [10816]],
          ["CapitalDifferentialD", [8517]],
          ["caps", [8745, 65024]],
          ["caret", [8257]],
          ["caron", [711]],
          ["Cayleys", [8493]],
          ["ccaps", [10829]],
          ["Ccaron", [268]],
          ["ccaron", [269]],
          ["Ccedil", [199]],
          ["ccedil", [231]],
          ["Ccirc", [264]],
          ["ccirc", [265]],
          ["Cconint", [8752]],
          ["ccups", [10828]],
          ["ccupssm", [10832]],
          ["Cdot", [266]],
          ["cdot", [267]],
          ["cedil", [184]],
          ["Cedilla", [184]],
          ["cemptyv", [10674]],
          ["cent", [162]],
          ["centerdot", [183]],
          ["CenterDot", [183]],
          ["cfr", [120096]],
          ["Cfr", [8493]],
          ["CHcy", [1063]],
          ["chcy", [1095]],
          ["check", [10003]],
          ["checkmark", [10003]],
          ["Chi", [935]],
          ["chi", [967]],
          ["circ", [710]],
          ["circeq", [8791]],
          ["circlearrowleft", [8634]],
          ["circlearrowright", [8635]],
          ["circledast", [8859]],
          ["circledcirc", [8858]],
          ["circleddash", [8861]],
          ["CircleDot", [8857]],
          ["circledR", [174]],
          ["circledS", [9416]],
          ["CircleMinus", [8854]],
          ["CirclePlus", [8853]],
          ["CircleTimes", [8855]],
          ["cir", [9675]],
          ["cirE", [10691]],
          ["cire", [8791]],
          ["cirfnint", [10768]],
          ["cirmid", [10991]],
          ["cirscir", [10690]],
          ["ClockwiseContourIntegral", [8754]],
          ["clubs", [9827]],
          ["clubsuit", [9827]],
          ["colon", [58]],
          ["Colon", [8759]],
          ["Colone", [10868]],
          ["colone", [8788]],
          ["coloneq", [8788]],
          ["comma", [44]],
          ["commat", [64]],
          ["comp", [8705]],
          ["compfn", [8728]],
          ["complement", [8705]],
          ["complexes", [8450]],
          ["cong", [8773]],
          ["congdot", [10861]],
          ["Congruent", [8801]],
          ["conint", [8750]],
          ["Conint", [8751]],
          ["ContourIntegral", [8750]],
          ["copf", [120148]],
          ["Copf", [8450]],
          ["coprod", [8720]],
          ["Coproduct", [8720]],
          ["copy", [169]],
          ["COPY", [169]],
          ["copysr", [8471]],
          ["CounterClockwiseContourIntegral", [8755]],
          ["crarr", [8629]],
          ["cross", [10007]],
          ["Cross", [10799]],
          ["Cscr", [119966]],
          ["cscr", [119992]],
          ["csub", [10959]],
          ["csube", [10961]],
          ["csup", [10960]],
          ["csupe", [10962]],
          ["ctdot", [8943]],
          ["cudarrl", [10552]],
          ["cudarrr", [10549]],
          ["cuepr", [8926]],
          ["cuesc", [8927]],
          ["cularr", [8630]],
          ["cularrp", [10557]],
          ["cupbrcap", [10824]],
          ["cupcap", [10822]],
          ["CupCap", [8781]],
          ["cup", [8746]],
          ["Cup", [8915]],
          ["cupcup", [10826]],
          ["cupdot", [8845]],
          ["cupor", [10821]],
          ["cups", [8746, 65024]],
          ["curarr", [8631]],
          ["curarrm", [10556]],
          ["curlyeqprec", [8926]],
          ["curlyeqsucc", [8927]],
          ["curlyvee", [8910]],
          ["curlywedge", [8911]],
          ["curren", [164]],
          ["curvearrowleft", [8630]],
          ["curvearrowright", [8631]],
          ["cuvee", [8910]],
          ["cuwed", [8911]],
          ["cwconint", [8754]],
          ["cwint", [8753]],
          ["cylcty", [9005]],
          ["dagger", [8224]],
          ["Dagger", [8225]],
          ["daleth", [8504]],
          ["darr", [8595]],
          ["Darr", [8609]],
          ["dArr", [8659]],
          ["dash", [8208]],
          ["Dashv", [10980]],
          ["dashv", [8867]],
          ["dbkarow", [10511]],
          ["dblac", [733]],
          ["Dcaron", [270]],
          ["dcaron", [271]],
          ["Dcy", [1044]],
          ["dcy", [1076]],
          ["ddagger", [8225]],
          ["ddarr", [8650]],
          ["DD", [8517]],
          ["dd", [8518]],
          ["DDotrahd", [10513]],
          ["ddotseq", [10871]],
          ["deg", [176]],
          ["Del", [8711]],
          ["Delta", [916]],
          ["delta", [948]],
          ["demptyv", [10673]],
          ["dfisht", [10623]],
          ["Dfr", [120071]],
          ["dfr", [120097]],
          ["dHar", [10597]],
          ["dharl", [8643]],
          ["dharr", [8642]],
          ["DiacriticalAcute", [180]],
          ["DiacriticalDot", [729]],
          ["DiacriticalDoubleAcute", [733]],
          ["DiacriticalGrave", [96]],
          ["DiacriticalTilde", [732]],
          ["diam", [8900]],
          ["diamond", [8900]],
          ["Diamond", [8900]],
          ["diamondsuit", [9830]],
          ["diams", [9830]],
          ["die", [168]],
          ["DifferentialD", [8518]],
          ["digamma", [989]],
          ["disin", [8946]],
          ["div", [247]],
          ["divide", [247]],
          ["divideontimes", [8903]],
          ["divonx", [8903]],
          ["DJcy", [1026]],
          ["djcy", [1106]],
          ["dlcorn", [8990]],
          ["dlcrop", [8973]],
          ["dollar", [36]],
          ["Dopf", [120123]],
          ["dopf", [120149]],
          ["Dot", [168]],
          ["dot", [729]],
          ["DotDot", [8412]],
          ["doteq", [8784]],
          ["doteqdot", [8785]],
          ["DotEqual", [8784]],
          ["dotminus", [8760]],
          ["dotplus", [8724]],
          ["dotsquare", [8865]],
          ["doublebarwedge", [8966]],
          ["DoubleContourIntegral", [8751]],
          ["DoubleDot", [168]],
          ["DoubleDownArrow", [8659]],
          ["DoubleLeftArrow", [8656]],
          ["DoubleLeftRightArrow", [8660]],
          ["DoubleLeftTee", [10980]],
          ["DoubleLongLeftArrow", [10232]],
          ["DoubleLongLeftRightArrow", [10234]],
          ["DoubleLongRightArrow", [10233]],
          ["DoubleRightArrow", [8658]],
          ["DoubleRightTee", [8872]],
          ["DoubleUpArrow", [8657]],
          ["DoubleUpDownArrow", [8661]],
          ["DoubleVerticalBar", [8741]],
          ["DownArrowBar", [10515]],
          ["downarrow", [8595]],
          ["DownArrow", [8595]],
          ["Downarrow", [8659]],
          ["DownArrowUpArrow", [8693]],
          ["DownBreve", [785]],
          ["downdownarrows", [8650]],
          ["downharpoonleft", [8643]],
          ["downharpoonright", [8642]],
          ["DownLeftRightVector", [10576]],
          ["DownLeftTeeVector", [10590]],
          ["DownLeftVectorBar", [10582]],
          ["DownLeftVector", [8637]],
          ["DownRightTeeVector", [10591]],
          ["DownRightVectorBar", [10583]],
          ["DownRightVector", [8641]],
          ["DownTeeArrow", [8615]],
          ["DownTee", [8868]],
          ["drbkarow", [10512]],
          ["drcorn", [8991]],
          ["drcrop", [8972]],
          ["Dscr", [119967]],
          ["dscr", [119993]],
          ["DScy", [1029]],
          ["dscy", [1109]],
          ["dsol", [10742]],
          ["Dstrok", [272]],
          ["dstrok", [273]],
          ["dtdot", [8945]],
          ["dtri", [9663]],
          ["dtrif", [9662]],
          ["duarr", [8693]],
          ["duhar", [10607]],
          ["dwangle", [10662]],
          ["DZcy", [1039]],
          ["dzcy", [1119]],
          ["dzigrarr", [10239]],
          ["Eacute", [201]],
          ["eacute", [233]],
          ["easter", [10862]],
          ["Ecaron", [282]],
          ["ecaron", [283]],
          ["Ecirc", [202]],
          ["ecirc", [234]],
          ["ecir", [8790]],
          ["ecolon", [8789]],
          ["Ecy", [1069]],
          ["ecy", [1101]],
          ["eDDot", [10871]],
          ["Edot", [278]],
          ["edot", [279]],
          ["eDot", [8785]],
          ["ee", [8519]],
          ["efDot", [8786]],
          ["Efr", [120072]],
          ["efr", [120098]],
          ["eg", [10906]],
          ["Egrave", [200]],
          ["egrave", [232]],
          ["egs", [10902]],
          ["egsdot", [10904]],
          ["el", [10905]],
          ["Element", [8712]],
          ["elinters", [9191]],
          ["ell", [8467]],
          ["els", [10901]],
          ["elsdot", [10903]],
          ["Emacr", [274]],
          ["emacr", [275]],
          ["empty", [8709]],
          ["emptyset", [8709]],
          ["EmptySmallSquare", [9723]],
          ["emptyv", [8709]],
          ["EmptyVerySmallSquare", [9643]],
          ["emsp13", [8196]],
          ["emsp14", [8197]],
          ["emsp", [8195]],
          ["ENG", [330]],
          ["eng", [331]],
          ["ensp", [8194]],
          ["Eogon", [280]],
          ["eogon", [281]],
          ["Eopf", [120124]],
          ["eopf", [120150]],
          ["epar", [8917]],
          ["eparsl", [10723]],
          ["eplus", [10865]],
          ["epsi", [949]],
          ["Epsilon", [917]],
          ["epsilon", [949]],
          ["epsiv", [1013]],
          ["eqcirc", [8790]],
          ["eqcolon", [8789]],
          ["eqsim", [8770]],
          ["eqslantgtr", [10902]],
          ["eqslantless", [10901]],
          ["Equal", [10869]],
          ["equals", [61]],
          ["EqualTilde", [8770]],
          ["equest", [8799]],
          ["Equilibrium", [8652]],
          ["equiv", [8801]],
          ["equivDD", [10872]],
          ["eqvparsl", [10725]],
          ["erarr", [10609]],
          ["erDot", [8787]],
          ["escr", [8495]],
          ["Escr", [8496]],
          ["esdot", [8784]],
          ["Esim", [10867]],
          ["esim", [8770]],
          ["Eta", [919]],
          ["eta", [951]],
          ["ETH", [208]],
          ["eth", [240]],
          ["Euml", [203]],
          ["euml", [235]],
          ["euro", [8364]],
          ["excl", [33]],
          ["exist", [8707]],
          ["Exists", [8707]],
          ["expectation", [8496]],
          ["exponentiale", [8519]],
          ["ExponentialE", [8519]],
          ["fallingdotseq", [8786]],
          ["Fcy", [1060]],
          ["fcy", [1092]],
          ["female", [9792]],
          ["ffilig", [64259]],
          ["fflig", [64256]],
          ["ffllig", [64260]],
          ["Ffr", [120073]],
          ["ffr", [120099]],
          ["filig", [64257]],
          ["FilledSmallSquare", [9724]],
          ["FilledVerySmallSquare", [9642]],
          ["fjlig", [102, 106]],
          ["flat", [9837]],
          ["fllig", [64258]],
          ["fltns", [9649]],
          ["fnof", [402]],
          ["Fopf", [120125]],
          ["fopf", [120151]],
          ["forall", [8704]],
          ["ForAll", [8704]],
          ["fork", [8916]],
          ["forkv", [10969]],
          ["Fouriertrf", [8497]],
          ["fpartint", [10765]],
          ["frac12", [189]],
          ["frac13", [8531]],
          ["frac14", [188]],
          ["frac15", [8533]],
          ["frac16", [8537]],
          ["frac18", [8539]],
          ["frac23", [8532]],
          ["frac25", [8534]],
          ["frac34", [190]],
          ["frac35", [8535]],
          ["frac38", [8540]],
          ["frac45", [8536]],
          ["frac56", [8538]],
          ["frac58", [8541]],
          ["frac78", [8542]],
          ["frasl", [8260]],
          ["frown", [8994]],
          ["fscr", [119995]],
          ["Fscr", [8497]],
          ["gacute", [501]],
          ["Gamma", [915]],
          ["gamma", [947]],
          ["Gammad", [988]],
          ["gammad", [989]],
          ["gap", [10886]],
          ["Gbreve", [286]],
          ["gbreve", [287]],
          ["Gcedil", [290]],
          ["Gcirc", [284]],
          ["gcirc", [285]],
          ["Gcy", [1043]],
          ["gcy", [1075]],
          ["Gdot", [288]],
          ["gdot", [289]],
          ["ge", [8805]],
          ["gE", [8807]],
          ["gEl", [10892]],
          ["gel", [8923]],
          ["geq", [8805]],
          ["geqq", [8807]],
          ["geqslant", [10878]],
          ["gescc", [10921]],
          ["ges", [10878]],
          ["gesdot", [10880]],
          ["gesdoto", [10882]],
          ["gesdotol", [10884]],
          ["gesl", [8923, 65024]],
          ["gesles", [10900]],
          ["Gfr", [120074]],
          ["gfr", [120100]],
          ["gg", [8811]],
          ["Gg", [8921]],
          ["ggg", [8921]],
          ["gimel", [8503]],
          ["GJcy", [1027]],
          ["gjcy", [1107]],
          ["gla", [10917]],
          ["gl", [8823]],
          ["glE", [10898]],
          ["glj", [10916]],
          ["gnap", [10890]],
          ["gnapprox", [10890]],
          ["gne", [10888]],
          ["gnE", [8809]],
          ["gneq", [10888]],
          ["gneqq", [8809]],
          ["gnsim", [8935]],
          ["Gopf", [120126]],
          ["gopf", [120152]],
          ["grave", [96]],
          ["GreaterEqual", [8805]],
          ["GreaterEqualLess", [8923]],
          ["GreaterFullEqual", [8807]],
          ["GreaterGreater", [10914]],
          ["GreaterLess", [8823]],
          ["GreaterSlantEqual", [10878]],
          ["GreaterTilde", [8819]],
          ["Gscr", [119970]],
          ["gscr", [8458]],
          ["gsim", [8819]],
          ["gsime", [10894]],
          ["gsiml", [10896]],
          ["gtcc", [10919]],
          ["gtcir", [10874]],
          ["gt", [62]],
          ["GT", [62]],
          ["Gt", [8811]],
          ["gtdot", [8919]],
          ["gtlPar", [10645]],
          ["gtquest", [10876]],
          ["gtrapprox", [10886]],
          ["gtrarr", [10616]],
          ["gtrdot", [8919]],
          ["gtreqless", [8923]],
          ["gtreqqless", [10892]],
          ["gtrless", [8823]],
          ["gtrsim", [8819]],
          ["gvertneqq", [8809, 65024]],
          ["gvnE", [8809, 65024]],
          ["Hacek", [711]],
          ["hairsp", [8202]],
          ["half", [189]],
          ["hamilt", [8459]],
          ["HARDcy", [1066]],
          ["hardcy", [1098]],
          ["harrcir", [10568]],
          ["harr", [8596]],
          ["hArr", [8660]],
          ["harrw", [8621]],
          ["Hat", [94]],
          ["hbar", [8463]],
          ["Hcirc", [292]],
          ["hcirc", [293]],
          ["hearts", [9829]],
          ["heartsuit", [9829]],
          ["hellip", [8230]],
          ["hercon", [8889]],
          ["hfr", [120101]],
          ["Hfr", [8460]],
          ["HilbertSpace", [8459]],
          ["hksearow", [10533]],
          ["hkswarow", [10534]],
          ["hoarr", [8703]],
          ["homtht", [8763]],
          ["hookleftarrow", [8617]],
          ["hookrightarrow", [8618]],
          ["hopf", [120153]],
          ["Hopf", [8461]],
          ["horbar", [8213]],
          ["HorizontalLine", [9472]],
          ["hscr", [119997]],
          ["Hscr", [8459]],
          ["hslash", [8463]],
          ["Hstrok", [294]],
          ["hstrok", [295]],
          ["HumpDownHump", [8782]],
          ["HumpEqual", [8783]],
          ["hybull", [8259]],
          ["hyphen", [8208]],
          ["Iacute", [205]],
          ["iacute", [237]],
          ["ic", [8291]],
          ["Icirc", [206]],
          ["icirc", [238]],
          ["Icy", [1048]],
          ["icy", [1080]],
          ["Idot", [304]],
          ["IEcy", [1045]],
          ["iecy", [1077]],
          ["iexcl", [161]],
          ["iff", [8660]],
          ["ifr", [120102]],
          ["Ifr", [8465]],
          ["Igrave", [204]],
          ["igrave", [236]],
          ["ii", [8520]],
          ["iiiint", [10764]],
          ["iiint", [8749]],
          ["iinfin", [10716]],
          ["iiota", [8489]],
          ["IJlig", [306]],
          ["ijlig", [307]],
          ["Imacr", [298]],
          ["imacr", [299]],
          ["image", [8465]],
          ["ImaginaryI", [8520]],
          ["imagline", [8464]],
          ["imagpart", [8465]],
          ["imath", [305]],
          ["Im", [8465]],
          ["imof", [8887]],
          ["imped", [437]],
          ["Implies", [8658]],
          ["incare", [8453]],
          ["in", [8712]],
          ["infin", [8734]],
          ["infintie", [10717]],
          ["inodot", [305]],
          ["intcal", [8890]],
          ["int", [8747]],
          ["Int", [8748]],
          ["integers", [8484]],
          ["Integral", [8747]],
          ["intercal", [8890]],
          ["Intersection", [8898]],
          ["intlarhk", [10775]],
          ["intprod", [10812]],
          ["InvisibleComma", [8291]],
          ["InvisibleTimes", [8290]],
          ["IOcy", [1025]],
          ["iocy", [1105]],
          ["Iogon", [302]],
          ["iogon", [303]],
          ["Iopf", [120128]],
          ["iopf", [120154]],
          ["Iota", [921]],
          ["iota", [953]],
          ["iprod", [10812]],
          ["iquest", [191]],
          ["iscr", [119998]],
          ["Iscr", [8464]],
          ["isin", [8712]],
          ["isindot", [8949]],
          ["isinE", [8953]],
          ["isins", [8948]],
          ["isinsv", [8947]],
          ["isinv", [8712]],
          ["it", [8290]],
          ["Itilde", [296]],
          ["itilde", [297]],
          ["Iukcy", [1030]],
          ["iukcy", [1110]],
          ["Iuml", [207]],
          ["iuml", [239]],
          ["Jcirc", [308]],
          ["jcirc", [309]],
          ["Jcy", [1049]],
          ["jcy", [1081]],
          ["Jfr", [120077]],
          ["jfr", [120103]],
          ["jmath", [567]],
          ["Jopf", [120129]],
          ["jopf", [120155]],
          ["Jscr", [119973]],
          ["jscr", [119999]],
          ["Jsercy", [1032]],
          ["jsercy", [1112]],
          ["Jukcy", [1028]],
          ["jukcy", [1108]],
          ["Kappa", [922]],
          ["kappa", [954]],
          ["kappav", [1008]],
          ["Kcedil", [310]],
          ["kcedil", [311]],
          ["Kcy", [1050]],
          ["kcy", [1082]],
          ["Kfr", [120078]],
          ["kfr", [120104]],
          ["kgreen", [312]],
          ["KHcy", [1061]],
          ["khcy", [1093]],
          ["KJcy", [1036]],
          ["kjcy", [1116]],
          ["Kopf", [120130]],
          ["kopf", [120156]],
          ["Kscr", [119974]],
          ["kscr", [120000]],
          ["lAarr", [8666]],
          ["Lacute", [313]],
          ["lacute", [314]],
          ["laemptyv", [10676]],
          ["lagran", [8466]],
          ["Lambda", [923]],
          ["lambda", [955]],
          ["lang", [10216]],
          ["Lang", [10218]],
          ["langd", [10641]],
          ["langle", [10216]],
          ["lap", [10885]],
          ["Laplacetrf", [8466]],
          ["laquo", [171]],
          ["larrb", [8676]],
          ["larrbfs", [10527]],
          ["larr", [8592]],
          ["Larr", [8606]],
          ["lArr", [8656]],
          ["larrfs", [10525]],
          ["larrhk", [8617]],
          ["larrlp", [8619]],
          ["larrpl", [10553]],
          ["larrsim", [10611]],
          ["larrtl", [8610]],
          ["latail", [10521]],
          ["lAtail", [10523]],
          ["lat", [10923]],
          ["late", [10925]],
          ["lates", [10925, 65024]],
          ["lbarr", [10508]],
          ["lBarr", [10510]],
          ["lbbrk", [10098]],
          ["lbrace", [123]],
          ["lbrack", [91]],
          ["lbrke", [10635]],
          ["lbrksld", [10639]],
          ["lbrkslu", [10637]],
          ["Lcaron", [317]],
          ["lcaron", [318]],
          ["Lcedil", [315]],
          ["lcedil", [316]],
          ["lceil", [8968]],
          ["lcub", [123]],
          ["Lcy", [1051]],
          ["lcy", [1083]],
          ["ldca", [10550]],
          ["ldquo", [8220]],
          ["ldquor", [8222]],
          ["ldrdhar", [10599]],
          ["ldrushar", [10571]],
          ["ldsh", [8626]],
          ["le", [8804]],
          ["lE", [8806]],
          ["LeftAngleBracket", [10216]],
          ["LeftArrowBar", [8676]],
          ["leftarrow", [8592]],
          ["LeftArrow", [8592]],
          ["Leftarrow", [8656]],
          ["LeftArrowRightArrow", [8646]],
          ["leftarrowtail", [8610]],
          ["LeftCeiling", [8968]],
          ["LeftDoubleBracket", [10214]],
          ["LeftDownTeeVector", [10593]],
          ["LeftDownVectorBar", [10585]],
          ["LeftDownVector", [8643]],
          ["LeftFloor", [8970]],
          ["leftharpoondown", [8637]],
          ["leftharpoonup", [8636]],
          ["leftleftarrows", [8647]],
          ["leftrightarrow", [8596]],
          ["LeftRightArrow", [8596]],
          ["Leftrightarrow", [8660]],
          ["leftrightarrows", [8646]],
          ["leftrightharpoons", [8651]],
          ["leftrightsquigarrow", [8621]],
          ["LeftRightVector", [10574]],
          ["LeftTeeArrow", [8612]],
          ["LeftTee", [8867]],
          ["LeftTeeVector", [10586]],
          ["leftthreetimes", [8907]],
          ["LeftTriangleBar", [10703]],
          ["LeftTriangle", [8882]],
          ["LeftTriangleEqual", [8884]],
          ["LeftUpDownVector", [10577]],
          ["LeftUpTeeVector", [10592]],
          ["LeftUpVectorBar", [10584]],
          ["LeftUpVector", [8639]],
          ["LeftVectorBar", [10578]],
          ["LeftVector", [8636]],
          ["lEg", [10891]],
          ["leg", [8922]],
          ["leq", [8804]],
          ["leqq", [8806]],
          ["leqslant", [10877]],
          ["lescc", [10920]],
          ["les", [10877]],
          ["lesdot", [10879]],
          ["lesdoto", [10881]],
          ["lesdotor", [10883]],
          ["lesg", [8922, 65024]],
          ["lesges", [10899]],
          ["lessapprox", [10885]],
          ["lessdot", [8918]],
          ["lesseqgtr", [8922]],
          ["lesseqqgtr", [10891]],
          ["LessEqualGreater", [8922]],
          ["LessFullEqual", [8806]],
          ["LessGreater", [8822]],
          ["lessgtr", [8822]],
          ["LessLess", [10913]],
          ["lesssim", [8818]],
          ["LessSlantEqual", [10877]],
          ["LessTilde", [8818]],
          ["lfisht", [10620]],
          ["lfloor", [8970]],
          ["Lfr", [120079]],
          ["lfr", [120105]],
          ["lg", [8822]],
          ["lgE", [10897]],
          ["lHar", [10594]],
          ["lhard", [8637]],
          ["lharu", [8636]],
          ["lharul", [10602]],
          ["lhblk", [9604]],
          ["LJcy", [1033]],
          ["ljcy", [1113]],
          ["llarr", [8647]],
          ["ll", [8810]],
          ["Ll", [8920]],
          ["llcorner", [8990]],
          ["Lleftarrow", [8666]],
          ["llhard", [10603]],
          ["lltri", [9722]],
          ["Lmidot", [319]],
          ["lmidot", [320]],
          ["lmoustache", [9136]],
          ["lmoust", [9136]],
          ["lnap", [10889]],
          ["lnapprox", [10889]],
          ["lne", [10887]],
          ["lnE", [8808]],
          ["lneq", [10887]],
          ["lneqq", [8808]],
          ["lnsim", [8934]],
          ["loang", [10220]],
          ["loarr", [8701]],
          ["lobrk", [10214]],
          ["longleftarrow", [10229]],
          ["LongLeftArrow", [10229]],
          ["Longleftarrow", [10232]],
          ["longleftrightarrow", [10231]],
          ["LongLeftRightArrow", [10231]],
          ["Longleftrightarrow", [10234]],
          ["longmapsto", [10236]],
          ["longrightarrow", [10230]],
          ["LongRightArrow", [10230]],
          ["Longrightarrow", [10233]],
          ["looparrowleft", [8619]],
          ["looparrowright", [8620]],
          ["lopar", [10629]],
          ["Lopf", [120131]],
          ["lopf", [120157]],
          ["loplus", [10797]],
          ["lotimes", [10804]],
          ["lowast", [8727]],
          ["lowbar", [95]],
          ["LowerLeftArrow", [8601]],
          ["LowerRightArrow", [8600]],
          ["loz", [9674]],
          ["lozenge", [9674]],
          ["lozf", [10731]],
          ["lpar", [40]],
          ["lparlt", [10643]],
          ["lrarr", [8646]],
          ["lrcorner", [8991]],
          ["lrhar", [8651]],
          ["lrhard", [10605]],
          ["lrm", [8206]],
          ["lrtri", [8895]],
          ["lsaquo", [8249]],
          ["lscr", [120001]],
          ["Lscr", [8466]],
          ["lsh", [8624]],
          ["Lsh", [8624]],
          ["lsim", [8818]],
          ["lsime", [10893]],
          ["lsimg", [10895]],
          ["lsqb", [91]],
          ["lsquo", [8216]],
          ["lsquor", [8218]],
          ["Lstrok", [321]],
          ["lstrok", [322]],
          ["ltcc", [10918]],
          ["ltcir", [10873]],
          ["lt", [60]],
          ["LT", [60]],
          ["Lt", [8810]],
          ["ltdot", [8918]],
          ["lthree", [8907]],
          ["ltimes", [8905]],
          ["ltlarr", [10614]],
          ["ltquest", [10875]],
          ["ltri", [9667]],
          ["ltrie", [8884]],
          ["ltrif", [9666]],
          ["ltrPar", [10646]],
          ["lurdshar", [10570]],
          ["luruhar", [10598]],
          ["lvertneqq", [8808, 65024]],
          ["lvnE", [8808, 65024]],
          ["macr", [175]],
          ["male", [9794]],
          ["malt", [10016]],
          ["maltese", [10016]],
          ["Map", [10501]],
          ["map", [8614]],
          ["mapsto", [8614]],
          ["mapstodown", [8615]],
          ["mapstoleft", [8612]],
          ["mapstoup", [8613]],
          ["marker", [9646]],
          ["mcomma", [10793]],
          ["Mcy", [1052]],
          ["mcy", [1084]],
          ["mdash", [8212]],
          ["mDDot", [8762]],
          ["measuredangle", [8737]],
          ["MediumSpace", [8287]],
          ["Mellintrf", [8499]],
          ["Mfr", [120080]],
          ["mfr", [120106]],
          ["mho", [8487]],
          ["micro", [181]],
          ["midast", [42]],
          ["midcir", [10992]],
          ["mid", [8739]],
          ["middot", [183]],
          ["minusb", [8863]],
          ["minus", [8722]],
          ["minusd", [8760]],
          ["minusdu", [10794]],
          ["MinusPlus", [8723]],
          ["mlcp", [10971]],
          ["mldr", [8230]],
          ["mnplus", [8723]],
          ["models", [8871]],
          ["Mopf", [120132]],
          ["mopf", [120158]],
          ["mp", [8723]],
          ["mscr", [120002]],
          ["Mscr", [8499]],
          ["mstpos", [8766]],
          ["Mu", [924]],
          ["mu", [956]],
          ["multimap", [8888]],
          ["mumap", [8888]],
          ["nabla", [8711]],
          ["Nacute", [323]],
          ["nacute", [324]],
          ["nang", [8736, 8402]],
          ["nap", [8777]],
          ["napE", [10864, 824]],
          ["napid", [8779, 824]],
          ["napos", [329]],
          ["napprox", [8777]],
          ["natural", [9838]],
          ["naturals", [8469]],
          ["natur", [9838]],
          ["nbsp", [160]],
          ["nbump", [8782, 824]],
          ["nbumpe", [8783, 824]],
          ["ncap", [10819]],
          ["Ncaron", [327]],
          ["ncaron", [328]],
          ["Ncedil", [325]],
          ["ncedil", [326]],
          ["ncong", [8775]],
          ["ncongdot", [10861, 824]],
          ["ncup", [10818]],
          ["Ncy", [1053]],
          ["ncy", [1085]],
          ["ndash", [8211]],
          ["nearhk", [10532]],
          ["nearr", [8599]],
          ["neArr", [8663]],
          ["nearrow", [8599]],
          ["ne", [8800]],
          ["nedot", [8784, 824]],
          ["NegativeMediumSpace", [8203]],
          ["NegativeThickSpace", [8203]],
          ["NegativeThinSpace", [8203]],
          ["NegativeVeryThinSpace", [8203]],
          ["nequiv", [8802]],
          ["nesear", [10536]],
          ["nesim", [8770, 824]],
          ["NestedGreaterGreater", [8811]],
          ["NestedLessLess", [8810]],
          ["nexist", [8708]],
          ["nexists", [8708]],
          ["Nfr", [120081]],
          ["nfr", [120107]],
          ["ngE", [8807, 824]],
          ["nge", [8817]],
          ["ngeq", [8817]],
          ["ngeqq", [8807, 824]],
          ["ngeqslant", [10878, 824]],
          ["nges", [10878, 824]],
          ["nGg", [8921, 824]],
          ["ngsim", [8821]],
          ["nGt", [8811, 8402]],
          ["ngt", [8815]],
          ["ngtr", [8815]],
          ["nGtv", [8811, 824]],
          ["nharr", [8622]],
          ["nhArr", [8654]],
          ["nhpar", [10994]],
          ["ni", [8715]],
          ["nis", [8956]],
          ["nisd", [8954]],
          ["niv", [8715]],
          ["NJcy", [1034]],
          ["njcy", [1114]],
          ["nlarr", [8602]],
          ["nlArr", [8653]],
          ["nldr", [8229]],
          ["nlE", [8806, 824]],
          ["nle", [8816]],
          ["nleftarrow", [8602]],
          ["nLeftarrow", [8653]],
          ["nleftrightarrow", [8622]],
          ["nLeftrightarrow", [8654]],
          ["nleq", [8816]],
          ["nleqq", [8806, 824]],
          ["nleqslant", [10877, 824]],
          ["nles", [10877, 824]],
          ["nless", [8814]],
          ["nLl", [8920, 824]],
          ["nlsim", [8820]],
          ["nLt", [8810, 8402]],
          ["nlt", [8814]],
          ["nltri", [8938]],
          ["nltrie", [8940]],
          ["nLtv", [8810, 824]],
          ["nmid", [8740]],
          ["NoBreak", [8288]],
          ["NonBreakingSpace", [160]],
          ["nopf", [120159]],
          ["Nopf", [8469]],
          ["Not", [10988]],
          ["not", [172]],
          ["NotCongruent", [8802]],
          ["NotCupCap", [8813]],
          ["NotDoubleVerticalBar", [8742]],
          ["NotElement", [8713]],
          ["NotEqual", [8800]],
          ["NotEqualTilde", [8770, 824]],
          ["NotExists", [8708]],
          ["NotGreater", [8815]],
          ["NotGreaterEqual", [8817]],
          ["NotGreaterFullEqual", [8807, 824]],
          ["NotGreaterGreater", [8811, 824]],
          ["NotGreaterLess", [8825]],
          ["NotGreaterSlantEqual", [10878, 824]],
          ["NotGreaterTilde", [8821]],
          ["NotHumpDownHump", [8782, 824]],
          ["NotHumpEqual", [8783, 824]],
          ["notin", [8713]],
          ["notindot", [8949, 824]],
          ["notinE", [8953, 824]],
          ["notinva", [8713]],
          ["notinvb", [8951]],
          ["notinvc", [8950]],
          ["NotLeftTriangleBar", [10703, 824]],
          ["NotLeftTriangle", [8938]],
          ["NotLeftTriangleEqual", [8940]],
          ["NotLess", [8814]],
          ["NotLessEqual", [8816]],
          ["NotLessGreater", [8824]],
          ["NotLessLess", [8810, 824]],
          ["NotLessSlantEqual", [10877, 824]],
          ["NotLessTilde", [8820]],
          ["NotNestedGreaterGreater", [10914, 824]],
          ["NotNestedLessLess", [10913, 824]],
          ["notni", [8716]],
          ["notniva", [8716]],
          ["notnivb", [8958]],
          ["notnivc", [8957]],
          ["NotPrecedes", [8832]],
          ["NotPrecedesEqual", [10927, 824]],
          ["NotPrecedesSlantEqual", [8928]],
          ["NotReverseElement", [8716]],
          ["NotRightTriangleBar", [10704, 824]],
          ["NotRightTriangle", [8939]],
          ["NotRightTriangleEqual", [8941]],
          ["NotSquareSubset", [8847, 824]],
          ["NotSquareSubsetEqual", [8930]],
          ["NotSquareSuperset", [8848, 824]],
          ["NotSquareSupersetEqual", [8931]],
          ["NotSubset", [8834, 8402]],
          ["NotSubsetEqual", [8840]],
          ["NotSucceeds", [8833]],
          ["NotSucceedsEqual", [10928, 824]],
          ["NotSucceedsSlantEqual", [8929]],
          ["NotSucceedsTilde", [8831, 824]],
          ["NotSuperset", [8835, 8402]],
          ["NotSupersetEqual", [8841]],
          ["NotTilde", [8769]],
          ["NotTildeEqual", [8772]],
          ["NotTildeFullEqual", [8775]],
          ["NotTildeTilde", [8777]],
          ["NotVerticalBar", [8740]],
          ["nparallel", [8742]],
          ["npar", [8742]],
          ["nparsl", [11005, 8421]],
          ["npart", [8706, 824]],
          ["npolint", [10772]],
          ["npr", [8832]],
          ["nprcue", [8928]],
          ["nprec", [8832]],
          ["npreceq", [10927, 824]],
          ["npre", [10927, 824]],
          ["nrarrc", [10547, 824]],
          ["nrarr", [8603]],
          ["nrArr", [8655]],
          ["nrarrw", [8605, 824]],
          ["nrightarrow", [8603]],
          ["nRightarrow", [8655]],
          ["nrtri", [8939]],
          ["nrtrie", [8941]],
          ["nsc", [8833]],
          ["nsccue", [8929]],
          ["nsce", [10928, 824]],
          ["Nscr", [119977]],
          ["nscr", [120003]],
          ["nshortmid", [8740]],
          ["nshortparallel", [8742]],
          ["nsim", [8769]],
          ["nsime", [8772]],
          ["nsimeq", [8772]],
          ["nsmid", [8740]],
          ["nspar", [8742]],
          ["nsqsube", [8930]],
          ["nsqsupe", [8931]],
          ["nsub", [8836]],
          ["nsubE", [10949, 824]],
          ["nsube", [8840]],
          ["nsubset", [8834, 8402]],
          ["nsubseteq", [8840]],
          ["nsubseteqq", [10949, 824]],
          ["nsucc", [8833]],
          ["nsucceq", [10928, 824]],
          ["nsup", [8837]],
          ["nsupE", [10950, 824]],
          ["nsupe", [8841]],
          ["nsupset", [8835, 8402]],
          ["nsupseteq", [8841]],
          ["nsupseteqq", [10950, 824]],
          ["ntgl", [8825]],
          ["Ntilde", [209]],
          ["ntilde", [241]],
          ["ntlg", [8824]],
          ["ntriangleleft", [8938]],
          ["ntrianglelefteq", [8940]],
          ["ntriangleright", [8939]],
          ["ntrianglerighteq", [8941]],
          ["Nu", [925]],
          ["nu", [957]],
          ["num", [35]],
          ["numero", [8470]],
          ["numsp", [8199]],
          ["nvap", [8781, 8402]],
          ["nvdash", [8876]],
          ["nvDash", [8877]],
          ["nVdash", [8878]],
          ["nVDash", [8879]],
          ["nvge", [8805, 8402]],
          ["nvgt", [62, 8402]],
          ["nvHarr", [10500]],
          ["nvinfin", [10718]],
          ["nvlArr", [10498]],
          ["nvle", [8804, 8402]],
          ["nvlt", [60, 8402]],
          ["nvltrie", [8884, 8402]],
          ["nvrArr", [10499]],
          ["nvrtrie", [8885, 8402]],
          ["nvsim", [8764, 8402]],
          ["nwarhk", [10531]],
          ["nwarr", [8598]],
          ["nwArr", [8662]],
          ["nwarrow", [8598]],
          ["nwnear", [10535]],
          ["Oacute", [211]],
          ["oacute", [243]],
          ["oast", [8859]],
          ["Ocirc", [212]],
          ["ocirc", [244]],
          ["ocir", [8858]],
          ["Ocy", [1054]],
          ["ocy", [1086]],
          ["odash", [8861]],
          ["Odblac", [336]],
          ["odblac", [337]],
          ["odiv", [10808]],
          ["odot", [8857]],
          ["odsold", [10684]],
          ["OElig", [338]],
          ["oelig", [339]],
          ["ofcir", [10687]],
          ["Ofr", [120082]],
          ["ofr", [120108]],
          ["ogon", [731]],
          ["Ograve", [210]],
          ["ograve", [242]],
          ["ogt", [10689]],
          ["ohbar", [10677]],
          ["ohm", [937]],
          ["oint", [8750]],
          ["olarr", [8634]],
          ["olcir", [10686]],
          ["olcross", [10683]],
          ["oline", [8254]],
          ["olt", [10688]],
          ["Omacr", [332]],
          ["omacr", [333]],
          ["Omega", [937]],
          ["omega", [969]],
          ["Omicron", [927]],
          ["omicron", [959]],
          ["omid", [10678]],
          ["ominus", [8854]],
          ["Oopf", [120134]],
          ["oopf", [120160]],
          ["opar", [10679]],
          ["OpenCurlyDoubleQuote", [8220]],
          ["OpenCurlyQuote", [8216]],
          ["operp", [10681]],
          ["oplus", [8853]],
          ["orarr", [8635]],
          ["Or", [10836]],
          ["or", [8744]],
          ["ord", [10845]],
          ["order", [8500]],
          ["orderof", [8500]],
          ["ordf", [170]],
          ["ordm", [186]],
          ["origof", [8886]],
          ["oror", [10838]],
          ["orslope", [10839]],
          ["orv", [10843]],
          ["oS", [9416]],
          ["Oscr", [119978]],
          ["oscr", [8500]],
          ["Oslash", [216]],
          ["oslash", [248]],
          ["osol", [8856]],
          ["Otilde", [213]],
          ["otilde", [245]],
          ["otimesas", [10806]],
          ["Otimes", [10807]],
          ["otimes", [8855]],
          ["Ouml", [214]],
          ["ouml", [246]],
          ["ovbar", [9021]],
          ["OverBar", [8254]],
          ["OverBrace", [9182]],
          ["OverBracket", [9140]],
          ["OverParenthesis", [9180]],
          ["para", [182]],
          ["parallel", [8741]],
          ["par", [8741]],
          ["parsim", [10995]],
          ["parsl", [11005]],
          ["part", [8706]],
          ["PartialD", [8706]],
          ["Pcy", [1055]],
          ["pcy", [1087]],
          ["percnt", [37]],
          ["period", [46]],
          ["permil", [8240]],
          ["perp", [8869]],
          ["pertenk", [8241]],
          ["Pfr", [120083]],
          ["pfr", [120109]],
          ["Phi", [934]],
          ["phi", [966]],
          ["phiv", [981]],
          ["phmmat", [8499]],
          ["phone", [9742]],
          ["Pi", [928]],
          ["pi", [960]],
          ["pitchfork", [8916]],
          ["piv", [982]],
          ["planck", [8463]],
          ["planckh", [8462]],
          ["plankv", [8463]],
          ["plusacir", [10787]],
          ["plusb", [8862]],
          ["pluscir", [10786]],
          ["plus", [43]],
          ["plusdo", [8724]],
          ["plusdu", [10789]],
          ["pluse", [10866]],
          ["PlusMinus", [177]],
          ["plusmn", [177]],
          ["plussim", [10790]],
          ["plustwo", [10791]],
          ["pm", [177]],
          ["Poincareplane", [8460]],
          ["pointint", [10773]],
          ["popf", [120161]],
          ["Popf", [8473]],
          ["pound", [163]],
          ["prap", [10935]],
          ["Pr", [10939]],
          ["pr", [8826]],
          ["prcue", [8828]],
          ["precapprox", [10935]],
          ["prec", [8826]],
          ["preccurlyeq", [8828]],
          ["Precedes", [8826]],
          ["PrecedesEqual", [10927]],
          ["PrecedesSlantEqual", [8828]],
          ["PrecedesTilde", [8830]],
          ["preceq", [10927]],
          ["precnapprox", [10937]],
          ["precneqq", [10933]],
          ["precnsim", [8936]],
          ["pre", [10927]],
          ["prE", [10931]],
          ["precsim", [8830]],
          ["prime", [8242]],
          ["Prime", [8243]],
          ["primes", [8473]],
          ["prnap", [10937]],
          ["prnE", [10933]],
          ["prnsim", [8936]],
          ["prod", [8719]],
          ["Product", [8719]],
          ["profalar", [9006]],
          ["profline", [8978]],
          ["profsurf", [8979]],
          ["prop", [8733]],
          ["Proportional", [8733]],
          ["Proportion", [8759]],
          ["propto", [8733]],
          ["prsim", [8830]],
          ["prurel", [8880]],
          ["Pscr", [119979]],
          ["pscr", [120005]],
          ["Psi", [936]],
          ["psi", [968]],
          ["puncsp", [8200]],
          ["Qfr", [120084]],
          ["qfr", [120110]],
          ["qint", [10764]],
          ["qopf", [120162]],
          ["Qopf", [8474]],
          ["qprime", [8279]],
          ["Qscr", [119980]],
          ["qscr", [120006]],
          ["quaternions", [8461]],
          ["quatint", [10774]],
          ["quest", [63]],
          ["questeq", [8799]],
          ["quot", [34]],
          ["QUOT", [34]],
          ["rAarr", [8667]],
          ["race", [8765, 817]],
          ["Racute", [340]],
          ["racute", [341]],
          ["radic", [8730]],
          ["raemptyv", [10675]],
          ["rang", [10217]],
          ["Rang", [10219]],
          ["rangd", [10642]],
          ["range", [10661]],
          ["rangle", [10217]],
          ["raquo", [187]],
          ["rarrap", [10613]],
          ["rarrb", [8677]],
          ["rarrbfs", [10528]],
          ["rarrc", [10547]],
          ["rarr", [8594]],
          ["Rarr", [8608]],
          ["rArr", [8658]],
          ["rarrfs", [10526]],
          ["rarrhk", [8618]],
          ["rarrlp", [8620]],
          ["rarrpl", [10565]],
          ["rarrsim", [10612]],
          ["Rarrtl", [10518]],
          ["rarrtl", [8611]],
          ["rarrw", [8605]],
          ["ratail", [10522]],
          ["rAtail", [10524]],
          ["ratio", [8758]],
          ["rationals", [8474]],
          ["rbarr", [10509]],
          ["rBarr", [10511]],
          ["RBarr", [10512]],
          ["rbbrk", [10099]],
          ["rbrace", [125]],
          ["rbrack", [93]],
          ["rbrke", [10636]],
          ["rbrksld", [10638]],
          ["rbrkslu", [10640]],
          ["Rcaron", [344]],
          ["rcaron", [345]],
          ["Rcedil", [342]],
          ["rcedil", [343]],
          ["rceil", [8969]],
          ["rcub", [125]],
          ["Rcy", [1056]],
          ["rcy", [1088]],
          ["rdca", [10551]],
          ["rdldhar", [10601]],
          ["rdquo", [8221]],
          ["rdquor", [8221]],
          ["CloseCurlyDoubleQuote", [8221]],
          ["rdsh", [8627]],
          ["real", [8476]],
          ["realine", [8475]],
          ["realpart", [8476]],
          ["reals", [8477]],
          ["Re", [8476]],
          ["rect", [9645]],
          ["reg", [174]],
          ["REG", [174]],
          ["ReverseElement", [8715]],
          ["ReverseEquilibrium", [8651]],
          ["ReverseUpEquilibrium", [10607]],
          ["rfisht", [10621]],
          ["rfloor", [8971]],
          ["rfr", [120111]],
          ["Rfr", [8476]],
          ["rHar", [10596]],
          ["rhard", [8641]],
          ["rharu", [8640]],
          ["rharul", [10604]],
          ["Rho", [929]],
          ["rho", [961]],
          ["rhov", [1009]],
          ["RightAngleBracket", [10217]],
          ["RightArrowBar", [8677]],
          ["rightarrow", [8594]],
          ["RightArrow", [8594]],
          ["Rightarrow", [8658]],
          ["RightArrowLeftArrow", [8644]],
          ["rightarrowtail", [8611]],
          ["RightCeiling", [8969]],
          ["RightDoubleBracket", [10215]],
          ["RightDownTeeVector", [10589]],
          ["RightDownVectorBar", [10581]],
          ["RightDownVector", [8642]],
          ["RightFloor", [8971]],
          ["rightharpoondown", [8641]],
          ["rightharpoonup", [8640]],
          ["rightleftarrows", [8644]],
          ["rightleftharpoons", [8652]],
          ["rightrightarrows", [8649]],
          ["rightsquigarrow", [8605]],
          ["RightTeeArrow", [8614]],
          ["RightTee", [8866]],
          ["RightTeeVector", [10587]],
          ["rightthreetimes", [8908]],
          ["RightTriangleBar", [10704]],
          ["RightTriangle", [8883]],
          ["RightTriangleEqual", [8885]],
          ["RightUpDownVector", [10575]],
          ["RightUpTeeVector", [10588]],
          ["RightUpVectorBar", [10580]],
          ["RightUpVector", [8638]],
          ["RightVectorBar", [10579]],
          ["RightVector", [8640]],
          ["ring", [730]],
          ["risingdotseq", [8787]],
          ["rlarr", [8644]],
          ["rlhar", [8652]],
          ["rlm", [8207]],
          ["rmoustache", [9137]],
          ["rmoust", [9137]],
          ["rnmid", [10990]],
          ["roang", [10221]],
          ["roarr", [8702]],
          ["robrk", [10215]],
          ["ropar", [10630]],
          ["ropf", [120163]],
          ["Ropf", [8477]],
          ["roplus", [10798]],
          ["rotimes", [10805]],
          ["RoundImplies", [10608]],
          ["rpar", [41]],
          ["rpargt", [10644]],
          ["rppolint", [10770]],
          ["rrarr", [8649]],
          ["Rrightarrow", [8667]],
          ["rsaquo", [8250]],
          ["rscr", [120007]],
          ["Rscr", [8475]],
          ["rsh", [8625]],
          ["Rsh", [8625]],
          ["rsqb", [93]],
          ["rsquo", [8217]],
          ["rsquor", [8217]],
          ["CloseCurlyQuote", [8217]],
          ["rthree", [8908]],
          ["rtimes", [8906]],
          ["rtri", [9657]],
          ["rtrie", [8885]],
          ["rtrif", [9656]],
          ["rtriltri", [10702]],
          ["RuleDelayed", [10740]],
          ["ruluhar", [10600]],
          ["rx", [8478]],
          ["Sacute", [346]],
          ["sacute", [347]],
          ["sbquo", [8218]],
          ["scap", [10936]],
          ["Scaron", [352]],
          ["scaron", [353]],
          ["Sc", [10940]],
          ["sc", [8827]],
          ["sccue", [8829]],
          ["sce", [10928]],
          ["scE", [10932]],
          ["Scedil", [350]],
          ["scedil", [351]],
          ["Scirc", [348]],
          ["scirc", [349]],
          ["scnap", [10938]],
          ["scnE", [10934]],
          ["scnsim", [8937]],
          ["scpolint", [10771]],
          ["scsim", [8831]],
          ["Scy", [1057]],
          ["scy", [1089]],
          ["sdotb", [8865]],
          ["sdot", [8901]],
          ["sdote", [10854]],
          ["searhk", [10533]],
          ["searr", [8600]],
          ["seArr", [8664]],
          ["searrow", [8600]],
          ["sect", [167]],
          ["semi", [59]],
          ["seswar", [10537]],
          ["setminus", [8726]],
          ["setmn", [8726]],
          ["sext", [10038]],
          ["Sfr", [120086]],
          ["sfr", [120112]],
          ["sfrown", [8994]],
          ["sharp", [9839]],
          ["SHCHcy", [1065]],
          ["shchcy", [1097]],
          ["SHcy", [1064]],
          ["shcy", [1096]],
          ["ShortDownArrow", [8595]],
          ["ShortLeftArrow", [8592]],
          ["shortmid", [8739]],
          ["shortparallel", [8741]],
          ["ShortRightArrow", [8594]],
          ["ShortUpArrow", [8593]],
          ["shy", [173]],
          ["Sigma", [931]],
          ["sigma", [963]],
          ["sigmaf", [962]],
          ["sigmav", [962]],
          ["sim", [8764]],
          ["simdot", [10858]],
          ["sime", [8771]],
          ["simeq", [8771]],
          ["simg", [10910]],
          ["simgE", [10912]],
          ["siml", [10909]],
          ["simlE", [10911]],
          ["simne", [8774]],
          ["simplus", [10788]],
          ["simrarr", [10610]],
          ["slarr", [8592]],
          ["SmallCircle", [8728]],
          ["smallsetminus", [8726]],
          ["smashp", [10803]],
          ["smeparsl", [10724]],
          ["smid", [8739]],
          ["smile", [8995]],
          ["smt", [10922]],
          ["smte", [10924]],
          ["smtes", [10924, 65024]],
          ["SOFTcy", [1068]],
          ["softcy", [1100]],
          ["solbar", [9023]],
          ["solb", [10692]],
          ["sol", [47]],
          ["Sopf", [120138]],
          ["sopf", [120164]],
          ["spades", [9824]],
          ["spadesuit", [9824]],
          ["spar", [8741]],
          ["sqcap", [8851]],
          ["sqcaps", [8851, 65024]],
          ["sqcup", [8852]],
          ["sqcups", [8852, 65024]],
          ["Sqrt", [8730]],
          ["sqsub", [8847]],
          ["sqsube", [8849]],
          ["sqsubset", [8847]],
          ["sqsubseteq", [8849]],
          ["sqsup", [8848]],
          ["sqsupe", [8850]],
          ["sqsupset", [8848]],
          ["sqsupseteq", [8850]],
          ["square", [9633]],
          ["Square", [9633]],
          ["SquareIntersection", [8851]],
          ["SquareSubset", [8847]],
          ["SquareSubsetEqual", [8849]],
          ["SquareSuperset", [8848]],
          ["SquareSupersetEqual", [8850]],
          ["SquareUnion", [8852]],
          ["squarf", [9642]],
          ["squ", [9633]],
          ["squf", [9642]],
          ["srarr", [8594]],
          ["Sscr", [119982]],
          ["sscr", [120008]],
          ["ssetmn", [8726]],
          ["ssmile", [8995]],
          ["sstarf", [8902]],
          ["Star", [8902]],
          ["star", [9734]],
          ["starf", [9733]],
          ["straightepsilon", [1013]],
          ["straightphi", [981]],
          ["strns", [175]],
          ["sub", [8834]],
          ["Sub", [8912]],
          ["subdot", [10941]],
          ["subE", [10949]],
          ["sube", [8838]],
          ["subedot", [10947]],
          ["submult", [10945]],
          ["subnE", [10955]],
          ["subne", [8842]],
          ["subplus", [10943]],
          ["subrarr", [10617]],
          ["subset", [8834]],
          ["Subset", [8912]],
          ["subseteq", [8838]],
          ["subseteqq", [10949]],
          ["SubsetEqual", [8838]],
          ["subsetneq", [8842]],
          ["subsetneqq", [10955]],
          ["subsim", [10951]],
          ["subsub", [10965]],
          ["subsup", [10963]],
          ["succapprox", [10936]],
          ["succ", [8827]],
          ["succcurlyeq", [8829]],
          ["Succeeds", [8827]],
          ["SucceedsEqual", [10928]],
          ["SucceedsSlantEqual", [8829]],
          ["SucceedsTilde", [8831]],
          ["succeq", [10928]],
          ["succnapprox", [10938]],
          ["succneqq", [10934]],
          ["succnsim", [8937]],
          ["succsim", [8831]],
          ["SuchThat", [8715]],
          ["sum", [8721]],
          ["Sum", [8721]],
          ["sung", [9834]],
          ["sup1", [185]],
          ["sup2", [178]],
          ["sup3", [179]],
          ["sup", [8835]],
          ["Sup", [8913]],
          ["supdot", [10942]],
          ["supdsub", [10968]],
          ["supE", [10950]],
          ["supe", [8839]],
          ["supedot", [10948]],
          ["Superset", [8835]],
          ["SupersetEqual", [8839]],
          ["suphsol", [10185]],
          ["suphsub", [10967]],
          ["suplarr", [10619]],
          ["supmult", [10946]],
          ["supnE", [10956]],
          ["supne", [8843]],
          ["supplus", [10944]],
          ["supset", [8835]],
          ["Supset", [8913]],
          ["supseteq", [8839]],
          ["supseteqq", [10950]],
          ["supsetneq", [8843]],
          ["supsetneqq", [10956]],
          ["supsim", [10952]],
          ["supsub", [10964]],
          ["supsup", [10966]],
          ["swarhk", [10534]],
          ["swarr", [8601]],
          ["swArr", [8665]],
          ["swarrow", [8601]],
          ["swnwar", [10538]],
          ["szlig", [223]],
          ["Tab", [9]],
          ["target", [8982]],
          ["Tau", [932]],
          ["tau", [964]],
          ["tbrk", [9140]],
          ["Tcaron", [356]],
          ["tcaron", [357]],
          ["Tcedil", [354]],
          ["tcedil", [355]],
          ["Tcy", [1058]],
          ["tcy", [1090]],
          ["tdot", [8411]],
          ["telrec", [8981]],
          ["Tfr", [120087]],
          ["tfr", [120113]],
          ["there4", [8756]],
          ["therefore", [8756]],
          ["Therefore", [8756]],
          ["Theta", [920]],
          ["theta", [952]],
          ["thetasym", [977]],
          ["thetav", [977]],
          ["thickapprox", [8776]],
          ["thicksim", [8764]],
          ["ThickSpace", [8287, 8202]],
          ["ThinSpace", [8201]],
          ["thinsp", [8201]],
          ["thkap", [8776]],
          ["thksim", [8764]],
          ["THORN", [222]],
          ["thorn", [254]],
          ["tilde", [732]],
          ["Tilde", [8764]],
          ["TildeEqual", [8771]],
          ["TildeFullEqual", [8773]],
          ["TildeTilde", [8776]],
          ["timesbar", [10801]],
          ["timesb", [8864]],
          ["times", [215]],
          ["timesd", [10800]],
          ["tint", [8749]],
          ["toea", [10536]],
          ["topbot", [9014]],
          ["topcir", [10993]],
          ["top", [8868]],
          ["Topf", [120139]],
          ["topf", [120165]],
          ["topfork", [10970]],
          ["tosa", [10537]],
          ["tprime", [8244]],
          ["trade", [8482]],
          ["TRADE", [8482]],
          ["triangle", [9653]],
          ["triangledown", [9663]],
          ["triangleleft", [9667]],
          ["trianglelefteq", [8884]],
          ["triangleq", [8796]],
          ["triangleright", [9657]],
          ["trianglerighteq", [8885]],
          ["tridot", [9708]],
          ["trie", [8796]],
          ["triminus", [10810]],
          ["TripleDot", [8411]],
          ["triplus", [10809]],
          ["trisb", [10701]],
          ["tritime", [10811]],
          ["trpezium", [9186]],
          ["Tscr", [119983]],
          ["tscr", [120009]],
          ["TScy", [1062]],
          ["tscy", [1094]],
          ["TSHcy", [1035]],
          ["tshcy", [1115]],
          ["Tstrok", [358]],
          ["tstrok", [359]],
          ["twixt", [8812]],
          ["twoheadleftarrow", [8606]],
          ["twoheadrightarrow", [8608]],
          ["Uacute", [218]],
          ["uacute", [250]],
          ["uarr", [8593]],
          ["Uarr", [8607]],
          ["uArr", [8657]],
          ["Uarrocir", [10569]],
          ["Ubrcy", [1038]],
          ["ubrcy", [1118]],
          ["Ubreve", [364]],
          ["ubreve", [365]],
          ["Ucirc", [219]],
          ["ucirc", [251]],
          ["Ucy", [1059]],
          ["ucy", [1091]],
          ["udarr", [8645]],
          ["Udblac", [368]],
          ["udblac", [369]],
          ["udhar", [10606]],
          ["ufisht", [10622]],
          ["Ufr", [120088]],
          ["ufr", [120114]],
          ["Ugrave", [217]],
          ["ugrave", [249]],
          ["uHar", [10595]],
          ["uharl", [8639]],
          ["uharr", [8638]],
          ["uhblk", [9600]],
          ["ulcorn", [8988]],
          ["ulcorner", [8988]],
          ["ulcrop", [8975]],
          ["ultri", [9720]],
          ["Umacr", [362]],
          ["umacr", [363]],
          ["uml", [168]],
          ["UnderBar", [95]],
          ["UnderBrace", [9183]],
          ["UnderBracket", [9141]],
          ["UnderParenthesis", [9181]],
          ["Union", [8899]],
          ["UnionPlus", [8846]],
          ["Uogon", [370]],
          ["uogon", [371]],
          ["Uopf", [120140]],
          ["uopf", [120166]],
          ["UpArrowBar", [10514]],
          ["uparrow", [8593]],
          ["UpArrow", [8593]],
          ["Uparrow", [8657]],
          ["UpArrowDownArrow", [8645]],
          ["updownarrow", [8597]],
          ["UpDownArrow", [8597]],
          ["Updownarrow", [8661]],
          ["UpEquilibrium", [10606]],
          ["upharpoonleft", [8639]],
          ["upharpoonright", [8638]],
          ["uplus", [8846]],
          ["UpperLeftArrow", [8598]],
          ["UpperRightArrow", [8599]],
          ["upsi", [965]],
          ["Upsi", [978]],
          ["upsih", [978]],
          ["Upsilon", [933]],
          ["upsilon", [965]],
          ["UpTeeArrow", [8613]],
          ["UpTee", [8869]],
          ["upuparrows", [8648]],
          ["urcorn", [8989]],
          ["urcorner", [8989]],
          ["urcrop", [8974]],
          ["Uring", [366]],
          ["uring", [367]],
          ["urtri", [9721]],
          ["Uscr", [119984]],
          ["uscr", [120010]],
          ["utdot", [8944]],
          ["Utilde", [360]],
          ["utilde", [361]],
          ["utri", [9653]],
          ["utrif", [9652]],
          ["uuarr", [8648]],
          ["Uuml", [220]],
          ["uuml", [252]],
          ["uwangle", [10663]],
          ["vangrt", [10652]],
          ["varepsilon", [1013]],
          ["varkappa", [1008]],
          ["varnothing", [8709]],
          ["varphi", [981]],
          ["varpi", [982]],
          ["varpropto", [8733]],
          ["varr", [8597]],
          ["vArr", [8661]],
          ["varrho", [1009]],
          ["varsigma", [962]],
          ["varsubsetneq", [8842, 65024]],
          ["varsubsetneqq", [10955, 65024]],
          ["varsupsetneq", [8843, 65024]],
          ["varsupsetneqq", [10956, 65024]],
          ["vartheta", [977]],
          ["vartriangleleft", [8882]],
          ["vartriangleright", [8883]],
          ["vBar", [10984]],
          ["Vbar", [10987]],
          ["vBarv", [10985]],
          ["Vcy", [1042]],
          ["vcy", [1074]],
          ["vdash", [8866]],
          ["vDash", [8872]],
          ["Vdash", [8873]],
          ["VDash", [8875]],
          ["Vdashl", [10982]],
          ["veebar", [8891]],
          ["vee", [8744]],
          ["Vee", [8897]],
          ["veeeq", [8794]],
          ["vellip", [8942]],
          ["verbar", [124]],
          ["Verbar", [8214]],
          ["vert", [124]],
          ["Vert", [8214]],
          ["VerticalBar", [8739]],
          ["VerticalLine", [124]],
          ["VerticalSeparator", [10072]],
          ["VerticalTilde", [8768]],
          ["VeryThinSpace", [8202]],
          ["Vfr", [120089]],
          ["vfr", [120115]],
          ["vltri", [8882]],
          ["vnsub", [8834, 8402]],
          ["vnsup", [8835, 8402]],
          ["Vopf", [120141]],
          ["vopf", [120167]],
          ["vprop", [8733]],
          ["vrtri", [8883]],
          ["Vscr", [119985]],
          ["vscr", [120011]],
          ["vsubnE", [10955, 65024]],
          ["vsubne", [8842, 65024]],
          ["vsupnE", [10956, 65024]],
          ["vsupne", [8843, 65024]],
          ["Vvdash", [8874]],
          ["vzigzag", [10650]],
          ["Wcirc", [372]],
          ["wcirc", [373]],
          ["wedbar", [10847]],
          ["wedge", [8743]],
          ["Wedge", [8896]],
          ["wedgeq", [8793]],
          ["weierp", [8472]],
          ["Wfr", [120090]],
          ["wfr", [120116]],
          ["Wopf", [120142]],
          ["wopf", [120168]],
          ["wp", [8472]],
          ["wr", [8768]],
          ["wreath", [8768]],
          ["Wscr", [119986]],
          ["wscr", [120012]],
          ["xcap", [8898]],
          ["xcirc", [9711]],
          ["xcup", [8899]],
          ["xdtri", [9661]],
          ["Xfr", [120091]],
          ["xfr", [120117]],
          ["xharr", [10231]],
          ["xhArr", [10234]],
          ["Xi", [926]],
          ["xi", [958]],
          ["xlarr", [10229]],
          ["xlArr", [10232]],
          ["xmap", [10236]],
          ["xnis", [8955]],
          ["xodot", [10752]],
          ["Xopf", [120143]],
          ["xopf", [120169]],
          ["xoplus", [10753]],
          ["xotime", [10754]],
          ["xrarr", [10230]],
          ["xrArr", [10233]],
          ["Xscr", [119987]],
          ["xscr", [120013]],
          ["xsqcup", [10758]],
          ["xuplus", [10756]],
          ["xutri", [9651]],
          ["xvee", [8897]],
          ["xwedge", [8896]],
          ["Yacute", [221]],
          ["yacute", [253]],
          ["YAcy", [1071]],
          ["yacy", [1103]],
          ["Ycirc", [374]],
          ["ycirc", [375]],
          ["Ycy", [1067]],
          ["ycy", [1099]],
          ["yen", [165]],
          ["Yfr", [120092]],
          ["yfr", [120118]],
          ["YIcy", [1031]],
          ["yicy", [1111]],
          ["Yopf", [120144]],
          ["yopf", [120170]],
          ["Yscr", [119988]],
          ["yscr", [120014]],
          ["YUcy", [1070]],
          ["yucy", [1102]],
          ["yuml", [255]],
          ["Yuml", [376]],
          ["Zacute", [377]],
          ["zacute", [378]],
          ["Zcaron", [381]],
          ["zcaron", [382]],
          ["Zcy", [1047]],
          ["zcy", [1079]],
          ["Zdot", [379]],
          ["zdot", [380]],
          ["zeetrf", [8488]],
          ["ZeroWidthSpace", [8203]],
          ["Zeta", [918]],
          ["zeta", [950]],
          ["zfr", [120119]],
          ["Zfr", [8488]],
          ["ZHcy", [1046]],
          ["zhcy", [1078]],
          ["zigrarr", [8669]],
          ["zopf", [120171]],
          ["Zopf", [8484]],
          ["Zscr", [119989]],
          ["zscr", [120015]],
          ["zwj", [8205]],
          ["zwnj", [8204]]
        ];
        var alphaIndex = {};
        var charIndex = {};
        createIndexes(alphaIndex, charIndex);
        var Html5Entities = /** @class */ (function() {
          function Html5Entities() {}
          Html5Entities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
              var chr;
              if (entity.charAt(0) === "#") {
                var code =
                  entity.charAt(1) === "x"
                    ? parseInt(entity.substr(2).toLowerCase(), 16)
                    : parseInt(entity.substr(1));
                if (!(isNaN(code) || code < -32768 || code > 65535)) {
                  chr = String.fromCharCode(code);
                }
              } else {
                chr = alphaIndex[entity];
              }
              return chr || s;
            });
          };
          Html5Entities.decode = function(str) {
            return new Html5Entities().decode(str);
          };
          Html5Entities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var charInfo = charIndex[str.charCodeAt(i)];
              if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                  i++;
                } else {
                  alpha = charInfo[""];
                }
                if (alpha) {
                  result += "&" + alpha + ";";
                  i++;
                  continue;
                }
              }
              result += str.charAt(i);
              i++;
            }
            return result;
          };
          Html5Entities.encode = function(str) {
            return new Html5Entities().encode(str);
          };
          Html5Entities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              var charInfo = charIndex[c];
              if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                  i++;
                } else {
                  alpha = charInfo[""];
                }
                if (alpha) {
                  result += "&" + alpha + ";";
                  i++;
                  continue;
                }
              }
              if (c < 32 || c > 126) {
                result += "&#" + c + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          Html5Entities.encodeNonUTF = function(str) {
            return new Html5Entities().encodeNonUTF(str);
          };
          Html5Entities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          Html5Entities.encodeNonASCII = function(str) {
            return new Html5Entities().encodeNonASCII(str);
          };
          return Html5Entities;
        })();
        exports.Html5Entities = Html5Entities;
        function createIndexes(alphaIndex, charIndex) {
          var i = ENTITIES.length;
          while (i--) {
            var e = ENTITIES[i];
            var alpha = e[0];
            var chars = e[1];
            var chr = chars[0];
            var addChar =
              chr < 32 ||
              chr > 126 ||
              chr === 62 ||
              chr === 60 ||
              chr === 38 ||
              chr === 34 ||
              chr === 39;
            var charInfo = void 0;
            if (addChar) {
              charInfo = charIndex[chr] = charIndex[chr] || {};
            }
            if (chars[1]) {
              var chr2 = chars[1];
              alphaIndex[alpha] =
                String.fromCharCode(chr) + String.fromCharCode(chr2);
              addChar && (charInfo[chr2] = alpha);
            } else {
              alphaIndex[alpha] = String.fromCharCode(chr);
              addChar && (charInfo[""] = alpha);
            }
          }
        }

        /***/
      },

    /***/ "../paperclip-utils/node_modules/html-entities/lib/index.js":
      /*!******************************************************************!*\
  !*** ../paperclip-utils/node_modules/html-entities/lib/index.js ***!
  \******************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var xml_entities_1 = __webpack_require__(
          /*! ./xml-entities */ "../paperclip-utils/node_modules/html-entities/lib/xml-entities.js"
        );
        exports.XmlEntities = xml_entities_1.XmlEntities;
        var html4_entities_1 = __webpack_require__(
          /*! ./html4-entities */ "../paperclip-utils/node_modules/html-entities/lib/html4-entities.js"
        );
        exports.Html4Entities = html4_entities_1.Html4Entities;
        var html5_entities_1 = __webpack_require__(
          /*! ./html5-entities */ "../paperclip-utils/node_modules/html-entities/lib/html5-entities.js"
        );
        exports.Html5Entities = html5_entities_1.Html5Entities;
        exports.AllHtmlEntities = html5_entities_1.Html5Entities;

        /***/
      },

    /***/ "../paperclip-utils/node_modules/html-entities/lib/xml-entities.js":
      /*!*************************************************************************!*\
  !*** ../paperclip-utils/node_modules/html-entities/lib/xml-entities.js ***!
  \*************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var ALPHA_INDEX = {
          "&lt": "<",
          "&gt": ">",
          "&quot": '"',
          "&apos": "'",
          "&amp": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&apos;": "'",
          "&amp;": "&"
        };
        var CHAR_INDEX = {
          60: "lt",
          62: "gt",
          34: "quot",
          39: "apos",
          38: "amp"
        };
        var CHAR_S_INDEX = {
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
          "&": "&amp;"
        };
        var XmlEntities = /** @class */ (function() {
          function XmlEntities() {}
          XmlEntities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/[<>"'&]/g, function(s) {
              return CHAR_S_INDEX[s];
            });
          };
          XmlEntities.encode = function(str) {
            return new XmlEntities().encode(str);
          };
          XmlEntities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&#?[0-9a-zA-Z]+;?/g, function(s) {
              if (s.charAt(1) === "#") {
                var code =
                  s.charAt(2).toLowerCase() === "x"
                    ? parseInt(s.substr(3), 16)
                    : parseInt(s.substr(2));
                if (isNaN(code) || code < -32768 || code > 65535) {
                  return "";
                }
                return String.fromCharCode(code);
              }
              return ALPHA_INDEX[s] || s;
            });
          };
          XmlEntities.decode = function(str) {
            return new XmlEntities().decode(str);
          };
          XmlEntities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              var alpha = CHAR_INDEX[c];
              if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
              }
              if (c < 32 || c > 126) {
                result += "&#" + c + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          XmlEntities.encodeNonUTF = function(str) {
            return new XmlEntities().encodeNonUTF(str);
          };
          XmlEntities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLenght = str.length;
            var result = "";
            var i = 0;
            while (i < strLenght) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          XmlEntities.encodeNonASCII = function(str) {
            return new XmlEntities().encodeNonASCII(str);
          };
          return XmlEntities;
        })();
        exports.XmlEntities = XmlEntities;

        /***/
      },

    /***/ "../paperclip-web-renderer/index.js":
      /*!******************************************!*\
  !*** ../paperclip-web-renderer/index.js ***!
  \******************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(
          /*! ./lib */ "../paperclip-web-renderer/lib/index.js"
        );

        /***/
      },

    /***/ "../paperclip-web-renderer/lib/dom-patcher.js":
      /*!****************************************************!*\
  !*** ../paperclip-web-renderer/lib/dom-patcher.js ***!
  \****************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.patchNativeNode = void 0;
        var html_entities_1 = __webpack_require__(
          /*! html-entities */ "../paperclip-web-renderer/node_modules/html-entities/lib/index.js"
        );
        var native_renderer_1 = __webpack_require__(
          /*! ./native-renderer */ "../paperclip-web-renderer/lib/native-renderer.js"
        );
        var paperclip_utils_1 = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        var utils_1 = __webpack_require__(
          /*! ./utils */ "../paperclip-web-renderer/lib/utils.js"
        );
        var entities = new html_entities_1.Html5Entities();
        exports.patchNativeNode = function(
          mount,
          mutations,
          factory,
          protocol
        ) {
          for (
            var _i = 0, mutations_1 = mutations;
            _i < mutations_1.length;
            _i++
          ) {
            var mutation = mutations_1[_i];
            var target = getTarget(mount, mutation);
            var action = mutation.action;
            switch (action.kind) {
              case paperclip_utils_1.ActionKind.DeleteChild: {
                var child = target.childNodes[action.index];
                target.removeChild(child);
                break;
              }
              case paperclip_utils_1.ActionKind.InsertChild: {
                var newChild = native_renderer_1.createNativeNode(
                  action.child,
                  factory,
                  protocol,
                  target.namespaceURI
                );
                if (action.index >= target.childNodes.length) {
                  target.appendChild(newChild);
                } else {
                  target.insertBefore(
                    newChild,
                    target.childNodes[action.index]
                  );
                }
                break;
              }
              case paperclip_utils_1.ActionKind.ReplaceNode: {
                var parent_1 = target.parentNode;
                parent_1.insertBefore(
                  native_renderer_1.createNativeNode(
                    action.replacement,
                    factory,
                    protocol,
                    parent_1.namespaceURI
                  ),
                  target
                );
                target.remove();
                break;
              }
              case paperclip_utils_1.ActionKind.RemoveAttribute: {
                var element = target;
                element.removeAttribute(
                  utils_1.ATTR_ALIASES[action.name] || action.name
                );
                break;
              }
              case paperclip_utils_1.ActionKind.SetAttribute: {
                var element = target;
                var aliasName =
                  utils_1.ATTR_ALIASES[action.name] || action.name;
                var value = action.value || "";
                if (value.indexOf("file:") === 0) {
                  value = value.replace("file:", protocol);
                }
                element.setAttribute(aliasName, value);
                break;
              }
              case paperclip_utils_1.ActionKind.SetText: {
                var text = target;
                text.nodeValue = entities.decode(action.value);
                break;
              }
            }
          }
        };
        var getTarget = function(mount, mutation) {
          return mutation.nodePath.reduce(function(current, i) {
            return current.childNodes[i];
          }, mount);
        };

        /***/
      },

    /***/ "../paperclip-web-renderer/lib/index.js":
      /*!**********************************************!*\
  !*** ../paperclip-web-renderer/lib/index.js ***!
  \**********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function(o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function() {
                    return m[k];
                  }
                });
              }
            : function(o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function(m, exports) {
            for (var p in m)
              if (p !== "default" && !exports.hasOwnProperty(p))
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, "__esModule", { value: true });
        __exportStar(
          __webpack_require__(
            /*! ./renderer */ "../paperclip-web-renderer/lib/renderer.js"
          ),
          exports
        );

        /***/
      },

    /***/ "../paperclip-web-renderer/lib/native-renderer.js":
      /*!********************************************************!*\
  !*** ../paperclip-web-renderer/lib/native-renderer.js ***!
  \********************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.createNativeStyleFromSheet = exports.createNativeNode = exports.getNativeNodePath = void 0;
        var html_entities_1 = __webpack_require__(
          /*! html-entities */ "../paperclip-web-renderer/node_modules/html-entities/lib/index.js"
        );
        var paperclip_utils_1 = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        var utils_1 = __webpack_require__(
          /*! ./utils */ "../paperclip-web-renderer/lib/utils.js"
        );
        var entities = new html_entities_1.Html5Entities();
        var XMLNS_NAMESPACE = "http://www.w3.org/2000/svg";
        exports.getNativeNodePath = function(root, node) {
          var path = [];
          var current = node;
          while (current.parentNode !== root) {
            path.unshift(
              Array.prototype.indexOf.call(
                current.parentNode.childNodes,
                current
              )
            );
            current = current.parentNode;
          }
          return path;
        };
        exports.createNativeNode = function(
          node,
          factory,
          protocol,
          namespaceURI
        ) {
          // return document.createTextNode(JSON.stringify(node, null, 2));
          if (!node) {
            return factory.createTextNode("");
          }
          try {
            switch (node.kind) {
              case "Text": {
                var text = createNativeTextNode(node, factory);
                return text;
              }
              case "Element":
                return createNativeElement(
                  node,
                  factory,
                  protocol,
                  namespaceURI
                );
              case "StyleElement":
                return exports.createNativeStyleFromSheet(
                  node.sheet,
                  factory,
                  protocol
                );
              case "Fragment":
                return createNativeFragment(node, factory, protocol);
            }
          } catch (e) {
            return factory.createTextNode(String(e.stack));
          }
        };
        exports.createNativeStyleFromSheet = function(
          sheet,
          factory,
          protocol
        ) {
          // return factory.createTextNode(JSON.stringify(element.sheet, null, 2));
          // return factory.createTextNode(stringifyCSSSheet(sheet, protocol)) as any;
          var nativeElement = factory.createElement("style");
          nativeElement.textContent = paperclip_utils_1.stringifyCSSSheet(
            sheet,
            protocol
          );
          return nativeElement;
        };
        var createNativeTextNode = function(node, factory) {
          return factory.createTextNode(entities.decode(node.value));
        };
        var createNativeElement = function(
          element,
          factory,
          protocol,
          namespaceUri
        ) {
          // return factory.createTextNode(JSON.stringify(element, null, 2));
          var nativeElement =
            element.tagName === "svg"
              ? document.createElementNS(XMLNS_NAMESPACE, "svg")
              : namespaceUri
              ? factory.createElementNS(namespaceUri, element.tagName)
              : factory.createElement(element.tagName);
          var childNamespaceUri =
            element.tagName === "svg" ? XMLNS_NAMESPACE : namespaceUri;
          for (var name_1 in element.attributes) {
            var value = element.attributes[name_1];
            if (name_1 === "src" && protocol) {
              value = value.replace("file:", protocol);
            }
            var aliasName = utils_1.ATTR_ALIASES[name_1] || name_1;
            nativeElement.setAttribute(aliasName, value);
          }
          for (var _i = 0, _a = element.children; _i < _a.length; _i++) {
            var child = _a[_i];
            nativeElement.appendChild(
              exports.createNativeNode(
                child,
                factory,
                protocol,
                childNamespaceUri
              )
            );
          }
          // prevent redirects & vscode from asking to redirect.
          if (element.tagName === "a") {
            nativeElement.onclick = utils_1.preventDefault;
            nativeElement.onmouseup = utils_1.preventDefault;
            nativeElement.onmousedown = utils_1.preventDefault;
          }
          // return document.createTextNode(nativeElement.outerHTML);
          return nativeElement;
        };
        var createNativeFragment = function(fragment, factory, protocol) {
          var nativeFragment = factory.createDocumentFragment();
          for (var _i = 0, _a = fragment.children; _i < _a.length; _i++) {
            var child = _a[_i];
            nativeFragment.appendChild(
              exports.createNativeNode(
                child,
                factory,
                protocol,
                nativeFragment.namespaceURI
              )
            );
          }
          return nativeFragment;
        };

        /***/
      },

    /***/ "../paperclip-web-renderer/lib/renderer.js":
      /*!*************************************************!*\
  !*** ../paperclip-web-renderer/lib/renderer.js ***!
  \*************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.Renderer = void 0;
        var native_renderer_1 = __webpack_require__(
          /*! ./native-renderer */ "../paperclip-web-renderer/lib/native-renderer.js"
        );
        var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
        var paperclip_utils_1 = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        var events_1 = __webpack_require__(
          /*! events */ "./node_modules/events/events.js"
        );
        var utils_1 = __webpack_require__(
          /*! ./utils */ "../paperclip-web-renderer/lib/utils.js"
        );
        var dom_patcher_1 = __webpack_require__(
          /*! ./dom-patcher */ "../paperclip-web-renderer/lib/dom-patcher.js"
        );
        var RenderEventTypes;
        (function(RenderEventTypes) {
          RenderEventTypes["META_CLICK"] = "META_CLICK";
          RenderEventTypes["ERROR_BANNER_CLICK"] = "ERROR_BANNER_CLICK";
        })(RenderEventTypes || (RenderEventTypes = {}));
        var Renderer = /** @class */ (function() {
          function Renderer(protocol, targetUri, _domFactory) {
            var _this = this;
            if (_domFactory === void 0) {
              _domFactory = document;
            }
            this.protocol = protocol;
            this.targetUri = targetUri;
            this._domFactory = _domFactory;
            this._dependencies = [];
            this.onMetaClick = function(listener) {
              _this._em.addListener(RenderEventTypes.META_CLICK, listener);
            };
            this.onErrorBannerClick = function(listener) {
              _this._em.addListener(
                RenderEventTypes.ERROR_BANNER_CLICK,
                listener
              );
            };
            this.initialize = function(_a) {
              var sheet = _a.sheet,
                preview = _a.preview,
                importedSheets = _a.importedSheets;
              removeAllChildren(_this._stage);
              removeAllChildren(_this._mainStyleContainer);
              removeAllChildren(_this._importedStylesContainer);
              _this._virtualRootNode = preview;
              var node = native_renderer_1.createNativeNode(
                preview,
                _this._domFactory,
                _this.protocol,
                null
              );
              _this._dependencies = importedSheets.map(function(info) {
                return info.uri;
              });
              _this._addSheets(importedSheets);
              var style = native_renderer_1.createNativeStyleFromSheet(
                sheet,
                _this._domFactory,
                _this.protocol
              );
              _this._mainStyleContainer.appendChild(style);
              _this._stage.appendChild(node);
            };
            this._onErrorBannerClick = function(error) {
              _this._clearErrors();
              _this._em.emit(RenderEventTypes.ERROR_BANNER_CLICK, error);
            };
            this.handleEngineEvent = function(event) {
              _this._clearErrors();
              switch (event.kind) {
                case paperclip_utils_1.EngineEventKind.Error: {
                  _this.handleError(event);
                  break;
                }
                case paperclip_utils_1.EngineEventKind.ChangedSheets: {
                  if (event.uri === _this.targetUri) {
                    _this._dependencies = event.data.allDependencies;
                    _this._addSheets(event.data.newSheets);
                    _this._removeSheets(event.data.removedSheetUris);
                  }
                  break;
                }
                case paperclip_utils_1.EngineEventKind.Loaded: {
                  if (event.uri === _this.targetUri) {
                    _this._dependencies = event.data.allDependencies;
                    _this.initialize(event.data);
                  }
                  break;
                }
                case paperclip_utils_1.EngineEventKind.Evaluated: {
                  if (event.uri === _this.targetUri) {
                    _this._dependencies = event.data.allDependencies;
                  } else if (_this._dependencies.includes(event.uri)) {
                    var impStyle = _this._importedStyles[event.uri];
                    if (impStyle) {
                      impStyle.remove();
                    }
                    var style = (_this._importedStyles[
                      event.uri
                    ] = native_renderer_1.createNativeStyleFromSheet(
                      event.data.sheet,
                      _this._domFactory,
                      _this.protocol
                    ));
                    _this._importedStylesContainer.appendChild(style);
                  }
                  break;
                }
                case paperclip_utils_1.EngineEventKind.Diffed: {
                  if (event.uri === _this.targetUri) {
                    dom_patcher_1.patchNativeNode(
                      _this._stage,
                      event.data.mutations,
                      _this._domFactory,
                      _this.protocol
                    );
                    _this._virtualRootNode = paperclip_utils_1.patchVirtNode(
                      _this._virtualRootNode,
                      event.data.mutations
                    );
                    if (event.data.sheet) {
                      removeAllChildren(_this._mainStyleContainer);
                      var sheet = native_renderer_1.createNativeStyleFromSheet(
                        event.data.sheet,
                        _this._domFactory,
                        _this.protocol
                      );
                      _this._mainStyleContainer.appendChild(sheet);
                    }
                    for (var importedSheetUri in _this._importedStyles) {
                      if (
                        !event.data.allDependencies.includes(importedSheetUri)
                      ) {
                        var sheet = _this._importedStyles[importedSheetUri];
                        sheet.remove();
                        delete _this._importedStyles[importedSheetUri];
                      }
                    }
                  } else if (event.data.sheet) {
                    // this._importedStylesContainer.appendChild(createNativeStyleFromSheet(event.sheet, this._domFactory, this.protocol));
                    var impStyle = _this._importedStyles[event.uri];
                    if (impStyle) {
                      impStyle.remove();
                    }
                    var element = (_this._importedStyles[
                      event.uri
                    ] = native_renderer_1.createNativeStyleFromSheet(
                      event.data.sheet,
                      _this._domFactory,
                      _this.protocol
                    ));
                    _this._importedStylesContainer.appendChild(element);
                  }
                  break;
                }
              }
            };
            this._onStageMouseDown = function(event) {
              event.preventDefault();
              event.stopImmediatePropagation();
              var element = event.target;
              if (element.nodeType !== 1 || !event.metaKey) return;
              var nodePath = native_renderer_1.getNativeNodePath(
                _this.mount,
                element
              );
              var virtNode = paperclip_utils_1.getVirtTarget(
                _this._virtualRootNode,
                nodePath
              );
              if (!virtNode) return;
              _this._em.emit(RenderEventTypes.META_CLICK, virtNode);
            };
            this._onStageMouseOver = function(event) {
              var element = event.target;
              var elementWindow = element.ownerDocument.defaultView;
              if (element.nodeType !== 1 || !event.metaKey) return;
              _this.mount.style.cursor = "pointer";
              var rect = element.getBoundingClientRect();
              Object.assign(_this._hoverOverlay.style, {
                display: "block",
                left: elementWindow.document.body.scrollLeft + rect.left + "px",
                top: elementWindow.document.body.scrollTop + rect.top + "px",
                width: rect.width + "px",
                height: rect.height + "px"
              });
            };
            this._onStageMouseOut = function(event) {
              var element = event.target;
              if (element.nodeType !== 1) return;
              _this.mount.style.cursor = "default";
              Object.assign(_this._hoverOverlay.style, {
                display: "none"
              });
            };
            this._importedStyles = {};
            this._em = new events_1.EventEmitter();
            this._errorOverlay = _domFactory.createElement("div");
            Object.assign(this._errorOverlay.style, {
              zIndex: 1024,
              position: "fixed",
              top: 0,
              left: 0
            });
            this._hoverOverlay = _domFactory.createElement("div");
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
            });
            this._stage = this._domFactory.createElement("div");
            this.mount = this._domFactory.createElement("div");
            this._mainStyleContainer = this._domFactory.createElement("div");
            this._importedStylesContainer = this._domFactory.createElement(
              "div"
            );
            this.mount.appendChild(this._importedStylesContainer);
            this.mount.appendChild(this._mainStyleContainer);
            this.mount.appendChild(this._stage);
            this.mount.appendChild(this._hoverOverlay);
            this.mount.appendChild(this._errorOverlay);
            this._stage.addEventListener(
              "mousedown",
              this._onStageMouseDown,
              true
            );
            this._stage.addEventListener(
              "mouseup",
              utils_1.preventDefault,
              true
            );
            this._stage.addEventListener("mouseover", this._onStageMouseOver);
            this._stage.addEventListener("mouseout", this._onStageMouseOut);
          }
          Renderer.prototype._addSheets = function(importedSheets) {
            for (
              var _i = 0, importedSheets_1 = importedSheets;
              _i < importedSheets_1.length;
              _i++
            ) {
              var _a = importedSheets_1[_i],
                uri = _a.uri,
                sheet = _a.sheet;
              var nativeSheet = native_renderer_1.createNativeStyleFromSheet(
                sheet,
                this._domFactory,
                this.protocol
              );
              this._importedStyles[uri] = nativeSheet;
              this._importedStylesContainer.appendChild(nativeSheet);
            }
          };
          Renderer.prototype._removeSheets = function(uris) {
            for (var _i = 0, uris_1 = uris; _i < uris_1.length; _i++) {
              var uri = uris_1[_i];
              // Note that this should always exist. If null, then we want an error to be thrown.
              this._importedStyles[uri].remove();
              delete this._importedStyles[uri];
            }
          };
          Renderer.prototype._clearErrors = function() {
            removeAllChildren(this._errorOverlay);
          };
          Renderer.prototype.handleError = function(error) {
            var message;
            var uri = error.uri;
            // running in node
            if (typeof window == "undefined") {
              return;
            }
            // Only want to show errors that are outside of this doc since they
            // may be preventing this doc from rendering. Also, errors will be displayed
            // in the code editor, so this is redundant. Also! Displaying errors on the canvas
            // while it's being edited is visually jaaring. So it shouldn't be done!
            if (uri === this.targetUri) {
              return;
            }
            switch (error.errorKind) {
              case paperclip_utils_1.EngineErrorKind.Graph: {
                message = error.info.message;
                break;
              }
              default: {
                message = error.message;
              }
            }
            var errorElement = this._domFactory.createElement("div");
            // url.fileURLToPath may be null in some cases
            try {
              // To style this, copy & paste in paperclip.
              errorElement.innerHTML =
                '\n      <div style="position: fixed; cursor: pointer; bottom: 0; width: 100%; word-break: break-word; box-sizing: border-box; font-family: Helvetica; padding: 10px; background: rgb(255, 152, 152); color: rgb(138, 31, 31); line-height: 1.1em">\n        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">\n          Error&nbsp;in&nbsp;' +
                url.fileURLToPath(uri) +
                ':\n        </div>\n        <div style="font-size: 14px;">\n        ' +
                message +
                "\n        </div>\n      </div>\n      ";
              errorElement.onclick = this._onErrorBannerClick.bind(this, error);
              this._errorOverlay.appendChild(errorElement);
            } catch (e) {}
          };
          return Renderer;
        })();
        exports.Renderer = Renderer;
        var removeAllChildren = function(node) {
          while (node.childNodes.length) {
            node.removeChild(node.childNodes[0]);
          }
        };

        /***/
      },

    /***/ "../paperclip-web-renderer/lib/utils.js":
      /*!**********************************************!*\
  !*** ../paperclip-web-renderer/lib/utils.js ***!
  \**********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        exports.ATTR_ALIASES = exports.preventDefault = void 0;
        exports.preventDefault = function(event) {
          event.stopPropagation();
          event.preventDefault();
          return false;
        };
        exports.ATTR_ALIASES = {
          className: "class"
        };

        /***/
      },

    /***/ "../paperclip-web-renderer/node_modules/html-entities/lib/html4-entities.js":
      /*!**********************************************************************************!*\
  !*** ../paperclip-web-renderer/node_modules/html-entities/lib/html4-entities.js ***!
  \**********************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var HTML_ALPHA = [
          "apos",
          "nbsp",
          "iexcl",
          "cent",
          "pound",
          "curren",
          "yen",
          "brvbar",
          "sect",
          "uml",
          "copy",
          "ordf",
          "laquo",
          "not",
          "shy",
          "reg",
          "macr",
          "deg",
          "plusmn",
          "sup2",
          "sup3",
          "acute",
          "micro",
          "para",
          "middot",
          "cedil",
          "sup1",
          "ordm",
          "raquo",
          "frac14",
          "frac12",
          "frac34",
          "iquest",
          "Agrave",
          "Aacute",
          "Acirc",
          "Atilde",
          "Auml",
          "Aring",
          "Aelig",
          "Ccedil",
          "Egrave",
          "Eacute",
          "Ecirc",
          "Euml",
          "Igrave",
          "Iacute",
          "Icirc",
          "Iuml",
          "ETH",
          "Ntilde",
          "Ograve",
          "Oacute",
          "Ocirc",
          "Otilde",
          "Ouml",
          "times",
          "Oslash",
          "Ugrave",
          "Uacute",
          "Ucirc",
          "Uuml",
          "Yacute",
          "THORN",
          "szlig",
          "agrave",
          "aacute",
          "acirc",
          "atilde",
          "auml",
          "aring",
          "aelig",
          "ccedil",
          "egrave",
          "eacute",
          "ecirc",
          "euml",
          "igrave",
          "iacute",
          "icirc",
          "iuml",
          "eth",
          "ntilde",
          "ograve",
          "oacute",
          "ocirc",
          "otilde",
          "ouml",
          "divide",
          "oslash",
          "ugrave",
          "uacute",
          "ucirc",
          "uuml",
          "yacute",
          "thorn",
          "yuml",
          "quot",
          "amp",
          "lt",
          "gt",
          "OElig",
          "oelig",
          "Scaron",
          "scaron",
          "Yuml",
          "circ",
          "tilde",
          "ensp",
          "emsp",
          "thinsp",
          "zwnj",
          "zwj",
          "lrm",
          "rlm",
          "ndash",
          "mdash",
          "lsquo",
          "rsquo",
          "sbquo",
          "ldquo",
          "rdquo",
          "bdquo",
          "dagger",
          "Dagger",
          "permil",
          "lsaquo",
          "rsaquo",
          "euro",
          "fnof",
          "Alpha",
          "Beta",
          "Gamma",
          "Delta",
          "Epsilon",
          "Zeta",
          "Eta",
          "Theta",
          "Iota",
          "Kappa",
          "Lambda",
          "Mu",
          "Nu",
          "Xi",
          "Omicron",
          "Pi",
          "Rho",
          "Sigma",
          "Tau",
          "Upsilon",
          "Phi",
          "Chi",
          "Psi",
          "Omega",
          "alpha",
          "beta",
          "gamma",
          "delta",
          "epsilon",
          "zeta",
          "eta",
          "theta",
          "iota",
          "kappa",
          "lambda",
          "mu",
          "nu",
          "xi",
          "omicron",
          "pi",
          "rho",
          "sigmaf",
          "sigma",
          "tau",
          "upsilon",
          "phi",
          "chi",
          "psi",
          "omega",
          "thetasym",
          "upsih",
          "piv",
          "bull",
          "hellip",
          "prime",
          "Prime",
          "oline",
          "frasl",
          "weierp",
          "image",
          "real",
          "trade",
          "alefsym",
          "larr",
          "uarr",
          "rarr",
          "darr",
          "harr",
          "crarr",
          "lArr",
          "uArr",
          "rArr",
          "dArr",
          "hArr",
          "forall",
          "part",
          "exist",
          "empty",
          "nabla",
          "isin",
          "notin",
          "ni",
          "prod",
          "sum",
          "minus",
          "lowast",
          "radic",
          "prop",
          "infin",
          "ang",
          "and",
          "or",
          "cap",
          "cup",
          "int",
          "there4",
          "sim",
          "cong",
          "asymp",
          "ne",
          "equiv",
          "le",
          "ge",
          "sub",
          "sup",
          "nsub",
          "sube",
          "supe",
          "oplus",
          "otimes",
          "perp",
          "sdot",
          "lceil",
          "rceil",
          "lfloor",
          "rfloor",
          "lang",
          "rang",
          "loz",
          "spades",
          "clubs",
          "hearts",
          "diams"
        ];
        var HTML_CODES = [
          39,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          174,
          175,
          176,
          177,
          178,
          179,
          180,
          181,
          182,
          183,
          184,
          185,
          186,
          187,
          188,
          189,
          190,
          191,
          192,
          193,
          194,
          195,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          210,
          211,
          212,
          213,
          214,
          215,
          216,
          217,
          218,
          219,
          220,
          221,
          222,
          223,
          224,
          225,
          226,
          227,
          228,
          229,
          230,
          231,
          232,
          233,
          234,
          235,
          236,
          237,
          238,
          239,
          240,
          241,
          242,
          243,
          244,
          245,
          246,
          247,
          248,
          249,
          250,
          251,
          252,
          253,
          254,
          255,
          34,
          38,
          60,
          62,
          338,
          339,
          352,
          353,
          376,
          710,
          732,
          8194,
          8195,
          8201,
          8204,
          8205,
          8206,
          8207,
          8211,
          8212,
          8216,
          8217,
          8218,
          8220,
          8221,
          8222,
          8224,
          8225,
          8240,
          8249,
          8250,
          8364,
          402,
          913,
          914,
          915,
          916,
          917,
          918,
          919,
          920,
          921,
          922,
          923,
          924,
          925,
          926,
          927,
          928,
          929,
          931,
          932,
          933,
          934,
          935,
          936,
          937,
          945,
          946,
          947,
          948,
          949,
          950,
          951,
          952,
          953,
          954,
          955,
          956,
          957,
          958,
          959,
          960,
          961,
          962,
          963,
          964,
          965,
          966,
          967,
          968,
          969,
          977,
          978,
          982,
          8226,
          8230,
          8242,
          8243,
          8254,
          8260,
          8472,
          8465,
          8476,
          8482,
          8501,
          8592,
          8593,
          8594,
          8595,
          8596,
          8629,
          8656,
          8657,
          8658,
          8659,
          8660,
          8704,
          8706,
          8707,
          8709,
          8711,
          8712,
          8713,
          8715,
          8719,
          8721,
          8722,
          8727,
          8730,
          8733,
          8734,
          8736,
          8743,
          8744,
          8745,
          8746,
          8747,
          8756,
          8764,
          8773,
          8776,
          8800,
          8801,
          8804,
          8805,
          8834,
          8835,
          8836,
          8838,
          8839,
          8853,
          8855,
          8869,
          8901,
          8968,
          8969,
          8970,
          8971,
          9001,
          9002,
          9674,
          9824,
          9827,
          9829,
          9830
        ];
        var alphaIndex = {};
        var numIndex = {};
        (function() {
          var i = 0;
          var length = HTML_ALPHA.length;
          while (i < length) {
            var a = HTML_ALPHA[i];
            var c = HTML_CODES[i];
            alphaIndex[a] = String.fromCharCode(c);
            numIndex[c] = a;
            i++;
          }
        })();
        var Html4Entities = /** @class */ (function() {
          function Html4Entities() {}
          Html4Entities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
              var chr;
              if (entity.charAt(0) === "#") {
                var code =
                  entity.charAt(1).toLowerCase() === "x"
                    ? parseInt(entity.substr(2), 16)
                    : parseInt(entity.substr(1));
                if (!(isNaN(code) || code < -32768 || code > 65535)) {
                  chr = String.fromCharCode(code);
                }
              } else {
                chr = alphaIndex[entity];
              }
              return chr || s;
            });
          };
          Html4Entities.decode = function(str) {
            return new Html4Entities().decode(str);
          };
          Html4Entities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var alpha = numIndex[str.charCodeAt(i)];
              result += alpha ? "&" + alpha + ";" : str.charAt(i);
              i++;
            }
            return result;
          };
          Html4Entities.encode = function(str) {
            return new Html4Entities().encode(str);
          };
          Html4Entities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var cc = str.charCodeAt(i);
              var alpha = numIndex[cc];
              if (alpha) {
                result += "&" + alpha + ";";
              } else if (cc < 32 || cc > 126) {
                result += "&#" + cc + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          Html4Entities.encodeNonUTF = function(str) {
            return new Html4Entities().encodeNonUTF(str);
          };
          Html4Entities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          Html4Entities.encodeNonASCII = function(str) {
            return new Html4Entities().encodeNonASCII(str);
          };
          return Html4Entities;
        })();
        exports.Html4Entities = Html4Entities;

        /***/
      },

    /***/ "../paperclip-web-renderer/node_modules/html-entities/lib/html5-entities.js":
      /*!**********************************************************************************!*\
  !*** ../paperclip-web-renderer/node_modules/html-entities/lib/html5-entities.js ***!
  \**********************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var ENTITIES = [
          ["Aacute", [193]],
          ["aacute", [225]],
          ["Abreve", [258]],
          ["abreve", [259]],
          ["ac", [8766]],
          ["acd", [8767]],
          ["acE", [8766, 819]],
          ["Acirc", [194]],
          ["acirc", [226]],
          ["acute", [180]],
          ["Acy", [1040]],
          ["acy", [1072]],
          ["AElig", [198]],
          ["aelig", [230]],
          ["af", [8289]],
          ["Afr", [120068]],
          ["afr", [120094]],
          ["Agrave", [192]],
          ["agrave", [224]],
          ["alefsym", [8501]],
          ["aleph", [8501]],
          ["Alpha", [913]],
          ["alpha", [945]],
          ["Amacr", [256]],
          ["amacr", [257]],
          ["amalg", [10815]],
          ["amp", [38]],
          ["AMP", [38]],
          ["andand", [10837]],
          ["And", [10835]],
          ["and", [8743]],
          ["andd", [10844]],
          ["andslope", [10840]],
          ["andv", [10842]],
          ["ang", [8736]],
          ["ange", [10660]],
          ["angle", [8736]],
          ["angmsdaa", [10664]],
          ["angmsdab", [10665]],
          ["angmsdac", [10666]],
          ["angmsdad", [10667]],
          ["angmsdae", [10668]],
          ["angmsdaf", [10669]],
          ["angmsdag", [10670]],
          ["angmsdah", [10671]],
          ["angmsd", [8737]],
          ["angrt", [8735]],
          ["angrtvb", [8894]],
          ["angrtvbd", [10653]],
          ["angsph", [8738]],
          ["angst", [197]],
          ["angzarr", [9084]],
          ["Aogon", [260]],
          ["aogon", [261]],
          ["Aopf", [120120]],
          ["aopf", [120146]],
          ["apacir", [10863]],
          ["ap", [8776]],
          ["apE", [10864]],
          ["ape", [8778]],
          ["apid", [8779]],
          ["apos", [39]],
          ["ApplyFunction", [8289]],
          ["approx", [8776]],
          ["approxeq", [8778]],
          ["Aring", [197]],
          ["aring", [229]],
          ["Ascr", [119964]],
          ["ascr", [119990]],
          ["Assign", [8788]],
          ["ast", [42]],
          ["asymp", [8776]],
          ["asympeq", [8781]],
          ["Atilde", [195]],
          ["atilde", [227]],
          ["Auml", [196]],
          ["auml", [228]],
          ["awconint", [8755]],
          ["awint", [10769]],
          ["backcong", [8780]],
          ["backepsilon", [1014]],
          ["backprime", [8245]],
          ["backsim", [8765]],
          ["backsimeq", [8909]],
          ["Backslash", [8726]],
          ["Barv", [10983]],
          ["barvee", [8893]],
          ["barwed", [8965]],
          ["Barwed", [8966]],
          ["barwedge", [8965]],
          ["bbrk", [9141]],
          ["bbrktbrk", [9142]],
          ["bcong", [8780]],
          ["Bcy", [1041]],
          ["bcy", [1073]],
          ["bdquo", [8222]],
          ["becaus", [8757]],
          ["because", [8757]],
          ["Because", [8757]],
          ["bemptyv", [10672]],
          ["bepsi", [1014]],
          ["bernou", [8492]],
          ["Bernoullis", [8492]],
          ["Beta", [914]],
          ["beta", [946]],
          ["beth", [8502]],
          ["between", [8812]],
          ["Bfr", [120069]],
          ["bfr", [120095]],
          ["bigcap", [8898]],
          ["bigcirc", [9711]],
          ["bigcup", [8899]],
          ["bigodot", [10752]],
          ["bigoplus", [10753]],
          ["bigotimes", [10754]],
          ["bigsqcup", [10758]],
          ["bigstar", [9733]],
          ["bigtriangledown", [9661]],
          ["bigtriangleup", [9651]],
          ["biguplus", [10756]],
          ["bigvee", [8897]],
          ["bigwedge", [8896]],
          ["bkarow", [10509]],
          ["blacklozenge", [10731]],
          ["blacksquare", [9642]],
          ["blacktriangle", [9652]],
          ["blacktriangledown", [9662]],
          ["blacktriangleleft", [9666]],
          ["blacktriangleright", [9656]],
          ["blank", [9251]],
          ["blk12", [9618]],
          ["blk14", [9617]],
          ["blk34", [9619]],
          ["block", [9608]],
          ["bne", [61, 8421]],
          ["bnequiv", [8801, 8421]],
          ["bNot", [10989]],
          ["bnot", [8976]],
          ["Bopf", [120121]],
          ["bopf", [120147]],
          ["bot", [8869]],
          ["bottom", [8869]],
          ["bowtie", [8904]],
          ["boxbox", [10697]],
          ["boxdl", [9488]],
          ["boxdL", [9557]],
          ["boxDl", [9558]],
          ["boxDL", [9559]],
          ["boxdr", [9484]],
          ["boxdR", [9554]],
          ["boxDr", [9555]],
          ["boxDR", [9556]],
          ["boxh", [9472]],
          ["boxH", [9552]],
          ["boxhd", [9516]],
          ["boxHd", [9572]],
          ["boxhD", [9573]],
          ["boxHD", [9574]],
          ["boxhu", [9524]],
          ["boxHu", [9575]],
          ["boxhU", [9576]],
          ["boxHU", [9577]],
          ["boxminus", [8863]],
          ["boxplus", [8862]],
          ["boxtimes", [8864]],
          ["boxul", [9496]],
          ["boxuL", [9563]],
          ["boxUl", [9564]],
          ["boxUL", [9565]],
          ["boxur", [9492]],
          ["boxuR", [9560]],
          ["boxUr", [9561]],
          ["boxUR", [9562]],
          ["boxv", [9474]],
          ["boxV", [9553]],
          ["boxvh", [9532]],
          ["boxvH", [9578]],
          ["boxVh", [9579]],
          ["boxVH", [9580]],
          ["boxvl", [9508]],
          ["boxvL", [9569]],
          ["boxVl", [9570]],
          ["boxVL", [9571]],
          ["boxvr", [9500]],
          ["boxvR", [9566]],
          ["boxVr", [9567]],
          ["boxVR", [9568]],
          ["bprime", [8245]],
          ["breve", [728]],
          ["Breve", [728]],
          ["brvbar", [166]],
          ["bscr", [119991]],
          ["Bscr", [8492]],
          ["bsemi", [8271]],
          ["bsim", [8765]],
          ["bsime", [8909]],
          ["bsolb", [10693]],
          ["bsol", [92]],
          ["bsolhsub", [10184]],
          ["bull", [8226]],
          ["bullet", [8226]],
          ["bump", [8782]],
          ["bumpE", [10926]],
          ["bumpe", [8783]],
          ["Bumpeq", [8782]],
          ["bumpeq", [8783]],
          ["Cacute", [262]],
          ["cacute", [263]],
          ["capand", [10820]],
          ["capbrcup", [10825]],
          ["capcap", [10827]],
          ["cap", [8745]],
          ["Cap", [8914]],
          ["capcup", [10823]],
          ["capdot", [10816]],
          ["CapitalDifferentialD", [8517]],
          ["caps", [8745, 65024]],
          ["caret", [8257]],
          ["caron", [711]],
          ["Cayleys", [8493]],
          ["ccaps", [10829]],
          ["Ccaron", [268]],
          ["ccaron", [269]],
          ["Ccedil", [199]],
          ["ccedil", [231]],
          ["Ccirc", [264]],
          ["ccirc", [265]],
          ["Cconint", [8752]],
          ["ccups", [10828]],
          ["ccupssm", [10832]],
          ["Cdot", [266]],
          ["cdot", [267]],
          ["cedil", [184]],
          ["Cedilla", [184]],
          ["cemptyv", [10674]],
          ["cent", [162]],
          ["centerdot", [183]],
          ["CenterDot", [183]],
          ["cfr", [120096]],
          ["Cfr", [8493]],
          ["CHcy", [1063]],
          ["chcy", [1095]],
          ["check", [10003]],
          ["checkmark", [10003]],
          ["Chi", [935]],
          ["chi", [967]],
          ["circ", [710]],
          ["circeq", [8791]],
          ["circlearrowleft", [8634]],
          ["circlearrowright", [8635]],
          ["circledast", [8859]],
          ["circledcirc", [8858]],
          ["circleddash", [8861]],
          ["CircleDot", [8857]],
          ["circledR", [174]],
          ["circledS", [9416]],
          ["CircleMinus", [8854]],
          ["CirclePlus", [8853]],
          ["CircleTimes", [8855]],
          ["cir", [9675]],
          ["cirE", [10691]],
          ["cire", [8791]],
          ["cirfnint", [10768]],
          ["cirmid", [10991]],
          ["cirscir", [10690]],
          ["ClockwiseContourIntegral", [8754]],
          ["clubs", [9827]],
          ["clubsuit", [9827]],
          ["colon", [58]],
          ["Colon", [8759]],
          ["Colone", [10868]],
          ["colone", [8788]],
          ["coloneq", [8788]],
          ["comma", [44]],
          ["commat", [64]],
          ["comp", [8705]],
          ["compfn", [8728]],
          ["complement", [8705]],
          ["complexes", [8450]],
          ["cong", [8773]],
          ["congdot", [10861]],
          ["Congruent", [8801]],
          ["conint", [8750]],
          ["Conint", [8751]],
          ["ContourIntegral", [8750]],
          ["copf", [120148]],
          ["Copf", [8450]],
          ["coprod", [8720]],
          ["Coproduct", [8720]],
          ["copy", [169]],
          ["COPY", [169]],
          ["copysr", [8471]],
          ["CounterClockwiseContourIntegral", [8755]],
          ["crarr", [8629]],
          ["cross", [10007]],
          ["Cross", [10799]],
          ["Cscr", [119966]],
          ["cscr", [119992]],
          ["csub", [10959]],
          ["csube", [10961]],
          ["csup", [10960]],
          ["csupe", [10962]],
          ["ctdot", [8943]],
          ["cudarrl", [10552]],
          ["cudarrr", [10549]],
          ["cuepr", [8926]],
          ["cuesc", [8927]],
          ["cularr", [8630]],
          ["cularrp", [10557]],
          ["cupbrcap", [10824]],
          ["cupcap", [10822]],
          ["CupCap", [8781]],
          ["cup", [8746]],
          ["Cup", [8915]],
          ["cupcup", [10826]],
          ["cupdot", [8845]],
          ["cupor", [10821]],
          ["cups", [8746, 65024]],
          ["curarr", [8631]],
          ["curarrm", [10556]],
          ["curlyeqprec", [8926]],
          ["curlyeqsucc", [8927]],
          ["curlyvee", [8910]],
          ["curlywedge", [8911]],
          ["curren", [164]],
          ["curvearrowleft", [8630]],
          ["curvearrowright", [8631]],
          ["cuvee", [8910]],
          ["cuwed", [8911]],
          ["cwconint", [8754]],
          ["cwint", [8753]],
          ["cylcty", [9005]],
          ["dagger", [8224]],
          ["Dagger", [8225]],
          ["daleth", [8504]],
          ["darr", [8595]],
          ["Darr", [8609]],
          ["dArr", [8659]],
          ["dash", [8208]],
          ["Dashv", [10980]],
          ["dashv", [8867]],
          ["dbkarow", [10511]],
          ["dblac", [733]],
          ["Dcaron", [270]],
          ["dcaron", [271]],
          ["Dcy", [1044]],
          ["dcy", [1076]],
          ["ddagger", [8225]],
          ["ddarr", [8650]],
          ["DD", [8517]],
          ["dd", [8518]],
          ["DDotrahd", [10513]],
          ["ddotseq", [10871]],
          ["deg", [176]],
          ["Del", [8711]],
          ["Delta", [916]],
          ["delta", [948]],
          ["demptyv", [10673]],
          ["dfisht", [10623]],
          ["Dfr", [120071]],
          ["dfr", [120097]],
          ["dHar", [10597]],
          ["dharl", [8643]],
          ["dharr", [8642]],
          ["DiacriticalAcute", [180]],
          ["DiacriticalDot", [729]],
          ["DiacriticalDoubleAcute", [733]],
          ["DiacriticalGrave", [96]],
          ["DiacriticalTilde", [732]],
          ["diam", [8900]],
          ["diamond", [8900]],
          ["Diamond", [8900]],
          ["diamondsuit", [9830]],
          ["diams", [9830]],
          ["die", [168]],
          ["DifferentialD", [8518]],
          ["digamma", [989]],
          ["disin", [8946]],
          ["div", [247]],
          ["divide", [247]],
          ["divideontimes", [8903]],
          ["divonx", [8903]],
          ["DJcy", [1026]],
          ["djcy", [1106]],
          ["dlcorn", [8990]],
          ["dlcrop", [8973]],
          ["dollar", [36]],
          ["Dopf", [120123]],
          ["dopf", [120149]],
          ["Dot", [168]],
          ["dot", [729]],
          ["DotDot", [8412]],
          ["doteq", [8784]],
          ["doteqdot", [8785]],
          ["DotEqual", [8784]],
          ["dotminus", [8760]],
          ["dotplus", [8724]],
          ["dotsquare", [8865]],
          ["doublebarwedge", [8966]],
          ["DoubleContourIntegral", [8751]],
          ["DoubleDot", [168]],
          ["DoubleDownArrow", [8659]],
          ["DoubleLeftArrow", [8656]],
          ["DoubleLeftRightArrow", [8660]],
          ["DoubleLeftTee", [10980]],
          ["DoubleLongLeftArrow", [10232]],
          ["DoubleLongLeftRightArrow", [10234]],
          ["DoubleLongRightArrow", [10233]],
          ["DoubleRightArrow", [8658]],
          ["DoubleRightTee", [8872]],
          ["DoubleUpArrow", [8657]],
          ["DoubleUpDownArrow", [8661]],
          ["DoubleVerticalBar", [8741]],
          ["DownArrowBar", [10515]],
          ["downarrow", [8595]],
          ["DownArrow", [8595]],
          ["Downarrow", [8659]],
          ["DownArrowUpArrow", [8693]],
          ["DownBreve", [785]],
          ["downdownarrows", [8650]],
          ["downharpoonleft", [8643]],
          ["downharpoonright", [8642]],
          ["DownLeftRightVector", [10576]],
          ["DownLeftTeeVector", [10590]],
          ["DownLeftVectorBar", [10582]],
          ["DownLeftVector", [8637]],
          ["DownRightTeeVector", [10591]],
          ["DownRightVectorBar", [10583]],
          ["DownRightVector", [8641]],
          ["DownTeeArrow", [8615]],
          ["DownTee", [8868]],
          ["drbkarow", [10512]],
          ["drcorn", [8991]],
          ["drcrop", [8972]],
          ["Dscr", [119967]],
          ["dscr", [119993]],
          ["DScy", [1029]],
          ["dscy", [1109]],
          ["dsol", [10742]],
          ["Dstrok", [272]],
          ["dstrok", [273]],
          ["dtdot", [8945]],
          ["dtri", [9663]],
          ["dtrif", [9662]],
          ["duarr", [8693]],
          ["duhar", [10607]],
          ["dwangle", [10662]],
          ["DZcy", [1039]],
          ["dzcy", [1119]],
          ["dzigrarr", [10239]],
          ["Eacute", [201]],
          ["eacute", [233]],
          ["easter", [10862]],
          ["Ecaron", [282]],
          ["ecaron", [283]],
          ["Ecirc", [202]],
          ["ecirc", [234]],
          ["ecir", [8790]],
          ["ecolon", [8789]],
          ["Ecy", [1069]],
          ["ecy", [1101]],
          ["eDDot", [10871]],
          ["Edot", [278]],
          ["edot", [279]],
          ["eDot", [8785]],
          ["ee", [8519]],
          ["efDot", [8786]],
          ["Efr", [120072]],
          ["efr", [120098]],
          ["eg", [10906]],
          ["Egrave", [200]],
          ["egrave", [232]],
          ["egs", [10902]],
          ["egsdot", [10904]],
          ["el", [10905]],
          ["Element", [8712]],
          ["elinters", [9191]],
          ["ell", [8467]],
          ["els", [10901]],
          ["elsdot", [10903]],
          ["Emacr", [274]],
          ["emacr", [275]],
          ["empty", [8709]],
          ["emptyset", [8709]],
          ["EmptySmallSquare", [9723]],
          ["emptyv", [8709]],
          ["EmptyVerySmallSquare", [9643]],
          ["emsp13", [8196]],
          ["emsp14", [8197]],
          ["emsp", [8195]],
          ["ENG", [330]],
          ["eng", [331]],
          ["ensp", [8194]],
          ["Eogon", [280]],
          ["eogon", [281]],
          ["Eopf", [120124]],
          ["eopf", [120150]],
          ["epar", [8917]],
          ["eparsl", [10723]],
          ["eplus", [10865]],
          ["epsi", [949]],
          ["Epsilon", [917]],
          ["epsilon", [949]],
          ["epsiv", [1013]],
          ["eqcirc", [8790]],
          ["eqcolon", [8789]],
          ["eqsim", [8770]],
          ["eqslantgtr", [10902]],
          ["eqslantless", [10901]],
          ["Equal", [10869]],
          ["equals", [61]],
          ["EqualTilde", [8770]],
          ["equest", [8799]],
          ["Equilibrium", [8652]],
          ["equiv", [8801]],
          ["equivDD", [10872]],
          ["eqvparsl", [10725]],
          ["erarr", [10609]],
          ["erDot", [8787]],
          ["escr", [8495]],
          ["Escr", [8496]],
          ["esdot", [8784]],
          ["Esim", [10867]],
          ["esim", [8770]],
          ["Eta", [919]],
          ["eta", [951]],
          ["ETH", [208]],
          ["eth", [240]],
          ["Euml", [203]],
          ["euml", [235]],
          ["euro", [8364]],
          ["excl", [33]],
          ["exist", [8707]],
          ["Exists", [8707]],
          ["expectation", [8496]],
          ["exponentiale", [8519]],
          ["ExponentialE", [8519]],
          ["fallingdotseq", [8786]],
          ["Fcy", [1060]],
          ["fcy", [1092]],
          ["female", [9792]],
          ["ffilig", [64259]],
          ["fflig", [64256]],
          ["ffllig", [64260]],
          ["Ffr", [120073]],
          ["ffr", [120099]],
          ["filig", [64257]],
          ["FilledSmallSquare", [9724]],
          ["FilledVerySmallSquare", [9642]],
          ["fjlig", [102, 106]],
          ["flat", [9837]],
          ["fllig", [64258]],
          ["fltns", [9649]],
          ["fnof", [402]],
          ["Fopf", [120125]],
          ["fopf", [120151]],
          ["forall", [8704]],
          ["ForAll", [8704]],
          ["fork", [8916]],
          ["forkv", [10969]],
          ["Fouriertrf", [8497]],
          ["fpartint", [10765]],
          ["frac12", [189]],
          ["frac13", [8531]],
          ["frac14", [188]],
          ["frac15", [8533]],
          ["frac16", [8537]],
          ["frac18", [8539]],
          ["frac23", [8532]],
          ["frac25", [8534]],
          ["frac34", [190]],
          ["frac35", [8535]],
          ["frac38", [8540]],
          ["frac45", [8536]],
          ["frac56", [8538]],
          ["frac58", [8541]],
          ["frac78", [8542]],
          ["frasl", [8260]],
          ["frown", [8994]],
          ["fscr", [119995]],
          ["Fscr", [8497]],
          ["gacute", [501]],
          ["Gamma", [915]],
          ["gamma", [947]],
          ["Gammad", [988]],
          ["gammad", [989]],
          ["gap", [10886]],
          ["Gbreve", [286]],
          ["gbreve", [287]],
          ["Gcedil", [290]],
          ["Gcirc", [284]],
          ["gcirc", [285]],
          ["Gcy", [1043]],
          ["gcy", [1075]],
          ["Gdot", [288]],
          ["gdot", [289]],
          ["ge", [8805]],
          ["gE", [8807]],
          ["gEl", [10892]],
          ["gel", [8923]],
          ["geq", [8805]],
          ["geqq", [8807]],
          ["geqslant", [10878]],
          ["gescc", [10921]],
          ["ges", [10878]],
          ["gesdot", [10880]],
          ["gesdoto", [10882]],
          ["gesdotol", [10884]],
          ["gesl", [8923, 65024]],
          ["gesles", [10900]],
          ["Gfr", [120074]],
          ["gfr", [120100]],
          ["gg", [8811]],
          ["Gg", [8921]],
          ["ggg", [8921]],
          ["gimel", [8503]],
          ["GJcy", [1027]],
          ["gjcy", [1107]],
          ["gla", [10917]],
          ["gl", [8823]],
          ["glE", [10898]],
          ["glj", [10916]],
          ["gnap", [10890]],
          ["gnapprox", [10890]],
          ["gne", [10888]],
          ["gnE", [8809]],
          ["gneq", [10888]],
          ["gneqq", [8809]],
          ["gnsim", [8935]],
          ["Gopf", [120126]],
          ["gopf", [120152]],
          ["grave", [96]],
          ["GreaterEqual", [8805]],
          ["GreaterEqualLess", [8923]],
          ["GreaterFullEqual", [8807]],
          ["GreaterGreater", [10914]],
          ["GreaterLess", [8823]],
          ["GreaterSlantEqual", [10878]],
          ["GreaterTilde", [8819]],
          ["Gscr", [119970]],
          ["gscr", [8458]],
          ["gsim", [8819]],
          ["gsime", [10894]],
          ["gsiml", [10896]],
          ["gtcc", [10919]],
          ["gtcir", [10874]],
          ["gt", [62]],
          ["GT", [62]],
          ["Gt", [8811]],
          ["gtdot", [8919]],
          ["gtlPar", [10645]],
          ["gtquest", [10876]],
          ["gtrapprox", [10886]],
          ["gtrarr", [10616]],
          ["gtrdot", [8919]],
          ["gtreqless", [8923]],
          ["gtreqqless", [10892]],
          ["gtrless", [8823]],
          ["gtrsim", [8819]],
          ["gvertneqq", [8809, 65024]],
          ["gvnE", [8809, 65024]],
          ["Hacek", [711]],
          ["hairsp", [8202]],
          ["half", [189]],
          ["hamilt", [8459]],
          ["HARDcy", [1066]],
          ["hardcy", [1098]],
          ["harrcir", [10568]],
          ["harr", [8596]],
          ["hArr", [8660]],
          ["harrw", [8621]],
          ["Hat", [94]],
          ["hbar", [8463]],
          ["Hcirc", [292]],
          ["hcirc", [293]],
          ["hearts", [9829]],
          ["heartsuit", [9829]],
          ["hellip", [8230]],
          ["hercon", [8889]],
          ["hfr", [120101]],
          ["Hfr", [8460]],
          ["HilbertSpace", [8459]],
          ["hksearow", [10533]],
          ["hkswarow", [10534]],
          ["hoarr", [8703]],
          ["homtht", [8763]],
          ["hookleftarrow", [8617]],
          ["hookrightarrow", [8618]],
          ["hopf", [120153]],
          ["Hopf", [8461]],
          ["horbar", [8213]],
          ["HorizontalLine", [9472]],
          ["hscr", [119997]],
          ["Hscr", [8459]],
          ["hslash", [8463]],
          ["Hstrok", [294]],
          ["hstrok", [295]],
          ["HumpDownHump", [8782]],
          ["HumpEqual", [8783]],
          ["hybull", [8259]],
          ["hyphen", [8208]],
          ["Iacute", [205]],
          ["iacute", [237]],
          ["ic", [8291]],
          ["Icirc", [206]],
          ["icirc", [238]],
          ["Icy", [1048]],
          ["icy", [1080]],
          ["Idot", [304]],
          ["IEcy", [1045]],
          ["iecy", [1077]],
          ["iexcl", [161]],
          ["iff", [8660]],
          ["ifr", [120102]],
          ["Ifr", [8465]],
          ["Igrave", [204]],
          ["igrave", [236]],
          ["ii", [8520]],
          ["iiiint", [10764]],
          ["iiint", [8749]],
          ["iinfin", [10716]],
          ["iiota", [8489]],
          ["IJlig", [306]],
          ["ijlig", [307]],
          ["Imacr", [298]],
          ["imacr", [299]],
          ["image", [8465]],
          ["ImaginaryI", [8520]],
          ["imagline", [8464]],
          ["imagpart", [8465]],
          ["imath", [305]],
          ["Im", [8465]],
          ["imof", [8887]],
          ["imped", [437]],
          ["Implies", [8658]],
          ["incare", [8453]],
          ["in", [8712]],
          ["infin", [8734]],
          ["infintie", [10717]],
          ["inodot", [305]],
          ["intcal", [8890]],
          ["int", [8747]],
          ["Int", [8748]],
          ["integers", [8484]],
          ["Integral", [8747]],
          ["intercal", [8890]],
          ["Intersection", [8898]],
          ["intlarhk", [10775]],
          ["intprod", [10812]],
          ["InvisibleComma", [8291]],
          ["InvisibleTimes", [8290]],
          ["IOcy", [1025]],
          ["iocy", [1105]],
          ["Iogon", [302]],
          ["iogon", [303]],
          ["Iopf", [120128]],
          ["iopf", [120154]],
          ["Iota", [921]],
          ["iota", [953]],
          ["iprod", [10812]],
          ["iquest", [191]],
          ["iscr", [119998]],
          ["Iscr", [8464]],
          ["isin", [8712]],
          ["isindot", [8949]],
          ["isinE", [8953]],
          ["isins", [8948]],
          ["isinsv", [8947]],
          ["isinv", [8712]],
          ["it", [8290]],
          ["Itilde", [296]],
          ["itilde", [297]],
          ["Iukcy", [1030]],
          ["iukcy", [1110]],
          ["Iuml", [207]],
          ["iuml", [239]],
          ["Jcirc", [308]],
          ["jcirc", [309]],
          ["Jcy", [1049]],
          ["jcy", [1081]],
          ["Jfr", [120077]],
          ["jfr", [120103]],
          ["jmath", [567]],
          ["Jopf", [120129]],
          ["jopf", [120155]],
          ["Jscr", [119973]],
          ["jscr", [119999]],
          ["Jsercy", [1032]],
          ["jsercy", [1112]],
          ["Jukcy", [1028]],
          ["jukcy", [1108]],
          ["Kappa", [922]],
          ["kappa", [954]],
          ["kappav", [1008]],
          ["Kcedil", [310]],
          ["kcedil", [311]],
          ["Kcy", [1050]],
          ["kcy", [1082]],
          ["Kfr", [120078]],
          ["kfr", [120104]],
          ["kgreen", [312]],
          ["KHcy", [1061]],
          ["khcy", [1093]],
          ["KJcy", [1036]],
          ["kjcy", [1116]],
          ["Kopf", [120130]],
          ["kopf", [120156]],
          ["Kscr", [119974]],
          ["kscr", [120000]],
          ["lAarr", [8666]],
          ["Lacute", [313]],
          ["lacute", [314]],
          ["laemptyv", [10676]],
          ["lagran", [8466]],
          ["Lambda", [923]],
          ["lambda", [955]],
          ["lang", [10216]],
          ["Lang", [10218]],
          ["langd", [10641]],
          ["langle", [10216]],
          ["lap", [10885]],
          ["Laplacetrf", [8466]],
          ["laquo", [171]],
          ["larrb", [8676]],
          ["larrbfs", [10527]],
          ["larr", [8592]],
          ["Larr", [8606]],
          ["lArr", [8656]],
          ["larrfs", [10525]],
          ["larrhk", [8617]],
          ["larrlp", [8619]],
          ["larrpl", [10553]],
          ["larrsim", [10611]],
          ["larrtl", [8610]],
          ["latail", [10521]],
          ["lAtail", [10523]],
          ["lat", [10923]],
          ["late", [10925]],
          ["lates", [10925, 65024]],
          ["lbarr", [10508]],
          ["lBarr", [10510]],
          ["lbbrk", [10098]],
          ["lbrace", [123]],
          ["lbrack", [91]],
          ["lbrke", [10635]],
          ["lbrksld", [10639]],
          ["lbrkslu", [10637]],
          ["Lcaron", [317]],
          ["lcaron", [318]],
          ["Lcedil", [315]],
          ["lcedil", [316]],
          ["lceil", [8968]],
          ["lcub", [123]],
          ["Lcy", [1051]],
          ["lcy", [1083]],
          ["ldca", [10550]],
          ["ldquo", [8220]],
          ["ldquor", [8222]],
          ["ldrdhar", [10599]],
          ["ldrushar", [10571]],
          ["ldsh", [8626]],
          ["le", [8804]],
          ["lE", [8806]],
          ["LeftAngleBracket", [10216]],
          ["LeftArrowBar", [8676]],
          ["leftarrow", [8592]],
          ["LeftArrow", [8592]],
          ["Leftarrow", [8656]],
          ["LeftArrowRightArrow", [8646]],
          ["leftarrowtail", [8610]],
          ["LeftCeiling", [8968]],
          ["LeftDoubleBracket", [10214]],
          ["LeftDownTeeVector", [10593]],
          ["LeftDownVectorBar", [10585]],
          ["LeftDownVector", [8643]],
          ["LeftFloor", [8970]],
          ["leftharpoondown", [8637]],
          ["leftharpoonup", [8636]],
          ["leftleftarrows", [8647]],
          ["leftrightarrow", [8596]],
          ["LeftRightArrow", [8596]],
          ["Leftrightarrow", [8660]],
          ["leftrightarrows", [8646]],
          ["leftrightharpoons", [8651]],
          ["leftrightsquigarrow", [8621]],
          ["LeftRightVector", [10574]],
          ["LeftTeeArrow", [8612]],
          ["LeftTee", [8867]],
          ["LeftTeeVector", [10586]],
          ["leftthreetimes", [8907]],
          ["LeftTriangleBar", [10703]],
          ["LeftTriangle", [8882]],
          ["LeftTriangleEqual", [8884]],
          ["LeftUpDownVector", [10577]],
          ["LeftUpTeeVector", [10592]],
          ["LeftUpVectorBar", [10584]],
          ["LeftUpVector", [8639]],
          ["LeftVectorBar", [10578]],
          ["LeftVector", [8636]],
          ["lEg", [10891]],
          ["leg", [8922]],
          ["leq", [8804]],
          ["leqq", [8806]],
          ["leqslant", [10877]],
          ["lescc", [10920]],
          ["les", [10877]],
          ["lesdot", [10879]],
          ["lesdoto", [10881]],
          ["lesdotor", [10883]],
          ["lesg", [8922, 65024]],
          ["lesges", [10899]],
          ["lessapprox", [10885]],
          ["lessdot", [8918]],
          ["lesseqgtr", [8922]],
          ["lesseqqgtr", [10891]],
          ["LessEqualGreater", [8922]],
          ["LessFullEqual", [8806]],
          ["LessGreater", [8822]],
          ["lessgtr", [8822]],
          ["LessLess", [10913]],
          ["lesssim", [8818]],
          ["LessSlantEqual", [10877]],
          ["LessTilde", [8818]],
          ["lfisht", [10620]],
          ["lfloor", [8970]],
          ["Lfr", [120079]],
          ["lfr", [120105]],
          ["lg", [8822]],
          ["lgE", [10897]],
          ["lHar", [10594]],
          ["lhard", [8637]],
          ["lharu", [8636]],
          ["lharul", [10602]],
          ["lhblk", [9604]],
          ["LJcy", [1033]],
          ["ljcy", [1113]],
          ["llarr", [8647]],
          ["ll", [8810]],
          ["Ll", [8920]],
          ["llcorner", [8990]],
          ["Lleftarrow", [8666]],
          ["llhard", [10603]],
          ["lltri", [9722]],
          ["Lmidot", [319]],
          ["lmidot", [320]],
          ["lmoustache", [9136]],
          ["lmoust", [9136]],
          ["lnap", [10889]],
          ["lnapprox", [10889]],
          ["lne", [10887]],
          ["lnE", [8808]],
          ["lneq", [10887]],
          ["lneqq", [8808]],
          ["lnsim", [8934]],
          ["loang", [10220]],
          ["loarr", [8701]],
          ["lobrk", [10214]],
          ["longleftarrow", [10229]],
          ["LongLeftArrow", [10229]],
          ["Longleftarrow", [10232]],
          ["longleftrightarrow", [10231]],
          ["LongLeftRightArrow", [10231]],
          ["Longleftrightarrow", [10234]],
          ["longmapsto", [10236]],
          ["longrightarrow", [10230]],
          ["LongRightArrow", [10230]],
          ["Longrightarrow", [10233]],
          ["looparrowleft", [8619]],
          ["looparrowright", [8620]],
          ["lopar", [10629]],
          ["Lopf", [120131]],
          ["lopf", [120157]],
          ["loplus", [10797]],
          ["lotimes", [10804]],
          ["lowast", [8727]],
          ["lowbar", [95]],
          ["LowerLeftArrow", [8601]],
          ["LowerRightArrow", [8600]],
          ["loz", [9674]],
          ["lozenge", [9674]],
          ["lozf", [10731]],
          ["lpar", [40]],
          ["lparlt", [10643]],
          ["lrarr", [8646]],
          ["lrcorner", [8991]],
          ["lrhar", [8651]],
          ["lrhard", [10605]],
          ["lrm", [8206]],
          ["lrtri", [8895]],
          ["lsaquo", [8249]],
          ["lscr", [120001]],
          ["Lscr", [8466]],
          ["lsh", [8624]],
          ["Lsh", [8624]],
          ["lsim", [8818]],
          ["lsime", [10893]],
          ["lsimg", [10895]],
          ["lsqb", [91]],
          ["lsquo", [8216]],
          ["lsquor", [8218]],
          ["Lstrok", [321]],
          ["lstrok", [322]],
          ["ltcc", [10918]],
          ["ltcir", [10873]],
          ["lt", [60]],
          ["LT", [60]],
          ["Lt", [8810]],
          ["ltdot", [8918]],
          ["lthree", [8907]],
          ["ltimes", [8905]],
          ["ltlarr", [10614]],
          ["ltquest", [10875]],
          ["ltri", [9667]],
          ["ltrie", [8884]],
          ["ltrif", [9666]],
          ["ltrPar", [10646]],
          ["lurdshar", [10570]],
          ["luruhar", [10598]],
          ["lvertneqq", [8808, 65024]],
          ["lvnE", [8808, 65024]],
          ["macr", [175]],
          ["male", [9794]],
          ["malt", [10016]],
          ["maltese", [10016]],
          ["Map", [10501]],
          ["map", [8614]],
          ["mapsto", [8614]],
          ["mapstodown", [8615]],
          ["mapstoleft", [8612]],
          ["mapstoup", [8613]],
          ["marker", [9646]],
          ["mcomma", [10793]],
          ["Mcy", [1052]],
          ["mcy", [1084]],
          ["mdash", [8212]],
          ["mDDot", [8762]],
          ["measuredangle", [8737]],
          ["MediumSpace", [8287]],
          ["Mellintrf", [8499]],
          ["Mfr", [120080]],
          ["mfr", [120106]],
          ["mho", [8487]],
          ["micro", [181]],
          ["midast", [42]],
          ["midcir", [10992]],
          ["mid", [8739]],
          ["middot", [183]],
          ["minusb", [8863]],
          ["minus", [8722]],
          ["minusd", [8760]],
          ["minusdu", [10794]],
          ["MinusPlus", [8723]],
          ["mlcp", [10971]],
          ["mldr", [8230]],
          ["mnplus", [8723]],
          ["models", [8871]],
          ["Mopf", [120132]],
          ["mopf", [120158]],
          ["mp", [8723]],
          ["mscr", [120002]],
          ["Mscr", [8499]],
          ["mstpos", [8766]],
          ["Mu", [924]],
          ["mu", [956]],
          ["multimap", [8888]],
          ["mumap", [8888]],
          ["nabla", [8711]],
          ["Nacute", [323]],
          ["nacute", [324]],
          ["nang", [8736, 8402]],
          ["nap", [8777]],
          ["napE", [10864, 824]],
          ["napid", [8779, 824]],
          ["napos", [329]],
          ["napprox", [8777]],
          ["natural", [9838]],
          ["naturals", [8469]],
          ["natur", [9838]],
          ["nbsp", [160]],
          ["nbump", [8782, 824]],
          ["nbumpe", [8783, 824]],
          ["ncap", [10819]],
          ["Ncaron", [327]],
          ["ncaron", [328]],
          ["Ncedil", [325]],
          ["ncedil", [326]],
          ["ncong", [8775]],
          ["ncongdot", [10861, 824]],
          ["ncup", [10818]],
          ["Ncy", [1053]],
          ["ncy", [1085]],
          ["ndash", [8211]],
          ["nearhk", [10532]],
          ["nearr", [8599]],
          ["neArr", [8663]],
          ["nearrow", [8599]],
          ["ne", [8800]],
          ["nedot", [8784, 824]],
          ["NegativeMediumSpace", [8203]],
          ["NegativeThickSpace", [8203]],
          ["NegativeThinSpace", [8203]],
          ["NegativeVeryThinSpace", [8203]],
          ["nequiv", [8802]],
          ["nesear", [10536]],
          ["nesim", [8770, 824]],
          ["NestedGreaterGreater", [8811]],
          ["NestedLessLess", [8810]],
          ["nexist", [8708]],
          ["nexists", [8708]],
          ["Nfr", [120081]],
          ["nfr", [120107]],
          ["ngE", [8807, 824]],
          ["nge", [8817]],
          ["ngeq", [8817]],
          ["ngeqq", [8807, 824]],
          ["ngeqslant", [10878, 824]],
          ["nges", [10878, 824]],
          ["nGg", [8921, 824]],
          ["ngsim", [8821]],
          ["nGt", [8811, 8402]],
          ["ngt", [8815]],
          ["ngtr", [8815]],
          ["nGtv", [8811, 824]],
          ["nharr", [8622]],
          ["nhArr", [8654]],
          ["nhpar", [10994]],
          ["ni", [8715]],
          ["nis", [8956]],
          ["nisd", [8954]],
          ["niv", [8715]],
          ["NJcy", [1034]],
          ["njcy", [1114]],
          ["nlarr", [8602]],
          ["nlArr", [8653]],
          ["nldr", [8229]],
          ["nlE", [8806, 824]],
          ["nle", [8816]],
          ["nleftarrow", [8602]],
          ["nLeftarrow", [8653]],
          ["nleftrightarrow", [8622]],
          ["nLeftrightarrow", [8654]],
          ["nleq", [8816]],
          ["nleqq", [8806, 824]],
          ["nleqslant", [10877, 824]],
          ["nles", [10877, 824]],
          ["nless", [8814]],
          ["nLl", [8920, 824]],
          ["nlsim", [8820]],
          ["nLt", [8810, 8402]],
          ["nlt", [8814]],
          ["nltri", [8938]],
          ["nltrie", [8940]],
          ["nLtv", [8810, 824]],
          ["nmid", [8740]],
          ["NoBreak", [8288]],
          ["NonBreakingSpace", [160]],
          ["nopf", [120159]],
          ["Nopf", [8469]],
          ["Not", [10988]],
          ["not", [172]],
          ["NotCongruent", [8802]],
          ["NotCupCap", [8813]],
          ["NotDoubleVerticalBar", [8742]],
          ["NotElement", [8713]],
          ["NotEqual", [8800]],
          ["NotEqualTilde", [8770, 824]],
          ["NotExists", [8708]],
          ["NotGreater", [8815]],
          ["NotGreaterEqual", [8817]],
          ["NotGreaterFullEqual", [8807, 824]],
          ["NotGreaterGreater", [8811, 824]],
          ["NotGreaterLess", [8825]],
          ["NotGreaterSlantEqual", [10878, 824]],
          ["NotGreaterTilde", [8821]],
          ["NotHumpDownHump", [8782, 824]],
          ["NotHumpEqual", [8783, 824]],
          ["notin", [8713]],
          ["notindot", [8949, 824]],
          ["notinE", [8953, 824]],
          ["notinva", [8713]],
          ["notinvb", [8951]],
          ["notinvc", [8950]],
          ["NotLeftTriangleBar", [10703, 824]],
          ["NotLeftTriangle", [8938]],
          ["NotLeftTriangleEqual", [8940]],
          ["NotLess", [8814]],
          ["NotLessEqual", [8816]],
          ["NotLessGreater", [8824]],
          ["NotLessLess", [8810, 824]],
          ["NotLessSlantEqual", [10877, 824]],
          ["NotLessTilde", [8820]],
          ["NotNestedGreaterGreater", [10914, 824]],
          ["NotNestedLessLess", [10913, 824]],
          ["notni", [8716]],
          ["notniva", [8716]],
          ["notnivb", [8958]],
          ["notnivc", [8957]],
          ["NotPrecedes", [8832]],
          ["NotPrecedesEqual", [10927, 824]],
          ["NotPrecedesSlantEqual", [8928]],
          ["NotReverseElement", [8716]],
          ["NotRightTriangleBar", [10704, 824]],
          ["NotRightTriangle", [8939]],
          ["NotRightTriangleEqual", [8941]],
          ["NotSquareSubset", [8847, 824]],
          ["NotSquareSubsetEqual", [8930]],
          ["NotSquareSuperset", [8848, 824]],
          ["NotSquareSupersetEqual", [8931]],
          ["NotSubset", [8834, 8402]],
          ["NotSubsetEqual", [8840]],
          ["NotSucceeds", [8833]],
          ["NotSucceedsEqual", [10928, 824]],
          ["NotSucceedsSlantEqual", [8929]],
          ["NotSucceedsTilde", [8831, 824]],
          ["NotSuperset", [8835, 8402]],
          ["NotSupersetEqual", [8841]],
          ["NotTilde", [8769]],
          ["NotTildeEqual", [8772]],
          ["NotTildeFullEqual", [8775]],
          ["NotTildeTilde", [8777]],
          ["NotVerticalBar", [8740]],
          ["nparallel", [8742]],
          ["npar", [8742]],
          ["nparsl", [11005, 8421]],
          ["npart", [8706, 824]],
          ["npolint", [10772]],
          ["npr", [8832]],
          ["nprcue", [8928]],
          ["nprec", [8832]],
          ["npreceq", [10927, 824]],
          ["npre", [10927, 824]],
          ["nrarrc", [10547, 824]],
          ["nrarr", [8603]],
          ["nrArr", [8655]],
          ["nrarrw", [8605, 824]],
          ["nrightarrow", [8603]],
          ["nRightarrow", [8655]],
          ["nrtri", [8939]],
          ["nrtrie", [8941]],
          ["nsc", [8833]],
          ["nsccue", [8929]],
          ["nsce", [10928, 824]],
          ["Nscr", [119977]],
          ["nscr", [120003]],
          ["nshortmid", [8740]],
          ["nshortparallel", [8742]],
          ["nsim", [8769]],
          ["nsime", [8772]],
          ["nsimeq", [8772]],
          ["nsmid", [8740]],
          ["nspar", [8742]],
          ["nsqsube", [8930]],
          ["nsqsupe", [8931]],
          ["nsub", [8836]],
          ["nsubE", [10949, 824]],
          ["nsube", [8840]],
          ["nsubset", [8834, 8402]],
          ["nsubseteq", [8840]],
          ["nsubseteqq", [10949, 824]],
          ["nsucc", [8833]],
          ["nsucceq", [10928, 824]],
          ["nsup", [8837]],
          ["nsupE", [10950, 824]],
          ["nsupe", [8841]],
          ["nsupset", [8835, 8402]],
          ["nsupseteq", [8841]],
          ["nsupseteqq", [10950, 824]],
          ["ntgl", [8825]],
          ["Ntilde", [209]],
          ["ntilde", [241]],
          ["ntlg", [8824]],
          ["ntriangleleft", [8938]],
          ["ntrianglelefteq", [8940]],
          ["ntriangleright", [8939]],
          ["ntrianglerighteq", [8941]],
          ["Nu", [925]],
          ["nu", [957]],
          ["num", [35]],
          ["numero", [8470]],
          ["numsp", [8199]],
          ["nvap", [8781, 8402]],
          ["nvdash", [8876]],
          ["nvDash", [8877]],
          ["nVdash", [8878]],
          ["nVDash", [8879]],
          ["nvge", [8805, 8402]],
          ["nvgt", [62, 8402]],
          ["nvHarr", [10500]],
          ["nvinfin", [10718]],
          ["nvlArr", [10498]],
          ["nvle", [8804, 8402]],
          ["nvlt", [60, 8402]],
          ["nvltrie", [8884, 8402]],
          ["nvrArr", [10499]],
          ["nvrtrie", [8885, 8402]],
          ["nvsim", [8764, 8402]],
          ["nwarhk", [10531]],
          ["nwarr", [8598]],
          ["nwArr", [8662]],
          ["nwarrow", [8598]],
          ["nwnear", [10535]],
          ["Oacute", [211]],
          ["oacute", [243]],
          ["oast", [8859]],
          ["Ocirc", [212]],
          ["ocirc", [244]],
          ["ocir", [8858]],
          ["Ocy", [1054]],
          ["ocy", [1086]],
          ["odash", [8861]],
          ["Odblac", [336]],
          ["odblac", [337]],
          ["odiv", [10808]],
          ["odot", [8857]],
          ["odsold", [10684]],
          ["OElig", [338]],
          ["oelig", [339]],
          ["ofcir", [10687]],
          ["Ofr", [120082]],
          ["ofr", [120108]],
          ["ogon", [731]],
          ["Ograve", [210]],
          ["ograve", [242]],
          ["ogt", [10689]],
          ["ohbar", [10677]],
          ["ohm", [937]],
          ["oint", [8750]],
          ["olarr", [8634]],
          ["olcir", [10686]],
          ["olcross", [10683]],
          ["oline", [8254]],
          ["olt", [10688]],
          ["Omacr", [332]],
          ["omacr", [333]],
          ["Omega", [937]],
          ["omega", [969]],
          ["Omicron", [927]],
          ["omicron", [959]],
          ["omid", [10678]],
          ["ominus", [8854]],
          ["Oopf", [120134]],
          ["oopf", [120160]],
          ["opar", [10679]],
          ["OpenCurlyDoubleQuote", [8220]],
          ["OpenCurlyQuote", [8216]],
          ["operp", [10681]],
          ["oplus", [8853]],
          ["orarr", [8635]],
          ["Or", [10836]],
          ["or", [8744]],
          ["ord", [10845]],
          ["order", [8500]],
          ["orderof", [8500]],
          ["ordf", [170]],
          ["ordm", [186]],
          ["origof", [8886]],
          ["oror", [10838]],
          ["orslope", [10839]],
          ["orv", [10843]],
          ["oS", [9416]],
          ["Oscr", [119978]],
          ["oscr", [8500]],
          ["Oslash", [216]],
          ["oslash", [248]],
          ["osol", [8856]],
          ["Otilde", [213]],
          ["otilde", [245]],
          ["otimesas", [10806]],
          ["Otimes", [10807]],
          ["otimes", [8855]],
          ["Ouml", [214]],
          ["ouml", [246]],
          ["ovbar", [9021]],
          ["OverBar", [8254]],
          ["OverBrace", [9182]],
          ["OverBracket", [9140]],
          ["OverParenthesis", [9180]],
          ["para", [182]],
          ["parallel", [8741]],
          ["par", [8741]],
          ["parsim", [10995]],
          ["parsl", [11005]],
          ["part", [8706]],
          ["PartialD", [8706]],
          ["Pcy", [1055]],
          ["pcy", [1087]],
          ["percnt", [37]],
          ["period", [46]],
          ["permil", [8240]],
          ["perp", [8869]],
          ["pertenk", [8241]],
          ["Pfr", [120083]],
          ["pfr", [120109]],
          ["Phi", [934]],
          ["phi", [966]],
          ["phiv", [981]],
          ["phmmat", [8499]],
          ["phone", [9742]],
          ["Pi", [928]],
          ["pi", [960]],
          ["pitchfork", [8916]],
          ["piv", [982]],
          ["planck", [8463]],
          ["planckh", [8462]],
          ["plankv", [8463]],
          ["plusacir", [10787]],
          ["plusb", [8862]],
          ["pluscir", [10786]],
          ["plus", [43]],
          ["plusdo", [8724]],
          ["plusdu", [10789]],
          ["pluse", [10866]],
          ["PlusMinus", [177]],
          ["plusmn", [177]],
          ["plussim", [10790]],
          ["plustwo", [10791]],
          ["pm", [177]],
          ["Poincareplane", [8460]],
          ["pointint", [10773]],
          ["popf", [120161]],
          ["Popf", [8473]],
          ["pound", [163]],
          ["prap", [10935]],
          ["Pr", [10939]],
          ["pr", [8826]],
          ["prcue", [8828]],
          ["precapprox", [10935]],
          ["prec", [8826]],
          ["preccurlyeq", [8828]],
          ["Precedes", [8826]],
          ["PrecedesEqual", [10927]],
          ["PrecedesSlantEqual", [8828]],
          ["PrecedesTilde", [8830]],
          ["preceq", [10927]],
          ["precnapprox", [10937]],
          ["precneqq", [10933]],
          ["precnsim", [8936]],
          ["pre", [10927]],
          ["prE", [10931]],
          ["precsim", [8830]],
          ["prime", [8242]],
          ["Prime", [8243]],
          ["primes", [8473]],
          ["prnap", [10937]],
          ["prnE", [10933]],
          ["prnsim", [8936]],
          ["prod", [8719]],
          ["Product", [8719]],
          ["profalar", [9006]],
          ["profline", [8978]],
          ["profsurf", [8979]],
          ["prop", [8733]],
          ["Proportional", [8733]],
          ["Proportion", [8759]],
          ["propto", [8733]],
          ["prsim", [8830]],
          ["prurel", [8880]],
          ["Pscr", [119979]],
          ["pscr", [120005]],
          ["Psi", [936]],
          ["psi", [968]],
          ["puncsp", [8200]],
          ["Qfr", [120084]],
          ["qfr", [120110]],
          ["qint", [10764]],
          ["qopf", [120162]],
          ["Qopf", [8474]],
          ["qprime", [8279]],
          ["Qscr", [119980]],
          ["qscr", [120006]],
          ["quaternions", [8461]],
          ["quatint", [10774]],
          ["quest", [63]],
          ["questeq", [8799]],
          ["quot", [34]],
          ["QUOT", [34]],
          ["rAarr", [8667]],
          ["race", [8765, 817]],
          ["Racute", [340]],
          ["racute", [341]],
          ["radic", [8730]],
          ["raemptyv", [10675]],
          ["rang", [10217]],
          ["Rang", [10219]],
          ["rangd", [10642]],
          ["range", [10661]],
          ["rangle", [10217]],
          ["raquo", [187]],
          ["rarrap", [10613]],
          ["rarrb", [8677]],
          ["rarrbfs", [10528]],
          ["rarrc", [10547]],
          ["rarr", [8594]],
          ["Rarr", [8608]],
          ["rArr", [8658]],
          ["rarrfs", [10526]],
          ["rarrhk", [8618]],
          ["rarrlp", [8620]],
          ["rarrpl", [10565]],
          ["rarrsim", [10612]],
          ["Rarrtl", [10518]],
          ["rarrtl", [8611]],
          ["rarrw", [8605]],
          ["ratail", [10522]],
          ["rAtail", [10524]],
          ["ratio", [8758]],
          ["rationals", [8474]],
          ["rbarr", [10509]],
          ["rBarr", [10511]],
          ["RBarr", [10512]],
          ["rbbrk", [10099]],
          ["rbrace", [125]],
          ["rbrack", [93]],
          ["rbrke", [10636]],
          ["rbrksld", [10638]],
          ["rbrkslu", [10640]],
          ["Rcaron", [344]],
          ["rcaron", [345]],
          ["Rcedil", [342]],
          ["rcedil", [343]],
          ["rceil", [8969]],
          ["rcub", [125]],
          ["Rcy", [1056]],
          ["rcy", [1088]],
          ["rdca", [10551]],
          ["rdldhar", [10601]],
          ["rdquo", [8221]],
          ["rdquor", [8221]],
          ["CloseCurlyDoubleQuote", [8221]],
          ["rdsh", [8627]],
          ["real", [8476]],
          ["realine", [8475]],
          ["realpart", [8476]],
          ["reals", [8477]],
          ["Re", [8476]],
          ["rect", [9645]],
          ["reg", [174]],
          ["REG", [174]],
          ["ReverseElement", [8715]],
          ["ReverseEquilibrium", [8651]],
          ["ReverseUpEquilibrium", [10607]],
          ["rfisht", [10621]],
          ["rfloor", [8971]],
          ["rfr", [120111]],
          ["Rfr", [8476]],
          ["rHar", [10596]],
          ["rhard", [8641]],
          ["rharu", [8640]],
          ["rharul", [10604]],
          ["Rho", [929]],
          ["rho", [961]],
          ["rhov", [1009]],
          ["RightAngleBracket", [10217]],
          ["RightArrowBar", [8677]],
          ["rightarrow", [8594]],
          ["RightArrow", [8594]],
          ["Rightarrow", [8658]],
          ["RightArrowLeftArrow", [8644]],
          ["rightarrowtail", [8611]],
          ["RightCeiling", [8969]],
          ["RightDoubleBracket", [10215]],
          ["RightDownTeeVector", [10589]],
          ["RightDownVectorBar", [10581]],
          ["RightDownVector", [8642]],
          ["RightFloor", [8971]],
          ["rightharpoondown", [8641]],
          ["rightharpoonup", [8640]],
          ["rightleftarrows", [8644]],
          ["rightleftharpoons", [8652]],
          ["rightrightarrows", [8649]],
          ["rightsquigarrow", [8605]],
          ["RightTeeArrow", [8614]],
          ["RightTee", [8866]],
          ["RightTeeVector", [10587]],
          ["rightthreetimes", [8908]],
          ["RightTriangleBar", [10704]],
          ["RightTriangle", [8883]],
          ["RightTriangleEqual", [8885]],
          ["RightUpDownVector", [10575]],
          ["RightUpTeeVector", [10588]],
          ["RightUpVectorBar", [10580]],
          ["RightUpVector", [8638]],
          ["RightVectorBar", [10579]],
          ["RightVector", [8640]],
          ["ring", [730]],
          ["risingdotseq", [8787]],
          ["rlarr", [8644]],
          ["rlhar", [8652]],
          ["rlm", [8207]],
          ["rmoustache", [9137]],
          ["rmoust", [9137]],
          ["rnmid", [10990]],
          ["roang", [10221]],
          ["roarr", [8702]],
          ["robrk", [10215]],
          ["ropar", [10630]],
          ["ropf", [120163]],
          ["Ropf", [8477]],
          ["roplus", [10798]],
          ["rotimes", [10805]],
          ["RoundImplies", [10608]],
          ["rpar", [41]],
          ["rpargt", [10644]],
          ["rppolint", [10770]],
          ["rrarr", [8649]],
          ["Rrightarrow", [8667]],
          ["rsaquo", [8250]],
          ["rscr", [120007]],
          ["Rscr", [8475]],
          ["rsh", [8625]],
          ["Rsh", [8625]],
          ["rsqb", [93]],
          ["rsquo", [8217]],
          ["rsquor", [8217]],
          ["CloseCurlyQuote", [8217]],
          ["rthree", [8908]],
          ["rtimes", [8906]],
          ["rtri", [9657]],
          ["rtrie", [8885]],
          ["rtrif", [9656]],
          ["rtriltri", [10702]],
          ["RuleDelayed", [10740]],
          ["ruluhar", [10600]],
          ["rx", [8478]],
          ["Sacute", [346]],
          ["sacute", [347]],
          ["sbquo", [8218]],
          ["scap", [10936]],
          ["Scaron", [352]],
          ["scaron", [353]],
          ["Sc", [10940]],
          ["sc", [8827]],
          ["sccue", [8829]],
          ["sce", [10928]],
          ["scE", [10932]],
          ["Scedil", [350]],
          ["scedil", [351]],
          ["Scirc", [348]],
          ["scirc", [349]],
          ["scnap", [10938]],
          ["scnE", [10934]],
          ["scnsim", [8937]],
          ["scpolint", [10771]],
          ["scsim", [8831]],
          ["Scy", [1057]],
          ["scy", [1089]],
          ["sdotb", [8865]],
          ["sdot", [8901]],
          ["sdote", [10854]],
          ["searhk", [10533]],
          ["searr", [8600]],
          ["seArr", [8664]],
          ["searrow", [8600]],
          ["sect", [167]],
          ["semi", [59]],
          ["seswar", [10537]],
          ["setminus", [8726]],
          ["setmn", [8726]],
          ["sext", [10038]],
          ["Sfr", [120086]],
          ["sfr", [120112]],
          ["sfrown", [8994]],
          ["sharp", [9839]],
          ["SHCHcy", [1065]],
          ["shchcy", [1097]],
          ["SHcy", [1064]],
          ["shcy", [1096]],
          ["ShortDownArrow", [8595]],
          ["ShortLeftArrow", [8592]],
          ["shortmid", [8739]],
          ["shortparallel", [8741]],
          ["ShortRightArrow", [8594]],
          ["ShortUpArrow", [8593]],
          ["shy", [173]],
          ["Sigma", [931]],
          ["sigma", [963]],
          ["sigmaf", [962]],
          ["sigmav", [962]],
          ["sim", [8764]],
          ["simdot", [10858]],
          ["sime", [8771]],
          ["simeq", [8771]],
          ["simg", [10910]],
          ["simgE", [10912]],
          ["siml", [10909]],
          ["simlE", [10911]],
          ["simne", [8774]],
          ["simplus", [10788]],
          ["simrarr", [10610]],
          ["slarr", [8592]],
          ["SmallCircle", [8728]],
          ["smallsetminus", [8726]],
          ["smashp", [10803]],
          ["smeparsl", [10724]],
          ["smid", [8739]],
          ["smile", [8995]],
          ["smt", [10922]],
          ["smte", [10924]],
          ["smtes", [10924, 65024]],
          ["SOFTcy", [1068]],
          ["softcy", [1100]],
          ["solbar", [9023]],
          ["solb", [10692]],
          ["sol", [47]],
          ["Sopf", [120138]],
          ["sopf", [120164]],
          ["spades", [9824]],
          ["spadesuit", [9824]],
          ["spar", [8741]],
          ["sqcap", [8851]],
          ["sqcaps", [8851, 65024]],
          ["sqcup", [8852]],
          ["sqcups", [8852, 65024]],
          ["Sqrt", [8730]],
          ["sqsub", [8847]],
          ["sqsube", [8849]],
          ["sqsubset", [8847]],
          ["sqsubseteq", [8849]],
          ["sqsup", [8848]],
          ["sqsupe", [8850]],
          ["sqsupset", [8848]],
          ["sqsupseteq", [8850]],
          ["square", [9633]],
          ["Square", [9633]],
          ["SquareIntersection", [8851]],
          ["SquareSubset", [8847]],
          ["SquareSubsetEqual", [8849]],
          ["SquareSuperset", [8848]],
          ["SquareSupersetEqual", [8850]],
          ["SquareUnion", [8852]],
          ["squarf", [9642]],
          ["squ", [9633]],
          ["squf", [9642]],
          ["srarr", [8594]],
          ["Sscr", [119982]],
          ["sscr", [120008]],
          ["ssetmn", [8726]],
          ["ssmile", [8995]],
          ["sstarf", [8902]],
          ["Star", [8902]],
          ["star", [9734]],
          ["starf", [9733]],
          ["straightepsilon", [1013]],
          ["straightphi", [981]],
          ["strns", [175]],
          ["sub", [8834]],
          ["Sub", [8912]],
          ["subdot", [10941]],
          ["subE", [10949]],
          ["sube", [8838]],
          ["subedot", [10947]],
          ["submult", [10945]],
          ["subnE", [10955]],
          ["subne", [8842]],
          ["subplus", [10943]],
          ["subrarr", [10617]],
          ["subset", [8834]],
          ["Subset", [8912]],
          ["subseteq", [8838]],
          ["subseteqq", [10949]],
          ["SubsetEqual", [8838]],
          ["subsetneq", [8842]],
          ["subsetneqq", [10955]],
          ["subsim", [10951]],
          ["subsub", [10965]],
          ["subsup", [10963]],
          ["succapprox", [10936]],
          ["succ", [8827]],
          ["succcurlyeq", [8829]],
          ["Succeeds", [8827]],
          ["SucceedsEqual", [10928]],
          ["SucceedsSlantEqual", [8829]],
          ["SucceedsTilde", [8831]],
          ["succeq", [10928]],
          ["succnapprox", [10938]],
          ["succneqq", [10934]],
          ["succnsim", [8937]],
          ["succsim", [8831]],
          ["SuchThat", [8715]],
          ["sum", [8721]],
          ["Sum", [8721]],
          ["sung", [9834]],
          ["sup1", [185]],
          ["sup2", [178]],
          ["sup3", [179]],
          ["sup", [8835]],
          ["Sup", [8913]],
          ["supdot", [10942]],
          ["supdsub", [10968]],
          ["supE", [10950]],
          ["supe", [8839]],
          ["supedot", [10948]],
          ["Superset", [8835]],
          ["SupersetEqual", [8839]],
          ["suphsol", [10185]],
          ["suphsub", [10967]],
          ["suplarr", [10619]],
          ["supmult", [10946]],
          ["supnE", [10956]],
          ["supne", [8843]],
          ["supplus", [10944]],
          ["supset", [8835]],
          ["Supset", [8913]],
          ["supseteq", [8839]],
          ["supseteqq", [10950]],
          ["supsetneq", [8843]],
          ["supsetneqq", [10956]],
          ["supsim", [10952]],
          ["supsub", [10964]],
          ["supsup", [10966]],
          ["swarhk", [10534]],
          ["swarr", [8601]],
          ["swArr", [8665]],
          ["swarrow", [8601]],
          ["swnwar", [10538]],
          ["szlig", [223]],
          ["Tab", [9]],
          ["target", [8982]],
          ["Tau", [932]],
          ["tau", [964]],
          ["tbrk", [9140]],
          ["Tcaron", [356]],
          ["tcaron", [357]],
          ["Tcedil", [354]],
          ["tcedil", [355]],
          ["Tcy", [1058]],
          ["tcy", [1090]],
          ["tdot", [8411]],
          ["telrec", [8981]],
          ["Tfr", [120087]],
          ["tfr", [120113]],
          ["there4", [8756]],
          ["therefore", [8756]],
          ["Therefore", [8756]],
          ["Theta", [920]],
          ["theta", [952]],
          ["thetasym", [977]],
          ["thetav", [977]],
          ["thickapprox", [8776]],
          ["thicksim", [8764]],
          ["ThickSpace", [8287, 8202]],
          ["ThinSpace", [8201]],
          ["thinsp", [8201]],
          ["thkap", [8776]],
          ["thksim", [8764]],
          ["THORN", [222]],
          ["thorn", [254]],
          ["tilde", [732]],
          ["Tilde", [8764]],
          ["TildeEqual", [8771]],
          ["TildeFullEqual", [8773]],
          ["TildeTilde", [8776]],
          ["timesbar", [10801]],
          ["timesb", [8864]],
          ["times", [215]],
          ["timesd", [10800]],
          ["tint", [8749]],
          ["toea", [10536]],
          ["topbot", [9014]],
          ["topcir", [10993]],
          ["top", [8868]],
          ["Topf", [120139]],
          ["topf", [120165]],
          ["topfork", [10970]],
          ["tosa", [10537]],
          ["tprime", [8244]],
          ["trade", [8482]],
          ["TRADE", [8482]],
          ["triangle", [9653]],
          ["triangledown", [9663]],
          ["triangleleft", [9667]],
          ["trianglelefteq", [8884]],
          ["triangleq", [8796]],
          ["triangleright", [9657]],
          ["trianglerighteq", [8885]],
          ["tridot", [9708]],
          ["trie", [8796]],
          ["triminus", [10810]],
          ["TripleDot", [8411]],
          ["triplus", [10809]],
          ["trisb", [10701]],
          ["tritime", [10811]],
          ["trpezium", [9186]],
          ["Tscr", [119983]],
          ["tscr", [120009]],
          ["TScy", [1062]],
          ["tscy", [1094]],
          ["TSHcy", [1035]],
          ["tshcy", [1115]],
          ["Tstrok", [358]],
          ["tstrok", [359]],
          ["twixt", [8812]],
          ["twoheadleftarrow", [8606]],
          ["twoheadrightarrow", [8608]],
          ["Uacute", [218]],
          ["uacute", [250]],
          ["uarr", [8593]],
          ["Uarr", [8607]],
          ["uArr", [8657]],
          ["Uarrocir", [10569]],
          ["Ubrcy", [1038]],
          ["ubrcy", [1118]],
          ["Ubreve", [364]],
          ["ubreve", [365]],
          ["Ucirc", [219]],
          ["ucirc", [251]],
          ["Ucy", [1059]],
          ["ucy", [1091]],
          ["udarr", [8645]],
          ["Udblac", [368]],
          ["udblac", [369]],
          ["udhar", [10606]],
          ["ufisht", [10622]],
          ["Ufr", [120088]],
          ["ufr", [120114]],
          ["Ugrave", [217]],
          ["ugrave", [249]],
          ["uHar", [10595]],
          ["uharl", [8639]],
          ["uharr", [8638]],
          ["uhblk", [9600]],
          ["ulcorn", [8988]],
          ["ulcorner", [8988]],
          ["ulcrop", [8975]],
          ["ultri", [9720]],
          ["Umacr", [362]],
          ["umacr", [363]],
          ["uml", [168]],
          ["UnderBar", [95]],
          ["UnderBrace", [9183]],
          ["UnderBracket", [9141]],
          ["UnderParenthesis", [9181]],
          ["Union", [8899]],
          ["UnionPlus", [8846]],
          ["Uogon", [370]],
          ["uogon", [371]],
          ["Uopf", [120140]],
          ["uopf", [120166]],
          ["UpArrowBar", [10514]],
          ["uparrow", [8593]],
          ["UpArrow", [8593]],
          ["Uparrow", [8657]],
          ["UpArrowDownArrow", [8645]],
          ["updownarrow", [8597]],
          ["UpDownArrow", [8597]],
          ["Updownarrow", [8661]],
          ["UpEquilibrium", [10606]],
          ["upharpoonleft", [8639]],
          ["upharpoonright", [8638]],
          ["uplus", [8846]],
          ["UpperLeftArrow", [8598]],
          ["UpperRightArrow", [8599]],
          ["upsi", [965]],
          ["Upsi", [978]],
          ["upsih", [978]],
          ["Upsilon", [933]],
          ["upsilon", [965]],
          ["UpTeeArrow", [8613]],
          ["UpTee", [8869]],
          ["upuparrows", [8648]],
          ["urcorn", [8989]],
          ["urcorner", [8989]],
          ["urcrop", [8974]],
          ["Uring", [366]],
          ["uring", [367]],
          ["urtri", [9721]],
          ["Uscr", [119984]],
          ["uscr", [120010]],
          ["utdot", [8944]],
          ["Utilde", [360]],
          ["utilde", [361]],
          ["utri", [9653]],
          ["utrif", [9652]],
          ["uuarr", [8648]],
          ["Uuml", [220]],
          ["uuml", [252]],
          ["uwangle", [10663]],
          ["vangrt", [10652]],
          ["varepsilon", [1013]],
          ["varkappa", [1008]],
          ["varnothing", [8709]],
          ["varphi", [981]],
          ["varpi", [982]],
          ["varpropto", [8733]],
          ["varr", [8597]],
          ["vArr", [8661]],
          ["varrho", [1009]],
          ["varsigma", [962]],
          ["varsubsetneq", [8842, 65024]],
          ["varsubsetneqq", [10955, 65024]],
          ["varsupsetneq", [8843, 65024]],
          ["varsupsetneqq", [10956, 65024]],
          ["vartheta", [977]],
          ["vartriangleleft", [8882]],
          ["vartriangleright", [8883]],
          ["vBar", [10984]],
          ["Vbar", [10987]],
          ["vBarv", [10985]],
          ["Vcy", [1042]],
          ["vcy", [1074]],
          ["vdash", [8866]],
          ["vDash", [8872]],
          ["Vdash", [8873]],
          ["VDash", [8875]],
          ["Vdashl", [10982]],
          ["veebar", [8891]],
          ["vee", [8744]],
          ["Vee", [8897]],
          ["veeeq", [8794]],
          ["vellip", [8942]],
          ["verbar", [124]],
          ["Verbar", [8214]],
          ["vert", [124]],
          ["Vert", [8214]],
          ["VerticalBar", [8739]],
          ["VerticalLine", [124]],
          ["VerticalSeparator", [10072]],
          ["VerticalTilde", [8768]],
          ["VeryThinSpace", [8202]],
          ["Vfr", [120089]],
          ["vfr", [120115]],
          ["vltri", [8882]],
          ["vnsub", [8834, 8402]],
          ["vnsup", [8835, 8402]],
          ["Vopf", [120141]],
          ["vopf", [120167]],
          ["vprop", [8733]],
          ["vrtri", [8883]],
          ["Vscr", [119985]],
          ["vscr", [120011]],
          ["vsubnE", [10955, 65024]],
          ["vsubne", [8842, 65024]],
          ["vsupnE", [10956, 65024]],
          ["vsupne", [8843, 65024]],
          ["Vvdash", [8874]],
          ["vzigzag", [10650]],
          ["Wcirc", [372]],
          ["wcirc", [373]],
          ["wedbar", [10847]],
          ["wedge", [8743]],
          ["Wedge", [8896]],
          ["wedgeq", [8793]],
          ["weierp", [8472]],
          ["Wfr", [120090]],
          ["wfr", [120116]],
          ["Wopf", [120142]],
          ["wopf", [120168]],
          ["wp", [8472]],
          ["wr", [8768]],
          ["wreath", [8768]],
          ["Wscr", [119986]],
          ["wscr", [120012]],
          ["xcap", [8898]],
          ["xcirc", [9711]],
          ["xcup", [8899]],
          ["xdtri", [9661]],
          ["Xfr", [120091]],
          ["xfr", [120117]],
          ["xharr", [10231]],
          ["xhArr", [10234]],
          ["Xi", [926]],
          ["xi", [958]],
          ["xlarr", [10229]],
          ["xlArr", [10232]],
          ["xmap", [10236]],
          ["xnis", [8955]],
          ["xodot", [10752]],
          ["Xopf", [120143]],
          ["xopf", [120169]],
          ["xoplus", [10753]],
          ["xotime", [10754]],
          ["xrarr", [10230]],
          ["xrArr", [10233]],
          ["Xscr", [119987]],
          ["xscr", [120013]],
          ["xsqcup", [10758]],
          ["xuplus", [10756]],
          ["xutri", [9651]],
          ["xvee", [8897]],
          ["xwedge", [8896]],
          ["Yacute", [221]],
          ["yacute", [253]],
          ["YAcy", [1071]],
          ["yacy", [1103]],
          ["Ycirc", [374]],
          ["ycirc", [375]],
          ["Ycy", [1067]],
          ["ycy", [1099]],
          ["yen", [165]],
          ["Yfr", [120092]],
          ["yfr", [120118]],
          ["YIcy", [1031]],
          ["yicy", [1111]],
          ["Yopf", [120144]],
          ["yopf", [120170]],
          ["Yscr", [119988]],
          ["yscr", [120014]],
          ["YUcy", [1070]],
          ["yucy", [1102]],
          ["yuml", [255]],
          ["Yuml", [376]],
          ["Zacute", [377]],
          ["zacute", [378]],
          ["Zcaron", [381]],
          ["zcaron", [382]],
          ["Zcy", [1047]],
          ["zcy", [1079]],
          ["Zdot", [379]],
          ["zdot", [380]],
          ["zeetrf", [8488]],
          ["ZeroWidthSpace", [8203]],
          ["Zeta", [918]],
          ["zeta", [950]],
          ["zfr", [120119]],
          ["Zfr", [8488]],
          ["ZHcy", [1046]],
          ["zhcy", [1078]],
          ["zigrarr", [8669]],
          ["zopf", [120171]],
          ["Zopf", [8484]],
          ["Zscr", [119989]],
          ["zscr", [120015]],
          ["zwj", [8205]],
          ["zwnj", [8204]]
        ];
        var alphaIndex = {};
        var charIndex = {};
        createIndexes(alphaIndex, charIndex);
        var Html5Entities = /** @class */ (function() {
          function Html5Entities() {}
          Html5Entities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
              var chr;
              if (entity.charAt(0) === "#") {
                var code =
                  entity.charAt(1) === "x"
                    ? parseInt(entity.substr(2).toLowerCase(), 16)
                    : parseInt(entity.substr(1));
                if (!(isNaN(code) || code < -32768 || code > 65535)) {
                  chr = String.fromCharCode(code);
                }
              } else {
                chr = alphaIndex[entity];
              }
              return chr || s;
            });
          };
          Html5Entities.decode = function(str) {
            return new Html5Entities().decode(str);
          };
          Html5Entities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var charInfo = charIndex[str.charCodeAt(i)];
              if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                  i++;
                } else {
                  alpha = charInfo[""];
                }
                if (alpha) {
                  result += "&" + alpha + ";";
                  i++;
                  continue;
                }
              }
              result += str.charAt(i);
              i++;
            }
            return result;
          };
          Html5Entities.encode = function(str) {
            return new Html5Entities().encode(str);
          };
          Html5Entities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              var charInfo = charIndex[c];
              if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                  i++;
                } else {
                  alpha = charInfo[""];
                }
                if (alpha) {
                  result += "&" + alpha + ";";
                  i++;
                  continue;
                }
              }
              if (c < 32 || c > 126) {
                result += "&#" + c + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          Html5Entities.encodeNonUTF = function(str) {
            return new Html5Entities().encodeNonUTF(str);
          };
          Html5Entities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          Html5Entities.encodeNonASCII = function(str) {
            return new Html5Entities().encodeNonASCII(str);
          };
          return Html5Entities;
        })();
        exports.Html5Entities = Html5Entities;
        function createIndexes(alphaIndex, charIndex) {
          var i = ENTITIES.length;
          while (i--) {
            var e = ENTITIES[i];
            var alpha = e[0];
            var chars = e[1];
            var chr = chars[0];
            var addChar =
              chr < 32 ||
              chr > 126 ||
              chr === 62 ||
              chr === 60 ||
              chr === 38 ||
              chr === 34 ||
              chr === 39;
            var charInfo = void 0;
            if (addChar) {
              charInfo = charIndex[chr] = charIndex[chr] || {};
            }
            if (chars[1]) {
              var chr2 = chars[1];
              alphaIndex[alpha] =
                String.fromCharCode(chr) + String.fromCharCode(chr2);
              addChar && (charInfo[chr2] = alpha);
            } else {
              alphaIndex[alpha] = String.fromCharCode(chr);
              addChar && (charInfo[""] = alpha);
            }
          }
        }

        /***/
      },

    /***/ "../paperclip-web-renderer/node_modules/html-entities/lib/index.js":
      /*!*************************************************************************!*\
  !*** ../paperclip-web-renderer/node_modules/html-entities/lib/index.js ***!
  \*************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var xml_entities_1 = __webpack_require__(
          /*! ./xml-entities */ "../paperclip-web-renderer/node_modules/html-entities/lib/xml-entities.js"
        );
        exports.XmlEntities = xml_entities_1.XmlEntities;
        var html4_entities_1 = __webpack_require__(
          /*! ./html4-entities */ "../paperclip-web-renderer/node_modules/html-entities/lib/html4-entities.js"
        );
        exports.Html4Entities = html4_entities_1.Html4Entities;
        var html5_entities_1 = __webpack_require__(
          /*! ./html5-entities */ "../paperclip-web-renderer/node_modules/html-entities/lib/html5-entities.js"
        );
        exports.Html5Entities = html5_entities_1.Html5Entities;
        exports.AllHtmlEntities = html5_entities_1.Html5Entities;

        /***/
      },

    /***/ "../paperclip-web-renderer/node_modules/html-entities/lib/xml-entities.js":
      /*!********************************************************************************!*\
  !*** ../paperclip-web-renderer/node_modules/html-entities/lib/xml-entities.js ***!
  \********************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", { value: true });
        var ALPHA_INDEX = {
          "&lt": "<",
          "&gt": ">",
          "&quot": '"',
          "&apos": "'",
          "&amp": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&apos;": "'",
          "&amp;": "&"
        };
        var CHAR_INDEX = {
          60: "lt",
          62: "gt",
          34: "quot",
          39: "apos",
          38: "amp"
        };
        var CHAR_S_INDEX = {
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
          "&": "&amp;"
        };
        var XmlEntities = /** @class */ (function() {
          function XmlEntities() {}
          XmlEntities.prototype.encode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/[<>"'&]/g, function(s) {
              return CHAR_S_INDEX[s];
            });
          };
          XmlEntities.encode = function(str) {
            return new XmlEntities().encode(str);
          };
          XmlEntities.prototype.decode = function(str) {
            if (!str || !str.length) {
              return "";
            }
            return str.replace(/&#?[0-9a-zA-Z]+;?/g, function(s) {
              if (s.charAt(1) === "#") {
                var code =
                  s.charAt(2).toLowerCase() === "x"
                    ? parseInt(s.substr(3), 16)
                    : parseInt(s.substr(2));
                if (isNaN(code) || code < -32768 || code > 65535) {
                  return "";
                }
                return String.fromCharCode(code);
              }
              return ALPHA_INDEX[s] || s;
            });
          };
          XmlEntities.decode = function(str) {
            return new XmlEntities().decode(str);
          };
          XmlEntities.prototype.encodeNonUTF = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLength = str.length;
            var result = "";
            var i = 0;
            while (i < strLength) {
              var c = str.charCodeAt(i);
              var alpha = CHAR_INDEX[c];
              if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
              }
              if (c < 32 || c > 126) {
                result += "&#" + c + ";";
              } else {
                result += str.charAt(i);
              }
              i++;
            }
            return result;
          };
          XmlEntities.encodeNonUTF = function(str) {
            return new XmlEntities().encodeNonUTF(str);
          };
          XmlEntities.prototype.encodeNonASCII = function(str) {
            if (!str || !str.length) {
              return "";
            }
            var strLenght = str.length;
            var result = "";
            var i = 0;
            while (i < strLenght) {
              var c = str.charCodeAt(i);
              if (c <= 255) {
                result += str[i++];
                continue;
              }
              result += "&#" + c + ";";
              i++;
            }
            return result;
          };
          XmlEntities.encodeNonASCII = function(str) {
            return new XmlEntities().encodeNonASCII(str);
          };
          return XmlEntities;
        })();
        exports.XmlEntities = XmlEntities;

        /***/
      },

    /***/ "../paperclip/browser.js":
      /*!*******************************!*\
  !*** ../paperclip/browser.js ***!
  \*******************************/
      /*! exports provided: createEngine */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "createEngine",
          function() {
            return createEngine;
          }
        );
        /* harmony import */ var _esm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./esm */ "../paperclip/esm/index.js"
        );
        /* harmony import */ var _native_web_paperclip_no_import_meta_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! ./native/web/paperclip-no-import-meta.js */ "../paperclip/native/web/paperclip-no-import-meta.js"
        );

        const initp = Object(
          _native_web_paperclip_no_import_meta_js__WEBPACK_IMPORTED_MODULE_1__[
            "default"
          ]
        )("/paperclip_bg.wasm");

        const createEngine = Object(
          _esm__WEBPACK_IMPORTED_MODULE_0__["createEngine"]
        )(async (...args) => {
          await initp;
          return _native_web_paperclip_no_import_meta_js__WEBPACK_IMPORTED_MODULE_1__[
            "NativeEngine"
          ].new(...args);
        });

        /***/
      },

    /***/ "../paperclip/esm/engine.js":
      /*!**********************************!*\
  !*** ../paperclip/esm/engine.js ***!
  \**********************************/
      /*! exports provided: Engine, createEngine, keepEngineInSyncWithFileSystem */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "Engine",
          function() {
            return Engine;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "createEngine",
          function() {
            return createEngine;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "keepEngineInSyncWithFileSystem",
          function() {
            return keepEngineInSyncWithFileSystem;
          }
        );
        /* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! fs */ "fs"
        );
        /* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
          fs__WEBPACK_IMPORTED_MODULE_0__
        );
        /* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        /* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/ __webpack_require__.n(
          path__WEBPACK_IMPORTED_MODULE_1__
        );
        /* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
          /*! url */ "./node_modules/url/url.js"
        );
        /* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/ __webpack_require__.n(
          url__WEBPACK_IMPORTED_MODULE_2__
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(
          paperclip_utils__WEBPACK_IMPORTED_MODULE_3__
        );
        /* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
          /*! ./utils */ "../paperclip/esm/utils.js"
        );
        // 🙈
        var __awaiter =
          (undefined && undefined.__awaiter) ||
          function(thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function(resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function(resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator["throw"](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };

        const mapResult = result => {
          if (!result) {
            return result;
          }
          if (result.Ok) {
            return result.Ok;
          } else {
            return { error: result.Err };
          }
        };
        class Engine {
          constructor(
            _createNativeEngine,
            _options = {},
            _onCrash = _utils__WEBPACK_IMPORTED_MODULE_4__["noop"]
          ) {
            this._createNativeEngine = _createNativeEngine;
            this._options = _options;
            this._onCrash = _onCrash;
            this._listeners = [];
            this._rendered = {};
            this._onEngineEvent = event => {
              if (
                event.kind ===
                paperclip_utils__WEBPACK_IMPORTED_MODULE_3__["EngineEventKind"]
                  .Evaluated
              ) {
                const data = (this._rendered[
                  event.uri
                ] = Object.assign(Object.assign({}, event.data), {
                  importedSheets: this.getImportedSheets(event)
                }));
                this._dispatch({
                  kind:
                    paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                      "EngineEventKind"
                    ].Loaded,
                  uri: event.uri,
                  data
                });
              } else if (
                event.kind ===
                paperclip_utils__WEBPACK_IMPORTED_MODULE_3__["EngineEventKind"]
                  .Diffed
              ) {
                const existingData = this._rendered[event.uri];
                const newData = (this._rendered[event.uri] = Object.assign(
                  Object.assign({}, existingData),
                  {
                    imports: event.data.imports,
                    exports: event.data.exports,
                    importedSheets: this.getImportedSheets(event),
                    allDependencies: event.data.allDependencies,
                    sheet: event.data.sheet || existingData.sheet,
                    preview: Object(
                      paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                        "patchVirtNode"
                      ]
                    )(existingData.preview, event.data.mutations)
                  }
                ));
                const removedSheetUris = [];
                for (const { uri } of existingData.importedSheets) {
                  if (!newData.allDependencies.includes(uri)) {
                    removedSheetUris.push(uri);
                  }
                }
                const addedSheets = [];
                for (const depUri of event.data.allDependencies) {
                  // Note that we only do this if the sheet is already rendered -- engine
                  // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
                  // has been added, including the actual sheet object.
                  if (
                    !existingData.allDependencies.includes(depUri) &&
                    this._rendered[depUri]
                  ) {
                    addedSheets.push({
                      uri: depUri,
                      sheet: this._rendered[depUri].sheet
                    });
                  }
                }
                if (addedSheets.length || removedSheetUris.length) {
                  this._dispatch({
                    uri: event.uri,
                    kind:
                      paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                        "EngineEventKind"
                      ].ChangedSheets,
                    data: {
                      newSheets: addedSheets,
                      removedSheetUris: removedSheetUris,
                      allDependencies: event.data.allDependencies
                    }
                  });
                }
              }
            };
            this._tryCatch = fn => {
              try {
                return fn();
              } catch (e) {
                this._onCrash(e);
                return null;
              }
            };
            this._dispatch = event => {
              // try-catch since engine will throw opaque error.
              for (const listener of this._listeners) {
                listener(event);
              }
            };
            this._io = Object.assign(
              {
                readFile: uri => {
                  return fs__WEBPACK_IMPORTED_MODULE_0__["readFileSync"](
                    new URL(uri),
                    "utf8"
                  );
                },
                fileExists: uri => {
                  try {
                    const url = new URL(uri);
                    // need to make sure that case matches _exactly_ since some
                    // systems are sensitive to that.
                    return (
                      existsSyncCaseSensitive(url) &&
                      fs__WEBPACK_IMPORTED_MODULE_0__["lstatSync"](url).isFile()
                    );
                  } catch (e) {
                    console.error(e);
                    return false;
                  }
                },
                resolveFile: Object(
                  paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                    "resolveImportUri"
                  ]
                )(fs__WEBPACK_IMPORTED_MODULE_0__)
              },
              _options.io
            );
          }
          $$load() {
            return __awaiter(this, void 0, void 0, function*() {
              const io = this._io;
              this._native = yield this._createNativeEngine(
                io.readFile,
                io.fileExists,
                io.resolveFile
              );
              // only one native listener to for buffer performance
              this._native.add_listener(this._dispatch);
              this.onEvent(this._onEngineEvent);
              return this;
            });
          }
          onEvent(listener) {
            if (listener == null) {
              throw new Error(`listener cannot be undefined`);
            }
            this._listeners.push(listener);
            return () => {
              const i = this._listeners.indexOf(listener);
              if (i !== -1) {
                this._listeners.splice(i, 1);
              }
            };
          }
          parseFile(uri) {
            return mapResult(this._native.parse_file(uri));
          }
          getLoadedAst(uri) {
            return this._tryCatch(() => this._native.get_loaded_ast(uri));
          }
          parseContent(content) {
            return this._tryCatch(() =>
              mapResult(this._native.parse_content(content))
            );
          }
          updateVirtualFileContent(uri, content) {
            return this._tryCatch(() => {
              const ret = mapResult(
                this._native.update_virtual_file_content(uri, content)
              );
              return ret;
            });
          }
          getLoadedData(uri) {
            return this._rendered[uri];
          }
          _waitForLoadedData(uri) {
            if (this._rendered[uri]) {
              return Promise.resolve(this._rendered[uri]);
            }
            return this._waitForLoadedData2(uri);
          }
          _waitForLoadedData2(uri) {
            return new Promise(resolve => {
              const dispose = this.onEvent(event => {
                if (
                  event.uri === uri &&
                  event.kind ===
                    paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                      "EngineEventKind"
                    ].Loaded
                ) {
                  dispose();
                  resolve(event.data);
                }
              });
            });
          }
          getImportedSheets({ data: { allDependencies } }) {
            // ick, wworks for now.
            const deps = [];
            for (const depUri of allDependencies) {
              const data = this._rendered[depUri];
              if (!data) {
                console.error(`data not loaded, this shouldn't happen 😬.`);
              } else {
                deps.push({ uri: depUri, sheet: data.sheet });
              }
            }
            return deps;
          }
          run(uri) {
            return __awaiter(this, void 0, void 0, function*() {
              const result = this._tryCatch(() =>
                mapResult(this._native.run(uri))
              );
              if (result && result.error) {
                return Promise.reject(result.error);
              }
              return this._waitForLoadedData(uri);
            });
          }
        }
        const createEngine = createNativeEngine => (options, onCrash) =>
          __awaiter(void 0, void 0, void 0, function*() {
            return yield new Engine(
              createNativeEngine,
              options,
              onCrash
            ).$$load();
          });
        const existsSyncCaseSensitive = uri => {
          const pathname = url__WEBPACK_IMPORTED_MODULE_2__["fileURLToPath"](
            uri
          );
          const dir = path__WEBPACK_IMPORTED_MODULE_1__["dirname"](pathname);
          const basename = path__WEBPACK_IMPORTED_MODULE_1__["basename"](
            pathname
          );
          return fs__WEBPACK_IMPORTED_MODULE_0__["readdirSync"](dir).includes(
            basename
          );
        };
        const keepEngineInSyncWithFileSystem = (watcher, engine) => {
          return watcher.onChange((kind, uri) => {
            if (
              kind ===
              paperclip_utils__WEBPACK_IMPORTED_MODULE_3__["ChangeKind"].Changed
            ) {
              engine.updateVirtualFileContent(
                uri,
                fs__WEBPACK_IMPORTED_MODULE_0__["readFileSync"](
                  new url__WEBPACK_IMPORTED_MODULE_2__["URL"](uri),
                  "utf8"
                )
              );
            }
          });
        };

        /***/
      },

    /***/ "../paperclip/esm/index.js":
      /*!*********************************!*\
  !*** ../paperclip/esm/index.js ***!
  \*********************************/
      /*! no static exports found */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./engine */ "../paperclip/esm/engine.js"
        );
        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "Engine",
          function() {
            return _engine__WEBPACK_IMPORTED_MODULE_0__["Engine"];
          }
        );

        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "createEngine",
          function() {
            return _engine__WEBPACK_IMPORTED_MODULE_0__["createEngine"];
          }
        );

        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "keepEngineInSyncWithFileSystem",
          function() {
            return _engine__WEBPACK_IMPORTED_MODULE_0__[
              "keepEngineInSyncWithFileSystem"
            ];
          }
        );

        /* harmony import */ var _infer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! ./infer */ "../paperclip/esm/infer.js"
        );
        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "InferenceKind",
          function() {
            return _infer__WEBPACK_IMPORTED_MODULE_1__["InferenceKind"];
          }
        );

        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "infer",
          function() {
            return _infer__WEBPACK_IMPORTED_MODULE_1__["infer"];
          }
        );

        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/ __webpack_require__.n(
          paperclip_utils__WEBPACK_IMPORTED_MODULE_2__
        );
        /* harmony reexport (unknown) */ for (var __WEBPACK_IMPORT_KEY__ in paperclip_utils__WEBPACK_IMPORTED_MODULE_2__)
          if (
            [
              "Engine",
              "createEngine",
              "keepEngineInSyncWithFileSystem",
              "InferenceKind",
              "infer",
              "default"
            ].indexOf(__WEBPACK_IMPORT_KEY__) < 0
          )
            (function(key) {
              __webpack_require__.d(__webpack_exports__, key, function() {
                return paperclip_utils__WEBPACK_IMPORTED_MODULE_2__[key];
              });
            })(__WEBPACK_IMPORT_KEY__);
        /* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          /*! ./utils */ "../paperclip/esm/utils.js"
        );
        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "resolveAllPaperclipFiles",
          function() {
            return _utils__WEBPACK_IMPORTED_MODULE_3__[
              "resolveAllPaperclipFiles"
            ];
          }
        );

        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "resolveAllAssetFiles",
          function() {
            return _utils__WEBPACK_IMPORTED_MODULE_3__["resolveAllAssetFiles"];
          }
        );

        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "noop",
          function() {
            return _utils__WEBPACK_IMPORTED_MODULE_3__["noop"];
          }
        );

        /***/
      },

    /***/ "../paperclip/esm/infer.js":
      /*!*********************************!*\
  !*** ../paperclip/esm/infer.js ***!
  \*********************************/
      /*! exports provided: InferenceKind, infer */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "InferenceKind",
          function() {
            return InferenceKind;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "infer",
          function() {
            return infer;
          }
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
          paperclip_utils__WEBPACK_IMPORTED_MODULE_0__
        );

        // TODO - this should be built in rust
        var InferenceKind;
        (function(InferenceKind) {
          InferenceKind[(InferenceKind["Shape"] = 0)] = "Shape";
          InferenceKind[(InferenceKind["Array"] = 1)] = "Array";
          InferenceKind[(InferenceKind["Any"] = 2)] = "Any";
        })(InferenceKind || (InferenceKind = {}));
        const createShapeInference = (properties = {}, fromSpread = false) => ({
          kind: InferenceKind.Shape,
          fromSpread,
          properties
        });
        const createAnyInference = () => ({ kind: InferenceKind.Any });
        const ANY_INFERENCE = createAnyInference();
        const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);
        const addShapeInferenceProperty = (part, value, shape) => {
          var _a, _b;
          return Object.assign(Object.assign({}, shape), {
            properties: Object.assign(Object.assign({}, shape.properties), {
              [part.name]: {
                value,
                optional:
                  ((_a = shape.properties[part.name]) === null || _a === void 0
                    ? void 0
                    : _a.optional) === false
                    ? (_b = shape.properties[part.name]) === null ||
                      _b === void 0
                      ? void 0
                      : _b.optional
                    : part.optional
              }
            })
          });
        };
        const mergeShapeInference = (existing, extended) => {
          if (extended.kind === InferenceKind.Any) {
            return existing;
          }
          if (extended.kind === InferenceKind.Array) {
            console.error(`Conflict: can't access properties of arra`);
            // ERRROR!
            return existing;
          }
          return Object.assign(Object.assign({}, existing), {
            properties: Object.assign(
              Object.assign({}, existing.properties),
              extended.properties
            )
          });
        };
        const addInferenceProperty = (path, value, owner, _index = 0) => {
          var _a, _b;
          if (path.length === 0) {
            return owner;
          }
          if (owner.kind === InferenceKind.Any) {
            owner = createShapeInference();
          }
          const part = path[_index];
          if (owner.kind === InferenceKind.Shape) {
            if (_index < path.length - 1) {
              let childValue =
                ((_a = owner.properties[part.name]) === null || _a === void 0
                  ? void 0
                  : _a.value) || createShapeInference();
              childValue = addInferenceProperty(
                path,
                value,
                childValue,
                _index + 1
              );
              owner = addShapeInferenceProperty(part, childValue, owner);
            } else {
              const existingInference =
                ((_b = owner.properties[part.name]) === null || _b === void 0
                  ? void 0
                  : _b.value) || ANY_INFERENCE;
              if (existingInference.kind === InferenceKind.Shape) {
                value = mergeShapeInference(existingInference, value);
              }
              owner = addShapeInferenceProperty(part, value, owner);
            }
          }
          if (owner.kind === InferenceKind.Array) {
            owner = Object.assign(Object.assign({}, owner), {
              value: addInferenceProperty(path, value, owner.value, _index)
            });
          }
          return owner;
        };
        const unfurlScopePath = (path, context) => {
          let cpath = path;
          if (!context.scope[path[0].name]) {
            return path;
          }
          let entirePath = path;
          while (true) {
            const property = cpath[0].name;
            const newCPath = context.scope[property];
            // if exists, but empty, then the scope is created within the template
            if (newCPath) {
              if (newCPath.length === 0) {
                return [];
              }
            } else {
              break;
            }
            entirePath = [...newCPath, ...entirePath.slice(1)];
            cpath = newCPath;
          }
          return entirePath;
        };
        const addContextInferenceProperty = (path, value, context) =>
          Object.assign(Object.assign({}, context), {
            inference: addInferenceProperty(
              unfurlScopePath(path, context),
              value,
              context.inference
            )
          });
        const infer = ast => {
          return inferNode(ast, true, {
            scope: {},
            inference: createShapeInference()
          }).inference;
        };
        const inferNode = (ast, isRoot, context) => {
          switch (ast.kind) {
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["NodeKind"]
              .Element:
              return inferElement(ast, isRoot, context);
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["NodeKind"].Slot:
              return inferSlot(ast, context);
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["NodeKind"]
              .Fragment:
              return inferFragment(ast, context);
          }
          return context;
        };
        const inferElement = (element, isRoot, context) => {
          for (const atttribute of element.attributes) {
            context = inferAttribute(atttribute, context);
          }
          context = inferChildren(element.children, context);
          return context;
        };
        const inferAttribute = (attribute, context) => {
          switch (attribute.kind) {
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["AttributeKind"]
              .KeyValueAttribute: {
              if (
                attribute.value &&
                attribute.value.attrValueKind ===
                  paperclip_utils__WEBPACK_IMPORTED_MODULE_0__[
                    "AttributeValueKind"
                  ].Slot
              ) {
                context = inferStatement(attribute.value.script, context);
              }
              if (
                attribute.value &&
                attribute.value.attrValueKind ===
                  paperclip_utils__WEBPACK_IMPORTED_MODULE_0__[
                    "AttributeValueKind"
                  ].DyanmicString
              ) {
                for (const part of attribute.value.values) {
                  if (
                    part.partKind ===
                    paperclip_utils__WEBPACK_IMPORTED_MODULE_0__[
                      "DynamicStringAttributeValuePartKind"
                    ].Slot
                  ) {
                    context = inferStatement(part, context);
                  }
                }
              }
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["AttributeKind"]
              .PropertyBoundAttribute: {
              context = addContextInferenceProperty(
                [{ name: attribute.bindingName, optional: true }],
                ANY_INFERENCE,
                context
              );
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["AttributeKind"]
              .ShorthandAttribute: {
              context = inferStatement(attribute.reference, context);
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["AttributeKind"]
              .SpreadAttribute: {
              context = inferStatement(
                attribute.script,
                context,
                SPREADED_SHAPE_INFERENCE
              );
              break;
            }
          }
          return context;
        };
        const inferSlot = (slot, context) => {
          return inferStatement(slot.script, context);
        };
        const inferFragment = (fragment, context) => {
          return inferChildren(fragment.children, context);
        };
        const inferChildren = (children, context) =>
          children.reduce(
            (context, child) => inferNode(child, false, context),
            context
          );
        const inferStatement = (
          statement,
          context,
          defaultInference = ANY_INFERENCE
        ) => {
          switch (statement.jsKind) {
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["StatementKind"]
              .Reference: {
              context = addContextInferenceProperty(
                statement.path,
                defaultInference,
                context
              );
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["StatementKind"]
              .Node: {
              context = inferNode(statement, false, context);
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["StatementKind"]
              .Object: {
              for (const property of statement.properties) {
                context = inferStatement(
                  property.value,
                  context,
                  defaultInference
                );
              }
              break;
            }
            case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__["StatementKind"]
              .Array: {
              for (const value of statement.values) {
                context = inferStatement(value, context, defaultInference);
              }
              break;
            }
          }
          return context;
        };

        /***/
      },

    /***/ "../paperclip/esm/utils.js":
      /*!*********************************!*\
  !*** ../paperclip/esm/utils.js ***!
  \*********************************/
      /*! exports provided: resolveAllPaperclipFiles, resolveAllAssetFiles, noop */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "resolveAllPaperclipFiles",
          function() {
            return resolveAllPaperclipFiles;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "resolveAllAssetFiles",
          function() {
            return resolveAllAssetFiles;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "noop",
          function() {
            return noop;
          }
        );
        /* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! path */ "./node_modules/path-browserify/index.js"
        );
        /* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
          path__WEBPACK_IMPORTED_MODULE_0__
        );
        /* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! glob */ "fs"
        );
        /* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/ __webpack_require__.n(
          glob__WEBPACK_IMPORTED_MODULE_1__
        );
        /* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
          /*! url */ "./node_modules/url/url.js"
        );
        /* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/ __webpack_require__.n(
          url__WEBPACK_IMPORTED_MODULE_2__
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          /*! paperclip-utils */ "../paperclip-utils/index.js"
        );
        /* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(
          paperclip_utils__WEBPACK_IMPORTED_MODULE_3__
        );

        // TODO - move to paperclip-utils as soon as we have a glob library that can handle virtual file systems
        const findResourcesFromConfig = get => fs => (fromUri, relative) => {
          // symlinks may fudge module resolution, so we need to find the real path
          const fromPath = fs.realpathSync(
            new url__WEBPACK_IMPORTED_MODULE_2__["URL"](fromUri)
          );
          const fromPathDirname = path__WEBPACK_IMPORTED_MODULE_0__["dirname"](
            fromPath
          );
          const configUrl = Object(
            paperclip_utils__WEBPACK_IMPORTED_MODULE_3__["findPCConfigUrl"]
          )(fs)(fromUri);
          // If there's no config, then don't bother looking for PC files. Otherwise we're likely
          // to need esoteric logic for resolving PC that I don't think should be supported -- there should
          // just be aproach.
          if (!configUrl) {
            return [];
          }
          const configUri = new url__WEBPACK_IMPORTED_MODULE_2__["URL"](
            configUrl
          );
          const config = JSON.parse(fs.readFileSync(configUri, "utf8"));
          return get(
            config,
            path__WEBPACK_IMPORTED_MODULE_0__["dirname"](
              url__WEBPACK_IMPORTED_MODULE_2__["fileURLToPath"](configUri)
            )
          )
            .filter(pathname => pathname !== fromPath)
            .map(pathname => {
              if (relative) {
                const modulePath = getModulePath(
                  configUrl,
                  config,
                  pathname,
                  fromPathDirname
                );
                if (
                  !path__WEBPACK_IMPORTED_MODULE_0__["isAbsolute"](modulePath)
                ) {
                  return modulePath;
                }
                let relativePath = path__WEBPACK_IMPORTED_MODULE_0__[
                  "relative"
                ](fromPathDirname, modulePath);
                if (relativePath.charAt(0) !== ".") {
                  relativePath = "./" + relativePath;
                }
                return relativePath;
              }
              return url__WEBPACK_IMPORTED_MODULE_2__["pathToFileURL"](pathname)
                .href;
            })
            .map(filePath => {
              return filePath.replace(/\\/g, "/");
            });
        };
        const resolveAllPaperclipFiles = findResourcesFromConfig(
          (config, cwd) => {
            return glob__WEBPACK_IMPORTED_MODULE_1__["sync"](
              Object(
                paperclip_utils__WEBPACK_IMPORTED_MODULE_3__[
                  "paperclipSourceGlobPattern"
                ]
              )(config.sourceDirectory),
              {
                cwd,
                realpath: true
              }
            );
          }
        );
        const resolveAllAssetFiles = findResourcesFromConfig((config, cwd) => {
          const ext = `+(jpg|jpeg|png|gif|svg)`;
          const sourceDir = config.sourceDirectory;
          if (sourceDir === ".") {
            return glob__WEBPACK_IMPORTED_MODULE_1__["sync"](`**/*.${ext}`, {
              cwd,
              realpath: true
            });
          }
          return glob__WEBPACK_IMPORTED_MODULE_1__[
            "sync"
          ](`${sourceDir}/**/*.${ext}`, { cwd, realpath: true });
        });
        const getModulePath = (configUri, config, fullPath, fromDir) => {
          const configDir = path__WEBPACK_IMPORTED_MODULE_0__["dirname"](
            url__WEBPACK_IMPORTED_MODULE_2__["fileURLToPath"](configUri)
          );
          const moduleDirectory =
            path__WEBPACK_IMPORTED_MODULE_0__["join"](
              configDir,
              config.sourceDirectory
            ) + "/";
          if (fullPath.indexOf(moduleDirectory) === 0) {
            const modulePath = fullPath.replace(moduleDirectory, "");
            const nextDirectory =
              path__WEBPACK_IMPORTED_MODULE_0__["join"](
                moduleDirectory,
                modulePath.split("/")[0]
              ) + "/";
            if (!fromDir || fromDir.indexOf(nextDirectory) === -1) {
              return modulePath;
            }
          }
          return fullPath;
        };
        // eslint-disable-next-line
        const noop = () => {};

        /***/
      },

    /***/ "../paperclip/native/web/paperclip-no-import-meta.js":
      /*!***********************************************************!*\
  !*** ../paperclip/native/web/paperclip-no-import-meta.js ***!
  \***********************************************************/
      /*! exports provided: NativeEngine, default */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "NativeEngine",
          function() {
            return NativeEngine;
          }
        );

        let wasm;

        const heap = new Array(32).fill(undefined);

        heap.push(undefined, null, true, false);

        function getObject(idx) {
          return heap[idx];
        }

        let heap_next = heap.length;

        function dropObject(idx) {
          if (idx < 36) return;
          heap[idx] = heap_next;
          heap_next = idx;
        }

        function takeObject(idx) {
          const ret = getObject(idx);
          dropObject(idx);
          return ret;
        }

        let cachedTextDecoder = new TextDecoder("utf-8", {
          ignoreBOM: true,
          fatal: true
        });

        cachedTextDecoder.decode();

        let cachegetUint8Memory0 = null;
        function getUint8Memory0() {
          if (
            cachegetUint8Memory0 === null ||
            cachegetUint8Memory0.buffer !== wasm.memory.buffer
          ) {
            cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
          }
          return cachegetUint8Memory0;
        }

        function getStringFromWasm0(ptr, len) {
          return cachedTextDecoder.decode(
            getUint8Memory0().subarray(ptr, ptr + len)
          );
        }

        function addHeapObject(obj) {
          if (heap_next === heap.length) heap.push(heap.length + 1);
          const idx = heap_next;
          heap_next = heap[idx];

          heap[idx] = obj;
          return idx;
        }

        let WASM_VECTOR_LEN = 0;

        let cachedTextEncoder = new TextEncoder("utf-8");

        const encodeString =
          typeof cachedTextEncoder.encodeInto === "function"
            ? function(arg, view) {
                return cachedTextEncoder.encodeInto(arg, view);
              }
            : function(arg, view) {
                const buf = cachedTextEncoder.encode(arg);
                view.set(buf);
                return {
                  read: arg.length,
                  written: buf.length
                };
              };

        function passStringToWasm0(arg, malloc, realloc) {
          if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length);
            getUint8Memory0()
              .subarray(ptr, ptr + buf.length)
              .set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
          }

          let len = arg.length;
          let ptr = malloc(len);

          const mem = getUint8Memory0();

          let offset = 0;

          for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7f) break;
            mem[ptr + offset] = code;
          }

          if (offset !== len) {
            if (offset !== 0) {
              arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, (len = offset + arg.length * 3));
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);

            offset += ret.written;
          }

          WASM_VECTOR_LEN = offset;
          return ptr;
        }

        function isLikeNone(x) {
          return x === undefined || x === null;
        }

        let cachegetInt32Memory0 = null;
        function getInt32Memory0() {
          if (
            cachegetInt32Memory0 === null ||
            cachegetInt32Memory0.buffer !== wasm.memory.buffer
          ) {
            cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
          }
          return cachegetInt32Memory0;
        }

        function debugString(val) {
          // primitive types
          const type = typeof val;
          if (type == "number" || type == "boolean" || val == null) {
            return `${val}`;
          }
          if (type == "string") {
            return `"${val}"`;
          }
          if (type == "symbol") {
            const description = val.description;
            if (description == null) {
              return "Symbol";
            } else {
              return `Symbol(${description})`;
            }
          }
          if (type == "function") {
            const name = val.name;
            if (typeof name == "string" && name.length > 0) {
              return `Function(${name})`;
            } else {
              return "Function";
            }
          }
          // objects
          if (Array.isArray(val)) {
            const length = val.length;
            let debug = "[";
            if (length > 0) {
              debug += debugString(val[0]);
            }
            for (let i = 1; i < length; i++) {
              debug += ", " + debugString(val[i]);
            }
            debug += "]";
            return debug;
          }
          // Test for built-in
          const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
          let className;
          if (builtInMatches.length > 1) {
            className = builtInMatches[1];
          } else {
            // Failed to match the standard '[object ClassName]'
            return toString.call(val);
          }
          if (className == "Object") {
            // we're a user defined class or Object
            // JSON.stringify avoids problems with cycles, and is generally much
            // easier than looping through ownProperties of `val`.
            try {
              return "Object(" + JSON.stringify(val) + ")";
            } catch (_) {
              return "Object";
            }
          }
          // errors
          if (val instanceof Error) {
            return `${val.name}: ${val.message}\n${val.stack}`;
          }
          // TODO we could test for more things here, like `Set`s and `Map`s.
          return className;
        }

        function handleError(f) {
          return function() {
            try {
              return f.apply(this, arguments);
            } catch (e) {
              wasm.__wbindgen_exn_store(addHeapObject(e));
            }
          };
        }
        /**
         */
        class NativeEngine {
          static __wrap(ptr) {
            const obj = Object.create(NativeEngine.prototype);
            obj.ptr = ptr;

            return obj;
          }

          free() {
            const ptr = this.ptr;
            this.ptr = 0;

            wasm.__wbg_nativeengine_free(ptr);
          }
          /**
           * @param {Function} read_file
           * @param {Function} file_exists
           * @param {Function} resolve_file
           * @returns {NativeEngine}
           */
          static new(read_file, file_exists, resolve_file) {
            var ret = wasm.nativeengine_new(
              addHeapObject(read_file),
              addHeapObject(file_exists),
              addHeapObject(resolve_file)
            );
            return NativeEngine.__wrap(ret);
          }
          /**
           * @param {string} uri
           * @returns {any}
           */
          load(uri) {
            var ptr0 = passStringToWasm0(
              uri,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.nativeengine_load(this.ptr, ptr0, len0);
            return takeObject(ret);
          }
          /**
           * @param {string} uri
           * @returns {any}
           */
          run(uri) {
            var ptr0 = passStringToWasm0(
              uri,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.nativeengine_run(this.ptr, ptr0, len0);
            return takeObject(ret);
          }
          /**
           * @param {Function} listener
           */
          add_listener(listener) {
            wasm.nativeengine_add_listener(this.ptr, addHeapObject(listener));
          }
          /**
           * @param {string} uri
           * @returns {any}
           */
          get_loaded_ast(uri) {
            var ptr0 = passStringToWasm0(
              uri,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.nativeengine_get_loaded_ast(this.ptr, ptr0, len0);
            return takeObject(ret);
          }
          /**
           * @param {string} content
           * @returns {any}
           */
          parse_content(content) {
            var ptr0 = passStringToWasm0(
              content,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.nativeengine_parse_content(this.ptr, ptr0, len0);
            return takeObject(ret);
          }
          /**
           * @param {string} uri
           * @returns {any}
           */
          parse_file(uri) {
            var ptr0 = passStringToWasm0(
              uri,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.nativeengine_parse_file(this.ptr, ptr0, len0);
            return takeObject(ret);
          }
          /**
           * @param {string} uri
           * @param {string} content
           */
          update_virtual_file_content(uri, content) {
            var ptr0 = passStringToWasm0(
              uri,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = passStringToWasm0(
              content,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len1 = WASM_VECTOR_LEN;
            wasm.nativeengine_update_virtual_file_content(
              this.ptr,
              ptr0,
              len0,
              ptr1,
              len1
            );
          }
        }

        async function load(module, imports) {
          if (typeof Response === "function" && module instanceof Response) {
            if (typeof WebAssembly.instantiateStreaming === "function") {
              try {
                return await WebAssembly.instantiateStreaming(module, imports);
              } catch (e) {
                if (module.headers.get("Content-Type") != "application/wasm") {
                  console.warn(
                    "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
                    e
                  );
                } else {
                  throw e;
                }
              }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);
          } else {
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
              return { instance, module };
            } else {
              return instance;
            }
          }
        }

        async function init(input) {
          if (typeof input === "undefined") {
            input = _NOOP_.replace(/\.js$/, "_bg.wasm");
          }
          const imports = {};
          imports.wbg = {};
          imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
            takeObject(arg0);
          };
          imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
            var ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
          };
          imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
            var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_call_0d50cec2d58307ad = handleError(function(
            arg0,
            arg1,
            arg2
          ) {
            var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
          });
          imports.wbg.__wbg_call_56e03f05ec7df758 = handleError(function(
            arg0,
            arg1,
            arg2,
            arg3
          ) {
            var ret = getObject(arg0).call(
              getObject(arg1),
              getObject(arg2),
              getObject(arg3)
            );
            return addHeapObject(ret);
          });
          imports.wbg.__wbg_new_59cb74e423758ede = function() {
            var ret = new Error();
            return addHeapObject(ret);
          };
          imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
            var ret = getObject(arg1).stack;
            var ptr0 = passStringToWasm0(
              ret,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
            try {
              console.error(getStringFromWasm0(arg0, arg1));
            } finally {
              wasm.__wbindgen_free(arg0, arg1);
            }
          };
          imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
            const obj = getObject(arg1);
            var ret = typeof obj === "string" ? obj : undefined;
            var ptr0 = isLikeNone(ret)
              ? 0
              : passStringToWasm0(
                  ret,
                  wasm.__wbindgen_malloc,
                  wasm.__wbindgen_realloc
                );
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_boolean_get = function(arg0) {
            const v = getObject(arg0);
            var ret = typeof v === "boolean" ? (v ? 1 : 0) : 2;
            return ret;
          };
          imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
            var ret = debugString(getObject(arg1));
            var ptr0 = passStringToWasm0(
              ret,
              wasm.__wbindgen_malloc,
              wasm.__wbindgen_realloc
            );
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
          };
          imports.wbg.__wbindgen_throw = function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
          };

          if (
            typeof input === "string" ||
            (typeof Request === "function" && input instanceof Request) ||
            (typeof URL === "function" && input instanceof URL)
          ) {
            input = fetch(input);
          }

          const { instance, module } = await load(await input, imports);

          wasm = instance.exports;
          init.__wbindgen_wasm_module = module;

          return wasm;
        }

        /* harmony default export */ __webpack_exports__["default"] = init;

        /***/
      },

    /***/ "./node_modules/css-loader/dist/cjs.js!./src/prism.css":
      /*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/prism.css ***!
  \*************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        // Imports
        var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(
          /*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js"
        );
        exports = ___CSS_LOADER_API_IMPORT___(false);
        // Module
        exports.push([
          module.i,
          '/* PrismJS 1.20.0\nhttps://prismjs.com/download.html#themes=prism-tomorrow&languages=markup+css+clike+javascript+abap+abnf+actionscript+ada+agda+al+antlr4+apacheconf+apl+applescript+aql+arduino+arff+asciidoc+aspnet+asm6502+autohotkey+autoit+bash+basic+batch+bbcode+bison+bnf+brainfuck+brightscript+bro+c+csharp+cpp+cil+clojure+cmake+coffeescript+concurnas+csp+crystal+css-extras+cypher+d+dart+dax+diff+django+dns-zone-file+docker+ebnf+editorconfig+eiffel+ejs+elixir+elm+etlua+erb+erlang+excel-formula+fsharp+factor+firestore-security-rules+flow+fortran+ftl+gml+gcode+gdscript+gedcom+gherkin+git+glsl+go+graphql+groovy+haml+handlebars+haskell+haxe+hcl+hlsl+http+hpkp+hsts+ichigojam+icon+ignore+inform7+ini+io+j+java+javadoc+javadoclike+javastacktrace+jolie+jq+jsdoc+js-extras+json+json5+jsonp+jsstacktrace+js-templates+julia+keyman+kotlin+latex+latte+less+lilypond+liquid+lisp+livescript+llvm+lolcode+lua+makefile+markdown+markup-templating+matlab+mel+mizar+monkey+moonscript+n1ql+n4js+nand2tetris-hdl+nasm+neon+nginx+nim+nix+nsis+objectivec+ocaml+opencl+oz+parigp+parser+pascal+pascaligo+pcaxis+peoplecode+perl+php+phpdoc+php-extras+plsql+powerquery+powershell+processing+prolog+properties+protobuf+pug+puppet+pure+purebasic+python+q+qml+qore+r+racket+jsx+tsx+reason+regex+renpy+rest+rip+roboconf+robotframework+ruby+rust+sas+sass+scss+scala+scheme+shell-session+smali+smalltalk+smarty+solidity+solution-file+soy+sparql+splunk-spl+sqf+sql+iecst+stylus+swift+t4-templating+t4-cs+t4-vb+tap+tcl+tt2+textile+toml+turtle+twig+typescript+unrealscript+vala+vbnet+velocity+verilog+vhdl+vim+visual-basic+warpscript+wasm+wiki+xeora+xml-doc+xojo+xquery+yaml+yang+zig */\n/**\n * prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML\n * Based on https://github.com/chriskempson/tomorrow-theme\n * @author Rose Pritchard\n */\n\ncode[class*="language-"],\npre[class*="language-"] {\n  color: #ccc;\n  background: none;\n  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;\n  font-size: 1em;\n  text-align: left;\n  white-space: pre;\n  word-spacing: normal;\n  word-break: normal;\n  word-wrap: normal;\n  line-height: 1.5;\n\n  -moz-tab-size: 4;\n  -o-tab-size: 4;\n  tab-size: 4;\n\n  -webkit-hyphens: none;\n  -moz-hyphens: none;\n  -ms-hyphens: none;\n  hyphens: none;\n}\n\n/* Code blocks */\npre[class*="language-"] {\n  padding: 1em;\n  margin: 0.5em 0;\n  overflow: auto;\n}\n\n:not(pre) > code[class*="language-"],\npre[class*="language-"] {\n  background: #2d2d2d;\n}\n\n/* Inline code */\n:not(pre) > code[class*="language-"] {\n  padding: 0.1em;\n  border-radius: 0.3em;\n  white-space: normal;\n}\n\n.token.comment,\n.token.block-comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n  color: #999;\n}\n\n.token.punctuation {\n  color: #ccc;\n}\n\n.token.tag,\n.token.attr-name,\n.token.namespace,\n.token.deleted {\n  color: #e2777a;\n}\n\n.token.function-name {\n  color: #6196cc;\n}\n\n.token.boolean,\n.token.number,\n.token.function {\n  color: #f08d49;\n}\n\n.token.property,\n.token.class-name,\n.token.constant,\n.token.symbol {\n  color: #f8c555;\n}\n\n.token.selector,\n.token.important,\n.token.atrule,\n.token.keyword,\n.token.builtin {\n  color: #cc99cd;\n}\n\n.token.string,\n.token.char,\n.token.attr-value,\n.token.regex,\n.token.variable {\n  color: #7ec699;\n}\n\n.token.operator,\n.token.entity,\n.token.url {\n  color: #67cdcc;\n}\n\n.token.important,\n.token.bold {\n  font-weight: bold;\n}\n.token.italic {\n  font-style: italic;\n}\n\n.token.entity {\n  cursor: help;\n}\n\n.token.inserted {\n  color: green;\n}\n',
          ""
        ]);
        // Exports
        module.exports = exports;

        /***/
      },

    /***/ "./node_modules/css-loader/dist/cjs.js!./src/ui.pc.css":
      /*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/ui.pc.css ***!
  \*************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        // Imports
        var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(
          /*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js"
        );
        exports = ___CSS_LOADER_API_IMPORT___(false);
        // Module
        exports.push([
          module.i,
          "body {\n    margin:0;\npadding:0;\n  }\n:root {\n    --color-grey-100:rgb(226, 226, 226);\n--color-grey-200:rgb(212, 212, 212);\n--color-grey-300:rgb(145, 145, 145);\n--color-grey-400:rgb(122, 122, 122);\n--color-grey-500:rgb(90, 90, 90);\n--color-dark-100:rgb(100, 100, 100);\n--color-dark-200:rgb(51, 51, 51);\n  }\n[class]._fab8095a_Editor {\n    --border-radius:4px;\nfont-family:sans-serif;\ndisplay:flex;\nwidth:100%;\nfont-size:14px;\nline-height:1em;\nheight:400px;\nborder:2px solid var(--color-grey-300);\nborder-radius:calc(var(--border-radius) + 2px);\n  }\n[class]._fab8095a_Editor {\n    color:white;\n  }\n[class]._fab8095a_code {\n    background:var(--color-dark-200);\nborder-bottom-left-radius:var(--border-radius);\nborder-top-left-radius:var(--border-radius);\nborder-right:1px solid var(--color-grey-300);\nheight:100%;\nwidth:100%;\ndisplay:flex;\nflex-direction:column;\noverflow:scroll;\n  }\n[class]._fab8095a_code [class]._fab8095a_content {\n    padding:15px;\noverflow:scroll;\nletter-spacing:0.05em;\n  }\n[class]._fab8095a_code [class]._fab8095a_content textarea {\n    outline:none;\n  }\n[class]._fab8095a_code [class]._fab8095a_tabs {\n    list-style-type:none;\nmargin:0;\npadding:0;\ncolor:var(--color-grey-500);\nbackground:var(--color-dark-100);\nborder-top-left-radius:var(--border-radius);\nflex-shrink:0;\n  }\n[class]._fab8095a_code [class]._fab8095a_tabs [class]._fab8095a_tab {\n    cursor:pointer;\nmargin:0;\ncolor:var(--color-grey-100);\ndisplay:inline-block;\nfont-weight:normal;\nbackground:var(--color-dark-100);\nborder-right:1px solid var(--color-dark-200);\npadding:8px 15px;\n  }\n[class]._fab8095a_code [class]._fab8095a_tabs [class]._fab8095a_tab:first-child {\n    border-top-left-radius:4px;\n  }\n[class]._fab8095a_code [class]._fab8095a_tabs [class]._fab8095a_tab:last-child {\n    border-right:none;\n  }\n[class]._fab8095a_code [class]._fab8095a_tabs [class]._fab8095a_tab--selected {\n    background:var(--color-dark-200);\n  }\n[class]._fab8095a_Preview {\n    width:100%;\nheight:100%;\ndisplay:flex;\nflex-direction:column;\n  }\n[class]._fab8095a_Preview [class]._fab8095a_header {\n    padding:8px 15px;\nbackground:var(--color-grey-300);\nborder-top-right-radius:var(--border-radius);\nflex-shrink:0;\n  }\n[class]._fab8095a_Preview [class]._fab8095a_header [class]._fab8095a_bolt {\n    line-height:0;\n  }\n[class]._fab8095a_Preview iframe[data-pc-fab8095a] {\n    border:0;\nwidth:100%;\nheight:100%;\nborder-bottom-right-radius:var(--border-radius);\n  }",
          ""
        ]);
        // Exports
        module.exports = exports;

        /***/
      },

    /***/ "./node_modules/css-loader/dist/runtime/api.js":
      /*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        /*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
        // css base code, injected by the css-loader
        // eslint-disable-next-line func-names
        module.exports = function(useSourceMap) {
          var list = []; // return the list of modules as css string

          list.toString = function toString() {
            return this.map(function(item) {
              var content = cssWithMappingToString(item, useSourceMap);

              if (item[2]) {
                return "@media ".concat(item[2], " {").concat(content, "}");
              }

              return content;
            }).join("");
          }; // import a list of modules into the list
          // eslint-disable-next-line func-names

          list.i = function(modules, mediaQuery, dedupe) {
            if (typeof modules === "string") {
              // eslint-disable-next-line no-param-reassign
              modules = [[null, modules, ""]];
            }

            var alreadyImportedModules = {};

            if (dedupe) {
              for (var i = 0; i < this.length; i++) {
                // eslint-disable-next-line prefer-destructuring
                var id = this[i][0];

                if (id != null) {
                  alreadyImportedModules[id] = true;
                }
              }
            }

            for (var _i = 0; _i < modules.length; _i++) {
              var item = [].concat(modules[_i]);

              if (dedupe && alreadyImportedModules[item[0]]) {
                // eslint-disable-next-line no-continue
                continue;
              }

              if (mediaQuery) {
                if (!item[2]) {
                  item[2] = mediaQuery;
                } else {
                  item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
                }
              }

              list.push(item);
            }
          };

          return list;
        };

        function cssWithMappingToString(item, useSourceMap) {
          var content = item[1] || ""; // eslint-disable-next-line prefer-destructuring

          var cssMapping = item[3];

          if (!cssMapping) {
            return content;
          }

          if (useSourceMap && typeof btoa === "function") {
            var sourceMapping = toComment(cssMapping);
            var sourceURLs = cssMapping.sources.map(function(source) {
              return "/*# sourceURL="
                .concat(cssMapping.sourceRoot || "")
                .concat(source, " */");
            });
            return [content]
              .concat(sourceURLs)
              .concat([sourceMapping])
              .join("\n");
          }

          return [content].join("\n");
        } // Adapted from convert-source-map (MIT)

        function toComment(sourceMap) {
          // eslint-disable-next-line no-undef
          var base64 = btoa(
            unescape(encodeURIComponent(JSON.stringify(sourceMap)))
          );
          var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(
            base64
          );
          return "/*# ".concat(data, " */");
        }

        /***/
      },

    /***/ "./node_modules/events/events.js":
      /*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        var R = typeof Reflect === "object" ? Reflect : null;
        var ReflectApply =
          R && typeof R.apply === "function"
            ? R.apply
            : function ReflectApply(target, receiver, args) {
                return Function.prototype.apply.call(target, receiver, args);
              };

        var ReflectOwnKeys;
        if (R && typeof R.ownKeys === "function") {
          ReflectOwnKeys = R.ownKeys;
        } else if (Object.getOwnPropertySymbols) {
          ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target).concat(
              Object.getOwnPropertySymbols(target)
            );
          };
        } else {
          ReflectOwnKeys = function ReflectOwnKeys(target) {
            return Object.getOwnPropertyNames(target);
          };
        }

        function ProcessEmitWarning(warning) {
          if (console && console.warn) console.warn(warning);
        }

        var NumberIsNaN =
          Number.isNaN ||
          function NumberIsNaN(value) {
            return value !== value;
          };

        function EventEmitter() {
          EventEmitter.init.call(this);
        }
        module.exports = EventEmitter;
        module.exports.once = once;

        // Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._eventsCount = 0;
        EventEmitter.prototype._maxListeners = undefined;

        // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.
        var defaultMaxListeners = 10;

        function checkListener(listener) {
          if (typeof listener !== "function") {
            throw new TypeError(
              'The "listener" argument must be of type Function. Received type ' +
                typeof listener
            );
          }
        }

        Object.defineProperty(EventEmitter, "defaultMaxListeners", {
          enumerable: true,
          get: function() {
            return defaultMaxListeners;
          },
          set: function(arg) {
            if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
              throw new RangeError(
                'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                  arg +
                  "."
              );
            }
            defaultMaxListeners = arg;
          }
        });

        EventEmitter.init = function() {
          if (
            this._events === undefined ||
            this._events === Object.getPrototypeOf(this)._events
          ) {
            this._events = Object.create(null);
            this._eventsCount = 0;
          }

          this._maxListeners = this._maxListeners || undefined;
        };

        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
          if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
            throw new RangeError(
              'The value of "n" is out of range. It must be a non-negative number. Received ' +
                n +
                "."
            );
          }
          this._maxListeners = n;
          return this;
        };

        function _getMaxListeners(that) {
          if (that._maxListeners === undefined)
            return EventEmitter.defaultMaxListeners;
          return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
          return _getMaxListeners(this);
        };

        EventEmitter.prototype.emit = function emit(type) {
          var args = [];
          for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
          var doError = type === "error";

          var events = this._events;
          if (events !== undefined)
            doError = doError && events.error === undefined;
          else if (!doError) return false;

          // If there is no 'error' event listener then throw.
          if (doError) {
            var er;
            if (args.length > 0) er = args[0];
            if (er instanceof Error) {
              // Note: The comments on the `throw` lines are intentional, they show
              // up in Node's output if this results in an unhandled exception.
              throw er; // Unhandled 'error' event
            }
            // At least give some kind of context to the user
            var err = new Error(
              "Unhandled error." + (er ? " (" + er.message + ")" : "")
            );
            err.context = er;
            throw err; // Unhandled 'error' event
          }

          var handler = events[type];

          if (handler === undefined) return false;

          if (typeof handler === "function") {
            ReflectApply(handler, this, args);
          } else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
              ReflectApply(listeners[i], this, args);
          }

          return true;
        };

        function _addListener(target, type, listener, prepend) {
          var m;
          var events;
          var existing;

          checkListener(listener);

          events = target._events;
          if (events === undefined) {
            events = target._events = Object.create(null);
            target._eventsCount = 0;
          } else {
            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (events.newListener !== undefined) {
              target.emit(
                "newListener",
                type,
                listener.listener ? listener.listener : listener
              );

              // Re-assign `events` because a newListener handler could have caused the
              // this._events to be assigned to a new object
              events = target._events;
            }
            existing = events[type];
          }

          if (existing === undefined) {
            // Optimize the case of one listener. Don't need the extra array object.
            existing = events[type] = listener;
            ++target._eventsCount;
          } else {
            if (typeof existing === "function") {
              // Adding the second element, need to change to array.
              existing = events[type] = prepend
                ? [listener, existing]
                : [existing, listener];
              // If we've already got an array, just append.
            } else if (prepend) {
              existing.unshift(listener);
            } else {
              existing.push(listener);
            }

            // Check for listener leak
            m = _getMaxListeners(target);
            if (m > 0 && existing.length > m && !existing.warned) {
              existing.warned = true;
              // No error code for this since it is a Warning
              // eslint-disable-next-line no-restricted-syntax
              var w = new Error(
                "Possible EventEmitter memory leak detected. " +
                  existing.length +
                  " " +
                  String(type) +
                  " listeners " +
                  "added. Use emitter.setMaxListeners() to " +
                  "increase limit"
              );
              w.name = "MaxListenersExceededWarning";
              w.emitter = target;
              w.type = type;
              w.count = existing.length;
              ProcessEmitWarning(w);
            }
          }

          return target;
        }

        EventEmitter.prototype.addListener = function addListener(
          type,
          listener
        ) {
          return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener = function prependListener(
          type,
          listener
        ) {
          return _addListener(this, type, listener, true);
        };

        function onceWrapper() {
          if (!this.fired) {
            this.target.removeListener(this.type, this.wrapFn);
            this.fired = true;
            if (arguments.length === 0) return this.listener.call(this.target);
            return this.listener.apply(this.target, arguments);
          }
        }

        function _onceWrap(target, type, listener) {
          var state = {
            fired: false,
            wrapFn: undefined,
            target: target,
            type: type,
            listener: listener
          };
          var wrapped = onceWrapper.bind(state);
          wrapped.listener = listener;
          state.wrapFn = wrapped;
          return wrapped;
        }

        EventEmitter.prototype.once = function once(type, listener) {
          checkListener(listener);
          this.on(type, _onceWrap(this, type, listener));
          return this;
        };

        EventEmitter.prototype.prependOnceListener = function prependOnceListener(
          type,
          listener
        ) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

        // Emits a 'removeListener' event if and only if the listener was removed.
        EventEmitter.prototype.removeListener = function removeListener(
          type,
          listener
        ) {
          var list, events, position, i, originalListener;

          checkListener(listener);

          events = this._events;
          if (events === undefined) return this;

          list = events[type];
          if (list === undefined) return this;

          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0) this._events = Object.create(null);
            else {
              delete events[type];
              if (events.removeListener)
                this.emit("removeListener", type, list.listener || listener);
            }
          } else if (typeof list !== "function") {
            position = -1;

            for (i = list.length - 1; i >= 0; i--) {
              if (list[i] === listener || list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0) return this;

            if (position === 0) list.shift();
            else {
              spliceOne(list, position);
            }

            if (list.length === 1) events[type] = list[0];

            if (events.removeListener !== undefined)
              this.emit("removeListener", type, originalListener || listener);
          }

          return this;
        };

        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

        EventEmitter.prototype.removeAllListeners = function removeAllListeners(
          type
        ) {
          var listeners, events, i;

          events = this._events;
          if (events === undefined) return this;

          // not listening for removeListener, no need to emit
          if (events.removeListener === undefined) {
            if (arguments.length === 0) {
              this._events = Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== undefined) {
              if (--this._eventsCount === 0) this._events = Object.create(null);
              else delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
              key = keys[i];
              if (key === "removeListener") continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners("removeListener");
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === "function") {
            this.removeListener(type, listeners);
          } else if (listeners !== undefined) {
            // LIFO order
            for (i = listeners.length - 1; i >= 0; i--) {
              this.removeListener(type, listeners[i]);
            }
          }

          return this;
        };

        function _listeners(target, type, unwrap) {
          var events = target._events;

          if (events === undefined) return [];

          var evlistener = events[type];
          if (evlistener === undefined) return [];

          if (typeof evlistener === "function")
            return unwrap ? [evlistener.listener || evlistener] : [evlistener];

          return unwrap
            ? unwrapListeners(evlistener)
            : arrayClone(evlistener, evlistener.length);
        }

        EventEmitter.prototype.listeners = function listeners(type) {
          return _listeners(this, type, true);
        };

        EventEmitter.prototype.rawListeners = function rawListeners(type) {
          return _listeners(this, type, false);
        };

        EventEmitter.listenerCount = function(emitter, type) {
          if (typeof emitter.listenerCount === "function") {
            return emitter.listenerCount(type);
          } else {
            return listenerCount.call(emitter, type);
          }
        };

        EventEmitter.prototype.listenerCount = listenerCount;
        function listenerCount(type) {
          var events = this._events;

          if (events !== undefined) {
            var evlistener = events[type];

            if (typeof evlistener === "function") {
              return 1;
            } else if (evlistener !== undefined) {
              return evlistener.length;
            }
          }

          return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
          return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
        };

        function arrayClone(arr, n) {
          var copy = new Array(n);
          for (var i = 0; i < n; ++i) copy[i] = arr[i];
          return copy;
        }

        function spliceOne(list, index) {
          for (; index + 1 < list.length; index++)
            list[index] = list[index + 1];
          list.pop();
        }

        function unwrapListeners(arr) {
          var ret = new Array(arr.length);
          for (var i = 0; i < ret.length; ++i) {
            ret[i] = arr[i].listener || arr[i];
          }
          return ret;
        }

        function once(emitter, name) {
          return new Promise(function(resolve, reject) {
            function eventListener() {
              if (errorListener !== undefined) {
                emitter.removeListener("error", errorListener);
              }
              resolve([].slice.call(arguments));
            }
            var errorListener;

            // Adding an error listener is not optional because
            // if an error is thrown on an event emitter we cannot
            // guarantee that the actual event we are waiting will
            // be fired. The result could be a silent way to create
            // memory or file descriptor leaks, which is something
            // we should avoid.
            if (name !== "error") {
              errorListener = function errorListener(err) {
                emitter.removeListener(name, eventListener);
                reject(err);
              };

              emitter.once("error", errorListener);
            }

            emitter.once(name, eventListener);
          });
        }

        /***/
      },

    /***/ "./node_modules/fast-memoize/src/index.js":
      /*!************************************************!*\
  !*** ./node_modules/fast-memoize/src/index.js ***!
  \************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        //
        // Main
        //

        function memoize(fn, options) {
          var cache = options && options.cache ? options.cache : cacheDefault;

          var serializer =
            options && options.serializer
              ? options.serializer
              : serializerDefault;

          var strategy =
            options && options.strategy ? options.strategy : strategyDefault;

          return strategy(fn, {
            cache: cache,
            serializer: serializer
          });
        }

        //
        // Strategy
        //

        function isPrimitive(value) {
          return (
            value == null ||
            typeof value === "number" ||
            typeof value === "boolean"
          ); // || typeof value === "string" 'unsafe' primitive for our needs
        }

        function monadic(fn, cache, serializer, arg) {
          var cacheKey = isPrimitive(arg) ? arg : serializer(arg);

          var computedValue = cache.get(cacheKey);
          if (typeof computedValue === "undefined") {
            computedValue = fn.call(this, arg);
            cache.set(cacheKey, computedValue);
          }

          return computedValue;
        }

        function variadic(fn, cache, serializer) {
          var args = Array.prototype.slice.call(arguments, 3);
          var cacheKey = serializer(args);

          var computedValue = cache.get(cacheKey);
          if (typeof computedValue === "undefined") {
            computedValue = fn.apply(this, args);
            cache.set(cacheKey, computedValue);
          }

          return computedValue;
        }

        function assemble(fn, context, strategy, cache, serialize) {
          return strategy.bind(context, fn, cache, serialize);
        }

        function strategyDefault(fn, options) {
          var strategy = fn.length === 1 ? monadic : variadic;

          return assemble(
            fn,
            this,
            strategy,
            options.cache.create(),
            options.serializer
          );
        }

        function strategyVariadic(fn, options) {
          var strategy = variadic;

          return assemble(
            fn,
            this,
            strategy,
            options.cache.create(),
            options.serializer
          );
        }

        function strategyMonadic(fn, options) {
          var strategy = monadic;

          return assemble(
            fn,
            this,
            strategy,
            options.cache.create(),
            options.serializer
          );
        }

        //
        // Serializer
        //

        function serializerDefault() {
          return JSON.stringify(arguments);
        }

        //
        // Cache
        //

        function ObjectWithoutPrototypeCache() {
          this.cache = Object.create(null);
        }

        ObjectWithoutPrototypeCache.prototype.has = function(key) {
          return key in this.cache;
        };

        ObjectWithoutPrototypeCache.prototype.get = function(key) {
          return this.cache[key];
        };

        ObjectWithoutPrototypeCache.prototype.set = function(key, value) {
          this.cache[key] = value;
        };

        var cacheDefault = {
          create: function create() {
            return new ObjectWithoutPrototypeCache();
          }
        };

        //
        // API
        //

        module.exports = memoize;
        module.exports.strategies = {
          variadic: strategyVariadic,
          monadic: strategyMonadic
        };

        /***/
      },

    /***/ "./node_modules/node-libs-browser/node_modules/punycode/punycode.js":
      /*!**************************************************************************!*\
  !*** ./node_modules/node-libs-browser/node_modules/punycode/punycode.js ***!
  \**************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        /* WEBPACK VAR INJECTION */ (function(module, global) {
          var __WEBPACK_AMD_DEFINE_RESULT__; /*! https://mths.be/punycode v1.4.1 by @mathias */
          (function(root) {
            /** Detect free variables */
            var freeExports = true && exports && !exports.nodeType && exports;
            var freeModule = true && module && !module.nodeType && module;
            var freeGlobal = typeof global == "object" && global;
            if (
              freeGlobal.global === freeGlobal ||
              freeGlobal.window === freeGlobal ||
              freeGlobal.self === freeGlobal
            ) {
              root = freeGlobal;
            }

            /**
             * The `punycode` object.
             * @name punycode
             * @type Object
             */
            var punycode,
              /** Highest positive signed 32-bit float value */
              maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
              /** Bootstring parameters */
              base = 36,
              tMin = 1,
              tMax = 26,
              skew = 38,
              damp = 700,
              initialBias = 72,
              initialN = 128, // 0x80
              delimiter = "-", // '\x2D'
              /** Regular expressions */
              regexPunycode = /^xn--/,
              regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
              regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
              /** Error messages */
              errors = {
                overflow: "Overflow: input needs wider integers to process",
                "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                "invalid-input": "Invalid input"
              },
              /** Convenience shortcuts */
              baseMinusTMin = base - tMin,
              floor = Math.floor,
              stringFromCharCode = String.fromCharCode,
              /** Temporary variable */
              key;

            /*--------------------------------------------------------------------------*/

            /**
             * A generic error utility function.
             * @private
             * @param {String} type The error type.
             * @returns {Error} Throws a `RangeError` with the applicable error message.
             */
            function error(type) {
              throw new RangeError(errors[type]);
            }

            /**
             * A generic `Array#map` utility function.
             * @private
             * @param {Array} array The array to iterate over.
             * @param {Function} callback The function that gets called for every array
             * item.
             * @returns {Array} A new array of values returned by the callback function.
             */
            function map(array, fn) {
              var length = array.length;
              var result = [];
              while (length--) {
                result[length] = fn(array[length]);
              }
              return result;
            }

            /**
             * A simple `Array#map`-like wrapper to work with domain name strings or email
             * addresses.
             * @private
             * @param {String} domain The domain name or email address.
             * @param {Function} callback The function that gets called for every
             * character.
             * @returns {Array} A new string of characters returned by the callback
             * function.
             */
            function mapDomain(string, fn) {
              var parts = string.split("@");
              var result = "";
              if (parts.length > 1) {
                // In email addresses, only the domain name should be punycoded. Leave
                // the local part (i.e. everything up to `@`) intact.
                result = parts[0] + "@";
                string = parts[1];
              }
              // Avoid `split(regex)` for IE8 compatibility. See #17.
              string = string.replace(regexSeparators, "\x2E");
              var labels = string.split(".");
              var encoded = map(labels, fn).join(".");
              return result + encoded;
            }

            /**
             * Creates an array containing the numeric code points of each Unicode
             * character in the string. While JavaScript uses UCS-2 internally,
             * this function will convert a pair of surrogate halves (each of which
             * UCS-2 exposes as separate characters) into a single code point,
             * matching UTF-16.
             * @see `punycode.ucs2.encode`
             * @see <https://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode.ucs2
             * @name decode
             * @param {String} string The Unicode input string (UCS-2).
             * @returns {Array} The new array of code points.
             */
            function ucs2decode(string) {
              var output = [],
                counter = 0,
                length = string.length,
                value,
                extra;
              while (counter < length) {
                value = string.charCodeAt(counter++);
                if (value >= 0xd800 && value <= 0xdbff && counter < length) {
                  // high surrogate, and there is a next character
                  extra = string.charCodeAt(counter++);
                  if ((extra & 0xfc00) == 0xdc00) {
                    // low surrogate
                    output.push(
                      ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000
                    );
                  } else {
                    // unmatched surrogate; only append this code unit, in case the next
                    // code unit is the high surrogate of a surrogate pair
                    output.push(value);
                    counter--;
                  }
                } else {
                  output.push(value);
                }
              }
              return output;
            }

            /**
             * Creates a string based on an array of numeric code points.
             * @see `punycode.ucs2.decode`
             * @memberOf punycode.ucs2
             * @name encode
             * @param {Array} codePoints The array of numeric code points.
             * @returns {String} The new Unicode string (UCS-2).
             */
            function ucs2encode(array) {
              return map(array, function(value) {
                var output = "";
                if (value > 0xffff) {
                  value -= 0x10000;
                  output += stringFromCharCode(
                    ((value >>> 10) & 0x3ff) | 0xd800
                  );
                  value = 0xdc00 | (value & 0x3ff);
                }
                output += stringFromCharCode(value);
                return output;
              }).join("");
            }

            /**
             * Converts a basic code point into a digit/integer.
             * @see `digitToBasic()`
             * @private
             * @param {Number} codePoint The basic numeric code point value.
             * @returns {Number} The numeric value of a basic code point (for use in
             * representing integers) in the range `0` to `base - 1`, or `base` if
             * the code point does not represent a value.
             */
            function basicToDigit(codePoint) {
              if (codePoint - 48 < 10) {
                return codePoint - 22;
              }
              if (codePoint - 65 < 26) {
                return codePoint - 65;
              }
              if (codePoint - 97 < 26) {
                return codePoint - 97;
              }
              return base;
            }

            /**
             * Converts a digit/integer into a basic code point.
             * @see `basicToDigit()`
             * @private
             * @param {Number} digit The numeric value of a basic code point.
             * @returns {Number} The basic code point whose value (when used for
             * representing integers) is `digit`, which needs to be in the range
             * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
             * used; else, the lowercase form is used. The behavior is undefined
             * if `flag` is non-zero and `digit` has no uppercase form.
             */
            function digitToBasic(digit, flag) {
              //  0..25 map to ASCII a..z or A..Z
              // 26..35 map to ASCII 0..9
              return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
            }

            /**
             * Bias adaptation function as per section 3.4 of RFC 3492.
             * https://tools.ietf.org/html/rfc3492#section-3.4
             * @private
             */
            function adapt(delta, numPoints, firstTime) {
              var k = 0;
              delta = firstTime ? floor(delta / damp) : delta >> 1;
              delta += floor(delta / numPoints);
              for (
                ;
                /* no initialization */ delta > (baseMinusTMin * tMax) >> 1;
                k += base
              ) {
                delta = floor(delta / baseMinusTMin);
              }
              return floor(k + ((baseMinusTMin + 1) * delta) / (delta + skew));
            }

            /**
             * Converts a Punycode string of ASCII-only symbols to a string of Unicode
             * symbols.
             * @memberOf punycode
             * @param {String} input The Punycode string of ASCII-only symbols.
             * @returns {String} The resulting string of Unicode symbols.
             */
            function decode(input) {
              // Don't use UCS-2
              var output = [],
                inputLength = input.length,
                out,
                i = 0,
                n = initialN,
                bias = initialBias,
                basic,
                j,
                index,
                oldi,
                w,
                k,
                digit,
                t,
                /** Cached calculation results */
                baseMinusT;

              // Handle the basic code points: let `basic` be the number of input code
              // points before the last delimiter, or `0` if there is none, then copy
              // the first basic code points to the output.

              basic = input.lastIndexOf(delimiter);
              if (basic < 0) {
                basic = 0;
              }

              for (j = 0; j < basic; ++j) {
                // if it's not a basic code point
                if (input.charCodeAt(j) >= 0x80) {
                  error("not-basic");
                }
                output.push(input.charCodeAt(j));
              }

              // Main decoding loop: start just after the last delimiter if any basic code
              // points were copied; start at the beginning otherwise.

              for (
                index = basic > 0 ? basic + 1 : 0;
                index < inputLength /* no final expression */;

              ) {
                // `index` is the index of the next character to be consumed.
                // Decode a generalized variable-length integer into `delta`,
                // which gets added to `i`. The overflow checking is easier
                // if we increase `i` as we go, then subtract off its starting
                // value at the end to obtain `delta`.
                for (
                  oldi = i, w = 1, k = base /* no condition */;
                  ;
                  k += base
                ) {
                  if (index >= inputLength) {
                    error("invalid-input");
                  }

                  digit = basicToDigit(input.charCodeAt(index++));

                  if (digit >= base || digit > floor((maxInt - i) / w)) {
                    error("overflow");
                  }

                  i += digit * w;
                  t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

                  if (digit < t) {
                    break;
                  }

                  baseMinusT = base - t;
                  if (w > floor(maxInt / baseMinusT)) {
                    error("overflow");
                  }

                  w *= baseMinusT;
                }

                out = output.length + 1;
                bias = adapt(i - oldi, out, oldi == 0);

                // `i` was supposed to wrap around from `out` to `0`,
                // incrementing `n` each time, so we'll fix that now:
                if (floor(i / out) > maxInt - n) {
                  error("overflow");
                }

                n += floor(i / out);
                i %= out;

                // Insert `n` at position `i` of the output
                output.splice(i++, 0, n);
              }

              return ucs2encode(output);
            }

            /**
             * Converts a string of Unicode symbols (e.g. a domain name label) to a
             * Punycode string of ASCII-only symbols.
             * @memberOf punycode
             * @param {String} input The string of Unicode symbols.
             * @returns {String} The resulting Punycode string of ASCII-only symbols.
             */
            function encode(input) {
              var n,
                delta,
                handledCPCount,
                basicLength,
                bias,
                j,
                m,
                q,
                k,
                t,
                currentValue,
                output = [],
                /** `inputLength` will hold the number of code points in `input`. */
                inputLength,
                /** Cached calculation results */
                handledCPCountPlusOne,
                baseMinusT,
                qMinusT;

              // Convert the input in UCS-2 to Unicode
              input = ucs2decode(input);

              // Cache the length
              inputLength = input.length;

              // Initialize the state
              n = initialN;
              delta = 0;
              bias = initialBias;

              // Handle the basic code points
              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue < 0x80) {
                  output.push(stringFromCharCode(currentValue));
                }
              }

              handledCPCount = basicLength = output.length;

              // `handledCPCount` is the number of code points that have been handled;
              // `basicLength` is the number of basic code points.

              // Finish the basic string - if it is not empty - with a delimiter
              if (basicLength) {
                output.push(delimiter);
              }

              // Main encoding loop:
              while (handledCPCount < inputLength) {
                // All non-basic code points < n have been handled already. Find the next
                // larger one:
                for (m = maxInt, j = 0; j < inputLength; ++j) {
                  currentValue = input[j];
                  if (currentValue >= n && currentValue < m) {
                    m = currentValue;
                  }
                }

                // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
                // but guard against overflow
                handledCPCountPlusOne = handledCPCount + 1;
                if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                  error("overflow");
                }

                delta += (m - n) * handledCPCountPlusOne;
                n = m;

                for (j = 0; j < inputLength; ++j) {
                  currentValue = input[j];

                  if (currentValue < n && ++delta > maxInt) {
                    error("overflow");
                  }

                  if (currentValue == n) {
                    // Represent delta as a generalized variable-length integer
                    for (q = delta, k = base /* no condition */; ; k += base) {
                      t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                      if (q < t) {
                        break;
                      }
                      qMinusT = q - t;
                      baseMinusT = base - t;
                      output.push(
                        stringFromCharCode(
                          digitToBasic(t + (qMinusT % baseMinusT), 0)
                        )
                      );
                      q = floor(qMinusT / baseMinusT);
                    }

                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(
                      delta,
                      handledCPCountPlusOne,
                      handledCPCount == basicLength
                    );
                    delta = 0;
                    ++handledCPCount;
                  }
                }

                ++delta;
                ++n;
              }
              return output.join("");
            }

            /**
             * Converts a Punycode string representing a domain name or an email address
             * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
             * it doesn't matter if you call it on a string that has already been
             * converted to Unicode.
             * @memberOf punycode
             * @param {String} input The Punycoded domain name or email address to
             * convert to Unicode.
             * @returns {String} The Unicode representation of the given Punycode
             * string.
             */
            function toUnicode(input) {
              return mapDomain(input, function(string) {
                return regexPunycode.test(string)
                  ? decode(string.slice(4).toLowerCase())
                  : string;
              });
            }

            /**
             * Converts a Unicode string representing a domain name or an email address to
             * Punycode. Only the non-ASCII parts of the domain name will be converted,
             * i.e. it doesn't matter if you call it with a domain that's already in
             * ASCII.
             * @memberOf punycode
             * @param {String} input The domain name or email address to convert, as a
             * Unicode string.
             * @returns {String} The Punycode representation of the given domain name or
             * email address.
             */
            function toASCII(input) {
              return mapDomain(input, function(string) {
                return regexNonASCII.test(string)
                  ? "xn--" + encode(string)
                  : string;
              });
            }

            /*--------------------------------------------------------------------------*/

            /** Define the public API */
            punycode = {
              /**
               * A string representing the current Punycode.js version number.
               * @memberOf punycode
               * @type String
               */
              version: "1.4.1",
              /**
               * An object of methods to convert from JavaScript's internal character
               * representation (UCS-2) to Unicode code points, and back.
               * @see <https://mathiasbynens.be/notes/javascript-encoding>
               * @memberOf punycode
               * @type Object
               */
              ucs2: {
                decode: ucs2decode,
                encode: ucs2encode
              },
              decode: decode,
              encode: encode,
              toASCII: toASCII,
              toUnicode: toUnicode
            };

            /** Expose `punycode` */
            // Some AMD build optimizers, like r.js, check for specific condition patterns
            // like the following:
            if (true) {
              !((__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                return punycode;
              }.call(exports, __webpack_require__, exports, module)),
              __WEBPACK_AMD_DEFINE_RESULT__ !== undefined &&
                (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            } else {
            }
          })(this);

          /* WEBPACK VAR INJECTION */
        }.call(
          this,
          __webpack_require__(
            /*! ./../../../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js"
          )(module),
          __webpack_require__(
            /*! ./../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"
          )
        ));

        /***/
      },

    /***/ "./node_modules/object-assign/index.js":
      /*!*********************************************!*\
  !*** ./node_modules/object-assign/index.js ***!
  \*********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        /*
object-assign
(c) Sindre Sorhus
@license MIT
*/

        /* eslint-disable no-unused-vars */
        var getOwnPropertySymbols = Object.getOwnPropertySymbols;
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var propIsEnumerable = Object.prototype.propertyIsEnumerable;

        function toObject(val) {
          if (val === null || val === undefined) {
            throw new TypeError(
              "Object.assign cannot be called with null or undefined"
            );
          }

          return Object(val);
        }

        function shouldUseNative() {
          try {
            if (!Object.assign) {
              return false;
            }

            // Detect buggy property enumeration order in older V8 versions.

            // https://bugs.chromium.org/p/v8/issues/detail?id=4118
            var test1 = new String("abc"); // eslint-disable-line no-new-wrappers
            test1[5] = "de";
            if (Object.getOwnPropertyNames(test1)[0] === "5") {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test2 = {};
            for (var i = 0; i < 10; i++) {
              test2["_" + String.fromCharCode(i)] = i;
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
              return test2[n];
            });
            if (order2.join("") !== "0123456789") {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test3 = {};
            "abcdefghijklmnopqrst".split("").forEach(function(letter) {
              test3[letter] = letter;
            });
            if (
              Object.keys(Object.assign({}, test3)).join("") !==
              "abcdefghijklmnopqrst"
            ) {
              return false;
            }

            return true;
          } catch (err) {
            // We don't expect any of the above to throw, but better to be safe.
            return false;
          }
        }

        module.exports = shouldUseNative()
          ? Object.assign
          : function(target, source) {
              var from;
              var to = toObject(target);
              var symbols;

              for (var s = 1; s < arguments.length; s++) {
                from = Object(arguments[s]);

                for (var key in from) {
                  if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                  }
                }

                if (getOwnPropertySymbols) {
                  symbols = getOwnPropertySymbols(from);
                  for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                      to[symbols[i]] = from[symbols[i]];
                    }
                  }
                }
              }

              return to;
            };

        /***/
      },

    /***/ "./node_modules/path-browserify/index.js":
      /*!***********************************************!*\
  !*** ./node_modules/path-browserify/index.js ***!
  \***********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        /* WEBPACK VAR INJECTION */ (function(process) {
          // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
          // backported and transplited with Babel, with backwards-compat fixes

          // Copyright Joyent, Inc. and other Node contributors.
          //
          // Permission is hereby granted, free of charge, to any person obtaining a
          // copy of this software and associated documentation files (the
          // "Software"), to deal in the Software without restriction, including
          // without limitation the rights to use, copy, modify, merge, publish,
          // distribute, sublicense, and/or sell copies of the Software, and to permit
          // persons to whom the Software is furnished to do so, subject to the
          // following conditions:
          //
          // The above copyright notice and this permission notice shall be included
          // in all copies or substantial portions of the Software.
          //
          // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
          // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
          // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
          // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
          // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
          // USE OR OTHER DEALINGS IN THE SOFTWARE.

          // resolves . and .. elements in a path array with directory names there
          // must be no slashes, empty elements, or device names (c:\) in the array
          // (so also no leading and trailing slashes - it does not distinguish
          // relative and absolute paths)
          function normalizeArray(parts, allowAboveRoot) {
            // if the path tries to go above the root, `up` ends up > 0
            var up = 0;
            for (var i = parts.length - 1; i >= 0; i--) {
              var last = parts[i];
              if (last === ".") {
                parts.splice(i, 1);
              } else if (last === "..") {
                parts.splice(i, 1);
                up++;
              } else if (up) {
                parts.splice(i, 1);
                up--;
              }
            }

            // if the path is allowed to go above the root, restore leading ..s
            if (allowAboveRoot) {
              for (; up--; up) {
                parts.unshift("..");
              }
            }

            return parts;
          }

          // path.resolve([from ...], to)
          // posix version
          exports.resolve = function() {
            var resolvedPath = "",
              resolvedAbsolute = false;

            for (
              var i = arguments.length - 1;
              i >= -1 && !resolvedAbsolute;
              i--
            ) {
              var path = i >= 0 ? arguments[i] : process.cwd();

              // Skip empty and invalid entries
              if (typeof path !== "string") {
                throw new TypeError(
                  "Arguments to path.resolve must be strings"
                );
              } else if (!path) {
                continue;
              }

              resolvedPath = path + "/" + resolvedPath;
              resolvedAbsolute = path.charAt(0) === "/";
            }

            // At this point the path should be resolved to a full absolute path, but
            // handle relative paths to be safe (might happen when process.cwd() fails)

            // Normalize the path
            resolvedPath = normalizeArray(
              filter(resolvedPath.split("/"), function(p) {
                return !!p;
              }),
              !resolvedAbsolute
            ).join("/");

            return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
          };

          // path.normalize(path)
          // posix version
          exports.normalize = function(path) {
            var isAbsolute = exports.isAbsolute(path),
              trailingSlash = substr(path, -1) === "/";

            // Normalize the path
            path = normalizeArray(
              filter(path.split("/"), function(p) {
                return !!p;
              }),
              !isAbsolute
            ).join("/");

            if (!path && !isAbsolute) {
              path = ".";
            }
            if (path && trailingSlash) {
              path += "/";
            }

            return (isAbsolute ? "/" : "") + path;
          };

          // posix version
          exports.isAbsolute = function(path) {
            return path.charAt(0) === "/";
          };

          // posix version
          exports.join = function() {
            var paths = Array.prototype.slice.call(arguments, 0);
            return exports.normalize(
              filter(paths, function(p, index) {
                if (typeof p !== "string") {
                  throw new TypeError("Arguments to path.join must be strings");
                }
                return p;
              }).join("/")
            );
          };

          // path.relative(from, to)
          // posix version
          exports.relative = function(from, to) {
            from = exports.resolve(from).substr(1);
            to = exports.resolve(to).substr(1);

            function trim(arr) {
              var start = 0;
              for (; start < arr.length; start++) {
                if (arr[start] !== "") break;
              }

              var end = arr.length - 1;
              for (; end >= 0; end--) {
                if (arr[end] !== "") break;
              }

              if (start > end) return [];
              return arr.slice(start, end - start + 1);
            }

            var fromParts = trim(from.split("/"));
            var toParts = trim(to.split("/"));

            var length = Math.min(fromParts.length, toParts.length);
            var samePartsLength = length;
            for (var i = 0; i < length; i++) {
              if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
              }
            }

            var outputParts = [];
            for (var i = samePartsLength; i < fromParts.length; i++) {
              outputParts.push("..");
            }

            outputParts = outputParts.concat(toParts.slice(samePartsLength));

            return outputParts.join("/");
          };

          exports.sep = "/";
          exports.delimiter = ":";

          exports.dirname = function(path) {
            if (typeof path !== "string") path = path + "";
            if (path.length === 0) return ".";
            var code = path.charCodeAt(0);
            var hasRoot = code === 47; /*/*/
            var end = -1;
            var matchedSlash = true;
            for (var i = path.length - 1; i >= 1; --i) {
              code = path.charCodeAt(i);
              if (code === 47 /*/*/) {
                if (!matchedSlash) {
                  end = i;
                  break;
                }
              } else {
                // We saw the first non-path separator
                matchedSlash = false;
              }
            }

            if (end === -1) return hasRoot ? "/" : ".";
            if (hasRoot && end === 1) {
              // return '//';
              // Backwards-compat fix:
              return "/";
            }
            return path.slice(0, end);
          };

          function basename(path) {
            if (typeof path !== "string") path = path + "";

            var start = 0;
            var end = -1;
            var matchedSlash = true;
            var i;

            for (i = path.length - 1; i >= 0; --i) {
              if (path.charCodeAt(i) === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                  start = i + 1;
                  break;
                }
              } else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
              }
            }

            if (end === -1) return "";
            return path.slice(start, end);
          }

          // Uses a mixed approach for backwards-compatibility, as ext behavior changed
          // in new Node.js versions, so only basename() above is backported here
          exports.basename = function(path, ext) {
            var f = basename(path);
            if (ext && f.substr(-1 * ext.length) === ext) {
              f = f.substr(0, f.length - ext.length);
            }
            return f;
          };

          exports.extname = function(path) {
            if (typeof path !== "string") path = path + "";
            var startDot = -1;
            var startPart = 0;
            var end = -1;
            var matchedSlash = true;
            // Track the state of characters (if any) we see before our first dot and
            // after any path separator we find
            var preDotState = 0;
            for (var i = path.length - 1; i >= 0; --i) {
              var code = path.charCodeAt(i);
              if (code === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                  startPart = i + 1;
                  break;
                }
                continue;
              }
              if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
              }
              if (code === 46 /*.*/) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
              } else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
              }
            }

            if (
              startDot === -1 ||
              end === -1 ||
              // We saw a non-dot character immediately before the dot
              preDotState === 0 ||
              // The (right-most) trimmed path component is exactly '..'
              (preDotState === 1 &&
                startDot === end - 1 &&
                startDot === startPart + 1)
            ) {
              return "";
            }
            return path.slice(startDot, end);
          };

          function filter(xs, f) {
            if (xs.filter) return xs.filter(f);
            var res = [];
            for (var i = 0; i < xs.length; i++) {
              if (f(xs[i], i, xs)) res.push(xs[i]);
            }
            return res;
          }

          // String.prototype.substr - negative index don't work in IE8
          var substr =
            "ab".substr(-1) === "b"
              ? function(str, start, len) {
                  return str.substr(start, len);
                }
              : function(str, start, len) {
                  if (start < 0) start = str.length + start;
                  return str.substr(start, len);
                };

          /* WEBPACK VAR INJECTION */
        }.call(
          this,
          __webpack_require__(
            /*! ./../process/browser.js */ "./node_modules/process/browser.js"
          )
        ));

        /***/
      },

    /***/ "./node_modules/prismjs/components/prism-clike.js":
      /*!********************************************************!*\
  !*** ./node_modules/prismjs/components/prism-clike.js ***!
  \********************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        Prism.languages.clike = {
          comment: [
            {
              pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
              lookbehind: true
            },
            {
              pattern: /(^|[^\\:])\/\/.*/,
              lookbehind: true,
              greedy: true
            }
          ],
          string: {
            pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
            greedy: true
          },
          "class-name": {
            pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
            lookbehind: true,
            inside: {
              punctuation: /[.\\]/
            }
          },
          keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
          boolean: /\b(?:true|false)\b/,
          function: /\w+(?=\()/,
          number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
          operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
          punctuation: /[{}[\];(),.:]/
        };

        /***/
      },

    /***/ "./node_modules/prismjs/components/prism-core.js":
      /*!*******************************************************!*\
  !*** ./node_modules/prismjs/components/prism-core.js ***!
  \*******************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        /* WEBPACK VAR INJECTION */ (function(global) {
          var _self =
            typeof window !== "undefined"
              ? window // if in browser
              : typeof WorkerGlobalScope !== "undefined" &&
                self instanceof WorkerGlobalScope
              ? self // if in worker
              : {}; // if in node js

          /**
           * Prism: Lightweight, robust, elegant syntax highlighting
           * MIT license http://www.opensource.org/licenses/mit-license.php/
           * @author Lea Verou http://lea.verou.me
           */

          var Prism = (function(_self) {
            // Private helper vars
            var lang = /\blang(?:uage)?-([\w-]+)\b/i;
            var uniqueId = 0;

            var _ = {
              manual: _self.Prism && _self.Prism.manual,
              disableWorkerMessageHandler:
                _self.Prism && _self.Prism.disableWorkerMessageHandler,
              util: {
                encode: function encode(tokens) {
                  if (tokens instanceof Token) {
                    return new Token(
                      tokens.type,
                      encode(tokens.content),
                      tokens.alias
                    );
                  } else if (Array.isArray(tokens)) {
                    return tokens.map(encode);
                  } else {
                    return tokens
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/\u00a0/g, " ");
                  }
                },

                type: function(o) {
                  return Object.prototype.toString.call(o).slice(8, -1);
                },

                objId: function(obj) {
                  if (!obj["__id"]) {
                    Object.defineProperty(obj, "__id", { value: ++uniqueId });
                  }
                  return obj["__id"];
                },

                // Deep clone a language definition (e.g. to extend it)
                clone: function deepClone(o, visited) {
                  var clone,
                    id,
                    type = _.util.type(o);
                  visited = visited || {};

                  switch (type) {
                    case "Object":
                      id = _.util.objId(o);
                      if (visited[id]) {
                        return visited[id];
                      }
                      clone = {};
                      visited[id] = clone;

                      for (var key in o) {
                        if (o.hasOwnProperty(key)) {
                          clone[key] = deepClone(o[key], visited);
                        }
                      }

                      return clone;

                    case "Array":
                      id = _.util.objId(o);
                      if (visited[id]) {
                        return visited[id];
                      }
                      clone = [];
                      visited[id] = clone;

                      o.forEach(function(v, i) {
                        clone[i] = deepClone(v, visited);
                      });

                      return clone;

                    default:
                      return o;
                  }
                },

                /**
                 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
                 *
                 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
                 *
                 * @param {Element} element
                 * @returns {string}
                 */
                getLanguage: function(element) {
                  while (element && !lang.test(element.className)) {
                    element = element.parentElement;
                  }
                  if (element) {
                    return (element.className.match(lang) || [
                      ,
                      "none"
                    ])[1].toLowerCase();
                  }
                  return "none";
                },

                /**
                 * Returns the script element that is currently executing.
                 *
                 * This does __not__ work for line script element.
                 *
                 * @returns {HTMLScriptElement | null}
                 */
                currentScript: function() {
                  if (typeof document === "undefined") {
                    return null;
                  }
                  if ("currentScript" in document) {
                    return document.currentScript;
                  }

                  // IE11 workaround
                  // we'll get the src of the current script by parsing IE11's error stack trace
                  // this will not work for inline scripts

                  try {
                    throw new Error();
                  } catch (err) {
                    // Get file src url from stack. Specifically works with the format of stack traces in IE.
                    // A stack will look like this:
                    //
                    // Error
                    //    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
                    //    at Global code (http://localhost/components/prism-core.js:606:1)

                    var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) ||
                      [])[1];
                    if (src) {
                      var scripts = document.getElementsByTagName("script");
                      for (var i in scripts) {
                        if (scripts[i].src == src) {
                          return scripts[i];
                        }
                      }
                    }
                    return null;
                  }
                }
              },

              languages: {
                extend: function(id, redef) {
                  var lang = _.util.clone(_.languages[id]);

                  for (var key in redef) {
                    lang[key] = redef[key];
                  }

                  return lang;
                },

                /**
                 * Insert a token before another token in a language literal
                 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
                 * we cannot just provide an object, we need an object and a key.
                 * @param inside The key (or language id) of the parent
                 * @param before The key to insert before.
                 * @param insert Object with the key/value pairs to insert
                 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
                 */
                insertBefore: function(inside, before, insert, root) {
                  root = root || _.languages;
                  var grammar = root[inside];
                  var ret = {};

                  for (var token in grammar) {
                    if (grammar.hasOwnProperty(token)) {
                      if (token == before) {
                        for (var newToken in insert) {
                          if (insert.hasOwnProperty(newToken)) {
                            ret[newToken] = insert[newToken];
                          }
                        }
                      }

                      // Do not insert token which also occur in insert. See #1525
                      if (!insert.hasOwnProperty(token)) {
                        ret[token] = grammar[token];
                      }
                    }
                  }

                  var old = root[inside];
                  root[inside] = ret;

                  // Update references in other language definitions
                  _.languages.DFS(_.languages, function(key, value) {
                    if (value === old && key != inside) {
                      this[key] = ret;
                    }
                  });

                  return ret;
                },

                // Traverse a language definition with Depth First Search
                DFS: function DFS(o, callback, type, visited) {
                  visited = visited || {};

                  var objId = _.util.objId;

                  for (var i in o) {
                    if (o.hasOwnProperty(i)) {
                      callback.call(o, i, o[i], type || i);

                      var property = o[i],
                        propertyType = _.util.type(property);

                      if (
                        propertyType === "Object" &&
                        !visited[objId(property)]
                      ) {
                        visited[objId(property)] = true;
                        DFS(property, callback, null, visited);
                      } else if (
                        propertyType === "Array" &&
                        !visited[objId(property)]
                      ) {
                        visited[objId(property)] = true;
                        DFS(property, callback, i, visited);
                      }
                    }
                  }
                }
              },
              plugins: {},

              highlightAll: function(async, callback) {
                _.highlightAllUnder(document, async, callback);
              },

              highlightAllUnder: function(container, async, callback) {
                var env = {
                  callback: callback,
                  container: container,
                  selector:
                    'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
                };

                _.hooks.run("before-highlightall", env);

                env.elements = Array.prototype.slice.apply(
                  env.container.querySelectorAll(env.selector)
                );

                _.hooks.run("before-all-elements-highlight", env);

                for (var i = 0, element; (element = env.elements[i++]); ) {
                  _.highlightElement(element, async === true, env.callback);
                }
              },

              highlightElement: function(element, async, callback) {
                // Find language
                var language = _.util.getLanguage(element);
                var grammar = _.languages[language];

                // Set language on the element, if not present
                element.className =
                  element.className.replace(lang, "").replace(/\s+/g, " ") +
                  " language-" +
                  language;

                // Set language on the parent, for styling
                var parent = element.parentNode;
                if (parent && parent.nodeName.toLowerCase() === "pre") {
                  parent.className =
                    parent.className.replace(lang, "").replace(/\s+/g, " ") +
                    " language-" +
                    language;
                }

                var code = element.textContent;

                var env = {
                  element: element,
                  language: language,
                  grammar: grammar,
                  code: code
                };

                function insertHighlightedCode(highlightedCode) {
                  env.highlightedCode = highlightedCode;

                  _.hooks.run("before-insert", env);

                  env.element.innerHTML = env.highlightedCode;

                  _.hooks.run("after-highlight", env);
                  _.hooks.run("complete", env);
                  callback && callback.call(env.element);
                }

                _.hooks.run("before-sanity-check", env);

                if (!env.code) {
                  _.hooks.run("complete", env);
                  callback && callback.call(env.element);
                  return;
                }

                _.hooks.run("before-highlight", env);

                if (!env.grammar) {
                  insertHighlightedCode(_.util.encode(env.code));
                  return;
                }

                if (async && _self.Worker) {
                  var worker = new Worker(_.filename);

                  worker.onmessage = function(evt) {
                    insertHighlightedCode(evt.data);
                  };

                  worker.postMessage(
                    JSON.stringify({
                      language: env.language,
                      code: env.code,
                      immediateClose: true
                    })
                  );
                } else {
                  insertHighlightedCode(
                    _.highlight(env.code, env.grammar, env.language)
                  );
                }
              },

              highlight: function(text, grammar, language) {
                var env = {
                  code: text,
                  grammar: grammar,
                  language: language
                };
                _.hooks.run("before-tokenize", env);
                env.tokens = _.tokenize(env.code, env.grammar);
                _.hooks.run("after-tokenize", env);
                return Token.stringify(_.util.encode(env.tokens), env.language);
              },

              tokenize: function(text, grammar) {
                var rest = grammar.rest;
                if (rest) {
                  for (var token in rest) {
                    grammar[token] = rest[token];
                  }

                  delete grammar.rest;
                }

                var tokenList = new LinkedList();
                addAfter(tokenList, tokenList.head, text);

                matchGrammar(text, tokenList, grammar, tokenList.head, 0);

                return toArray(tokenList);
              },

              hooks: {
                all: {},

                add: function(name, callback) {
                  var hooks = _.hooks.all;

                  hooks[name] = hooks[name] || [];

                  hooks[name].push(callback);
                },

                run: function(name, env) {
                  var callbacks = _.hooks.all[name];

                  if (!callbacks || !callbacks.length) {
                    return;
                  }

                  for (var i = 0, callback; (callback = callbacks[i++]); ) {
                    callback(env);
                  }
                }
              },

              Token: Token
            };

            _self.Prism = _;

            function Token(type, content, alias, matchedStr, greedy) {
              this.type = type;
              this.content = content;
              this.alias = alias;
              // Copy of the full string this token was created from
              this.length = (matchedStr || "").length | 0;
              this.greedy = !!greedy;
            }

            Token.stringify = function stringify(o, language) {
              if (typeof o == "string") {
                return o;
              }
              if (Array.isArray(o)) {
                var s = "";
                o.forEach(function(e) {
                  s += stringify(e, language);
                });
                return s;
              }

              var env = {
                type: o.type,
                content: stringify(o.content, language),
                tag: "span",
                classes: ["token", o.type],
                attributes: {},
                language: language
              };

              var aliases = o.alias;
              if (aliases) {
                if (Array.isArray(aliases)) {
                  Array.prototype.push.apply(env.classes, aliases);
                } else {
                  env.classes.push(aliases);
                }
              }

              _.hooks.run("wrap", env);

              var attributes = "";
              for (var name in env.attributes) {
                attributes +=
                  " " +
                  name +
                  '="' +
                  (env.attributes[name] || "").replace(/"/g, "&quot;") +
                  '"';
              }

              return (
                "<" +
                env.tag +
                ' class="' +
                env.classes.join(" ") +
                '"' +
                attributes +
                ">" +
                env.content +
                "</" +
                env.tag +
                ">"
              );
            };

            /**
             * @param {string} text
             * @param {LinkedList<string | Token>} tokenList
             * @param {any} grammar
             * @param {LinkedListNode<string | Token>} startNode
             * @param {number} startPos
             * @param {boolean} [oneshot=false]
             * @param {string} [target]
             */
            function matchGrammar(
              text,
              tokenList,
              grammar,
              startNode,
              startPos,
              oneshot,
              target
            ) {
              for (var token in grammar) {
                if (!grammar.hasOwnProperty(token) || !grammar[token]) {
                  continue;
                }

                var patterns = grammar[token];
                patterns = Array.isArray(patterns) ? patterns : [patterns];

                for (var j = 0; j < patterns.length; ++j) {
                  if (target && target == token + "," + j) {
                    return;
                  }

                  var pattern = patterns[j],
                    inside = pattern.inside,
                    lookbehind = !!pattern.lookbehind,
                    greedy = !!pattern.greedy,
                    lookbehindLength = 0,
                    alias = pattern.alias;

                  if (greedy && !pattern.pattern.global) {
                    // Without the global flag, lastIndex won't work
                    var flags = pattern.pattern
                      .toString()
                      .match(/[imsuy]*$/)[0];
                    pattern.pattern = RegExp(
                      pattern.pattern.source,
                      flags + "g"
                    );
                  }

                  pattern = pattern.pattern || pattern;

                  for (
                    // iterate the token list and keep track of the current token/string position
                    var currentNode = startNode.next, pos = startPos;
                    currentNode !== tokenList.tail;
                    pos += currentNode.value.length,
                      currentNode = currentNode.next
                  ) {
                    var str = currentNode.value;

                    if (tokenList.length > text.length) {
                      // Something went terribly wrong, ABORT, ABORT!
                      return;
                    }

                    if (str instanceof Token) {
                      continue;
                    }

                    var removeCount = 1; // this is the to parameter of removeBetween

                    if (greedy && currentNode != tokenList.tail.prev) {
                      pattern.lastIndex = pos;
                      var match = pattern.exec(text);
                      if (!match) {
                        break;
                      }

                      var from =
                        match.index +
                        (lookbehind && match[1] ? match[1].length : 0);
                      var to = match.index + match[0].length;
                      var p = pos;

                      // find the node that contains the match
                      p += currentNode.value.length;
                      while (from >= p) {
                        currentNode = currentNode.next;
                        p += currentNode.value.length;
                      }
                      // adjust pos (and p)
                      p -= currentNode.value.length;
                      pos = p;

                      // the current node is a Token, then the match starts inside another Token, which is invalid
                      if (currentNode.value instanceof Token) {
                        continue;
                      }

                      // find the last node which is affected by this match
                      for (
                        var k = currentNode;
                        k !== tokenList.tail &&
                        (p < to ||
                          (typeof k.value === "string" &&
                            !k.prev.value.greedy));
                        k = k.next
                      ) {
                        removeCount++;
                        p += k.value.length;
                      }
                      removeCount--;

                      // replace with the new match
                      str = text.slice(pos, p);
                      match.index -= pos;
                    } else {
                      pattern.lastIndex = 0;

                      var match = pattern.exec(str);
                    }

                    if (!match) {
                      if (oneshot) {
                        break;
                      }

                      continue;
                    }

                    if (lookbehind) {
                      lookbehindLength = match[1] ? match[1].length : 0;
                    }

                    var from = match.index + lookbehindLength,
                      match = match[0].slice(lookbehindLength),
                      to = from + match.length,
                      before = str.slice(0, from),
                      after = str.slice(to);

                    var removeFrom = currentNode.prev;

                    if (before) {
                      removeFrom = addAfter(tokenList, removeFrom, before);
                      pos += before.length;
                    }

                    removeRange(tokenList, removeFrom, removeCount);

                    var wrapped = new Token(
                      token,
                      inside ? _.tokenize(match, inside) : match,
                      alias,
                      match,
                      greedy
                    );
                    currentNode = addAfter(tokenList, removeFrom, wrapped);

                    if (after) {
                      addAfter(tokenList, currentNode, after);
                    }

                    if (removeCount > 1)
                      matchGrammar(
                        text,
                        tokenList,
                        grammar,
                        currentNode.prev,
                        pos,
                        true,
                        token + "," + j
                      );

                    if (oneshot) break;
                  }
                }
              }
            }

            /**
             * @typedef LinkedListNode
             * @property {T} value
             * @property {LinkedListNode<T> | null} prev The previous node.
             * @property {LinkedListNode<T> | null} next The next node.
             * @template T
             */

            /**
             * @template T
             */
            function LinkedList() {
              /** @type {LinkedListNode<T>} */
              var head = { value: null, prev: null, next: null };
              /** @type {LinkedListNode<T>} */
              var tail = { value: null, prev: head, next: null };
              head.next = tail;

              /** @type {LinkedListNode<T>} */
              this.head = head;
              /** @type {LinkedListNode<T>} */
              this.tail = tail;
              this.length = 0;
            }

            /**
             * Adds a new node with the given value to the list.
             * @param {LinkedList<T>} list
             * @param {LinkedListNode<T>} node
             * @param {T} value
             * @returns {LinkedListNode<T>} The added node.
             * @template T
             */
            function addAfter(list, node, value) {
              // assumes that node != list.tail && values.length >= 0
              var next = node.next;

              var newNode = { value: value, prev: node, next: next };
              node.next = newNode;
              next.prev = newNode;
              list.length++;

              return newNode;
            }
            /**
             * Removes `count` nodes after the given node. The given node will not be removed.
             * @param {LinkedList<T>} list
             * @param {LinkedListNode<T>} node
             * @param {number} count
             * @template T
             */
            function removeRange(list, node, count) {
              var next = node.next;
              for (var i = 0; i < count && next !== list.tail; i++) {
                next = next.next;
              }
              node.next = next;
              next.prev = node;
              list.length -= i;
            }
            /**
             * @param {LinkedList<T>} list
             * @returns {T[]}
             * @template T
             */
            function toArray(list) {
              var array = [];
              var node = list.head.next;
              while (node !== list.tail) {
                array.push(node.value);
                node = node.next;
              }
              return array;
            }

            if (!_self.document) {
              if (!_self.addEventListener) {
                // in Node.js
                return _;
              }

              if (!_.disableWorkerMessageHandler) {
                // In worker
                _self.addEventListener(
                  "message",
                  function(evt) {
                    var message = JSON.parse(evt.data),
                      lang = message.language,
                      code = message.code,
                      immediateClose = message.immediateClose;

                    _self.postMessage(
                      _.highlight(code, _.languages[lang], lang)
                    );
                    if (immediateClose) {
                      _self.close();
                    }
                  },
                  false
                );
              }

              return _;
            }

            //Get current script and highlight
            var script = _.util.currentScript();

            if (script) {
              _.filename = script.src;

              if (script.hasAttribute("data-manual")) {
                _.manual = true;
              }
            }

            function highlightAutomaticallyCallback() {
              if (!_.manual) {
                _.highlightAll();
              }
            }

            if (!_.manual) {
              // If the document state is "loading", then we'll use DOMContentLoaded.
              // If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
              // DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
              // might take longer one animation frame to execute which can create a race condition where only some plugins have
              // been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
              // See https://github.com/PrismJS/prism/issues/2102
              var readyState = document.readyState;
              if (
                readyState === "loading" ||
                (readyState === "interactive" && script && script.defer)
              ) {
                document.addEventListener(
                  "DOMContentLoaded",
                  highlightAutomaticallyCallback
                );
              } else {
                if (window.requestAnimationFrame) {
                  window.requestAnimationFrame(highlightAutomaticallyCallback);
                } else {
                  window.setTimeout(highlightAutomaticallyCallback, 16);
                }
              }
            }

            return _;
          })(_self);

          if (true && module.exports) {
            module.exports = Prism;
          }

          // hack for components to work correctly in node.js
          if (typeof global !== "undefined") {
            global.Prism = Prism;
          }

          /* WEBPACK VAR INJECTION */
        }.call(
          this,
          __webpack_require__(
            /*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"
          )
        ));

        /***/
      },

    /***/ "./node_modules/prismjs/components/prism-css.js":
      /*!******************************************************!*\
  !*** ./node_modules/prismjs/components/prism-css.js ***!
  \******************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        (function(Prism) {
          var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

          Prism.languages.css = {
            comment: /\/\*[\s\S]*?\*\//,
            atrule: {
              pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
              inside: {
                rule: /^@[\w-]+/,
                "selector-function-argument": {
                  pattern: /(\bselector\s*\((?!\s*\))\s*)(?:[^()]|\((?:[^()]|\([^()]*\))*\))+?(?=\s*\))/,
                  lookbehind: true,
                  alias: "selector"
                }
                // See rest below
              }
            },
            url: {
              pattern: RegExp(
                "url\\((?:" + string.source + "|[^\n\r()]*)\\)",
                "i"
              ),
              greedy: true,
              inside: {
                function: /^url/i,
                punctuation: /^\(|\)$/
              }
            },
            selector: RegExp(
              "[^{}\\s](?:[^{};\"']|" + string.source + ")*?(?=\\s*\\{)"
            ),
            string: {
              pattern: string,
              greedy: true
            },
            property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
            important: /!important\b/i,
            function: /[-a-z0-9]+(?=\()/i,
            punctuation: /[(){};:,]/
          };

          Prism.languages.css["atrule"].inside.rest = Prism.languages.css;

          var markup = Prism.languages.markup;
          if (markup) {
            markup.tag.addInlined("style", "css");

            Prism.languages.insertBefore(
              "inside",
              "attr-value",
              {
                "style-attr": {
                  pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
                  inside: {
                    "attr-name": {
                      pattern: /^\s*style/i,
                      inside: markup.tag.inside
                    },
                    punctuation: /^\s*=\s*['"]|['"]\s*$/,
                    "attr-value": {
                      pattern: /.+/i,
                      inside: Prism.languages.css
                    }
                  },
                  alias: "language-css"
                }
              },
              markup.tag
            );
          }
        })(Prism);

        /***/
      },

    /***/ "./node_modules/prismjs/components/prism-javascript.js":
      /*!*************************************************************!*\
  !*** ./node_modules/prismjs/components/prism-javascript.js ***!
  \*************************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        Prism.languages.javascript = Prism.languages.extend("clike", {
          "class-name": [
            Prism.languages.clike["class-name"],
            {
              pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
              lookbehind: true
            }
          ],
          keyword: [
            {
              pattern: /((?:^|})\s*)(?:catch|finally)\b/,
              lookbehind: true
            },
            {
              pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
              lookbehind: true
            }
          ],
          number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
          // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
          function: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
          operator: /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/
        });

        Prism.languages.javascript[
          "class-name"
        ][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

        Prism.languages.insertBefore("javascript", "keyword", {
          regex: {
            pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
            lookbehind: true,
            greedy: true
          },
          // This must be declared before keyword because we use "function" inside the look-forward
          "function-variable": {
            pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
            alias: "function"
          },
          parameter: [
            {
              pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
              lookbehind: true,
              inside: Prism.languages.javascript
            },
            {
              pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
              inside: Prism.languages.javascript
            },
            {
              pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
              lookbehind: true,
              inside: Prism.languages.javascript
            },
            {
              pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
              lookbehind: true,
              inside: Prism.languages.javascript
            }
          ],
          constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
        });

        Prism.languages.insertBefore("javascript", "string", {
          "template-string": {
            pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
            greedy: true,
            inside: {
              "template-punctuation": {
                pattern: /^`|`$/,
                alias: "string"
              },
              interpolation: {
                pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
                lookbehind: true,
                inside: {
                  "interpolation-punctuation": {
                    pattern: /^\${|}$/,
                    alias: "punctuation"
                  },
                  rest: Prism.languages.javascript
                }
              },
              string: /[\s\S]+/
            }
          }
        });

        if (Prism.languages.markup) {
          Prism.languages.markup.tag.addInlined("script", "javascript");
        }

        Prism.languages.js = Prism.languages.javascript;

        /***/
      },

    /***/ "./node_modules/prismjs/components/prism-markup.js":
      /*!*********************************************************!*\
  !*** ./node_modules/prismjs/components/prism-markup.js ***!
  \*********************************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        Prism.languages.markup = {
          comment: /<!--[\s\S]*?-->/,
          prolog: /<\?[\s\S]+?\?>/,
          doctype: {
            pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
            greedy: true
          },
          cdata: /<!\[CDATA\[[\s\S]*?]]>/i,
          tag: {
            pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
            greedy: true,
            inside: {
              tag: {
                pattern: /^<\/?[^\s>\/]+/i,
                inside: {
                  punctuation: /^<\/?/,
                  namespace: /^[^\s>\/:]+:/
                }
              },
              "attr-value": {
                pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
                inside: {
                  punctuation: [
                    /^=/,
                    {
                      pattern: /^(\s*)["']|["']$/,
                      lookbehind: true
                    }
                  ]
                }
              },
              punctuation: /\/?>/,
              "attr-name": {
                pattern: /[^\s>\/]+/,
                inside: {
                  namespace: /^[^\s>\/:]+:/
                }
              }
            }
          },
          entity: /&#?[\da-z]{1,8};/i
        };

        Prism.languages.markup["tag"].inside["attr-value"].inside["entity"] =
          Prism.languages.markup["entity"];

        // Plugin to make entity title show the real entity, idea by Roman Komarov
        Prism.hooks.add("wrap", function(env) {
          if (env.type === "entity") {
            env.attributes["title"] = env.content.replace(/&amp;/, "&");
          }
        });

        Object.defineProperty(Prism.languages.markup.tag, "addInlined", {
          /**
           * Adds an inlined language to markup.
           *
           * An example of an inlined language is CSS with `<style>` tags.
           *
           * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
           * case insensitive.
           * @param {string} lang The language key.
           * @example
           * addInlined('style', 'css');
           */
          value: function addInlined(tagName, lang) {
            var includedCdataInside = {};
            includedCdataInside["language-" + lang] = {
              pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
              lookbehind: true,
              inside: Prism.languages[lang]
            };
            includedCdataInside["cdata"] = /^<!\[CDATA\[|\]\]>$/i;

            var inside = {
              "included-cdata": {
                pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
                inside: includedCdataInside
              }
            };
            inside["language-" + lang] = {
              pattern: /[\s\S]+/,
              inside: Prism.languages[lang]
            };

            var def = {};
            def[tagName] = {
              pattern: RegExp(
                /(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
                  /__/g,
                  function() {
                    return tagName;
                  }
                ),
                "i"
              ),
              lookbehind: true,
              greedy: true,
              inside: inside
            };

            Prism.languages.insertBefore("markup", "cdata", def);
          }
        });

        Prism.languages.xml = Prism.languages.extend("markup", {});
        Prism.languages.html = Prism.languages.markup;
        Prism.languages.mathml = Prism.languages.markup;
        Prism.languages.svg = Prism.languages.markup;

        /***/
      },

    /***/ "./node_modules/process/browser.js":
      /*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        // shim for using process in browser
        var process = (module.exports = {});

        // cached from whatever global is present so that test runners that stub it
        // don't break things.  But we need to wrap it in a try catch in case it is
        // wrapped in strict mode code which doesn't define any globals.  It's inside a
        // function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
          throw new Error("setTimeout has not been defined");
        }
        function defaultClearTimeout() {
          throw new Error("clearTimeout has not been defined");
        }
        (function() {
          try {
            if (typeof setTimeout === "function") {
              cachedSetTimeout = setTimeout;
            } else {
              cachedSetTimeout = defaultSetTimout;
            }
          } catch (e) {
            cachedSetTimeout = defaultSetTimout;
          }
          try {
            if (typeof clearTimeout === "function") {
              cachedClearTimeout = clearTimeout;
            } else {
              cachedClearTimeout = defaultClearTimeout;
            }
          } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
          }
        })();
        function runTimeout(fun) {
          if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
          }
          // if setTimeout wasn't available but was latter defined
          if (
            (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
            setTimeout
          ) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
          }
          try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
          } catch (e) {
            try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
            } catch (e) {
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
            }
          }
        }
        function runClearTimeout(marker) {
          if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
          }
          // if clearTimeout wasn't available but was latter defined
          if (
            (cachedClearTimeout === defaultClearTimeout ||
              !cachedClearTimeout) &&
            clearTimeout
          ) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
          }
          try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
          } catch (e) {
            try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
            } catch (e) {
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
            }
          }
        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
          if (!draining || !currentQueue) {
            return;
          }
          draining = false;
          if (currentQueue.length) {
            queue = currentQueue.concat(queue);
          } else {
            queueIndex = -1;
          }
          if (queue.length) {
            drainQueue();
          }
        }

        function drainQueue() {
          if (draining) {
            return;
          }
          var timeout = runTimeout(cleanUpNextTick);
          draining = true;

          var len = queue.length;
          while (len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
              if (currentQueue) {
                currentQueue[queueIndex].run();
              }
            }
            queueIndex = -1;
            len = queue.length;
          }
          currentQueue = null;
          draining = false;
          runClearTimeout(timeout);
        }

        process.nextTick = function(fun) {
          var args = new Array(arguments.length - 1);
          if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }
          }
          queue.push(new Item(fun, args));
          if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
          }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
          this.fun = fun;
          this.array = array;
        }
        Item.prototype.run = function() {
          this.fun.apply(null, this.array);
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ""; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function(name) {
          return [];
        };

        process.binding = function(name) {
          throw new Error("process.binding is not supported");
        };

        process.cwd = function() {
          return "/";
        };
        process.chdir = function(dir) {
          throw new Error("process.chdir is not supported");
        };
        process.umask = function() {
          return 0;
        };

        /***/
      },

    /***/ "./node_modules/prop-types/checkPropTypes.js":
      /*!***************************************************!*\
  !*** ./node_modules/prop-types/checkPropTypes.js ***!
  \***************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var printWarning = function() {};

        if (true) {
          var ReactPropTypesSecret = __webpack_require__(
            /*! ./lib/ReactPropTypesSecret */ "./node_modules/prop-types/lib/ReactPropTypesSecret.js"
          );
          var loggedTypeFailures = {};
          var has = Function.call.bind(Object.prototype.hasOwnProperty);

          printWarning = function(text) {
            var message = "Warning: " + text;
            if (typeof console !== "undefined") {
              console.error(message);
            }
            try {
              // --- Welcome to debugging React ---
              // This error was thrown as a convenience so that you can use this stack
              // to find the callsite that caused this warning to fire.
              throw new Error(message);
            } catch (x) {}
          };
        }

        /**
         * Assert that the values match with the type specs.
         * Error messages are memorized and will only be shown once.
         *
         * @param {object} typeSpecs Map of name to a ReactPropType
         * @param {object} values Runtime values that need to be type-checked
         * @param {string} location e.g. "prop", "context", "child context"
         * @param {string} componentName Name of the component for error messages.
         * @param {?Function} getStack Returns the component stack.
         * @private
         */
        function checkPropTypes(
          typeSpecs,
          values,
          location,
          componentName,
          getStack
        ) {
          if (true) {
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error;
                // Prop type validation may throw. In case they do, we don't want to
                // fail the render phase where it didn't fail before. So we log it.
                // After these have been cleaned up, we'll let them throw.
                try {
                  // This is intentionally an invariant that gets caught. It's the same
                  // behavior as without this statement except with a better message.
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error(
                      (componentName || "React class") +
                        ": " +
                        location +
                        " type `" +
                        typeSpecName +
                        "` is invalid; " +
                        "it must be a function, usually from the `prop-types` package, but received `" +
                        typeof typeSpecs[typeSpecName] +
                        "`."
                    );
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error = typeSpecs[typeSpecName](
                    values,
                    typeSpecName,
                    componentName,
                    location,
                    null,
                    ReactPropTypesSecret
                  );
                } catch (ex) {
                  error = ex;
                }
                if (error && !(error instanceof Error)) {
                  printWarning(
                    (componentName || "React class") +
                      ": type specification of " +
                      location +
                      " `" +
                      typeSpecName +
                      "` is invalid; the type checker " +
                      "function must return `null` or an `Error` but returned a " +
                      typeof error +
                      ". " +
                      "You may have forgotten to pass an argument to the type checker " +
                      "creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and " +
                      "shape all require an argument)."
                  );
                }
                if (
                  error instanceof Error &&
                  !(error.message in loggedTypeFailures)
                ) {
                  // Only monitor this failure once because there tends to be a lot of the
                  // same error.
                  loggedTypeFailures[error.message] = true;

                  var stack = getStack ? getStack() : "";

                  printWarning(
                    "Failed " +
                      location +
                      " type: " +
                      error.message +
                      (stack != null ? stack : "")
                  );
                }
              }
            }
          }
        }

        /**
         * Resets warning cache when testing.
         *
         * @private
         */
        checkPropTypes.resetWarningCache = function() {
          if (true) {
            loggedTypeFailures = {};
          }
        };

        module.exports = checkPropTypes;

        /***/
      },

    /***/ "./node_modules/prop-types/lib/ReactPropTypesSecret.js":
      /*!*************************************************************!*\
  !*** ./node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        /**
         * Copyright (c) 2013-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        var ReactPropTypesSecret =
          "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";

        module.exports = ReactPropTypesSecret;

        /***/
      },

    /***/ "./node_modules/querystring-es3/decode.js":
      /*!************************************************!*\
  !*** ./node_modules/querystring-es3/decode.js ***!
  \************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // If obj.hasOwnProperty has been overridden, then calling
        // obj.hasOwnProperty(prop) will break.
        // See: https://github.com/joyent/node/issues/1707
        function hasOwnProperty(obj, prop) {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        module.exports = function(qs, sep, eq, options) {
          sep = sep || "&";
          eq = eq || "=";
          var obj = {};

          if (typeof qs !== "string" || qs.length === 0) {
            return obj;
          }

          var regexp = /\+/g;
          qs = qs.split(sep);

          var maxKeys = 1000;
          if (options && typeof options.maxKeys === "number") {
            maxKeys = options.maxKeys;
          }

          var len = qs.length;
          // maxKeys <= 0 means that we should not limit keys count
          if (maxKeys > 0 && len > maxKeys) {
            len = maxKeys;
          }

          for (var i = 0; i < len; ++i) {
            var x = qs[i].replace(regexp, "%20"),
              idx = x.indexOf(eq),
              kstr,
              vstr,
              k,
              v;

            if (idx >= 0) {
              kstr = x.substr(0, idx);
              vstr = x.substr(idx + 1);
            } else {
              kstr = x;
              vstr = "";
            }

            k = decodeURIComponent(kstr);
            v = decodeURIComponent(vstr);

            if (!hasOwnProperty(obj, k)) {
              obj[k] = v;
            } else if (isArray(obj[k])) {
              obj[k].push(v);
            } else {
              obj[k] = [obj[k], v];
            }
          }

          return obj;
        };

        var isArray =
          Array.isArray ||
          function(xs) {
            return Object.prototype.toString.call(xs) === "[object Array]";
          };

        /***/
      },

    /***/ "./node_modules/querystring-es3/encode.js":
      /*!************************************************!*\
  !*** ./node_modules/querystring-es3/encode.js ***!
  \************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        var stringifyPrimitive = function(v) {
          switch (typeof v) {
            case "string":
              return v;

            case "boolean":
              return v ? "true" : "false";

            case "number":
              return isFinite(v) ? v : "";

            default:
              return "";
          }
        };

        module.exports = function(obj, sep, eq, name) {
          sep = sep || "&";
          eq = eq || "=";
          if (obj === null) {
            obj = undefined;
          }

          if (typeof obj === "object") {
            return map(objectKeys(obj), function(k) {
              var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
              if (isArray(obj[k])) {
                return map(obj[k], function(v) {
                  return ks + encodeURIComponent(stringifyPrimitive(v));
                }).join(sep);
              } else {
                return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
              }
            }).join(sep);
          }

          if (!name) return "";
          return (
            encodeURIComponent(stringifyPrimitive(name)) +
            eq +
            encodeURIComponent(stringifyPrimitive(obj))
          );
        };

        var isArray =
          Array.isArray ||
          function(xs) {
            return Object.prototype.toString.call(xs) === "[object Array]";
          };

        function map(xs, f) {
          if (xs.map) return xs.map(f);
          var res = [];
          for (var i = 0; i < xs.length; i++) {
            res.push(f(xs[i], i));
          }
          return res;
        }

        var objectKeys =
          Object.keys ||
          function(obj) {
            var res = [];
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
            }
            return res;
          };

        /***/
      },

    /***/ "./node_modules/querystring-es3/index.js":
      /*!***********************************************!*\
  !*** ./node_modules/querystring-es3/index.js ***!
  \***********************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        exports.decode = exports.parse = __webpack_require__(
          /*! ./decode */ "./node_modules/querystring-es3/decode.js"
        );
        exports.encode = exports.stringify = __webpack_require__(
          /*! ./encode */ "./node_modules/querystring-es3/encode.js"
        );

        /***/
      },

    /***/ "./node_modules/react-simple-code-editor/lib/index.js":
      /*!************************************************************!*\
  !*** ./node_modules/react-simple-code-editor/lib/index.js ***!
  \************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        /* WEBPACK VAR INJECTION */ (function(global) {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });

          var _extends =
            Object.assign ||
            function(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                  if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                  }
                }
              }
              return target;
            };

          var _createClass = (function() {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function(Constructor, protoProps, staticProps) {
              if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();

          var _react = __webpack_require__(
            /*! react */ "./node_modules/react/index.js"
          );

          var React = _interopRequireWildcard(_react);

          function _interopRequireWildcard(obj) {
            if (obj && obj.__esModule) {
              return obj;
            } else {
              var newObj = {};
              if (obj != null) {
                for (var key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key))
                    newObj[key] = obj[key];
                }
              }
              newObj.default = obj;
              return newObj;
            }
          }

          function _objectWithoutProperties(obj, keys) {
            var target = {};
            for (var i in obj) {
              if (keys.indexOf(i) >= 0) continue;
              if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
              target[i] = obj[i];
            }
            return target;
          }

          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }

          function _possibleConstructorReturn(self, call) {
            if (!self) {
              throw new ReferenceError(
                "this hasn't been initialised - super() hasn't been called"
              );
            }
            return call &&
              (typeof call === "object" || typeof call === "function")
              ? call
              : self;
          }

          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError(
                "Super expression must either be null or a function, not " +
                  typeof superClass
              );
            }
            subClass.prototype = Object.create(
              superClass && superClass.prototype,
              {
                constructor: {
                  value: subClass,
                  enumerable: false,
                  writable: true,
                  configurable: true
                }
              }
            );
            if (superClass)
              Object.setPrototypeOf
                ? Object.setPrototypeOf(subClass, superClass)
                : (subClass.__proto__ = superClass);
          }
          /* global global */

          var KEYCODE_ENTER = 13;
          var KEYCODE_TAB = 9;
          var KEYCODE_BACKSPACE = 8;
          var KEYCODE_Y = 89;
          var KEYCODE_Z = 90;
          var KEYCODE_M = 77;
          var KEYCODE_PARENS = 57;
          var KEYCODE_BRACKETS = 219;
          var KEYCODE_QUOTE = 222;
          var KEYCODE_BACK_QUOTE = 192;
          var KEYCODE_ESCAPE = 27;

          var HISTORY_LIMIT = 100;
          var HISTORY_TIME_GAP = 3000;

          var isWindows =
            "navigator" in global && /Win/i.test(navigator.platform);
          var isMacLike =
            "navigator" in global &&
            /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

          var className = "npm__react-simple-code-editor__textarea";

          var cssText =
            /* CSS */ "\n/**\n * Reset the text fill color so that placeholder is visible\n */\n." +
            className +
            ":empty {\n  -webkit-text-fill-color: inherit !important;\n}\n\n/**\n * Hack to apply on some CSS on IE10 and IE11\n */\n@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {\n  /**\n    * IE doesn't support '-webkit-text-fill-color'\n    * So we use 'color: transparent' to make the text transparent on IE\n    * Unlike other browsers, it doesn't affect caret color in IE\n    */\n  ." +
            className +
            " {\n    color: transparent !important;\n  }\n\n  ." +
            className +
            "::selection {\n    background-color: #accef7 !important;\n    color: transparent !important;\n  }\n}\n";

          var Editor = (function(_React$Component) {
            _inherits(Editor, _React$Component);

            function Editor() {
              var _ref;

              var _temp, _this, _ret;

              _classCallCheck(this, Editor);

              for (
                var _len = arguments.length, args = Array(_len), _key = 0;
                _key < _len;
                _key++
              ) {
                args[_key] = arguments[_key];
              }

              return (
                (_ret =
                  ((_temp =
                    ((_this = _possibleConstructorReturn(
                      this,
                      (_ref =
                        Editor.__proto__ ||
                        Object.getPrototypeOf(Editor)).call.apply(
                        _ref,
                        [this].concat(args)
                      )
                    )),
                    _this)),
                  (_this.state = {
                    capture: true
                  }),
                  (_this._recordCurrentState = function() {
                    var input = _this._input;

                    if (!input) return;

                    // Save current state of the input
                    var value = input.value,
                      selectionStart = input.selectionStart,
                      selectionEnd = input.selectionEnd;

                    _this._recordChange({
                      value: value,
                      selectionStart: selectionStart,
                      selectionEnd: selectionEnd
                    });
                  }),
                  (_this._getLines = function(text, position) {
                    return text.substring(0, position).split("\n");
                  }),
                  (_this._recordChange = function(record) {
                    var overwrite =
                      arguments.length > 1 && arguments[1] !== undefined
                        ? arguments[1]
                        : false;
                    var _this$_history = _this._history,
                      stack = _this$_history.stack,
                      offset = _this$_history.offset;

                    if (stack.length && offset > -1) {
                      // When something updates, drop the redo operations
                      _this._history.stack = stack.slice(0, offset + 1);

                      // Limit the number of operations to 100
                      var count = _this._history.stack.length;

                      if (count > HISTORY_LIMIT) {
                        var extras = count - HISTORY_LIMIT;

                        _this._history.stack = stack.slice(extras, count);
                        _this._history.offset = Math.max(
                          _this._history.offset - extras,
                          0
                        );
                      }
                    }

                    var timestamp = Date.now();

                    if (overwrite) {
                      var last = _this._history.stack[_this._history.offset];

                      if (
                        last &&
                        timestamp - last.timestamp < HISTORY_TIME_GAP
                      ) {
                        // A previous entry exists and was in short interval

                        // Match the last word in the line
                        var re = /[^a-z0-9]([a-z0-9]+)$/i;

                        // Get the previous line
                        var previous = _this
                          ._getLines(last.value, last.selectionStart)
                          .pop()
                          .match(re);

                        // Get the current line
                        var current = _this
                          ._getLines(record.value, record.selectionStart)
                          .pop()
                          .match(re);

                        if (
                          previous &&
                          current &&
                          current[1].startsWith(previous[1])
                        ) {
                          // The last word of the previous line and current line match
                          // Overwrite previous entry so that undo will remove whole word
                          _this._history.stack[
                            _this._history.offset
                          ] = _extends({}, record, { timestamp: timestamp });

                          return;
                        }
                      }
                    }

                    // Add the new operation to the stack
                    _this._history.stack.push(
                      _extends({}, record, { timestamp: timestamp })
                    );
                    _this._history.offset++;
                  }),
                  (_this._updateInput = function(record) {
                    var input = _this._input;

                    if (!input) return;

                    // Update values and selection state
                    input.value = record.value;
                    input.selectionStart = record.selectionStart;
                    input.selectionEnd = record.selectionEnd;

                    _this.props.onValueChange(record.value);
                  }),
                  (_this._applyEdits = function(record) {
                    // Save last selection state
                    var input = _this._input;
                    var last = _this._history.stack[_this._history.offset];

                    if (last && input) {
                      _this._history.stack[_this._history.offset] = _extends(
                        {},
                        last,
                        {
                          selectionStart: input.selectionStart,
                          selectionEnd: input.selectionEnd
                        }
                      );
                    }

                    // Save the changes
                    _this._recordChange(record);
                    _this._updateInput(record);
                  }),
                  (_this._undoEdit = function() {
                    var _this$_history2 = _this._history,
                      stack = _this$_history2.stack,
                      offset = _this$_history2.offset;

                    // Get the previous edit

                    var record = stack[offset - 1];

                    if (record) {
                      // Apply the changes and update the offset
                      _this._updateInput(record);
                      _this._history.offset = Math.max(offset - 1, 0);
                    }
                  }),
                  (_this._redoEdit = function() {
                    var _this$_history3 = _this._history,
                      stack = _this$_history3.stack,
                      offset = _this$_history3.offset;

                    // Get the next edit

                    var record = stack[offset + 1];

                    if (record) {
                      // Apply the changes and update the offset
                      _this._updateInput(record);
                      _this._history.offset = Math.min(
                        offset + 1,
                        stack.length - 1
                      );
                    }
                  }),
                  (_this._handleKeyDown = function(e) {
                    var _this$props = _this.props,
                      tabSize = _this$props.tabSize,
                      insertSpaces = _this$props.insertSpaces,
                      ignoreTabKey = _this$props.ignoreTabKey,
                      onKeyDown = _this$props.onKeyDown;

                    if (onKeyDown) {
                      onKeyDown(e);

                      if (e.defaultPrevented) {
                        return;
                      }
                    }

                    if (e.keyCode === KEYCODE_ESCAPE) {
                      e.target.blur();
                    }

                    var _e$target = e.target,
                      value = _e$target.value,
                      selectionStart = _e$target.selectionStart,
                      selectionEnd = _e$target.selectionEnd;

                    var tabCharacter = (insertSpaces ? " " : "\t").repeat(
                      tabSize
                    );

                    if (
                      e.keyCode === KEYCODE_TAB &&
                      !ignoreTabKey &&
                      _this.state.capture
                    ) {
                      // Prevent focus change
                      e.preventDefault();

                      if (e.shiftKey) {
                        // Unindent selected lines
                        var linesBeforeCaret = _this._getLines(
                          value,
                          selectionStart
                        );
                        var startLine = linesBeforeCaret.length - 1;
                        var endLine =
                          _this._getLines(value, selectionEnd).length - 1;
                        var nextValue = value
                          .split("\n")
                          .map(function(line, i) {
                            if (
                              i >= startLine &&
                              i <= endLine &&
                              line.startsWith(tabCharacter)
                            ) {
                              return line.substring(tabCharacter.length);
                            }

                            return line;
                          })
                          .join("\n");

                        if (value !== nextValue) {
                          var startLineText = linesBeforeCaret[startLine];

                          _this._applyEdits({
                            value: nextValue,
                            // Move the start cursor if first line in selection was modified
                            // It was modified only if it started with a tab
                            selectionStart: startLineText.startsWith(
                              tabCharacter
                            )
                              ? selectionStart - tabCharacter.length
                              : selectionStart,
                            // Move the end cursor by total number of characters removed
                            selectionEnd:
                              selectionEnd - (value.length - nextValue.length)
                          });
                        }
                      } else if (selectionStart !== selectionEnd) {
                        // Indent selected lines
                        var _linesBeforeCaret = _this._getLines(
                          value,
                          selectionStart
                        );
                        var _startLine = _linesBeforeCaret.length - 1;
                        var _endLine =
                          _this._getLines(value, selectionEnd).length - 1;
                        var _startLineText = _linesBeforeCaret[_startLine];

                        _this._applyEdits({
                          value: value
                            .split("\n")
                            .map(function(line, i) {
                              if (i >= _startLine && i <= _endLine) {
                                return tabCharacter + line;
                              }

                              return line;
                            })
                            .join("\n"),
                          // Move the start cursor by number of characters added in first line of selection
                          // Don't move it if it there was no text before cursor
                          selectionStart: /\S/.test(_startLineText)
                            ? selectionStart + tabCharacter.length
                            : selectionStart,
                          // Move the end cursor by total number of characters added
                          selectionEnd:
                            selectionEnd +
                            tabCharacter.length * (_endLine - _startLine + 1)
                        });
                      } else {
                        var updatedSelection =
                          selectionStart + tabCharacter.length;

                        _this._applyEdits({
                          // Insert tab character at caret
                          value:
                            value.substring(0, selectionStart) +
                            tabCharacter +
                            value.substring(selectionEnd),
                          // Update caret position
                          selectionStart: updatedSelection,
                          selectionEnd: updatedSelection
                        });
                      }
                    } else if (e.keyCode === KEYCODE_BACKSPACE) {
                      var hasSelection = selectionStart !== selectionEnd;
                      var textBeforeCaret = value.substring(0, selectionStart);

                      if (
                        textBeforeCaret.endsWith(tabCharacter) &&
                        !hasSelection
                      ) {
                        // Prevent default delete behaviour
                        e.preventDefault();

                        var _updatedSelection =
                          selectionStart - tabCharacter.length;

                        _this._applyEdits({
                          // Remove tab character at caret
                          value:
                            value.substring(
                              0,
                              selectionStart - tabCharacter.length
                            ) + value.substring(selectionEnd),
                          // Update caret position
                          selectionStart: _updatedSelection,
                          selectionEnd: _updatedSelection
                        });
                      }
                    } else if (e.keyCode === KEYCODE_ENTER) {
                      // Ignore selections
                      if (selectionStart === selectionEnd) {
                        // Get the current line
                        var line = _this._getLines(value, selectionStart).pop();
                        var matches = line.match(/^\s+/);

                        if (matches && matches[0]) {
                          e.preventDefault();

                          // Preserve indentation on inserting a new line
                          var indent = "\n" + matches[0];
                          var _updatedSelection2 =
                            selectionStart + indent.length;

                          _this._applyEdits({
                            // Insert indentation character at caret
                            value:
                              value.substring(0, selectionStart) +
                              indent +
                              value.substring(selectionEnd),
                            // Update caret position
                            selectionStart: _updatedSelection2,
                            selectionEnd: _updatedSelection2
                          });
                        }
                      }
                    } else if (
                      e.keyCode === KEYCODE_PARENS ||
                      e.keyCode === KEYCODE_BRACKETS ||
                      e.keyCode === KEYCODE_QUOTE ||
                      e.keyCode === KEYCODE_BACK_QUOTE
                    ) {
                      var chars = void 0;

                      if (e.keyCode === KEYCODE_PARENS && e.shiftKey) {
                        chars = ["(", ")"];
                      } else if (e.keyCode === KEYCODE_BRACKETS) {
                        if (e.shiftKey) {
                          chars = ["{", "}"];
                        } else {
                          chars = ["[", "]"];
                        }
                      } else if (e.keyCode === KEYCODE_QUOTE) {
                        if (e.shiftKey) {
                          chars = ['"', '"'];
                        } else {
                          chars = ["'", "'"];
                        }
                      } else if (
                        e.keyCode === KEYCODE_BACK_QUOTE &&
                        !e.shiftKey
                      ) {
                        chars = ["`", "`"];
                      }

                      // If text is selected, wrap them in the characters
                      if (selectionStart !== selectionEnd && chars) {
                        e.preventDefault();

                        _this._applyEdits({
                          value:
                            value.substring(0, selectionStart) +
                            chars[0] +
                            value.substring(selectionStart, selectionEnd) +
                            chars[1] +
                            value.substring(selectionEnd),
                          // Update caret position
                          selectionStart: selectionStart,
                          selectionEnd: selectionEnd + 2
                        });
                      }
                    } else if (
                      (isMacLike // Trigger undo with ⌘+Z on Mac
                        ? e.metaKey && e.keyCode === KEYCODE_Z // Trigger undo with Ctrl+Z on other platforms
                        : e.ctrlKey && e.keyCode === KEYCODE_Z) &&
                      !e.shiftKey &&
                      !e.altKey
                    ) {
                      e.preventDefault();

                      _this._undoEdit();
                    } else if (
                      (isMacLike // Trigger redo with ⌘+Shift+Z on Mac
                        ? e.metaKey && e.keyCode === KEYCODE_Z && e.shiftKey
                        : isWindows // Trigger redo with Ctrl+Y on Windows
                        ? e.ctrlKey && e.keyCode === KEYCODE_Y // Trigger redo with Ctrl+Shift+Z on other platforms
                        : e.ctrlKey && e.keyCode === KEYCODE_Z && e.shiftKey) &&
                      !e.altKey
                    ) {
                      e.preventDefault();

                      _this._redoEdit();
                    } else if (
                      e.keyCode === KEYCODE_M &&
                      e.ctrlKey &&
                      (isMacLike ? e.shiftKey : true)
                    ) {
                      e.preventDefault();

                      // Toggle capturing tab key so users can focus away
                      _this.setState(function(state) {
                        return {
                          capture: !state.capture
                        };
                      });
                    }
                  }),
                  (_this._handleChange = function(e) {
                    var _e$target2 = e.target,
                      value = _e$target2.value,
                      selectionStart = _e$target2.selectionStart,
                      selectionEnd = _e$target2.selectionEnd;

                    _this._recordChange(
                      {
                        value: value,
                        selectionStart: selectionStart,
                        selectionEnd: selectionEnd
                      },
                      true
                    );

                    _this.props.onValueChange(value);
                  }),
                  (_this._history = {
                    stack: [],
                    offset: -1
                  }),
                  _temp)),
                _possibleConstructorReturn(_this, _ret)
              );
            }

            _createClass(Editor, [
              {
                key: "componentDidMount",
                value: function componentDidMount() {
                  this._recordCurrentState();
                }
              },
              {
                key: "render",
                value: function render() {
                  var _this2 = this;

                  var _props = this.props,
                    value = _props.value,
                    style = _props.style,
                    padding = _props.padding,
                    highlight = _props.highlight,
                    textareaId = _props.textareaId,
                    textareaClassName = _props.textareaClassName,
                    autoFocus = _props.autoFocus,
                    disabled = _props.disabled,
                    form = _props.form,
                    maxLength = _props.maxLength,
                    minLength = _props.minLength,
                    name = _props.name,
                    placeholder = _props.placeholder,
                    readOnly = _props.readOnly,
                    required = _props.required,
                    onClick = _props.onClick,
                    onFocus = _props.onFocus,
                    onBlur = _props.onBlur,
                    onKeyUp = _props.onKeyUp,
                    onKeyDown = _props.onKeyDown,
                    onValueChange = _props.onValueChange,
                    tabSize = _props.tabSize,
                    insertSpaces = _props.insertSpaces,
                    ignoreTabKey = _props.ignoreTabKey,
                    preClassName = _props.preClassName,
                    rest = _objectWithoutProperties(_props, [
                      "value",
                      "style",
                      "padding",
                      "highlight",
                      "textareaId",
                      "textareaClassName",
                      "autoFocus",
                      "disabled",
                      "form",
                      "maxLength",
                      "minLength",
                      "name",
                      "placeholder",
                      "readOnly",
                      "required",
                      "onClick",
                      "onFocus",
                      "onBlur",
                      "onKeyUp",
                      "onKeyDown",
                      "onValueChange",
                      "tabSize",
                      "insertSpaces",
                      "ignoreTabKey",
                      "preClassName"
                    ]);

                  var contentStyle = {
                    paddingTop: padding,
                    paddingRight: padding,
                    paddingBottom: padding,
                    paddingLeft: padding
                  };

                  var highlighted = highlight(value);

                  return React.createElement(
                    "div",
                    _extends({}, rest, {
                      style: _extends({}, styles.container, style)
                    }),
                    React.createElement("textarea", {
                      ref: function ref(c) {
                        return (_this2._input = c);
                      },
                      style: _extends(
                        {},
                        styles.editor,
                        styles.textarea,
                        contentStyle
                      ),
                      className:
                        className +
                        (textareaClassName ? " " + textareaClassName : ""),
                      id: textareaId,
                      value: value,
                      onChange: this._handleChange,
                      onKeyDown: this._handleKeyDown,
                      onClick: onClick,
                      onKeyUp: onKeyUp,
                      onFocus: onFocus,
                      onBlur: onBlur,
                      disabled: disabled,
                      form: form,
                      maxLength: maxLength,
                      minLength: minLength,
                      name: name,
                      placeholder: placeholder,
                      readOnly: readOnly,
                      required: required,
                      autoFocus: autoFocus,
                      autoCapitalize: "off",
                      autoComplete: "off",
                      autoCorrect: "off",
                      spellCheck: false,
                      "data-gramm": false
                    }),
                    React.createElement(
                      "pre",
                      _extends(
                        {
                          className: preClassName,
                          "aria-hidden": "true",
                          style: _extends(
                            {},
                            styles.editor,
                            styles.highlight,
                            contentStyle
                          )
                        },
                        typeof highlighted === "string"
                          ? {
                              dangerouslySetInnerHTML: {
                                __html: highlighted + "<br />"
                              }
                            }
                          : { children: highlighted }
                      )
                    ),
                    React.createElement("style", {
                      type: "text/css",
                      dangerouslySetInnerHTML: { __html: cssText }
                    })
                  );
                }
              },
              {
                key: "session",
                get: function get() {
                  return {
                    history: this._history
                  };
                },
                set: function set(session) {
                  this._history = session.history;
                }
              }
            ]);

            return Editor;
          })(React.Component);

          Editor.defaultProps = {
            tabSize: 2,
            insertSpaces: true,
            ignoreTabKey: false,
            padding: 0
          };
          exports.default = Editor;

          var styles = {
            container: {
              position: "relative",
              textAlign: "left",
              boxSizing: "border-box",
              padding: 0,
              overflow: "hidden"
            },
            textarea: {
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              resize: "none",
              color: "inherit",
              overflow: "hidden",
              MozOsxFontSmoothing: "grayscale",
              WebkitFontSmoothing: "antialiased",
              WebkitTextFillColor: "transparent"
            },
            highlight: {
              position: "relative",
              pointerEvents: "none"
            },
            editor: {
              margin: 0,
              border: 0,
              background: "none",
              boxSizing: "inherit",
              display: "inherit",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontStyle: "inherit",
              fontVariantLigatures: "inherit",
              fontWeight: "inherit",
              letterSpacing: "inherit",
              lineHeight: "inherit",
              tabSize: "inherit",
              textIndent: "inherit",
              textRendering: "inherit",
              textTransform: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "keep-all",
              overflowWrap: "break-word"
            }
          };
          //# sourceMappingURL=index.js.map
          /* WEBPACK VAR INJECTION */
        }.call(
          this,
          __webpack_require__(
            /*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"
          )
        ));

        /***/
      },

    /***/ "./node_modules/react/cjs/react.development.js":
      /*!*****************************************************!*\
  !*** ./node_modules/react/cjs/react.development.js ***!
  \*****************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        /** @license React v16.13.1
         * react.development.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */

        if (true) {
          (function() {
            "use strict";

            var _assign = __webpack_require__(
              /*! object-assign */ "./node_modules/object-assign/index.js"
            );
            var checkPropTypes = __webpack_require__(
              /*! prop-types/checkPropTypes */ "./node_modules/prop-types/checkPropTypes.js"
            );

            var ReactVersion = "16.13.1";

            // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
            // nor polyfill, then a plain number is used for performance.
            var hasSymbol = typeof Symbol === "function" && Symbol.for;
            var REACT_ELEMENT_TYPE = hasSymbol
              ? Symbol.for("react.element")
              : 0xeac7;
            var REACT_PORTAL_TYPE = hasSymbol
              ? Symbol.for("react.portal")
              : 0xeaca;
            var REACT_FRAGMENT_TYPE = hasSymbol
              ? Symbol.for("react.fragment")
              : 0xeacb;
            var REACT_STRICT_MODE_TYPE = hasSymbol
              ? Symbol.for("react.strict_mode")
              : 0xeacc;
            var REACT_PROFILER_TYPE = hasSymbol
              ? Symbol.for("react.profiler")
              : 0xead2;
            var REACT_PROVIDER_TYPE = hasSymbol
              ? Symbol.for("react.provider")
              : 0xeacd;
            var REACT_CONTEXT_TYPE = hasSymbol
              ? Symbol.for("react.context")
              : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
            var REACT_CONCURRENT_MODE_TYPE = hasSymbol
              ? Symbol.for("react.concurrent_mode")
              : 0xeacf;
            var REACT_FORWARD_REF_TYPE = hasSymbol
              ? Symbol.for("react.forward_ref")
              : 0xead0;
            var REACT_SUSPENSE_TYPE = hasSymbol
              ? Symbol.for("react.suspense")
              : 0xead1;
            var REACT_SUSPENSE_LIST_TYPE = hasSymbol
              ? Symbol.for("react.suspense_list")
              : 0xead8;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 0xead3;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 0xead4;
            var REACT_BLOCK_TYPE = hasSymbol
              ? Symbol.for("react.block")
              : 0xead9;
            var REACT_FUNDAMENTAL_TYPE = hasSymbol
              ? Symbol.for("react.fundamental")
              : 0xead5;
            var REACT_RESPONDER_TYPE = hasSymbol
              ? Symbol.for("react.responder")
              : 0xead6;
            var REACT_SCOPE_TYPE = hasSymbol
              ? Symbol.for("react.scope")
              : 0xead7;
            var MAYBE_ITERATOR_SYMBOL =
              typeof Symbol === "function" && Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = "@@iterator";
            function getIteratorFn(maybeIterable) {
              if (maybeIterable === null || typeof maybeIterable !== "object") {
                return null;
              }

              var maybeIterator =
                (MAYBE_ITERATOR_SYMBOL &&
                  maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
                maybeIterable[FAUX_ITERATOR_SYMBOL];

              if (typeof maybeIterator === "function") {
                return maybeIterator;
              }

              return null;
            }

            /**
             * Keeps track of the current dispatcher.
             */
            var ReactCurrentDispatcher = {
              /**
               * @internal
               * @type {ReactComponent}
               */
              current: null
            };

            /**
             * Keeps track of the current batch's configuration such as how long an update
             * should suspend for if it needs to.
             */
            var ReactCurrentBatchConfig = {
              suspense: null
            };

            /**
             * Keeps track of the current owner.
             *
             * The current owner is the component who should own any components that are
             * currently being constructed.
             */
            var ReactCurrentOwner = {
              /**
               * @internal
               * @type {ReactComponent}
               */
              current: null
            };

            var BEFORE_SLASH_RE = /^(.*)[\\\/]/;
            function describeComponentFrame(name, source, ownerName) {
              var sourceInfo = "";

              if (source) {
                var path = source.fileName;
                var fileName = path.replace(BEFORE_SLASH_RE, "");

                {
                  // In DEV, include code for a common special case:
                  // prefer "folder/index.js" instead of just "index.js".
                  if (/^index\./.test(fileName)) {
                    var match = path.match(BEFORE_SLASH_RE);

                    if (match) {
                      var pathBeforeSlash = match[1];

                      if (pathBeforeSlash) {
                        var folderName = pathBeforeSlash.replace(
                          BEFORE_SLASH_RE,
                          ""
                        );
                        fileName = folderName + "/" + fileName;
                      }
                    }
                  }
                }

                sourceInfo = " (at " + fileName + ":" + source.lineNumber + ")";
              } else if (ownerName) {
                sourceInfo = " (created by " + ownerName + ")";
              }

              return "\n    in " + (name || "Unknown") + sourceInfo;
            }

            var Resolved = 1;
            function refineResolvedLazyComponent(lazyComponent) {
              return lazyComponent._status === Resolved
                ? lazyComponent._result
                : null;
            }

            function getWrappedName(outerType, innerType, wrapperName) {
              var functionName = innerType.displayName || innerType.name || "";
              return (
                outerType.displayName ||
                (functionName !== ""
                  ? wrapperName + "(" + functionName + ")"
                  : wrapperName)
              );
            }

            function getComponentName(type) {
              if (type == null) {
                // Host root, text node or just invalid type.
                return null;
              }

              {
                if (typeof type.tag === "number") {
                  error(
                    "Received an unexpected object in getComponentName(). " +
                      "This is likely a bug in React. Please file an issue."
                  );
                }
              }

              if (typeof type === "function") {
                return type.displayName || type.name || null;
              }

              if (typeof type === "string") {
                return type;
              }

              switch (type) {
                case REACT_FRAGMENT_TYPE:
                  return "Fragment";

                case REACT_PORTAL_TYPE:
                  return "Portal";

                case REACT_PROFILER_TYPE:
                  return "Profiler";

                case REACT_STRICT_MODE_TYPE:
                  return "StrictMode";

                case REACT_SUSPENSE_TYPE:
                  return "Suspense";

                case REACT_SUSPENSE_LIST_TYPE:
                  return "SuspenseList";
              }

              if (typeof type === "object") {
                switch (type.$$typeof) {
                  case REACT_CONTEXT_TYPE:
                    return "Context.Consumer";

                  case REACT_PROVIDER_TYPE:
                    return "Context.Provider";

                  case REACT_FORWARD_REF_TYPE:
                    return getWrappedName(type, type.render, "ForwardRef");

                  case REACT_MEMO_TYPE:
                    return getComponentName(type.type);

                  case REACT_BLOCK_TYPE:
                    return getComponentName(type.render);

                  case REACT_LAZY_TYPE: {
                    var thenable = type;
                    var resolvedThenable = refineResolvedLazyComponent(
                      thenable
                    );

                    if (resolvedThenable) {
                      return getComponentName(resolvedThenable);
                    }

                    break;
                  }
                }
              }

              return null;
            }

            var ReactDebugCurrentFrame = {};
            var currentlyValidatingElement = null;
            function setCurrentlyValidatingElement(element) {
              {
                currentlyValidatingElement = element;
              }
            }

            {
              // Stack implementation injected by the current renderer.
              ReactDebugCurrentFrame.getCurrentStack = null;

              ReactDebugCurrentFrame.getStackAddendum = function() {
                var stack = ""; // Add an extra top frame while an element is being validated

                if (currentlyValidatingElement) {
                  var name = getComponentName(currentlyValidatingElement.type);
                  var owner = currentlyValidatingElement._owner;
                  stack += describeComponentFrame(
                    name,
                    currentlyValidatingElement._source,
                    owner && getComponentName(owner.type)
                  );
                } // Delegate to the injected renderer-specific implementation

                var impl = ReactDebugCurrentFrame.getCurrentStack;

                if (impl) {
                  stack += impl() || "";
                }

                return stack;
              };
            }

            /**
             * Used by act() to track whether you're inside an act() scope.
             */
            var IsSomeRendererActing = {
              current: false
            };

            var ReactSharedInternals = {
              ReactCurrentDispatcher: ReactCurrentDispatcher,
              ReactCurrentBatchConfig: ReactCurrentBatchConfig,
              ReactCurrentOwner: ReactCurrentOwner,
              IsSomeRendererActing: IsSomeRendererActing,
              // Used by renderers to avoid bundling object-assign twice in UMD bundles:
              assign: _assign
            };

            {
              _assign(ReactSharedInternals, {
                // These should not be included in production.
                ReactDebugCurrentFrame: ReactDebugCurrentFrame,
                // Shim for React DOM 16.0.0 which still destructured (but not used) this.
                // TODO: remove in React 17.0.
                ReactComponentTreeHook: {}
              });
            }

            // by calls to these methods by a Babel plugin.
            //
            // In PROD (or in packages without access to React internals),
            // they are left as they are instead.

            function warn(format) {
              {
                for (
                  var _len = arguments.length,
                    args = new Array(_len > 1 ? _len - 1 : 0),
                    _key = 1;
                  _key < _len;
                  _key++
                ) {
                  args[_key - 1] = arguments[_key];
                }

                printWarning("warn", format, args);
              }
            }
            function error(format) {
              {
                for (
                  var _len2 = arguments.length,
                    args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                    _key2 = 1;
                  _key2 < _len2;
                  _key2++
                ) {
                  args[_key2 - 1] = arguments[_key2];
                }

                printWarning("error", format, args);
              }
            }

            function printWarning(level, format, args) {
              // When changing this logic, you might want to also
              // update consoleWithStackDev.www.js as well.
              {
                var hasExistingStack =
                  args.length > 0 &&
                  typeof args[args.length - 1] === "string" &&
                  args[args.length - 1].indexOf("\n    in") === 0;

                if (!hasExistingStack) {
                  var ReactDebugCurrentFrame =
                    ReactSharedInternals.ReactDebugCurrentFrame;
                  var stack = ReactDebugCurrentFrame.getStackAddendum();

                  if (stack !== "") {
                    format += "%s";
                    args = args.concat([stack]);
                  }
                }

                var argsWithFormat = args.map(function(item) {
                  return "" + item;
                }); // Careful: RN currently depends on this prefix

                argsWithFormat.unshift("Warning: " + format); // We intentionally don't use spread (or .apply) directly because it
                // breaks IE9: https://github.com/facebook/react/issues/13610
                // eslint-disable-next-line react-internal/no-production-logging

                Function.prototype.apply.call(
                  console[level],
                  console,
                  argsWithFormat
                );

                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  var argIndex = 0;
                  var message =
                    "Warning: " +
                    format.replace(/%s/g, function() {
                      return args[argIndex++];
                    });
                  throw new Error(message);
                } catch (x) {}
              }
            }

            var didWarnStateUpdateForUnmountedComponent = {};

            function warnNoop(publicInstance, callerName) {
              {
                var _constructor = publicInstance.constructor;
                var componentName =
                  (_constructor &&
                    (_constructor.displayName || _constructor.name)) ||
                  "ReactClass";
                var warningKey = componentName + "." + callerName;

                if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
                  return;
                }

                error(
                  "Can't call %s on a component that is not yet mounted. " +
                    "This is a no-op, but it might indicate a bug in your application. " +
                    "Instead, assign to `this.state` directly or define a `state = {};` " +
                    "class property with the desired state in the %s component.",
                  callerName,
                  componentName
                );

                didWarnStateUpdateForUnmountedComponent[warningKey] = true;
              }
            }
            /**
             * This is the abstract API for an update queue.
             */

            var ReactNoopUpdateQueue = {
              /**
               * Checks whether or not this composite component is mounted.
               * @param {ReactClass} publicInstance The instance we want to test.
               * @return {boolean} True if mounted, false otherwise.
               * @protected
               * @final
               */
              isMounted: function(publicInstance) {
                return false;
              },

              /**
               * Forces an update. This should only be invoked when it is known with
               * certainty that we are **not** in a DOM transaction.
               *
               * You may want to call this when you know that some deeper aspect of the
               * component's state has changed but `setState` was not called.
               *
               * This will not invoke `shouldComponentUpdate`, but it will invoke
               * `componentWillUpdate` and `componentDidUpdate`.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueForceUpdate: function(
                publicInstance,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, "forceUpdate");
              },

              /**
               * Replaces all of the state. Always use this or `setState` to mutate state.
               * You should treat `this.state` as immutable.
               *
               * There is no guarantee that `this.state` will be immediately updated, so
               * accessing `this.state` after calling this method may return the old value.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} completeState Next state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueReplaceState: function(
                publicInstance,
                completeState,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, "replaceState");
              },

              /**
               * Sets a subset of the state. This only exists because _pendingState is
               * internal. This provides a merging strategy that is not available to deep
               * properties which is confusing. TODO: Expose pendingState or don't use it
               * during the merge.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} partialState Next partial state to be merged with state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} Name of the calling function in the public API.
               * @internal
               */
              enqueueSetState: function(
                publicInstance,
                partialState,
                callback,
                callerName
              ) {
                warnNoop(publicInstance, "setState");
              }
            };

            var emptyObject = {};

            {
              Object.freeze(emptyObject);
            }
            /**
             * Base class helpers for the updating state of a component.
             */

            function Component(props, context, updater) {
              this.props = props;
              this.context = context; // If a component has string refs, we will assign a different object later.

              this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
              // renderer.

              this.updater = updater || ReactNoopUpdateQueue;
            }

            Component.prototype.isReactComponent = {};
            /**
             * Sets a subset of the state. Always use this to mutate
             * state. You should treat `this.state` as immutable.
             *
             * There is no guarantee that `this.state` will be immediately updated, so
             * accessing `this.state` after calling this method may return the old value.
             *
             * There is no guarantee that calls to `setState` will run synchronously,
             * as they may eventually be batched together.  You can provide an optional
             * callback that will be executed when the call to setState is actually
             * completed.
             *
             * When a function is provided to setState, it will be called at some point in
             * the future (not synchronously). It will be called with the up to date
             * component arguments (state, props, context). These values can be different
             * from this.* because your function may be called after receiveProps but before
             * shouldComponentUpdate, and this new state, props, and context will not yet be
             * assigned to this.
             *
             * @param {object|function} partialState Next partial state or function to
             *        produce next partial state to be merged with current state.
             * @param {?function} callback Called after state is updated.
             * @final
             * @protected
             */

            Component.prototype.setState = function(partialState, callback) {
              if (
                !(
                  typeof partialState === "object" ||
                  typeof partialState === "function" ||
                  partialState == null
                )
              ) {
                {
                  throw Error(
                    "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
                  );
                }
              }

              this.updater.enqueueSetState(
                this,
                partialState,
                callback,
                "setState"
              );
            };
            /**
             * Forces an update. This should only be invoked when it is known with
             * certainty that we are **not** in a DOM transaction.
             *
             * You may want to call this when you know that some deeper aspect of the
             * component's state has changed but `setState` was not called.
             *
             * This will not invoke `shouldComponentUpdate`, but it will invoke
             * `componentWillUpdate` and `componentDidUpdate`.
             *
             * @param {?function} callback Called after update is complete.
             * @final
             * @protected
             */

            Component.prototype.forceUpdate = function(callback) {
              this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
            };
            /**
             * Deprecated APIs. These APIs used to exist on classic React classes but since
             * we would like to deprecate them, we're not going to move them over to this
             * modern base class. Instead, we define a getter that warns if it's accessed.
             */

            {
              var deprecatedAPIs = {
                isMounted: [
                  "isMounted",
                  "Instead, make sure to clean up subscriptions and pending requests in " +
                    "componentWillUnmount to prevent memory leaks."
                ],
                replaceState: [
                  "replaceState",
                  "Refactor your code to use setState instead (see " +
                    "https://github.com/facebook/react/issues/3236)."
                ]
              };

              var defineDeprecationWarning = function(methodName, info) {
                Object.defineProperty(Component.prototype, methodName, {
                  get: function() {
                    warn(
                      "%s(...) is deprecated in plain JavaScript React classes. %s",
                      info[0],
                      info[1]
                    );

                    return undefined;
                  }
                });
              };

              for (var fnName in deprecatedAPIs) {
                if (deprecatedAPIs.hasOwnProperty(fnName)) {
                  defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
                }
              }
            }

            function ComponentDummy() {}

            ComponentDummy.prototype = Component.prototype;
            /**
             * Convenience component with default shallow equality check for sCU.
             */

            function PureComponent(props, context, updater) {
              this.props = props;
              this.context = context; // If a component has string refs, we will assign a different object later.

              this.refs = emptyObject;
              this.updater = updater || ReactNoopUpdateQueue;
            }

            var pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
            pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

            _assign(pureComponentPrototype, Component.prototype);

            pureComponentPrototype.isPureReactComponent = true;

            // an immutable object with a single mutable value
            function createRef() {
              var refObject = {
                current: null
              };

              {
                Object.seal(refObject);
              }

              return refObject;
            }

            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var RESERVED_PROPS = {
              key: true,
              ref: true,
              __self: true,
              __source: true
            };
            var specialPropKeyWarningShown,
              specialPropRefWarningShown,
              didWarnAboutStringRefs;

            {
              didWarnAboutStringRefs = {};
            }

            function hasValidRef(config) {
              {
                if (hasOwnProperty.call(config, "ref")) {
                  var getter = Object.getOwnPropertyDescriptor(config, "ref")
                    .get;

                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }

              return config.ref !== undefined;
            }

            function hasValidKey(config) {
              {
                if (hasOwnProperty.call(config, "key")) {
                  var getter = Object.getOwnPropertyDescriptor(config, "key")
                    .get;

                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }

              return config.key !== undefined;
            }

            function defineKeyPropWarningGetter(props, displayName) {
              var warnAboutAccessingKey = function() {
                {
                  if (!specialPropKeyWarningShown) {
                    specialPropKeyWarningShown = true;

                    error(
                      "%s: `key` is not a prop. Trying to access it will result " +
                        "in `undefined` being returned. If you need to access the same " +
                        "value within the child component, you should pass it as a different " +
                        "prop. (https://fb.me/react-special-props)",
                      displayName
                    );
                  }
                }
              };

              warnAboutAccessingKey.isReactWarning = true;
              Object.defineProperty(props, "key", {
                get: warnAboutAccessingKey,
                configurable: true
              });
            }

            function defineRefPropWarningGetter(props, displayName) {
              var warnAboutAccessingRef = function() {
                {
                  if (!specialPropRefWarningShown) {
                    specialPropRefWarningShown = true;

                    error(
                      "%s: `ref` is not a prop. Trying to access it will result " +
                        "in `undefined` being returned. If you need to access the same " +
                        "value within the child component, you should pass it as a different " +
                        "prop. (https://fb.me/react-special-props)",
                      displayName
                    );
                  }
                }
              };

              warnAboutAccessingRef.isReactWarning = true;
              Object.defineProperty(props, "ref", {
                get: warnAboutAccessingRef,
                configurable: true
              });
            }

            function warnIfStringRefCannotBeAutoConverted(config) {
              {
                if (
                  typeof config.ref === "string" &&
                  ReactCurrentOwner.current &&
                  config.__self &&
                  ReactCurrentOwner.current.stateNode !== config.__self
                ) {
                  var componentName = getComponentName(
                    ReactCurrentOwner.current.type
                  );

                  if (!didWarnAboutStringRefs[componentName]) {
                    error(
                      'Component "%s" contains the string ref "%s". ' +
                        "Support for string refs will be removed in a future major release. " +
                        "This case cannot be automatically converted to an arrow function. " +
                        "We ask you to manually fix this case by using useRef() or createRef() instead. " +
                        "Learn more about using refs safely here: " +
                        "https://fb.me/react-strict-mode-string-ref",
                      getComponentName(ReactCurrentOwner.current.type),
                      config.ref
                    );

                    didWarnAboutStringRefs[componentName] = true;
                  }
                }
              }
            }
            /**
             * Factory method to create a new React element. This no longer adheres to
             * the class pattern, so do not use new to call it. Also, instanceof check
             * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
             * if something is a React Element.
             *
             * @param {*} type
             * @param {*} props
             * @param {*} key
             * @param {string|object} ref
             * @param {*} owner
             * @param {*} self A *temporary* helper to detect places where `this` is
             * different from the `owner` when React.createElement is called, so that we
             * can warn. We want to get rid of owner and replace string `ref`s with arrow
             * functions, and as long as `this` and owner are the same, there will be no
             * change in behavior.
             * @param {*} source An annotation object (added by a transpiler or otherwise)
             * indicating filename, line number, and/or other information.
             * @internal
             */

            var ReactElement = function(
              type,
              key,
              ref,
              self,
              source,
              owner,
              props
            ) {
              var element = {
                // This tag allows us to uniquely identify this as a React Element
                $$typeof: REACT_ELEMENT_TYPE,
                // Built-in properties that belong on the element
                type: type,
                key: key,
                ref: ref,
                props: props,
                // Record the component responsible for creating this element.
                _owner: owner
              };

              {
                // The validation flag is currently mutative. We put it on
                // an external backing store so that we can freeze the whole object.
                // This can be replaced with a WeakMap once they are implemented in
                // commonly used development environments.
                element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
                // the validation flag non-enumerable (where possible, which should
                // include every environment we run tests in), so the test framework
                // ignores it.

                Object.defineProperty(element._store, "validated", {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: false
                }); // self and source are DEV only properties.

                Object.defineProperty(element, "_self", {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: self
                }); // Two elements created in two different places should be considered
                // equal for testing purposes and therefore we hide it from enumeration.

                Object.defineProperty(element, "_source", {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: source
                });

                if (Object.freeze) {
                  Object.freeze(element.props);
                  Object.freeze(element);
                }
              }

              return element;
            };
            /**
             * Create and return a new ReactElement of the given type.
             * See https://reactjs.org/docs/react-api.html#createelement
             */

            function createElement(type, config, children) {
              var propName; // Reserved names are extracted

              var props = {};
              var key = null;
              var ref = null;
              var self = null;
              var source = null;

              if (config != null) {
                if (hasValidRef(config)) {
                  ref = config.ref;

                  {
                    warnIfStringRefCannotBeAutoConverted(config);
                  }
                }

                if (hasValidKey(config)) {
                  key = "" + config.key;
                }

                self = config.__self === undefined ? null : config.__self;
                source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

                for (propName in config) {
                  if (
                    hasOwnProperty.call(config, propName) &&
                    !RESERVED_PROPS.hasOwnProperty(propName)
                  ) {
                    props[propName] = config[propName];
                  }
                }
              } // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.

              var childrenLength = arguments.length - 2;

              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);

                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }

                {
                  if (Object.freeze) {
                    Object.freeze(childArray);
                  }
                }

                props.children = childArray;
              } // Resolve default props

              if (type && type.defaultProps) {
                var defaultProps = type.defaultProps;

                for (propName in defaultProps) {
                  if (props[propName] === undefined) {
                    props[propName] = defaultProps[propName];
                  }
                }
              }

              {
                if (key || ref) {
                  var displayName =
                    typeof type === "function"
                      ? type.displayName || type.name || "Unknown"
                      : type;

                  if (key) {
                    defineKeyPropWarningGetter(props, displayName);
                  }

                  if (ref) {
                    defineRefPropWarningGetter(props, displayName);
                  }
                }
              }

              return ReactElement(
                type,
                key,
                ref,
                self,
                source,
                ReactCurrentOwner.current,
                props
              );
            }
            function cloneAndReplaceKey(oldElement, newKey) {
              var newElement = ReactElement(
                oldElement.type,
                newKey,
                oldElement.ref,
                oldElement._self,
                oldElement._source,
                oldElement._owner,
                oldElement.props
              );
              return newElement;
            }
            /**
             * Clone and return a new ReactElement using element as the starting point.
             * See https://reactjs.org/docs/react-api.html#cloneelement
             */

            function cloneElement(element, config, children) {
              if (!!(element === null || element === undefined)) {
                {
                  throw Error(
                    "React.cloneElement(...): The argument must be a React element, but you passed " +
                      element +
                      "."
                  );
                }
              }

              var propName; // Original props are copied

              var props = _assign({}, element.props); // Reserved names are extracted

              var key = element.key;
              var ref = element.ref; // Self is preserved since the owner is preserved.

              var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
              // transpiler, and the original source is probably a better indicator of the
              // true owner.

              var source = element._source; // Owner will be preserved, unless ref is overridden

              var owner = element._owner;

              if (config != null) {
                if (hasValidRef(config)) {
                  // Silently steal the ref from the parent.
                  ref = config.ref;
                  owner = ReactCurrentOwner.current;
                }

                if (hasValidKey(config)) {
                  key = "" + config.key;
                } // Remaining properties override existing props

                var defaultProps;

                if (element.type && element.type.defaultProps) {
                  defaultProps = element.type.defaultProps;
                }

                for (propName in config) {
                  if (
                    hasOwnProperty.call(config, propName) &&
                    !RESERVED_PROPS.hasOwnProperty(propName)
                  ) {
                    if (
                      config[propName] === undefined &&
                      defaultProps !== undefined
                    ) {
                      // Resolve default props
                      props[propName] = defaultProps[propName];
                    } else {
                      props[propName] = config[propName];
                    }
                  }
                }
              } // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.

              var childrenLength = arguments.length - 2;

              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);

                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }

                props.children = childArray;
              }

              return ReactElement(
                element.type,
                key,
                ref,
                self,
                source,
                owner,
                props
              );
            }
            /**
             * Verifies the object is a ReactElement.
             * See https://reactjs.org/docs/react-api.html#isvalidelement
             * @param {?object} object
             * @return {boolean} True if `object` is a ReactElement.
             * @final
             */

            function isValidElement(object) {
              return (
                typeof object === "object" &&
                object !== null &&
                object.$$typeof === REACT_ELEMENT_TYPE
              );
            }

            var SEPARATOR = ".";
            var SUBSEPARATOR = ":";
            /**
             * Escape and wrap key so it is safe to use as a reactid
             *
             * @param {string} key to be escaped.
             * @return {string} the escaped key.
             */

            function escape(key) {
              var escapeRegex = /[=:]/g;
              var escaperLookup = {
                "=": "=0",
                ":": "=2"
              };
              var escapedString = ("" + key).replace(escapeRegex, function(
                match
              ) {
                return escaperLookup[match];
              });
              return "$" + escapedString;
            }
            /**
             * TODO: Test that a single child and an array with one item have the same key
             * pattern.
             */

            var didWarnAboutMaps = false;
            var userProvidedKeyEscapeRegex = /\/+/g;

            function escapeUserProvidedKey(text) {
              return ("" + text).replace(userProvidedKeyEscapeRegex, "$&/");
            }

            var POOL_SIZE = 10;
            var traverseContextPool = [];

            function getPooledTraverseContext(
              mapResult,
              keyPrefix,
              mapFunction,
              mapContext
            ) {
              if (traverseContextPool.length) {
                var traverseContext = traverseContextPool.pop();
                traverseContext.result = mapResult;
                traverseContext.keyPrefix = keyPrefix;
                traverseContext.func = mapFunction;
                traverseContext.context = mapContext;
                traverseContext.count = 0;
                return traverseContext;
              } else {
                return {
                  result: mapResult,
                  keyPrefix: keyPrefix,
                  func: mapFunction,
                  context: mapContext,
                  count: 0
                };
              }
            }

            function releaseTraverseContext(traverseContext) {
              traverseContext.result = null;
              traverseContext.keyPrefix = null;
              traverseContext.func = null;
              traverseContext.context = null;
              traverseContext.count = 0;

              if (traverseContextPool.length < POOL_SIZE) {
                traverseContextPool.push(traverseContext);
              }
            }
            /**
             * @param {?*} children Children tree container.
             * @param {!string} nameSoFar Name of the key path so far.
             * @param {!function} callback Callback to invoke with each child found.
             * @param {?*} traverseContext Used to pass information throughout the traversal
             * process.
             * @return {!number} The number of children in this subtree.
             */

            function traverseAllChildrenImpl(
              children,
              nameSoFar,
              callback,
              traverseContext
            ) {
              var type = typeof children;

              if (type === "undefined" || type === "boolean") {
                // All of the above are perceived as null.
                children = null;
              }

              var invokeCallback = false;

              if (children === null) {
                invokeCallback = true;
              } else {
                switch (type) {
                  case "string":
                  case "number":
                    invokeCallback = true;
                    break;

                  case "object":
                    switch (children.$$typeof) {
                      case REACT_ELEMENT_TYPE:
                      case REACT_PORTAL_TYPE:
                        invokeCallback = true;
                    }
                }
              }

              if (invokeCallback) {
                callback(
                  traverseContext,
                  children, // If it's the only child, treat the name as if it was wrapped in an array
                  // so that it's consistent if the number of children grows.
                  nameSoFar === ""
                    ? SEPARATOR + getComponentKey(children, 0)
                    : nameSoFar
                );
                return 1;
              }

              var child;
              var nextName;
              var subtreeCount = 0; // Count of children found in the current subtree.

              var nextNamePrefix =
                nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;

              if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                  child = children[i];
                  nextName = nextNamePrefix + getComponentKey(child, i);
                  subtreeCount += traverseAllChildrenImpl(
                    child,
                    nextName,
                    callback,
                    traverseContext
                  );
                }
              } else {
                var iteratorFn = getIteratorFn(children);

                if (typeof iteratorFn === "function") {
                  {
                    // Warn about using Maps as children
                    if (iteratorFn === children.entries) {
                      if (!didWarnAboutMaps) {
                        warn(
                          "Using Maps as children is deprecated and will be removed in " +
                            "a future major release. Consider converting children to " +
                            "an array of keyed ReactElements instead."
                        );
                      }

                      didWarnAboutMaps = true;
                    }
                  }

                  var iterator = iteratorFn.call(children);
                  var step;
                  var ii = 0;

                  while (!(step = iterator.next()).done) {
                    child = step.value;
                    nextName = nextNamePrefix + getComponentKey(child, ii++);
                    subtreeCount += traverseAllChildrenImpl(
                      child,
                      nextName,
                      callback,
                      traverseContext
                    );
                  }
                } else if (type === "object") {
                  var addendum = "";

                  {
                    addendum =
                      " If you meant to render a collection of children, use an array " +
                      "instead." +
                      ReactDebugCurrentFrame.getStackAddendum();
                  }

                  var childrenString = "" + children;

                  {
                    {
                      throw Error(
                        "Objects are not valid as a React child (found: " +
                          (childrenString === "[object Object]"
                            ? "object with keys {" +
                              Object.keys(children).join(", ") +
                              "}"
                            : childrenString) +
                          ")." +
                          addendum
                      );
                    }
                  }
                }
              }

              return subtreeCount;
            }
            /**
             * Traverses children that are typically specified as `props.children`, but
             * might also be specified through attributes:
             *
             * - `traverseAllChildren(this.props.children, ...)`
             * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
             *
             * The `traverseContext` is an optional argument that is passed through the
             * entire traversal. It can be used to store accumulations or anything else that
             * the callback might find relevant.
             *
             * @param {?*} children Children tree object.
             * @param {!function} callback To invoke upon traversing each child.
             * @param {?*} traverseContext Context for traversal.
             * @return {!number} The number of children in this subtree.
             */

            function traverseAllChildren(children, callback, traverseContext) {
              if (children == null) {
                return 0;
              }

              return traverseAllChildrenImpl(
                children,
                "",
                callback,
                traverseContext
              );
            }
            /**
             * Generate a key string that identifies a component within a set.
             *
             * @param {*} component A component that could contain a manual key.
             * @param {number} index Index that is used if a manual key is not provided.
             * @return {string}
             */

            function getComponentKey(component, index) {
              // Do some typechecking here since we call this blindly. We want to ensure
              // that we don't block potential future ES APIs.
              if (
                typeof component === "object" &&
                component !== null &&
                component.key != null
              ) {
                // Explicit key
                return escape(component.key);
              } // Implicit key determined by the index in the set

              return index.toString(36);
            }

            function forEachSingleChild(bookKeeping, child, name) {
              var func = bookKeeping.func,
                context = bookKeeping.context;
              func.call(context, child, bookKeeping.count++);
            }
            /**
             * Iterates through children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
             *
             * The provided forEachFunc(child, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} forEachFunc
             * @param {*} forEachContext Context for forEachContext.
             */

            function forEachChildren(children, forEachFunc, forEachContext) {
              if (children == null) {
                return children;
              }

              var traverseContext = getPooledTraverseContext(
                null,
                null,
                forEachFunc,
                forEachContext
              );
              traverseAllChildren(
                children,
                forEachSingleChild,
                traverseContext
              );
              releaseTraverseContext(traverseContext);
            }

            function mapSingleChildIntoContext(bookKeeping, child, childKey) {
              var result = bookKeeping.result,
                keyPrefix = bookKeeping.keyPrefix,
                func = bookKeeping.func,
                context = bookKeeping.context;
              var mappedChild = func.call(context, child, bookKeeping.count++);

              if (Array.isArray(mappedChild)) {
                mapIntoWithKeyPrefixInternal(
                  mappedChild,
                  result,
                  childKey,
                  function(c) {
                    return c;
                  }
                );
              } else if (mappedChild != null) {
                if (isValidElement(mappedChild)) {
                  mappedChild = cloneAndReplaceKey(
                    mappedChild, // Keep both the (mapped) and old keys if they differ, just as
                    // traverseAllChildren used to do for objects as children
                    keyPrefix +
                      (mappedChild.key &&
                      (!child || child.key !== mappedChild.key)
                        ? escapeUserProvidedKey(mappedChild.key) + "/"
                        : "") +
                      childKey
                  );
                }

                result.push(mappedChild);
              }
            }

            function mapIntoWithKeyPrefixInternal(
              children,
              array,
              prefix,
              func,
              context
            ) {
              var escapedPrefix = "";

              if (prefix != null) {
                escapedPrefix = escapeUserProvidedKey(prefix) + "/";
              }

              var traverseContext = getPooledTraverseContext(
                array,
                escapedPrefix,
                func,
                context
              );
              traverseAllChildren(
                children,
                mapSingleChildIntoContext,
                traverseContext
              );
              releaseTraverseContext(traverseContext);
            }
            /**
             * Maps children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenmap
             *
             * The provided mapFunction(child, key, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} func The map function.
             * @param {*} context Context for mapFunction.
             * @return {object} Object containing the ordered map of results.
             */

            function mapChildren(children, func, context) {
              if (children == null) {
                return children;
              }

              var result = [];
              mapIntoWithKeyPrefixInternal(
                children,
                result,
                null,
                func,
                context
              );
              return result;
            }
            /**
             * Count the number of children that are typically specified as
             * `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrencount
             *
             * @param {?*} children Children tree container.
             * @return {number} The number of children.
             */

            function countChildren(children) {
              return traverseAllChildren(
                children,
                function() {
                  return null;
                },
                null
              );
            }
            /**
             * Flatten a children object (typically specified as `props.children`) and
             * return an array with appropriately re-keyed children.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
             */

            function toArray(children) {
              var result = [];
              mapIntoWithKeyPrefixInternal(children, result, null, function(
                child
              ) {
                return child;
              });
              return result;
            }
            /**
             * Returns the first child in a collection of children and verifies that there
             * is only one child in the collection.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenonly
             *
             * The current implementation of this function assumes that a single child gets
             * passed without a wrapper, but the purpose of this helper function is to
             * abstract away the particular structure of children.
             *
             * @param {?object} children Child collection structure.
             * @return {ReactElement} The first and only `ReactElement` contained in the
             * structure.
             */

            function onlyChild(children) {
              if (!isValidElement(children)) {
                {
                  throw Error(
                    "React.Children.only expected to receive a single React element child."
                  );
                }
              }

              return children;
            }

            function createContext(defaultValue, calculateChangedBits) {
              if (calculateChangedBits === undefined) {
                calculateChangedBits = null;
              } else {
                {
                  if (
                    calculateChangedBits !== null &&
                    typeof calculateChangedBits !== "function"
                  ) {
                    error(
                      "createContext: Expected the optional second argument to be a " +
                        "function. Instead received: %s",
                      calculateChangedBits
                    );
                  }
                }
              }

              var context = {
                $$typeof: REACT_CONTEXT_TYPE,
                _calculateChangedBits: calculateChangedBits,
                // As a workaround to support multiple concurrent renderers, we categorize
                // some renderers as primary and others as secondary. We only expect
                // there to be two concurrent renderers at most: React Native (primary) and
                // Fabric (secondary); React DOM (primary) and React ART (secondary).
                // Secondary renderers store their context values on separate fields.
                _currentValue: defaultValue,
                _currentValue2: defaultValue,
                // Used to track how many concurrent renderers this context currently
                // supports within in a single renderer. Such as parallel server rendering.
                _threadCount: 0,
                // These are circular
                Provider: null,
                Consumer: null
              };
              context.Provider = {
                $$typeof: REACT_PROVIDER_TYPE,
                _context: context
              };
              var hasWarnedAboutUsingNestedContextConsumers = false;
              var hasWarnedAboutUsingConsumerProvider = false;

              {
                // A separate object, but proxies back to the original context object for
                // backwards compatibility. It has a different $$typeof, so we can properly
                // warn for the incorrect usage of Context as a Consumer.
                var Consumer = {
                  $$typeof: REACT_CONTEXT_TYPE,
                  _context: context,
                  _calculateChangedBits: context._calculateChangedBits
                }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

                Object.defineProperties(Consumer, {
                  Provider: {
                    get: function() {
                      if (!hasWarnedAboutUsingConsumerProvider) {
                        hasWarnedAboutUsingConsumerProvider = true;

                        error(
                          "Rendering <Context.Consumer.Provider> is not supported and will be removed in " +
                            "a future major release. Did you mean to render <Context.Provider> instead?"
                        );
                      }

                      return context.Provider;
                    },
                    set: function(_Provider) {
                      context.Provider = _Provider;
                    }
                  },
                  _currentValue: {
                    get: function() {
                      return context._currentValue;
                    },
                    set: function(_currentValue) {
                      context._currentValue = _currentValue;
                    }
                  },
                  _currentValue2: {
                    get: function() {
                      return context._currentValue2;
                    },
                    set: function(_currentValue2) {
                      context._currentValue2 = _currentValue2;
                    }
                  },
                  _threadCount: {
                    get: function() {
                      return context._threadCount;
                    },
                    set: function(_threadCount) {
                      context._threadCount = _threadCount;
                    }
                  },
                  Consumer: {
                    get: function() {
                      if (!hasWarnedAboutUsingNestedContextConsumers) {
                        hasWarnedAboutUsingNestedContextConsumers = true;

                        error(
                          "Rendering <Context.Consumer.Consumer> is not supported and will be removed in " +
                            "a future major release. Did you mean to render <Context.Consumer> instead?"
                        );
                      }

                      return context.Consumer;
                    }
                  }
                }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

                context.Consumer = Consumer;
              }

              {
                context._currentRenderer = null;
                context._currentRenderer2 = null;
              }

              return context;
            }

            function lazy(ctor) {
              var lazyType = {
                $$typeof: REACT_LAZY_TYPE,
                _ctor: ctor,
                // React uses these fields to store the result.
                _status: -1,
                _result: null
              };

              {
                // In production, this would just set it on the object.
                var defaultProps;
                var propTypes;
                Object.defineProperties(lazyType, {
                  defaultProps: {
                    configurable: true,
                    get: function() {
                      return defaultProps;
                    },
                    set: function(newDefaultProps) {
                      error(
                        "React.lazy(...): It is not supported to assign `defaultProps` to " +
                          "a lazy component import. Either specify them where the component " +
                          "is defined, or create a wrapping component around it."
                      );

                      defaultProps = newDefaultProps; // Match production behavior more closely:

                      Object.defineProperty(lazyType, "defaultProps", {
                        enumerable: true
                      });
                    }
                  },
                  propTypes: {
                    configurable: true,
                    get: function() {
                      return propTypes;
                    },
                    set: function(newPropTypes) {
                      error(
                        "React.lazy(...): It is not supported to assign `propTypes` to " +
                          "a lazy component import. Either specify them where the component " +
                          "is defined, or create a wrapping component around it."
                      );

                      propTypes = newPropTypes; // Match production behavior more closely:

                      Object.defineProperty(lazyType, "propTypes", {
                        enumerable: true
                      });
                    }
                  }
                });
              }

              return lazyType;
            }

            function forwardRef(render) {
              {
                if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
                  error(
                    "forwardRef requires a render function but received a `memo` " +
                      "component. Instead of forwardRef(memo(...)), use " +
                      "memo(forwardRef(...))."
                  );
                } else if (typeof render !== "function") {
                  error(
                    "forwardRef requires a render function but was given %s.",
                    render === null ? "null" : typeof render
                  );
                } else {
                  if (render.length !== 0 && render.length !== 2) {
                    error(
                      "forwardRef render functions accept exactly two parameters: props and ref. %s",
                      render.length === 1
                        ? "Did you forget to use the ref parameter?"
                        : "Any additional parameter will be undefined."
                    );
                  }
                }

                if (render != null) {
                  if (render.defaultProps != null || render.propTypes != null) {
                    error(
                      "forwardRef render functions do not support propTypes or defaultProps. " +
                        "Did you accidentally pass a React component?"
                    );
                  }
                }
              }

              return {
                $$typeof: REACT_FORWARD_REF_TYPE,
                render: render
              };
            }

            function isValidElementType(type) {
              return (
                typeof type === "string" ||
                typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
                type === REACT_FRAGMENT_TYPE ||
                type === REACT_CONCURRENT_MODE_TYPE ||
                type === REACT_PROFILER_TYPE ||
                type === REACT_STRICT_MODE_TYPE ||
                type === REACT_SUSPENSE_TYPE ||
                type === REACT_SUSPENSE_LIST_TYPE ||
                (typeof type === "object" &&
                  type !== null &&
                  (type.$$typeof === REACT_LAZY_TYPE ||
                    type.$$typeof === REACT_MEMO_TYPE ||
                    type.$$typeof === REACT_PROVIDER_TYPE ||
                    type.$$typeof === REACT_CONTEXT_TYPE ||
                    type.$$typeof === REACT_FORWARD_REF_TYPE ||
                    type.$$typeof === REACT_FUNDAMENTAL_TYPE ||
                    type.$$typeof === REACT_RESPONDER_TYPE ||
                    type.$$typeof === REACT_SCOPE_TYPE ||
                    type.$$typeof === REACT_BLOCK_TYPE))
              );
            }

            function memo(type, compare) {
              {
                if (!isValidElementType(type)) {
                  error(
                    "memo: The first argument must be a component. Instead " +
                      "received: %s",
                    type === null ? "null" : typeof type
                  );
                }
              }

              return {
                $$typeof: REACT_MEMO_TYPE,
                type: type,
                compare: compare === undefined ? null : compare
              };
            }

            function resolveDispatcher() {
              var dispatcher = ReactCurrentDispatcher.current;

              if (!(dispatcher !== null)) {
                {
                  throw Error(
                    "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem."
                  );
                }
              }

              return dispatcher;
            }

            function useContext(Context, unstable_observedBits) {
              var dispatcher = resolveDispatcher();

              {
                if (unstable_observedBits !== undefined) {
                  error(
                    "useContext() second argument is reserved for future " +
                      "use in React. Passing it is not supported. " +
                      "You passed: %s.%s",
                    unstable_observedBits,
                    typeof unstable_observedBits === "number" &&
                      Array.isArray(arguments[2])
                      ? "\n\nDid you call array.map(useContext)? " +
                          "Calling Hooks inside a loop is not supported. " +
                          "Learn more at https://fb.me/rules-of-hooks"
                      : ""
                  );
                } // TODO: add a more generic warning for invalid values.

                if (Context._context !== undefined) {
                  var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
                  // and nobody should be using this in existing code.

                  if (realContext.Consumer === Context) {
                    error(
                      "Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be " +
                        "removed in a future major release. Did you mean to call useContext(Context) instead?"
                    );
                  } else if (realContext.Provider === Context) {
                    error(
                      "Calling useContext(Context.Provider) is not supported. " +
                        "Did you mean to call useContext(Context) instead?"
                    );
                  }
                }
              }

              return dispatcher.useContext(Context, unstable_observedBits);
            }
            function useState(initialState) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useState(initialState);
            }
            function useReducer(reducer, initialArg, init) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useReducer(reducer, initialArg, init);
            }
            function useRef(initialValue) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useRef(initialValue);
            }
            function useEffect(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useEffect(create, deps);
            }
            function useLayoutEffect(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useLayoutEffect(create, deps);
            }
            function useCallback(callback, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useCallback(callback, deps);
            }
            function useMemo(create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useMemo(create, deps);
            }
            function useImperativeHandle(ref, create, deps) {
              var dispatcher = resolveDispatcher();
              return dispatcher.useImperativeHandle(ref, create, deps);
            }
            function useDebugValue(value, formatterFn) {
              {
                var dispatcher = resolveDispatcher();
                return dispatcher.useDebugValue(value, formatterFn);
              }
            }

            var propTypesMisspellWarningShown;

            {
              propTypesMisspellWarningShown = false;
            }

            function getDeclarationErrorAddendum() {
              if (ReactCurrentOwner.current) {
                var name = getComponentName(ReactCurrentOwner.current.type);

                if (name) {
                  return "\n\nCheck the render method of `" + name + "`.";
                }
              }

              return "";
            }

            function getSourceInfoErrorAddendum(source) {
              if (source !== undefined) {
                var fileName = source.fileName.replace(/^.*[\\\/]/, "");
                var lineNumber = source.lineNumber;
                return (
                  "\n\nCheck your code at " + fileName + ":" + lineNumber + "."
                );
              }

              return "";
            }

            function getSourceInfoErrorAddendumForProps(elementProps) {
              if (elementProps !== null && elementProps !== undefined) {
                return getSourceInfoErrorAddendum(elementProps.__source);
              }

              return "";
            }
            /**
             * Warn if there's no key explicitly set on dynamic arrays of children or
             * object keys are not valid. This allows us to keep track of children between
             * updates.
             */

            var ownerHasKeyUseWarning = {};

            function getCurrentComponentErrorInfo(parentType) {
              var info = getDeclarationErrorAddendum();

              if (!info) {
                var parentName =
                  typeof parentType === "string"
                    ? parentType
                    : parentType.displayName || parentType.name;

                if (parentName) {
                  info =
                    "\n\nCheck the top-level render call using <" +
                    parentName +
                    ">.";
                }
              }

              return info;
            }
            /**
             * Warn if the element doesn't have an explicit key assigned to it.
             * This element is in an array. The array could grow and shrink or be
             * reordered. All children that haven't already been validated are required to
             * have a "key" property assigned to it. Error statuses are cached so a warning
             * will only be shown once.
             *
             * @internal
             * @param {ReactElement} element Element that requires a key.
             * @param {*} parentType element's parent's type.
             */

            function validateExplicitKey(element, parentType) {
              if (
                !element._store ||
                element._store.validated ||
                element.key != null
              ) {
                return;
              }

              element._store.validated = true;
              var currentComponentErrorInfo = getCurrentComponentErrorInfo(
                parentType
              );

              if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
                return;
              }

              ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
              // property, it may be the creator of the child that's responsible for
              // assigning it a key.

              var childOwner = "";

              if (
                element &&
                element._owner &&
                element._owner !== ReactCurrentOwner.current
              ) {
                // Give the component that originally created this child.
                childOwner =
                  " It was passed a child from " +
                  getComponentName(element._owner.type) +
                  ".";
              }

              setCurrentlyValidatingElement(element);

              {
                error(
                  'Each child in a list should have a unique "key" prop.' +
                    "%s%s See https://fb.me/react-warning-keys for more information.",
                  currentComponentErrorInfo,
                  childOwner
                );
              }

              setCurrentlyValidatingElement(null);
            }
            /**
             * Ensure that every element either is passed in a static location, in an
             * array with an explicit keys property defined, or in an object literal
             * with valid key property.
             *
             * @internal
             * @param {ReactNode} node Statically passed child of any type.
             * @param {*} parentType node's parent's type.
             */

            function validateChildKeys(node, parentType) {
              if (typeof node !== "object") {
                return;
              }

              if (Array.isArray(node)) {
                for (var i = 0; i < node.length; i++) {
                  var child = node[i];

                  if (isValidElement(child)) {
                    validateExplicitKey(child, parentType);
                  }
                }
              } else if (isValidElement(node)) {
                // This element was passed in a valid location.
                if (node._store) {
                  node._store.validated = true;
                }
              } else if (node) {
                var iteratorFn = getIteratorFn(node);

                if (typeof iteratorFn === "function") {
                  // Entry iterators used to provide implicit keys,
                  // but now we print a separate warning for them later.
                  if (iteratorFn !== node.entries) {
                    var iterator = iteratorFn.call(node);
                    var step;

                    while (!(step = iterator.next()).done) {
                      if (isValidElement(step.value)) {
                        validateExplicitKey(step.value, parentType);
                      }
                    }
                  }
                }
              }
            }
            /**
             * Given an element, validate that its props follow the propTypes definition,
             * provided by the type.
             *
             * @param {ReactElement} element
             */

            function validatePropTypes(element) {
              {
                var type = element.type;

                if (
                  type === null ||
                  type === undefined ||
                  typeof type === "string"
                ) {
                  return;
                }

                var name = getComponentName(type);
                var propTypes;

                if (typeof type === "function") {
                  propTypes = type.propTypes;
                } else if (
                  typeof type === "object" &&
                  (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
                    // Inner props are checked in the reconciler.
                    type.$$typeof === REACT_MEMO_TYPE)
                ) {
                  propTypes = type.propTypes;
                } else {
                  return;
                }

                if (propTypes) {
                  setCurrentlyValidatingElement(element);
                  checkPropTypes(
                    propTypes,
                    element.props,
                    "prop",
                    name,
                    ReactDebugCurrentFrame.getStackAddendum
                  );
                  setCurrentlyValidatingElement(null);
                } else if (
                  type.PropTypes !== undefined &&
                  !propTypesMisspellWarningShown
                ) {
                  propTypesMisspellWarningShown = true;

                  error(
                    "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
                    name || "Unknown"
                  );
                }

                if (
                  typeof type.getDefaultProps === "function" &&
                  !type.getDefaultProps.isReactClassApproved
                ) {
                  error(
                    "getDefaultProps is only used on classic React.createClass " +
                      "definitions. Use a static property named `defaultProps` instead."
                  );
                }
              }
            }
            /**
             * Given a fragment, validate that it can only be provided with fragment props
             * @param {ReactElement} fragment
             */

            function validateFragmentProps(fragment) {
              {
                setCurrentlyValidatingElement(fragment);
                var keys = Object.keys(fragment.props);

                for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];

                  if (key !== "children" && key !== "key") {
                    error(
                      "Invalid prop `%s` supplied to `React.Fragment`. " +
                        "React.Fragment can only have `key` and `children` props.",
                      key
                    );

                    break;
                  }
                }

                if (fragment.ref !== null) {
                  error(
                    "Invalid attribute `ref` supplied to `React.Fragment`."
                  );
                }

                setCurrentlyValidatingElement(null);
              }
            }
            function createElementWithValidation(type, props, children) {
              var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
              // succeed and there will likely be errors in render.

              if (!validType) {
                var info = "";

                if (
                  type === undefined ||
                  (typeof type === "object" &&
                    type !== null &&
                    Object.keys(type).length === 0)
                ) {
                  info +=
                    " You likely forgot to export your component from the file " +
                    "it's defined in, or you might have mixed up default and named imports.";
                }

                var sourceInfo = getSourceInfoErrorAddendumForProps(props);

                if (sourceInfo) {
                  info += sourceInfo;
                } else {
                  info += getDeclarationErrorAddendum();
                }

                var typeString;

                if (type === null) {
                  typeString = "null";
                } else if (Array.isArray(type)) {
                  typeString = "array";
                } else if (
                  type !== undefined &&
                  type.$$typeof === REACT_ELEMENT_TYPE
                ) {
                  typeString =
                    "<" + (getComponentName(type.type) || "Unknown") + " />";
                  info =
                    " Did you accidentally export a JSX literal instead of a component?";
                } else {
                  typeString = typeof type;
                }

                {
                  error(
                    "React.createElement: type is invalid -- expected a string (for " +
                      "built-in components) or a class/function (for composite " +
                      "components) but got: %s.%s",
                    typeString,
                    info
                  );
                }
              }

              var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
              // TODO: Drop this when these are no longer allowed as the type argument.

              if (element == null) {
                return element;
              } // Skip key warning if the type isn't valid since our key validation logic
              // doesn't expect a non-string/function type and can throw confusing errors.
              // We don't want exception behavior to differ between dev and prod.
              // (Rendering will throw with a helpful message and as soon as the type is
              // fixed, the key warnings will appear.)

              if (validType) {
                for (var i = 2; i < arguments.length; i++) {
                  validateChildKeys(arguments[i], type);
                }
              }

              if (type === REACT_FRAGMENT_TYPE) {
                validateFragmentProps(element);
              } else {
                validatePropTypes(element);
              }

              return element;
            }
            var didWarnAboutDeprecatedCreateFactory = false;
            function createFactoryWithValidation(type) {
              var validatedFactory = createElementWithValidation.bind(
                null,
                type
              );
              validatedFactory.type = type;

              {
                if (!didWarnAboutDeprecatedCreateFactory) {
                  didWarnAboutDeprecatedCreateFactory = true;

                  warn(
                    "React.createFactory() is deprecated and will be removed in " +
                      "a future major release. Consider using JSX " +
                      "or use React.createElement() directly instead."
                  );
                } // Legacy hook: remove it

                Object.defineProperty(validatedFactory, "type", {
                  enumerable: false,
                  get: function() {
                    warn(
                      "Factory.type is deprecated. Access the class directly " +
                        "before passing it to createFactory."
                    );

                    Object.defineProperty(this, "type", {
                      value: type
                    });
                    return type;
                  }
                });
              }

              return validatedFactory;
            }
            function cloneElementWithValidation(element, props, children) {
              var newElement = cloneElement.apply(this, arguments);

              for (var i = 2; i < arguments.length; i++) {
                validateChildKeys(arguments[i], newElement.type);
              }

              validatePropTypes(newElement);
              return newElement;
            }

            {
              try {
                var frozenObject = Object.freeze({});
                var testMap = new Map([[frozenObject, null]]);
                var testSet = new Set([frozenObject]); // This is necessary for Rollup to not consider these unused.
                // https://github.com/rollup/rollup/issues/1771
                // TODO: we can remove these if Rollup fixes the bug.

                testMap.set(0, 0);
                testSet.add(0);
              } catch (e) {}
            }

            var createElement$1 = createElementWithValidation;
            var cloneElement$1 = cloneElementWithValidation;
            var createFactory = createFactoryWithValidation;
            var Children = {
              map: mapChildren,
              forEach: forEachChildren,
              count: countChildren,
              toArray: toArray,
              only: onlyChild
            };

            exports.Children = Children;
            exports.Component = Component;
            exports.Fragment = REACT_FRAGMENT_TYPE;
            exports.Profiler = REACT_PROFILER_TYPE;
            exports.PureComponent = PureComponent;
            exports.StrictMode = REACT_STRICT_MODE_TYPE;
            exports.Suspense = REACT_SUSPENSE_TYPE;
            exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
            exports.cloneElement = cloneElement$1;
            exports.createContext = createContext;
            exports.createElement = createElement$1;
            exports.createFactory = createFactory;
            exports.createRef = createRef;
            exports.forwardRef = forwardRef;
            exports.isValidElement = isValidElement;
            exports.lazy = lazy;
            exports.memo = memo;
            exports.useCallback = useCallback;
            exports.useContext = useContext;
            exports.useDebugValue = useDebugValue;
            exports.useEffect = useEffect;
            exports.useImperativeHandle = useImperativeHandle;
            exports.useLayoutEffect = useLayoutEffect;
            exports.useMemo = useMemo;
            exports.useReducer = useReducer;
            exports.useRef = useRef;
            exports.useState = useState;
            exports.version = ReactVersion;
          })();
        }

        /***/
      },

    /***/ "./node_modules/react/index.js":
      /*!*************************************!*\
  !*** ./node_modules/react/index.js ***!
  \*************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        if (false) {
        } else {
          module.exports = __webpack_require__(
            /*! ./cjs/react.development.js */ "./node_modules/react/cjs/react.development.js"
          );
        }

        /***/
      },

    /***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
      /*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        var isOldIE = (function isOldIE() {
          var memo;
          return function memorize() {
            if (typeof memo === "undefined") {
              // Test for IE <= 9 as proposed by Browserhacks
              // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
              // Tests for existence of standard globals is to allow style-loader
              // to operate correctly into non-standard environments
              // @see https://github.com/webpack-contrib/style-loader/issues/177
              memo = Boolean(
                window && document && document.all && !window.atob
              );
            }

            return memo;
          };
        })();

        var getTarget = (function getTarget() {
          var memo = {};
          return function memorize(target) {
            if (typeof memo[target] === "undefined") {
              var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

              if (
                window.HTMLIFrameElement &&
                styleTarget instanceof window.HTMLIFrameElement
              ) {
                try {
                  // This will throw an exception if access to iframe is blocked
                  // due to cross-origin restrictions
                  styleTarget = styleTarget.contentDocument.head;
                } catch (e) {
                  // istanbul ignore next
                  styleTarget = null;
                }
              }

              memo[target] = styleTarget;
            }

            return memo[target];
          };
        })();

        var stylesInDom = [];

        function getIndexByIdentifier(identifier) {
          var result = -1;

          for (var i = 0; i < stylesInDom.length; i++) {
            if (stylesInDom[i].identifier === identifier) {
              result = i;
              break;
            }
          }

          return result;
        }

        function modulesToDom(list, options) {
          var idCountMap = {};
          var identifiers = [];

          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var id = options.base ? item[0] + options.base : item[0];
            var count = idCountMap[id] || 0;
            var identifier = "".concat(id, " ").concat(count);
            idCountMap[id] = count + 1;
            var index = getIndexByIdentifier(identifier);
            var obj = {
              css: item[1],
              media: item[2],
              sourceMap: item[3]
            };

            if (index !== -1) {
              stylesInDom[index].references++;
              stylesInDom[index].updater(obj);
            } else {
              stylesInDom.push({
                identifier: identifier,
                updater: addStyle(obj, options),
                references: 1
              });
            }

            identifiers.push(identifier);
          }

          return identifiers;
        }

        function insertStyleElement(options) {
          var style = document.createElement("style");
          var attributes = options.attributes || {};

          if (typeof attributes.nonce === "undefined") {
            var nonce = true ? __webpack_require__.nc : undefined;

            if (nonce) {
              attributes.nonce = nonce;
            }
          }

          Object.keys(attributes).forEach(function(key) {
            style.setAttribute(key, attributes[key]);
          });

          if (typeof options.insert === "function") {
            options.insert(style);
          } else {
            var target = getTarget(options.insert || "head");

            if (!target) {
              throw new Error(
                "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
              );
            }

            target.appendChild(style);
          }

          return style;
        }

        function removeStyleElement(style) {
          // istanbul ignore if
          if (style.parentNode === null) {
            return false;
          }

          style.parentNode.removeChild(style);
        }
        /* istanbul ignore next  */

        var replaceText = (function replaceText() {
          var textStore = [];
          return function replace(index, replacement) {
            textStore[index] = replacement;
            return textStore.filter(Boolean).join("\n");
          };
        })();

        function applyToSingletonTag(style, index, remove, obj) {
          var css = remove
            ? ""
            : obj.media
            ? "@media ".concat(obj.media, " {").concat(obj.css, "}")
            : obj.css; // For old IE

          /* istanbul ignore if  */

          if (style.styleSheet) {
            style.styleSheet.cssText = replaceText(index, css);
          } else {
            var cssNode = document.createTextNode(css);
            var childNodes = style.childNodes;

            if (childNodes[index]) {
              style.removeChild(childNodes[index]);
            }

            if (childNodes.length) {
              style.insertBefore(cssNode, childNodes[index]);
            } else {
              style.appendChild(cssNode);
            }
          }
        }

        function applyToTag(style, options, obj) {
          var css = obj.css;
          var media = obj.media;
          var sourceMap = obj.sourceMap;

          if (media) {
            style.setAttribute("media", media);
          } else {
            style.removeAttribute("media");
          }

          if (sourceMap && btoa) {
            css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(
              btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))),
              " */"
            );
          } // For old IE

          /* istanbul ignore if  */

          if (style.styleSheet) {
            style.styleSheet.cssText = css;
          } else {
            while (style.firstChild) {
              style.removeChild(style.firstChild);
            }

            style.appendChild(document.createTextNode(css));
          }
        }

        var singleton = null;
        var singletonCounter = 0;

        function addStyle(obj, options) {
          var style;
          var update;
          var remove;

          if (options.singleton) {
            var styleIndex = singletonCounter++;
            style = singleton || (singleton = insertStyleElement(options));
            update = applyToSingletonTag.bind(null, style, styleIndex, false);
            remove = applyToSingletonTag.bind(null, style, styleIndex, true);
          } else {
            style = insertStyleElement(options);
            update = applyToTag.bind(null, style, options);

            remove = function remove() {
              removeStyleElement(style);
            };
          }

          update(obj);
          return function updateStyle(newObj) {
            if (newObj) {
              if (
                newObj.css === obj.css &&
                newObj.media === obj.media &&
                newObj.sourceMap === obj.sourceMap
              ) {
                return;
              }

              update((obj = newObj));
            } else {
              remove();
            }
          };
        }

        module.exports = function(list, options) {
          options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
          // tags it will allow on a page

          if (!options.singleton && typeof options.singleton !== "boolean") {
            options.singleton = isOldIE();
          }

          list = list || [];
          var lastIdentifiers = modulesToDom(list, options);
          return function update(newList) {
            newList = newList || [];

            if (Object.prototype.toString.call(newList) !== "[object Array]") {
              return;
            }

            for (var i = 0; i < lastIdentifiers.length; i++) {
              var identifier = lastIdentifiers[i];
              var index = getIndexByIdentifier(identifier);
              stylesInDom[index].references--;
            }

            var newLastIdentifiers = modulesToDom(newList, options);

            for (var _i = 0; _i < lastIdentifiers.length; _i++) {
              var _identifier = lastIdentifiers[_i];

              var _index = getIndexByIdentifier(_identifier);

              if (stylesInDom[_index].references === 0) {
                stylesInDom[_index].updater();

                stylesInDom.splice(_index, 1);
              }
            }

            lastIdentifiers = newLastIdentifiers;
          };
        };

        /***/
      },

    /***/ "./node_modules/url/url.js":
      /*!*********************************!*\
  !*** ./node_modules/url/url.js ***!
  \*********************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        var punycode = __webpack_require__(
          /*! punycode */ "./node_modules/node-libs-browser/node_modules/punycode/punycode.js"
        );
        var util = __webpack_require__(
          /*! ./util */ "./node_modules/url/util.js"
        );

        exports.parse = urlParse;
        exports.resolve = urlResolve;
        exports.resolveObject = urlResolveObject;
        exports.format = urlFormat;

        exports.Url = Url;

        function Url() {
          this.protocol = null;
          this.slashes = null;
          this.auth = null;
          this.host = null;
          this.port = null;
          this.hostname = null;
          this.hash = null;
          this.search = null;
          this.query = null;
          this.pathname = null;
          this.path = null;
          this.href = null;
        }

        // Reference: RFC 3986, RFC 1808, RFC 2396

        // define these here so at least they only have to be
        // compiled once on the first module load.
        var protocolPattern = /^([a-z0-9.+-]+:)/i,
          portPattern = /:[0-9]*$/,
          // Special case for a simple path URL
          simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
          // RFC 2396: characters reserved for delimiting URLs.
          // We actually just auto-escape these.
          delims = ["<", ">", '"', "`", " ", "\r", "\n", "\t"],
          // RFC 2396: characters not allowed for various reasons.
          unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims),
          // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
          autoEscape = ["'"].concat(unwise),
          // Characters that are never ever allowed in a hostname.
          // Note that any invalid chars are also handled, but these
          // are the ones that are *expected* to be seen, so we fast-path
          // them.
          nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape),
          hostEndingChars = ["/", "?", "#"],
          hostnameMaxLen = 255,
          hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
          hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
          // protocols that can allow "unsafe" and "unwise" chars.
          unsafeProtocol = {
            javascript: true,
            "javascript:": true
          },
          // protocols that never have a hostname.
          hostlessProtocol = {
            javascript: true,
            "javascript:": true
          },
          // protocols that always contain a // bit.
          slashedProtocol = {
            http: true,
            https: true,
            ftp: true,
            gopher: true,
            file: true,
            "http:": true,
            "https:": true,
            "ftp:": true,
            "gopher:": true,
            "file:": true
          },
          querystring = __webpack_require__(
            /*! querystring */ "./node_modules/querystring-es3/index.js"
          );

        function urlParse(url, parseQueryString, slashesDenoteHost) {
          if (url && util.isObject(url) && url instanceof Url) return url;

          var u = new Url();
          u.parse(url, parseQueryString, slashesDenoteHost);
          return u;
        }

        Url.prototype.parse = function(
          url,
          parseQueryString,
          slashesDenoteHost
        ) {
          if (!util.isString(url)) {
            throw new TypeError(
              "Parameter 'url' must be a string, not " + typeof url
            );
          }

          // Copy chrome, IE, opera backslash-handling behavior.
          // Back slashes before the query string get converted to forward slashes
          // See: https://code.google.com/p/chromium/issues/detail?id=25916
          var queryIndex = url.indexOf("?"),
            splitter =
              queryIndex !== -1 && queryIndex < url.indexOf("#") ? "?" : "#",
            uSplit = url.split(splitter),
            slashRegex = /\\/g;
          uSplit[0] = uSplit[0].replace(slashRegex, "/");
          url = uSplit.join(splitter);

          var rest = url;

          // trim before proceeding.
          // This is to support parse stuff like "  http://foo.com  \n"
          rest = rest.trim();

          if (!slashesDenoteHost && url.split("#").length === 1) {
            // Try fast path regexp
            var simplePath = simplePathPattern.exec(rest);
            if (simplePath) {
              this.path = rest;
              this.href = rest;
              this.pathname = simplePath[1];
              if (simplePath[2]) {
                this.search = simplePath[2];
                if (parseQueryString) {
                  this.query = querystring.parse(this.search.substr(1));
                } else {
                  this.query = this.search.substr(1);
                }
              } else if (parseQueryString) {
                this.search = "";
                this.query = {};
              }
              return this;
            }
          }

          var proto = protocolPattern.exec(rest);
          if (proto) {
            proto = proto[0];
            var lowerProto = proto.toLowerCase();
            this.protocol = lowerProto;
            rest = rest.substr(proto.length);
          }

          // figure out if it's got a host
          // user@server is *always* interpreted as a hostname, and url
          // resolution will treat //foo/bar as host=foo,path=bar because that's
          // how the browser resolves relative URLs.
          if (
            slashesDenoteHost ||
            proto ||
            rest.match(/^\/\/[^@\/]+@[^@\/]+/)
          ) {
            var slashes = rest.substr(0, 2) === "//";
            if (slashes && !(proto && hostlessProtocol[proto])) {
              rest = rest.substr(2);
              this.slashes = true;
            }
          }

          if (
            !hostlessProtocol[proto] &&
            (slashes || (proto && !slashedProtocol[proto]))
          ) {
            // there's a hostname.
            // the first instance of /, ?, ;, or # ends the host.
            //
            // If there is an @ in the hostname, then non-host chars *are* allowed
            // to the left of the last @ sign, unless some host-ending character
            // comes *before* the @-sign.
            // URLs are obnoxious.
            //
            // ex:
            // http://a@b@c/ => user:a@b host:c
            // http://a@b?@c => user:a host:c path:/?@c

            // v0.12 TODO(isaacs): This is not quite how Chrome does things.
            // Review our test case against browsers more comprehensively.

            // find the first instance of any hostEndingChars
            var hostEnd = -1;
            for (var i = 0; i < hostEndingChars.length; i++) {
              var hec = rest.indexOf(hostEndingChars[i]);
              if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
            }

            // at this point, either we have an explicit point where the
            // auth portion cannot go past, or the last @ char is the decider.
            var auth, atSign;
            if (hostEnd === -1) {
              // atSign can be anywhere.
              atSign = rest.lastIndexOf("@");
            } else {
              // atSign must be in auth portion.
              // http://a@b/c@d => host:b auth:a path:/c@d
              atSign = rest.lastIndexOf("@", hostEnd);
            }

            // Now we have a portion which is definitely the auth.
            // Pull that off.
            if (atSign !== -1) {
              auth = rest.slice(0, atSign);
              rest = rest.slice(atSign + 1);
              this.auth = decodeURIComponent(auth);
            }

            // the host is the remaining to the left of the first non-host char
            hostEnd = -1;
            for (var i = 0; i < nonHostChars.length; i++) {
              var hec = rest.indexOf(nonHostChars[i]);
              if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
            }
            // if we still have not hit it, then the entire thing is a host.
            if (hostEnd === -1) hostEnd = rest.length;

            this.host = rest.slice(0, hostEnd);
            rest = rest.slice(hostEnd);

            // pull out port.
            this.parseHost();

            // we've indicated that there is a hostname,
            // so even if it's empty, it has to be present.
            this.hostname = this.hostname || "";

            // if hostname begins with [ and ends with ]
            // assume that it's an IPv6 address.
            var ipv6Hostname =
              this.hostname[0] === "[" &&
              this.hostname[this.hostname.length - 1] === "]";

            // validate a little.
            if (!ipv6Hostname) {
              var hostparts = this.hostname.split(/\./);
              for (var i = 0, l = hostparts.length; i < l; i++) {
                var part = hostparts[i];
                if (!part) continue;
                if (!part.match(hostnamePartPattern)) {
                  var newpart = "";
                  for (var j = 0, k = part.length; j < k; j++) {
                    if (part.charCodeAt(j) > 127) {
                      // we replace non-ASCII char with a temporary placeholder
                      // we need this to make sure size of hostname is not
                      // broken by replacing non-ASCII by nothing
                      newpart += "x";
                    } else {
                      newpart += part[j];
                    }
                  }
                  // we test again with ASCII char only
                  if (!newpart.match(hostnamePartPattern)) {
                    var validParts = hostparts.slice(0, i);
                    var notHost = hostparts.slice(i + 1);
                    var bit = part.match(hostnamePartStart);
                    if (bit) {
                      validParts.push(bit[1]);
                      notHost.unshift(bit[2]);
                    }
                    if (notHost.length) {
                      rest = "/" + notHost.join(".") + rest;
                    }
                    this.hostname = validParts.join(".");
                    break;
                  }
                }
              }
            }

            if (this.hostname.length > hostnameMaxLen) {
              this.hostname = "";
            } else {
              // hostnames are always lower case.
              this.hostname = this.hostname.toLowerCase();
            }

            if (!ipv6Hostname) {
              // IDNA Support: Returns a punycoded representation of "domain".
              // It only converts parts of the domain name that
              // have non-ASCII characters, i.e. it doesn't matter if
              // you call it with a domain that already is ASCII-only.
              this.hostname = punycode.toASCII(this.hostname);
            }

            var p = this.port ? ":" + this.port : "";
            var h = this.hostname || "";
            this.host = h + p;
            this.href += this.host;

            // strip [ and ] from the hostname
            // the host field still retains them, though
            if (ipv6Hostname) {
              this.hostname = this.hostname.substr(1, this.hostname.length - 2);
              if (rest[0] !== "/") {
                rest = "/" + rest;
              }
            }
          }

          // now rest is set to the post-host stuff.
          // chop off any delim chars.
          if (!unsafeProtocol[lowerProto]) {
            // First, make 100% sure that any "autoEscape" chars get
            // escaped, even if encodeURIComponent doesn't think they
            // need to be.
            for (var i = 0, l = autoEscape.length; i < l; i++) {
              var ae = autoEscape[i];
              if (rest.indexOf(ae) === -1) continue;
              var esc = encodeURIComponent(ae);
              if (esc === ae) {
                esc = escape(ae);
              }
              rest = rest.split(ae).join(esc);
            }
          }

          // chop off from the tail first.
          var hash = rest.indexOf("#");
          if (hash !== -1) {
            // got a fragment string.
            this.hash = rest.substr(hash);
            rest = rest.slice(0, hash);
          }
          var qm = rest.indexOf("?");
          if (qm !== -1) {
            this.search = rest.substr(qm);
            this.query = rest.substr(qm + 1);
            if (parseQueryString) {
              this.query = querystring.parse(this.query);
            }
            rest = rest.slice(0, qm);
          } else if (parseQueryString) {
            // no query string, but parseQueryString still requested
            this.search = "";
            this.query = {};
          }
          if (rest) this.pathname = rest;
          if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
            this.pathname = "/";
          }

          //to support http.request
          if (this.pathname || this.search) {
            var p = this.pathname || "";
            var s = this.search || "";
            this.path = p + s;
          }

          // finally, reconstruct the href based on what has been validated.
          this.href = this.format();
          return this;
        };

        // format a parsed object into a url string
        function urlFormat(obj) {
          // ensure it's an object, and not a string url.
          // If it's an obj, this is a no-op.
          // this way, you can call url_format() on strings
          // to clean up potentially wonky urls.
          if (util.isString(obj)) obj = urlParse(obj);
          if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
          return obj.format();
        }

        Url.prototype.format = function() {
          var auth = this.auth || "";
          if (auth) {
            auth = encodeURIComponent(auth);
            auth = auth.replace(/%3A/i, ":");
            auth += "@";
          }

          var protocol = this.protocol || "",
            pathname = this.pathname || "",
            hash = this.hash || "",
            host = false,
            query = "";

          if (this.host) {
            host = auth + this.host;
          } else if (this.hostname) {
            host =
              auth +
              (this.hostname.indexOf(":") === -1
                ? this.hostname
                : "[" + this.hostname + "]");
            if (this.port) {
              host += ":" + this.port;
            }
          }

          if (
            this.query &&
            util.isObject(this.query) &&
            Object.keys(this.query).length
          ) {
            query = querystring.stringify(this.query);
          }

          var search = this.search || (query && "?" + query) || "";

          if (protocol && protocol.substr(-1) !== ":") protocol += ":";

          // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
          // unless they had them to begin with.
          if (
            this.slashes ||
            ((!protocol || slashedProtocol[protocol]) && host !== false)
          ) {
            host = "//" + (host || "");
            if (pathname && pathname.charAt(0) !== "/")
              pathname = "/" + pathname;
          } else if (!host) {
            host = "";
          }

          if (hash && hash.charAt(0) !== "#") hash = "#" + hash;
          if (search && search.charAt(0) !== "?") search = "?" + search;

          pathname = pathname.replace(/[?#]/g, function(match) {
            return encodeURIComponent(match);
          });
          search = search.replace("#", "%23");

          return protocol + host + pathname + search + hash;
        };

        function urlResolve(source, relative) {
          return urlParse(source, false, true).resolve(relative);
        }

        Url.prototype.resolve = function(relative) {
          return this.resolveObject(urlParse(relative, false, true)).format();
        };

        function urlResolveObject(source, relative) {
          if (!source) return relative;
          return urlParse(source, false, true).resolveObject(relative);
        }

        Url.prototype.resolveObject = function(relative) {
          if (util.isString(relative)) {
            var rel = new Url();
            rel.parse(relative, false, true);
            relative = rel;
          }

          var result = new Url();
          var tkeys = Object.keys(this);
          for (var tk = 0; tk < tkeys.length; tk++) {
            var tkey = tkeys[tk];
            result[tkey] = this[tkey];
          }

          // hash is always overridden, no matter what.
          // even href="" will remove it.
          result.hash = relative.hash;

          // if the relative url is empty, then there's nothing left to do here.
          if (relative.href === "") {
            result.href = result.format();
            return result;
          }

          // hrefs like //foo/bar always cut to the protocol.
          if (relative.slashes && !relative.protocol) {
            // take everything except the protocol from relative
            var rkeys = Object.keys(relative);
            for (var rk = 0; rk < rkeys.length; rk++) {
              var rkey = rkeys[rk];
              if (rkey !== "protocol") result[rkey] = relative[rkey];
            }

            //urlParse appends trailing / to urls like http://www.example.com
            if (
              slashedProtocol[result.protocol] &&
              result.hostname &&
              !result.pathname
            ) {
              result.path = result.pathname = "/";
            }

            result.href = result.format();
            return result;
          }

          if (relative.protocol && relative.protocol !== result.protocol) {
            // if it's a known url protocol, then changing
            // the protocol does weird things
            // first, if it's not file:, then we MUST have a host,
            // and if there was a path
            // to begin with, then we MUST have a path.
            // if it is file:, then the host is dropped,
            // because that's known to be hostless.
            // anything else is assumed to be absolute.
            if (!slashedProtocol[relative.protocol]) {
              var keys = Object.keys(relative);
              for (var v = 0; v < keys.length; v++) {
                var k = keys[v];
                result[k] = relative[k];
              }
              result.href = result.format();
              return result;
            }

            result.protocol = relative.protocol;
            if (!relative.host && !hostlessProtocol[relative.protocol]) {
              var relPath = (relative.pathname || "").split("/");
              while (relPath.length && !(relative.host = relPath.shift()));
              if (!relative.host) relative.host = "";
              if (!relative.hostname) relative.hostname = "";
              if (relPath[0] !== "") relPath.unshift("");
              if (relPath.length < 2) relPath.unshift("");
              result.pathname = relPath.join("/");
            } else {
              result.pathname = relative.pathname;
            }
            result.search = relative.search;
            result.query = relative.query;
            result.host = relative.host || "";
            result.auth = relative.auth;
            result.hostname = relative.hostname || relative.host;
            result.port = relative.port;
            // to support http.request
            if (result.pathname || result.search) {
              var p = result.pathname || "";
              var s = result.search || "";
              result.path = p + s;
            }
            result.slashes = result.slashes || relative.slashes;
            result.href = result.format();
            return result;
          }

          var isSourceAbs =
              result.pathname && result.pathname.charAt(0) === "/",
            isRelAbs =
              relative.host ||
              (relative.pathname && relative.pathname.charAt(0) === "/"),
            mustEndAbs =
              isRelAbs || isSourceAbs || (result.host && relative.pathname),
            removeAllDots = mustEndAbs,
            srcPath = (result.pathname && result.pathname.split("/")) || [],
            relPath = (relative.pathname && relative.pathname.split("/")) || [],
            psychotic = result.protocol && !slashedProtocol[result.protocol];

          // if the url is a non-slashed url, then relative
          // links like ../.. should be able
          // to crawl up to the hostname, as well.  This is strange.
          // result.protocol has already been set by now.
          // Later on, put the first path part into the host field.
          if (psychotic) {
            result.hostname = "";
            result.port = null;
            if (result.host) {
              if (srcPath[0] === "") srcPath[0] = result.host;
              else srcPath.unshift(result.host);
            }
            result.host = "";
            if (relative.protocol) {
              relative.hostname = null;
              relative.port = null;
              if (relative.host) {
                if (relPath[0] === "") relPath[0] = relative.host;
                else relPath.unshift(relative.host);
              }
              relative.host = null;
            }
            mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
          }

          if (isRelAbs) {
            // it's absolute.
            result.host =
              relative.host || relative.host === ""
                ? relative.host
                : result.host;
            result.hostname =
              relative.hostname || relative.hostname === ""
                ? relative.hostname
                : result.hostname;
            result.search = relative.search;
            result.query = relative.query;
            srcPath = relPath;
            // fall through to the dot-handling below.
          } else if (relPath.length) {
            // it's relative
            // throw away the existing file, and take the new path instead.
            if (!srcPath) srcPath = [];
            srcPath.pop();
            srcPath = srcPath.concat(relPath);
            result.search = relative.search;
            result.query = relative.query;
          } else if (!util.isNullOrUndefined(relative.search)) {
            // just pull out the search.
            // like href='?foo'.
            // Put this after the other two cases because it simplifies the booleans
            if (psychotic) {
              result.hostname = result.host = srcPath.shift();
              //occationaly the auth can get stuck only in host
              //this especially happens in cases like
              //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
              var authInHost =
                result.host && result.host.indexOf("@") > 0
                  ? result.host.split("@")
                  : false;
              if (authInHost) {
                result.auth = authInHost.shift();
                result.host = result.hostname = authInHost.shift();
              }
            }
            result.search = relative.search;
            result.query = relative.query;
            //to support http.request
            if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
              result.path =
                (result.pathname ? result.pathname : "") +
                (result.search ? result.search : "");
            }
            result.href = result.format();
            return result;
          }

          if (!srcPath.length) {
            // no path at all.  easy.
            // we've already handled the other stuff above.
            result.pathname = null;
            //to support http.request
            if (result.search) {
              result.path = "/" + result.search;
            } else {
              result.path = null;
            }
            result.href = result.format();
            return result;
          }

          // if a url ENDs in . or .., then it must get a trailing slash.
          // however, if it ends in anything else non-slashy,
          // then it must NOT get a trailing slash.
          var last = srcPath.slice(-1)[0];
          var hasTrailingSlash =
            ((result.host || relative.host || srcPath.length > 1) &&
              (last === "." || last === "..")) ||
            last === "";

          // strip single dots, resolve double dots to parent dir
          // if the path tries to go above the root, `up` ends up > 0
          var up = 0;
          for (var i = srcPath.length; i >= 0; i--) {
            last = srcPath[i];
            if (last === ".") {
              srcPath.splice(i, 1);
            } else if (last === "..") {
              srcPath.splice(i, 1);
              up++;
            } else if (up) {
              srcPath.splice(i, 1);
              up--;
            }
          }

          // if the path is allowed to go above the root, restore leading ..s
          if (!mustEndAbs && !removeAllDots) {
            for (; up--; up) {
              srcPath.unshift("..");
            }
          }

          if (
            mustEndAbs &&
            srcPath[0] !== "" &&
            (!srcPath[0] || srcPath[0].charAt(0) !== "/")
          ) {
            srcPath.unshift("");
          }

          if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") {
            srcPath.push("");
          }

          var isAbsolute =
            srcPath[0] === "" || (srcPath[0] && srcPath[0].charAt(0) === "/");

          // put the host back
          if (psychotic) {
            result.hostname = result.host = isAbsolute
              ? ""
              : srcPath.length
              ? srcPath.shift()
              : "";
            //occationaly the auth can get stuck only in host
            //this especially happens in cases like
            //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
            var authInHost =
              result.host && result.host.indexOf("@") > 0
                ? result.host.split("@")
                : false;
            if (authInHost) {
              result.auth = authInHost.shift();
              result.host = result.hostname = authInHost.shift();
            }
          }

          mustEndAbs = mustEndAbs || (result.host && srcPath.length);

          if (mustEndAbs && !isAbsolute) {
            srcPath.unshift("");
          }

          if (!srcPath.length) {
            result.pathname = null;
            result.path = null;
          } else {
            result.pathname = srcPath.join("/");
          }

          //to support request.http
          if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
            result.path =
              (result.pathname ? result.pathname : "") +
              (result.search ? result.search : "");
          }
          result.auth = relative.auth || result.auth;
          result.slashes = result.slashes || relative.slashes;
          result.href = result.format();
          return result;
        };

        Url.prototype.parseHost = function() {
          var host = this.host;
          var port = portPattern.exec(host);
          if (port) {
            port = port[0];
            if (port !== ":") {
              this.port = port.substr(1);
            }
            host = host.substr(0, host.length - port.length);
          }
          if (host) this.hostname = host;
        };

        /***/
      },

    /***/ "./node_modules/url/util.js":
      /*!**********************************!*\
  !*** ./node_modules/url/util.js ***!
  \**********************************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        "use strict";

        module.exports = {
          isString: function(arg) {
            return typeof arg === "string";
          },
          isObject: function(arg) {
            return typeof arg === "object" && arg !== null;
          },
          isNull: function(arg) {
            return arg === null;
          },
          isNullOrUndefined: function(arg) {
            return arg == null;
          }
        };

        /***/
      },

    /***/ "./node_modules/webpack/buildin/global.js":
      /*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        var g;

        // This works in non-strict mode
        g = (function() {
          return this;
        })();

        try {
          // This works if eval is allowed (see CSP)
          g = g || new Function("return this")();
        } catch (e) {
          // This works if the window reference is available
          if (typeof window === "object") g = window;
        }

        // g can still be undefined, but nothing to do about it...
        // We return undefined, instead of nothing here, so it's
        // easier to handle this case. if(!global) { ...}

        module.exports = g;

        /***/
      },

    /***/ "./node_modules/webpack/buildin/module.js":
      /*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
      /*! no static exports found */
      /***/ function(module, exports) {
        module.exports = function(module) {
          if (!module.webpackPolyfill) {
            module.deprecate = function() {};
            module.paths = [];
            // module.parent = undefined by default
            if (!module.children) module.children = [];
            Object.defineProperty(module, "loaded", {
              enumerable: true,
              get: function() {
                return module.l;
              }
            });
            Object.defineProperty(module, "id", {
              enumerable: true,
              get: function() {
                return module.i;
              }
            });
            module.webpackPolyfill = 1;
          }
          return module;
        };

        /***/
      },

    /***/ "./src/editor.tsx":
      /*!************************!*\
  !*** ./src/editor.tsx ***!
  \************************/
      /*! exports provided: createComponentClass */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "createComponentClass",
          function() {
            return createComponentClass;
          }
        );
        /* harmony import */ var _ui_pc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./ui.pc */ "./src/ui.pc"
        );
        /* harmony import */ var paperclip_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! paperclip/browser */ "../paperclip/browser.js"
        );
        /* harmony import */ var react_simple_code_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
          /*! react-simple-code-editor */ "./node_modules/react-simple-code-editor/lib/index.js"
        );
        /* harmony import */ var react_simple_code_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/ __webpack_require__.n(
          react_simple_code_editor__WEBPACK_IMPORTED_MODULE_2__
        );
        /* harmony import */ var prismjs_components_prism_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          /*! prismjs/components/prism-core */ "./node_modules/prismjs/components/prism-core.js"
        );
        /* harmony import */ var prismjs_components_prism_core__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(
          prismjs_components_prism_core__WEBPACK_IMPORTED_MODULE_3__
        );
        /* harmony import */ var paperclip_web_renderer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
          /*! paperclip-web-renderer */ "../paperclip-web-renderer/index.js"
        );
        /* harmony import */ var paperclip_web_renderer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/ __webpack_require__.n(
          paperclip_web_renderer__WEBPACK_IMPORTED_MODULE_4__
        );
        /* harmony import */ var fast_memoize__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          /*! fast-memoize */ "./node_modules/fast-memoize/src/index.js"
        );
        /* harmony import */ var fast_memoize__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/ __webpack_require__.n(
          fast_memoize__WEBPACK_IMPORTED_MODULE_5__
        );
        /* harmony import */ var prismjs_components_prism_clike__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
          /*! prismjs/components/prism-clike */ "./node_modules/prismjs/components/prism-clike.js"
        );
        /* harmony import */ var prismjs_components_prism_clike__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/ __webpack_require__.n(
          prismjs_components_prism_clike__WEBPACK_IMPORTED_MODULE_6__
        );
        /* harmony import */ var prismjs_components_prism_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(
          /*! prismjs/components/prism-css */ "./node_modules/prismjs/components/prism-css.js"
        );
        /* harmony import */ var prismjs_components_prism_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(
          prismjs_components_prism_css__WEBPACK_IMPORTED_MODULE_7__
        );
        /* harmony import */ var prismjs_components_prism_markup__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(
          /*! prismjs/components/prism-markup */ "./node_modules/prismjs/components/prism-markup.js"
        );
        /* harmony import */ var prismjs_components_prism_markup__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/ __webpack_require__.n(
          prismjs_components_prism_markup__WEBPACK_IMPORTED_MODULE_8__
        );
        /* harmony import */ var prismjs_components_prism_javascript__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(
          /*! prismjs/components/prism-javascript */ "./node_modules/prismjs/components/prism-javascript.js"
        );
        /* harmony import */ var prismjs_components_prism_javascript__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/ __webpack_require__.n(
          prismjs_components_prism_javascript__WEBPACK_IMPORTED_MODULE_9__
        );
        /* harmony import */ var _prism_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(
          /*! ./prism.css */ "./src/prism.css"
        );
        /* harmony import */ var _prism_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/ __webpack_require__.n(
          _prism_css__WEBPACK_IMPORTED_MODULE_10__
        );
        var __awaiter =
          (undefined && undefined.__awaiter) ||
          function(thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function(resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function(resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator["throw"](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        // import React, { useState, useEffect } from "react";

        const createComponentClass = ({
          React,
          useState,
          useEffect,
          useRef
        }) => {
          const usePaperclipEngine = initialGraph => {
            const [engine, setEngine] = useState(null);
            useEffect(() => {
              Object(
                paperclip_browser__WEBPACK_IMPORTED_MODULE_1__["createEngine"]
              )({
                io: {
                  readFile(uri) {
                    return initialGraph[uri];
                  },
                  resolveFile(from, to) {
                    return to.replace("./", "");
                  },
                  fileExists(uri) {
                    return Boolean(initialGraph[uri]);
                  }
                }
              }).then(v => {
                setEngine(v);
              });
            }, [initialGraph]);
            return engine;
          };
          const cachedGraph = fast_memoize__WEBPACK_IMPORTED_MODULE_5___default()(
            graph => graph,
            {
              serializer: graph => JSON.stringify(graph)
            }
          );
          const Editor = ({ graph, defaultUri }) => {
            const initialGraph = cachedGraph(graph);
            const [currentGraph, setGraph] = useState(initialGraph);
            const [currentUri, setCurrentUri] = useState(defaultUri);
            const code = currentGraph[currentUri];
            const engine = usePaperclipEngine(initialGraph);
            const onCodeChange = code => {
              setGraph(
                Object.assign(Object.assign({}, currentGraph), {
                  [currentUri]: code
                })
              );
              if (engine) {
                engine.updateVirtualFileContent(currentUri, code);
              }
            };
            return React.createElement(
              _ui_pc__WEBPACK_IMPORTED_MODULE_0__["Editor"],
              null,
              React.createElement(
                _ui_pc__WEBPACK_IMPORTED_MODULE_0__["CodePane"],
                {
                  tabs: React.createElement(
                    React.Fragment,
                    null,
                    Object.keys(currentGraph).map(uri => {
                      return React.createElement(
                        _ui_pc__WEBPACK_IMPORTED_MODULE_0__["Tab"],
                        {
                          selected: uri === currentUri,
                          onClick: () => setCurrentUri(uri)
                        },
                        uri
                      );
                    })
                  )
                },
                React.createElement(
                  react_simple_code_editor__WEBPACK_IMPORTED_MODULE_2___default.a,
                  {
                    value: code,
                    style: { width: "100%", minHeight: "100%" },
                    preClassName: "language-html",
                    onValueChange: onCodeChange,
                    highlight: code =>
                      Object(
                        prismjs_components_prism_core__WEBPACK_IMPORTED_MODULE_3__[
                          "highlight"
                        ]
                      )(
                        code,
                        prismjs_components_prism_core__WEBPACK_IMPORTED_MODULE_3__[
                          "languages"
                        ].html
                      )
                  }
                )
              ),
              React.createElement(Preview, {
                engine: engine,
                currentUri: currentUri
              })
            );
          };
          const Preview = ({ engine, currentUri }) => {
            const [iframeBody, setIframeBody] = useState();
            let renderer;
            const iframeRef = useRef();
            useEffect(() => {
              if (!engine || !iframeBody) {
                return;
              }
              let disposeListener;
              renderer = new paperclip_web_renderer__WEBPACK_IMPORTED_MODULE_4__[
                "Renderer"
              ]("http://", currentUri);
              const init = () =>
                __awaiter(void 0, void 0, void 0, function*() {
                  try {
                    renderer.initialize(yield engine.run(currentUri));
                    disposeListener = engine.onEvent(
                      renderer.handleEngineEvent
                    );
                  } catch (e) {
                    console.warn(e);
                    // wait for something to happen, then retry
                    const dispose = engine.onEvent(event => {
                      dispose();
                      init();
                    });
                  }
                });
              init();
              iframeBody.appendChild(renderer.mount);
              return () => {
                if (disposeListener) {
                  disposeListener();
                }
                iframeBody.removeChild(renderer.mount);
              };
            }, [engine, currentUri, iframeBody]);
            useEffect(() => {
              if (iframeBody) {
                return;
              }
              const timer = setInterval(() => {
                var _a, _b;
                if (
                  (_b =
                    (_a = iframeRef.current) === null || _a === void 0
                      ? void 0
                      : _a.contentDocument) === null || _b === void 0
                    ? void 0
                    : _b.body
                ) {
                  setIframeBody(iframeRef.current.contentDocument.body);
                }
              }, 500);
              return () => {
                clearInterval(timer);
              };
            }, [iframeBody]);
            return React.createElement(
              _ui_pc__WEBPACK_IMPORTED_MODULE_0__["PreviewPane"],
              { iframeRef: iframeRef }
            );
          };
          return Editor;
        };

        /***/
      },

    /***/ "./src/index.ts":
      /*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
      /*! exports provided: createComponentClass */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./editor */ "./src/editor.tsx"
        );
        /* harmony reexport (safe) */ __webpack_require__.d(
          __webpack_exports__,
          "createComponentClass",
          function() {
            return _editor__WEBPACK_IMPORTED_MODULE_0__["createComponentClass"];
          }
        );

        /***/
      },

    /***/ "./src/prism.css":
      /*!***********************!*\
  !*** ./src/prism.css ***!
  \***********************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        var api = __webpack_require__(
          /*! ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
        );
        var content = __webpack_require__(
          /*! !../node_modules/css-loader/dist/cjs.js!./prism.css */ "./node_modules/css-loader/dist/cjs.js!./src/prism.css"
        );

        content = content.__esModule ? content.default : content;

        if (typeof content === "string") {
          content = [[module.i, content, ""]];
        }

        var options = {};

        options.insert = "head";
        options.singleton = false;

        var update = api(content, options);

        module.exports = content.locals || {};

        /***/
      },

    /***/ "./src/ui.pc":
      /*!*******************!*\
  !*** ./src/ui.pc ***!
  \*******************/
      /*! exports provided: classNames, Tab, CodePane, PreviewPane, Editor */
      /***/ function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "classNames",
          function() {
            return classNames;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "Tab",
          function() {
            return Tab;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "CodePane",
          function() {
            return CodePane;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "PreviewPane",
          function() {
            return PreviewPane;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          "Editor",
          function() {
            return Editor;
          }
        );
        /* harmony import */ var _ui_pc_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./ui.pc.css */ "./src/ui.pc.css"
        );
        /* harmony import */ var _ui_pc_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
          _ui_pc_css__WEBPACK_IMPORTED_MODULE_0__
        );
        /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          /*! react */ "./node_modules/react/index.js"
        );
        /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/ __webpack_require__.n(
          react__WEBPACK_IMPORTED_MODULE_1__
        );

        const classNames = {};

        const getDefault = module => module.default || module;

        const castStyle = value => {
          const tov = typeof value;
          if (tov === "object" || tov !== "string") return value;
          return value
            .trim()
            .split(";")
            .reduce((obj, keyValue) => {
              const [key, value] = keyValue.split(":");
              obj[key.trim()] = value.trim();
              return obj;
            }, {});
        };

        const Tab = react__WEBPACK_IMPORTED_MODULE_1__["memo"](
          react__WEBPACK_IMPORTED_MODULE_1__["forwardRef"](function Tab(
            props,
            ref
          ) {
            return react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
              "li",
              {
                "data-pc-fab8095a": true,
                ref: ref,
                key: "0",
                className:
                  "" +
                  "_fab8095a_tab tab" +
                  (props.selected
                    ? " " + "_fab8095a_tab--selected tab--selected"
                    : ""),
                onClick: props.onClick
              },
              props.children
            );
          })
        );

        const CodePane = react__WEBPACK_IMPORTED_MODULE_1__["memo"](
          react__WEBPACK_IMPORTED_MODULE_1__["forwardRef"](function CodePane(
            props,
            ref
          ) {
            return react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
              "div",
              {
                "data-pc-fab8095a": true,
                ref: ref,
                key: "1",
                className: "_fab8095a_code code"
              },
              react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
                "ul",
                {
                  "data-pc-fab8095a": true,
                  key: "2",
                  className: "_fab8095a_tabs tabs"
                },
                props.tabs
              ),
              react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
                "div",
                {
                  "data-pc-fab8095a": true,
                  key: "3",
                  className: "_fab8095a_content content"
                },
                props.children
              )
            );
          })
        );

        const PreviewPane = react__WEBPACK_IMPORTED_MODULE_1__["memo"](
          react__WEBPACK_IMPORTED_MODULE_1__["forwardRef"](function PreviewPane(
            props,
            ref
          ) {
            return react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
              "div",
              {
                "data-pc-fab8095a": true,
                ref: ref,
                key: "4",
                className: "_fab8095a_Preview Preview"
              },
              react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
                "div",
                {
                  "data-pc-fab8095a": true,
                  key: "5",
                  className: "_fab8095a_header header"
                },
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
                  "span",
                  {
                    "data-pc-fab8095a": true,
                    key: "6",
                    className: "_fab8095a_bolt bolt"
                  },
                  "⚡️"
                ),
                " Preview\n  "
              ),
              react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("iframe", {
                "data-pc-fab8095a": true,
                key: "7",
                ref: props.iframeRef
              })
            );
          })
        );

        const Editor = react__WEBPACK_IMPORTED_MODULE_1__["memo"](
          react__WEBPACK_IMPORTED_MODULE_1__["forwardRef"](function Editor(
            props,
            ref
          ) {
            return react__WEBPACK_IMPORTED_MODULE_1__["createElement"](
              "div",
              {
                "data-pc-fab8095a": true,
                ref: ref,
                key: "8",
                className: "_fab8095a_Editor Editor"
              },
              props.children
            );
          })
        );

        /***/
      },

    /***/ "./src/ui.pc.css":
      /*!***********************!*\
  !*** ./src/ui.pc.css ***!
  \***********************/
      /*! no static exports found */
      /***/ function(module, exports, __webpack_require__) {
        var api = __webpack_require__(
          /*! ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
        );
        var content = __webpack_require__(
          /*! !../node_modules/css-loader/dist/cjs.js!./ui.pc.css */ "./node_modules/css-loader/dist/cjs.js!./src/ui.pc.css"
        );

        content = content.__esModule ? content.default : content;

        if (typeof content === "string") {
          content = [[module.i, content, ""]];
        }

        var options = {};

        options.insert = "head";
        options.singleton = false;

        var update = api(content, options);

        module.exports = content.locals || {};

        /***/
      },

    /***/ fs:
      /*!*********************!*\
  !*** external "[]" ***!
  \*********************/
      /*! no static exports found */
      /***/ function(module, exports) {
        (function() {
          module.exports = window["[]"];
        })();

        /***/
      }

    /******/
  }
);
