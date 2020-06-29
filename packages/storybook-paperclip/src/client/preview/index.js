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
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
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
exports.__esModule = true;
exports.raw = exports.getStorybook = exports.forceReRender = exports.setAddon = exports.clearDecorators = exports.addParameters = exports.addDecorator = exports.configure = exports.storiesOf = exports.WRAPS = void 0;
/* eslint-disable prefer-destructuring */
// import Vue, { VueConstructor, ComponentOptions } from 'vue';
var client_1 = require("@storybook/core/client");
require("./globals");
var render_1 = require("./render");
// import { extractProps } from './util';
exports.WRAPS = "STORYBOOK_WRAPS";
function prepare(rawStory, innerStory) {
  var story;
  if (typeof rawStory === "string") {
    story = { template: rawStory };
  } else if (rawStory != null) {
    story = rawStory;
  } else {
    return null;
  }
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  if (!story._isVue) {
    if (innerStory) {
      story.components = __assign(__assign({}, story.components || {}), {
        story: innerStory
      });
    }
    // story = Vue.extend(story);
    // @ts-ignore // https://github.com/storybookjs/storybook/pull/7578#discussion_r307984824
  } else if (story.options[exports.WRAPS]) {
    return story;
  }
}
var defaultContext = {
  id: "unspecified",
  name: "unspecified",
  kind: "unspecified",
  parameters: {},
  args: {},
  globalArgs: {}
};
function decorateStory(storyFn, decorators) {
  return decorators.reduce(
    function(decorated, decorator) {
      return function(context) {
        if (context === void 0) {
          context = defaultContext;
        }
        var story;
        var decoratedStory = decorator(function(_a) {
          if (_a === void 0) {
            _a = {};
          }
          var parameters = _a.parameters,
            innerContext = __rest(_a, ["parameters"]);
          story = decorated(__assign(__assign({}, context), innerContext));
          return story;
        }, context);
        if (!story) {
          story = decorated(context);
        }
        if (decoratedStory === story) {
          return story;
        }
        return prepare(decoratedStory, story);
      };
    },
    function(context) {
      return prepare(storyFn(context));
    }
  );
}
var framework = "vue";
var api = client_1.start(render_1["default"], { decorateStory: decorateStory });
exports.storiesOf = function(kind, m) {
  return api.clientApi.storiesOf(kind, m).addParameters({
    framework: framework
  });
};
exports.configure = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return api.configure.apply(api, __spreadArrays(args, [framework]));
};
exports.addDecorator = api.clientApi.addDecorator;
exports.addParameters = api.clientApi.addParameters;
exports.clearDecorators = api.clientApi.clearDecorators;
exports.setAddon = api.clientApi.setAddon;
exports.forceReRender = api.forceReRender;
exports.getStorybook = api.clientApi.getStorybook;
exports.raw = api.clientApi.raw;
