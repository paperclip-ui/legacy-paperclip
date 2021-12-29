"use strict";
exports.id = 1569;
exports.ids = [1569];
exports.modules = {

/***/ 51569:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "conf": () => (/* binding */ conf),
/* harmony export */   "language": () => (/* binding */ language)
/* harmony export */ });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var conf = {
    comments: {
        lineComment: '#'
    }
};
var language = {
    defaultToken: 'keyword',
    ignoreCase: true,
    tokenPostfix: '.azcli',
    str: /[^#\s]/,
    tokenizer: {
        root: [
            { include: '@comment' },
            [
                /\s-+@str*\s*/,
                {
                    cases: {
                        '@eos': { token: 'key.identifier', next: '@popall' },
                        '@default': { token: 'key.identifier', next: '@type' }
                    }
                }
            ],
            [
                /^-+@str*\s*/,
                {
                    cases: {
                        '@eos': { token: 'key.identifier', next: '@popall' },
                        '@default': { token: 'key.identifier', next: '@type' }
                    }
                }
            ]
        ],
        type: [
            { include: '@comment' },
            [
                /-+@str*\s*/,
                {
                    cases: {
                        '@eos': { token: 'key.identifier', next: '@popall' },
                        '@default': 'key.identifier'
                    }
                }
            ],
            [
                /@str+\s*/,
                {
                    cases: {
                        '@eos': { token: 'string', next: '@popall' },
                        '@default': 'string'
                    }
                }
            ]
        ],
        comment: [
            [
                /#.*$/,
                {
                    cases: {
                        '@eos': { token: 'comment', next: '@popall' }
                    }
                }
            ]
        ]
    }
};


/***/ })

};
;