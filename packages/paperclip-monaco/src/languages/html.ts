import { languages } from "monaco-editor-core";

// https://github.com/microsoft/monaco-languages/tree/master/src/html
export const config: languages.LanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,

  comments: {
    blockComment: ["<!--", "-->"]
  },

  brackets: [
    ["<!--", "-->"],
    ["<", ">"],
    ["{", "}"],
    ["(", ")"]
  ],

  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],

  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "<", close: ">" }
  ],

  onEnterRules: [
    // {
    // 	beforeText: new RegExp(
    // 		`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
    // 		'i'
    // 	),
    // 	afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
    // 	action: {
    // 		indentAction: languages.IndentAction.Indent
    // 	}
    // },
    // {
    // 	beforeText: new RegExp(
    // 		`<(?!(?:${EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
    // 		'i'
    // 	),
    // 	action: { indentAction: languages.IndentAction.Indent }
    // }
  ],

  folding: {
    markers: {
      start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
      end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->")
    }
  }
};

// https://microsoft.github.io/monaco-editor/monarch.html#htmlembed
export const language = {
  defaultToken: "",
  tokenPostfix: ".pc",
  ignoreCase: true,
  tagName: /(?:[\w\-]+:)?[\w\-\.]+/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      { include: '@node'}
    ],

    node: [
      [/<(\w+)/,       { token: 'tag.tag-$1', bracket: '@open', next: '@tag.$1' }],
      [/<\/(\w+)\s*>/, { token: 'tag.tag-$1', bracket: '@close' } ],
    ],

    tag: [
      [/>/, { cases: { '$S2==style' : { token: 'delimiter', switchTo: '@embedded.$S2', nextEmbedded: 'text/css'}}}]
    ]
  }
};
