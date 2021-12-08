import { languages } from "monaco-editor";

// https://github.com/microsoft/monaco-languages/tree/master/src/html
export const config: languages.LanguageConfiguration = {};

export const language = {
  defaultToken: "",
  tokenPostfix: ".pcs",
  ignoreCase: true,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [{ include: "@common" }],
    common: [
      [/[\w_$]/, "keyword.other", "@reference"],
      [/^\s*/, "keyword.other"],
      [/"/, "string", "@stringDouble"],
      [/'/, "string", "@stringSingle"],
      [/(&&|\|\|)/, "delimiter"],
      { include: "@element" }
    ],
    reference: [
      [/[\w\d]+/, "keyword.other"],
      [/(?=[^\w\d])/, "keyword.other", "@pop"]
    ],
    operator: [[/&&|\|\|/, "delimiter"]],

    element: [
      [
        /(?=<)/,
        {
          token: "delimiter",
          next: "elementEmbedded",
          nextEmbedded: "text/paperclip"
        }
      ]
    ],

    elementEmbedded: [
      [
        /^(?=<\/|\/>)/,
        { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }
      ]
    ],
    stringDouble: [
      [/[^\"]+/, "string"],
      [/"/, "string", "@pop"]
    ],

    stringSingle: [
      [/[^']+/, "string"],
      [/'/, "string", "@pop"]
    ]
  }
};
