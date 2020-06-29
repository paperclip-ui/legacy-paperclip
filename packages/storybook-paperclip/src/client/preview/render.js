"use strict";
exports.__esModule = true;
var global_1 = require("global");
var rootEl = global_1.document.getElementById("root");
function renderMain(_a) {
  var storyFn = _a.storyFn,
    selectedKind = _a.selectedKind,
    selectedStory = _a.selectedStory,
    showMain = _a.showMain,
    showError = _a.showError;
  var element = storyFn();
  console.log("ELELELELEL");
  // if (!element) {
  //   const error = {
  //     title: `Expecting a Paperclip element from the story: "${selectedStory}" of "${selectedKind}".`,
  //     description: dedent`
  //       Did you forget to return the Mithril element from the story?
  //       Use "() => MyComp" or "() => { return MyComp; }" when defining the story.
  //     `,
  //   };
  //   showError(error);
  //   return;
  // }
  // showMain();
  // m.mount(rootEl, { view: () => m(element) });
}
exports["default"] = renderMain;
