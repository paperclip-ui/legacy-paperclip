(window.webpackJsonp = window.webpackJsonp || []).push([
  [38],
  {
    141: function(n, e, o) {
      "use strict";
      o.r(e);
      var r = o(280),
        t = o.n(r);
      e.default = {
        "button.pc": t()(
          '\n    <import src="./button-styles.pc" as="styles">\n      \n    \x3c!-- This is exported to code --\x3e  \n    <div export component as="Button"\n      className=">>>styles.Button"\n      className:secondary=">>>styles.Button--secondary"\n      className:negate=">>>styles.Button--negate">\n      {children}\n    </div>\n    \n    \x3c!-- This is a preview --\x3e\n    <div className=">>>styles.preview">\n      <Button>\n        Primary button\n      </Button>\n    \n      <Button negate>\n        Negate\n      </Button>\n\n      <Button secondary>\n        Secondary Button\n      </Button>\n      \n      <Button secondary negate>\n        Secondary Negate\n      </Button>\n    </div>\n  '
        ),
        "button-styles.pc": t()(
          '\n    \x3c!-- Styles would typically go in the same file --\x3e\n    <import src="./colors.pc">\n    <import src="./typography.pc" as="typography">\n    <style>\n      @export {\n        .Button {\n          @include typography.text-default;\n          border: 2px solid var(--color-grey-100);\n          display: inline-block;\n          border-radius: 4px;\n          padding: 8px 16px;\n          background: var(--color-grey-100);\n          color: var(--color-grey-200);\n          &--negate {\n            background-color: var(--color-red-100);\n            border-color: var(--color-red-100);\n            color: var(--color-red-200);\n          }\n          &--secondary {\n            background: transparent;\n            color: var(--color-grey-100);\n          }\n          &--secondary&--negate {\n            color: var(--color-red-100);\n          }\n        }\n        \n        .preview {\n          display: flex;\n          flex-direction: column;\n          align-items: flex-start;\n          .Button {\n            margin-bottom: 10px;\n          }\n        }\n      }\n    </style>  \n    Nothing to see here!\n  '
        ),
        "typography.pc": t()(
          '\n      \x3c!-- Typography styles --\x3e\n      <import src="./colors.pc">\n\n      <style>\n        @export {\n          @mixin text-default {\n            font-family: sans-serif;\n            color: var(--color-grey-200);\n            font-size: 18px;\n          }\n          .text-default {\n            @include text-default;\n          }    \n          .text-color-danger {\n            color: var(--color-red-100);\n          }    \n        }\n        .text-preview {\n          margin-top: 10px;\n        }\n      </style>\n      \n      \x3c!-- previews --\x3e\n      \n      <div className="text-default text-preview">\n        Default text\n      </div>\n      <div className="text-default text-preview text-color-danger">\n        Danger text\n      </div>\n  '
        ),
        "colors.pc": t()(
          '\n      \x3c!-- All colors --\x3e\n\n      <style>\n        :root {\n          --color-grey-100: #999;\n          --color-grey-200: #333;\n          --color-red-100: #F00;\n          --color-red-200: #900;\n        }\n        .ColorPreview {\n          font-family: Helvetica;\n          margin-top: 10px;\n          font-size: 18px;\n        }\n      </style>\n\n      <div component as="ColorPreview" className="ColorPreview" style="color: {value}">  \n        {value}\n      </div>\n\n      <ColorPreview value="var(--color-grey-100)" />\n      <ColorPreview value="var(--color-grey-200)" />\n      <ColorPreview value="var(--color-red-100)" />\n      <ColorPreview value="var(--color-red-200)" />\n      \n  '
        )
      };
    },
    280: function(n, e, o) {
      "use strict";
      n.exports = function(n) {
        var e = void 0;
        e = "string" == typeof n ? [n] : n.raw;
        for (var o = "", r = 0; r < e.length; r++)
          (o += e[r].replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`")),
            r < (arguments.length <= 1 ? 0 : arguments.length - 1) &&
              (o += arguments.length <= r + 1 ? void 0 : arguments[r + 1]);
        var t = o.split("\n"),
          l = null;
        return (
          t.forEach(function(n) {
            var e = n.match(/^(\s+)\S+/);
            if (e) {
              var o = e[1].length;
              l = l ? Math.min(l, o) : o;
            }
          }),
          null !== l &&
            (o = t
              .map(function(n) {
                return " " === n[0] ? n.slice(l) : n;
              })
              .join("\n")),
          (o = o.trim()).replace(/\\n/g, "\n")
        );
      };
    }
  }
]);
