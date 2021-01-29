import { languages } from "monaco-editor-core";


// https://github.com/microsoft/monaco-languages/tree/master/src/html
export const config: languages.LanguageConfiguration = {

	wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,

	comments: {
		blockComment: ['<!--', '-->']
	},

	brackets: [
		['<!--', '-->'],
		['<', '>'],
		['{', '}'],
		['(', ')']
	],

	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" }
	],

	surroundingPairs: [
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '<', close: '>' }
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
			start: new RegExp('^\\s*<!--\\s*#region\\b.*-->'),
			end: new RegExp('^\\s*<!--\\s*#endregion\\b.*-->')
		}
	}
}

export const language = {
  defaultToken: '',
tokenPostfix: '.pc',
ignoreCase: true,

// The main tokenizer for our languages
tokenizer: {
  root: [
    { include: '@slot'},
    [/<!--/, 'comment', '@comment'],
    [/(<)((?:[\w\-]+:)?[\w\-]+)(\s*)(\/>)/, ['delimiter', 'tag', '', 'delimiter']],
    [/(<)(style)/, ['delimiter', { token: 'tag', next: '@style' }]],
    [/(<)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
    [/(<\/)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
    [/</, 'delimiter'],
    [/[^<{]+/] // text
  ],

  doctype: [
    [/[^>]+/, 'metatag.content'],
    [/>/, 'metatag', '@pop']
  ],

  comment: [
    [/-->/, 'comment', '@pop'],
    [/[^-]+/, 'comment.content'],
    [/./, 'comment.content']
  ],

  otherTag: [
    [/\/?>/, 'delimiter', '@pop'],
    [/"([^"]*)"/, 'attribute.value'],
    [/'([^']*)'/, 'attribute.value'],
    [/[\w\-]+/, 'attribute.name'],
    [/=/, 'delimiter'],
    [/[ \t\r\n]+/] // whitespace
  ],

  slot: [
    [/\{/, {
      token: 'delimiter',
      next: 'slotEmbedded',
      nextEmbedded: "text/pcs",
    }]
  ],

  slotEmbedded: [
    [/}/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }]
  ],




  // -- BEGIN <style> tags handling

  // After <style
  style: [
    [/type/, 'attribute.name', '@styleAfterType'],
    [/"([^"]*)"/, 'attribute.value'],
    [/'([^']*)'/, 'attribute.value'],
    [/[\w\-]+/, 'attribute.name'],
    [/=/, 'delimiter'],
    [
      />/,
      {
        token: 'delimiter',
        next: '@styleEmbedded',
        nextEmbedded: 'text/pcss'
      }
    ],
    [/[ \t\r\n]+/], // whitespace
    [/(<\/)(style\s*)(>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
  ],

  // After <style ... type
  styleAfterType: [
    [/=/, 'delimiter', '@styleAfterTypeEquals'],
    [
      />/,
      {
        token: 'delimiter',
        next: '@styleEmbedded',
        nextEmbedded: 'text/pcss'
      }
    ], // cover invalid e.g. <style type>
    [/[ \t\r\n]+/], // whitespace
    [/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
  ],

  // After <style ... type =
  styleAfterTypeEquals: [
    [
      /"([^"]*)"/,
      {
        token: 'attribute.value',
        switchTo: '@styleWithCustomType.$1'
      }
    ],
    [
      /'([^']*)'/,
      {
        token: 'attribute.value',
        switchTo: '@styleWithCustomType.$1'
      }
    ],
    [
      />/,
      {
        token: 'delimiter',
        next: '@styleEmbedded',
        nextEmbedded: 'text/css'
      }
    ], // cover invalid e.g. <style type=>
    [/[ \t\r\n]+/], // whitespace
    [/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
  ],

  // After <style ... type = $S2
  styleWithCustomType: [
    [
      />/,
      {
        token: 'delimiter',
        next: '@styleEmbedded.$S2',
        nextEmbedded: '$S2'
      }
    ],
    [/"([^"]*)"/, 'attribute.value'],
    [/'([^']*)'/, 'attribute.value'],
    [/[\w\-]+/, 'attribute.name'],
    [/=/, 'delimiter'],
    [/[ \t\r\n]+/], // whitespace
    [/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
  ],

  styleEmbedded: [
    [/<\/style/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
    [/[^<]+/, '']
  ]
}
};