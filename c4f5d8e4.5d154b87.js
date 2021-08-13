(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{141:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),r=(a(148),a(153)),o=a(22),l=a(200),i=a.n(l),s=(i()('\n    <import src="./button-styles.pc" as="styles" />\n      \n    \x3c!-- This is exported to code --\x3e  \n    <div export component as="Button"\n      className="$styles.Button"\n      className:secondary="$styles.Button--secondary"\n      className:negate="$styles.Button--negate">\n      {children}\n    </div>\n    \n    \x3c!-- This is a preview --\x3e\n    <div className="$styles.preview">\n      <Button>\n        Primary button\n      </Button>\n    \n      <Button negate>\n        Negate\n      </Button>\n\n      <Button secondary>\n        Secondary Button\n      </Button>\n      \n      <Button secondary negate>\n        Secondary Negate\n      </Button>\n    </div>\n  '),i()('\n    \x3c!-- Styles would typically go in the same file --\x3e\n    <import src="./colors.pc" />\n    <import src="./typography.pc" as="typography" />\n    <style>\n      @export {\n        .Button {\n          @include typography.text-default;\n          border: 2px solid var(--color-grey-100);\n          display: inline-block;\n          border-radius: 4px;\n          padding: 8px 16px;\n          background: var(--color-grey-100);\n          color: var(--color-grey-200);\n          &--negate {\n            background-color: var(--color-red-100);\n            border-color: var(--color-red-100);\n            color: var(--color-red-200);\n          }\n          &--secondary {\n            background: transparent;\n            color: var(--color-grey-100);\n          }\n          &--secondary&--negate {\n            color: var(--color-red-100);\n          }\n        }\n        \n        .preview {\n          display: flex;\n          flex-direction: column;\n          align-items: flex-start;\n          .Button {\n            margin-bottom: 10px;\n          }\n        }\n      }\n    </style>  \n    Nothing to see here!\n  '),i()('\n      \x3c!-- Typography styles --\x3e\n      <import src="./colors.pc" />\n\n      <style>\n        @export {\n          @mixin text-default {\n            font-family: sans-serif;\n            color: var(--color-grey-200);\n            font-size: 18px;\n          }\n          .text-default {\n            @include text-default;\n          }    \n          .text-color-danger {\n            color: var(--color-red-100);\n          }    \n        }\n        .text-preview {\n          margin-top: 10px;\n        }\n      </style>\n      \n      \x3c!-- previews --\x3e\n      \n      <div className="text-default text-preview">\n        Default text\n      </div>\n      <div className="text-default text-preview text-color-danger">\n        Danger text\n      </div>\n  '),i()('\n      \x3c!-- All colors --\x3e\n\n      <style>\n        :root {\n          --color-grey-100: #999;\n          --color-grey-200: #333;\n          --color-red-100: #F00;\n          --color-red-200: #900;\n        }\n        .ColorPreview {\n          font-family: Helvetica;\n          margin-top: 10px;\n          font-size: 18px;\n        }\n      </style>\n\n      <div component as="ColorPreview" className="ColorPreview" style="color: {value}">  \n        {value}\n      </div>\n\n      <ColorPreview value="var(--color-grey-100)" />\n      <ColorPreview value="var(--color-grey-200)" />\n      <ColorPreview value="var(--color-red-100)" />\n      <ColorPreview value="var(--color-red-200)" />\n      \n  '),'\nimport * as styles from "./styles.pc";\n\nfunction GroceryList() {\n\n  const groceries = [\n    "Milk \ud83e\udd5b", \n    "Water \ud83d\udca7", \n    "Taco seasoning \ud83c\udf2e"\n  ];\n\n  return <styles.List>\n    {\n      groceries.map(item => (\n        <styles.ListItem>{item}</styles.ListItem>;\n      ))\n    }\n  </styles.List>;  \n}\n'.trim()),d='\n<ol export component as="List">\n  <style>\n    padding-left: 1em;\n    font-family: Open Sans;\n  </style>\n  {children}\n</ol>\n\n<li export component as="ListItem">\n  <style>\n    margin-top: 6px;\n  </style>\n  {children}\n</li>\n\n\x3c!-- \n  Preview\n--\x3e\n\n<List>\n  <ListItem>Bagels \ud83e\udd6f</ListItem>\n  <ListItem>Yakitori \ud83c\udf62</ListItem>\n  <ListItem>Tofurky \ud83e\udd83</ListItem>\n  <ListItem>Skittles \ud83c\udf08</ListItem>\n</List>\n'.trim(),_=a(158);a(123);a(124);const u=e=>{const t=typeof e;return"object"===t||"string"!==t?e:e.trim().split(";").reduce(((e,t)=>{const[a,n]=t.split(":");if(!n||"undefined"===n)return e;return"undefined"===n.trim()||(e[a.trim()]=n&&n.trim()),e}),{})},p=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"1598c38",className:"_1598c38 _2ee04b36 _pub-2ee04b36 _2ee04b36_font _pub-2ee04b36_font font "+(a=e.className,a?a.split(" ").map((e=>"_2ee04b36_"+e+" _pub-2ee04b36_"+e+" "+e)).join(" "):"")},"\n  A quick brown fox jumped over the lazy dog\n");var a})));n.memo(n.forwardRef((function(e,t){return n.createElement("div",{className:"_e83a290d _2ee04b36 _pub-2ee04b36",ref:t,key:"e83a290d",style:u("font-family: "+e.fontFamily)},n.createElement(p,{key:"b03676a7",className:"extra-light"}),n.createElement(p,{key:"c7314631",className:"light"}),n.createElement(p,{key:"5e38178b"}),n.createElement(p,{key:"293f271d",className:"medium"}),n.createElement(p,{key:"b75bb2be",className:"bold"}),n.createElement(p,{key:"c05c8228",className:"extra-bold"}))}))),a(125);a(126);a(127);a(128);const m="_pub-3151939d_semi-bold semi-bold";a(129);const f=e=>e?e.split(" ").map((e=>"_3043d893_"+e+" _pub-3043d893_"+e+" "+e)).join(" "):"",y=(n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"e491a4ea",className:"_e491a4ea _3043d893 _pub-3043d893 _3043d893__col _pub-3043d893__col _col _3043d893__col3 _pub-3043d893__col3 _col3 "+f(e.className&&e.className)},e.children)}))),n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"df201df",className:"_df201df _3043d893 _pub-3043d893 _3043d893__col _pub-3043d893__col _col _3043d893__col6 _pub-3043d893__col6 _col6 "+f(e.className&&e.className)},e.children)}))),n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"e3fc60f3",className:"_e3fc60f3 _3043d893 _pub-3043d893 _3043d893__col _pub-3043d893__col _col _3043d893__col9 _pub-3043d893__col9 _col9 "+f(e.className&&e.className)},e.children)}))),n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"4444df4",className:"_4444df4 _3043d893 _pub-3043d893 _3043d893__col _pub-3043d893__col _col _3043d893__col12 _pub-3043d893__col12 _col12 "+f(e.className&&e.className)},e.children)}))),n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"9fcd1620",className:"_9fcd1620 _3043d893 _pub-3043d893 _3043d893__row _pub-3043d893__row _row "+f(e.className&&e.className)},e.children)})))),b=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"71c3770c",className:"_71c3770c _3043d893 _pub-3043d893 _3043d893__container _pub-3043d893__container _container "+f(e.className&&e.className)},e.children)})));a(130);const g=n.memo(n.forwardRef((function(e,t){return n.createElement("a",{ref:t,key:"149dda8c",className:"_149dda8c _1d429790 _pub-1d429790 _1d429790__button _pub-1d429790__button _button "+(a=e.className&&e.className,a?a.split(" ").map((e=>"_1d429790_"+e+" _pub-1d429790_"+e+" "+e)).join(" "):"")+(e.secondary?" _149dda8c _1d429790 _pub-1d429790 _1d429790__button--secondary _pub-1d429790__button--secondary _button--secondary":"")+(e.strong?" _149dda8c _1d429790 _pub-1d429790 _1d429790__button--strong _pub-1d429790__button--strong _button--strong":""),href:e.href},e.children);var a})));a(131);const h=e=>e?e.split(" ").map((e=>"_b1c0b4ab_"+e+" _pub-b1c0b4ab_"+e+" "+e)).join(" "):"",v=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"296d0dd3",className:"_296d0dd3 _b1c0b4ab _pub-b1c0b4ab _b1c0b4ab_icon _pub-b1c0b4ab_icon icon "+h(e.name)+" "+h(e.className&&e.className)})})));a(132);const k=e=>e.default||e,E=(e,t)=>({...t,className:t.className?t.className+" "+e:e}),w=n.memo(n.forwardRef((function(e,t){return n.createElement("span",{ref:t,key:"39ec88e8",className:"_39ec88e8 _81da3f7c _pub-81da3f7c _81da3f7c__highlight _pub-81da3f7c__highlight _highlight"+(e.noBreak?" _39ec88e8 _81da3f7c _pub-81da3f7c _81da3f7c_noBreak _pub-81da3f7c_noBreak noBreak":"")+(e.darker?" _39ec88e8 _81da3f7c _pub-81da3f7c _81da3f7c_darker _pub-81da3f7c_darker darker":"")+(e.bold?" _39ec88e8 _81da3f7c _pub-81da3f7c _81da3f7c_bold _pub-81da3f7c_bold bold":"")},e.children)}))),N=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"8bf1e2aa",className:"_8bf1e2aa _81da3f7c _pub-81da3f7c _81da3f7c__home _pub-81da3f7c__home _home _3151939d_text-default _pub-3151939d_text-default text-default"},e.children)}))),x=n.memo(n.forwardRef((function(e,t){return n.createElement(b,E("_65ff8386",{ref:t,key:"65ff8386",className:"_81da3f7c__header _pub-81da3f7c__header _header _81da3f7c__main _pub-81da3f7c__main _main"}),n.createElement(y,E("_b04c9138",{key:"b04c9138"}),n.createElement("div",{className:"_a0bae74f _81da3f7c _pub-81da3f7c",key:"a0bae74f"},n.createElement("img",{className:"_79a2cc81 _81da3f7c _pub-81da3f7c",key:"79a2cc81",src:k(a(241))}),"\n      Paperclip\n    ")),n.createElement(y,E("_c74ba1ae",{key:"c74ba1ae"}),n.createElement("div",{key:"a1788d78",className:"_a1788d78 _81da3f7c _pub-81da3f7c _81da3f7c__blurb _pub-81da3f7c__blurb _blurb"},n.createElement("div",{key:"44c2e531",className:"_44c2e531 _81da3f7c _pub-81da3f7c _81da3f7c__title _pub-81da3f7c__title _title"},e.title),n.createElement("div",{key:"ddcbb48b",className:"_ddcbb48b _81da3f7c _pub-81da3f7c _81da3f7c__subtext _pub-81da3f7c__subtext _subtext"},e.description),n.createElement("div",{key:"aacc841d",className:"_aacc841d _81da3f7c _pub-81da3f7c _81da3f7c__cta _pub-81da3f7c__cta _cta"},e.cta))),n.createElement(y,{key:"592f340d"},n.createElement("div",{key:"d330ab6b",className:"_d330ab6b _81da3f7c _pub-81da3f7c _81da3f7c__preview _pub-81da3f7c__preview _preview"},e.preview)))}))),j=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"8c9c26b3",className:"_8c9c26b3 _81da3f7c _pub-81da3f7c _81da3f7c__code-preview _pub-81da3f7c__code-preview _code-preview"})}))),S=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"6292479f",className:"_6292479f _81da3f7c _pub-81da3f7c _81da3f7c__summary _pub-81da3f7c__summary _summary _3043d893__row _pub-3043d893__row _row"},n.createElement("div",{key:"2e4c685e",className:"_2e4c685e _81da3f7c _pub-81da3f7c _3043d893__col12 _pub-3043d893__col12 _col12"},n.createElement("div",{key:"207bcf40",className:"_207bcf40 _81da3f7c _pub-81da3f7c _81da3f7c__title _pub-81da3f7c__title _title"},e.title),n.createElement("div",{key:"577cffd6",className:"_577cffd6 _81da3f7c _pub-81da3f7c _81da3f7c__text _pub-81da3f7c__text _text"},e.text)))}))),P=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"852a6a98",className:"_852a6a98 _81da3f7c _pub-81da3f7c _81da3f7c__main-features _pub-81da3f7c__main-features _main-features _3043d893__row _pub-3043d893__row _row"},e.children)}))),C=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"a0dcb169",className:"_a0dcb169 _81da3f7c _pub-81da3f7c _81da3f7c__item _pub-81da3f7c__item _item _3043d893__col _pub-3043d893__col _col _3043d893__col6 _pub-3043d893__col6 _col6"},n.createElement("div",{key:"3874bb02",className:"_3874bb02 _81da3f7c _pub-81da3f7c _81da3f7c__heading _pub-81da3f7c__heading _heading"},n.createElement(v,E("_5ea878d8",{key:"5ea878d8",name:e.iconName,className:"_81da3f7c__icon _pub-81da3f7c__icon _icon"})),n.createElement("div",{key:"c7a12962",className:"_c7a12962 _81da3f7c _pub-81da3f7c _81da3f7c__info _pub-81da3f7c__info _info"},n.createElement("div",{key:"25541ec2",className:"_25541ec2 _81da3f7c _pub-81da3f7c _81da3f7c__title _pub-81da3f7c__title _title"},n.createElement("span",{className:"_33eee5d1 _81da3f7c _pub-81da3f7c",key:"33eee5d1"},e.title)),n.createElement("div",{key:"bc5d4f78",className:"_bc5d4f78 _81da3f7c _pub-81da3f7c _81da3f7c__details _pub-81da3f7c__details _details"},e.description))),n.createElement("div",{key:"a17deab8",className:"_a17deab8 _81da3f7c _pub-81da3f7c _81da3f7c__example _pub-81da3f7c__example _example"},e.example))}))),B=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"4ed2d045",className:"_4ed2d045 _81da3f7c _pub-81da3f7c _81da3f7c__various-features _pub-81da3f7c__various-features _various-features _3043d893__row _pub-3043d893__row _row"},e.children)}))),L=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"a7b17570",className:"_a7b17570 _81da3f7c _pub-81da3f7c _81da3f7c__item _pub-81da3f7c__item _item _3043d893__col _pub-3043d893__col _col _3043d893__col3 _pub-3043d893__col3 _col3"},n.createElement(v,E("_3f7d13de",{key:"3f7d13de",name:e.iconName,className:"_81da3f7c__icon _pub-81da3f7c__icon _icon"})),n.createElement("div",{key:"a6744264",className:"_a6744264 _81da3f7c _pub-81da3f7c _81da3f7c__info _pub-81da3f7c__info _info"},n.createElement("div",{key:"de6950d7",className:"_de6950d7 _81da3f7c _pub-81da3f7c _81da3f7c__title _pub-81da3f7c__title _title"},n.createElement("span",{className:"_953f946f _81da3f7c _pub-81da3f7c",key:"953f946f"},e.title)),n.createElement("div",{key:"a96e6041",className:"_a96e6041 _81da3f7c _pub-81da3f7c _81da3f7c__details _pub-81da3f7c__details _details"},e.description)))}))),O=n.memo(n.forwardRef((function(e,t){return n.createElement("div",{ref:t,key:"49bf145c",className:"_49bf145c _81da3f7c _pub-81da3f7c _81da3f7c__big-feature _pub-81da3f7c__big-feature _big-feature _3043d893__section _pub-3043d893__section _section _3043d893__row _pub-3043d893__row _row"+(e.ctaText?" _49bf145c _81da3f7c _pub-81da3f7c _81da3f7c_has_cta _pub-81da3f7c_has_cta has_cta":"")},n.createElement("div",{key:"3cf9c7b0",className:"_3cf9c7b0 _81da3f7c _pub-81da3f7c _3043d893__col _pub-3043d893__col _col _3043d893__col3 _pub-3043d893__col3 _col3"},n.createElement(v,E("_48e1dcc2",{key:"48e1dcc2",name:"grow",className:"_81da3f7c__icon _pub-81da3f7c__icon _icon"})),n.createElement("div",{className:"_3fe6ec54 _81da3f7c _pub-81da3f7c",key:"3fe6ec54",clasName:"_info"},n.createElement("div",{key:"30417159",className:"_30417159 _81da3f7c _pub-81da3f7c _81da3f7c__title _pub-81da3f7c__title _title"},e.title),n.createElement("div",{key:"474641cf",className:"_474641cf _81da3f7c _pub-81da3f7c _81da3f7c__details _pub-81da3f7c__details _details"},e.description),n.createElement("a",{key:"de4f1075",className:"_de4f1075 _81da3f7c _pub-81da3f7c _81da3f7c__mini-cta-link _pub-81da3f7c__mini-cta-link _mini-cta-link",href:e.ctaHref&&e.ctaHref},e.ctaText,n.createElement(v,{key:"e6db5a08",name:"chevron-right",className:"_81da3f7c__mini-cta-icon _pub-81da3f7c__mini-cta-icon _mini-cta-icon"})))),n.createElement("div",{key:"a5f0960a",className:"_a5f0960a _81da3f7c _pub-81da3f7c _81da3f7c__preview _pub-81da3f7c__preview _preview _3043d893__col _pub-3043d893__col _col _3043d893__col9 _pub-3043d893__col9 _col9"},e.preview))}))),I=(n.memo(n.forwardRef((function(e,t){return n.createElement(N,{ref:t,key:"ae07395b"},n.createElement(x,{key:"4160da2c",title:n.createElement(n.Fragment,{children:["Use plain HTML & CSS to build web applications in ",n.createElement(w,{key:"adec955f",noBreak:!0},"record time.")]}),description:n.createElement(n.Fragment,{children:["With tooling for ",n.createElement(w,{key:"ac2eff68"},"realtime previews")," & ",n.createElement(w,{key:"42209e44"},"automatic visual regresion testing"),", you can build UIs in no time using the language you already know."]}),cta:n.createElement(n.Fragment,{children:[n.createElement(g,{key:"ae684131",className:"_3151939d_semi-bold _pub-3151939d_semi-bold semi-bold",strong:!0},"Sign up for early access")]}),preview:n.createElement("video",{className:"_5f4b82a2 _81da3f7c _pub-81da3f7c",key:"5f4b82a2",src:k(a(242)),autoplay:!0,loop:!0})}),n.createElement(S,{key:"3667eaba",title:"Iterate faster",text:"You shouldn't have to be bogged down by developer tooling in order to make simple HTML & CSS changes. And you should be able to make style changes confidently without needing to worry about introducing bugs. "}),n.createElement(P,{key:"af6ebb00"},n.createElement(C,{key:"1b99bdd6",iconName:"shapes",title:"A minimalistic UI language",description:"Paperclip just covers the visuals. No logic -  just HTML, CSS, and basic component.",example:n.createElement(j,{key:"27960c7"})}),n.createElement(C,{key:"6c9e8d40",iconName:"reactjs",title:"Import directly into React code",description:"Paperclip documents compile to plain code that you can import directly into your code.",example:n.createElement(j,{key:"1b625186"})})),n.createElement(B,{key:"d8698b96"},n.createElement(L,{key:"1a5bd7e1",iconName:"chaotic-1",title:"No global CSS",description:"CSS styles are explicitly referenced within Paperclip, so you don't have to have to worry about styles leaking out."}),n.createElement(L,{key:"6d5ce777",iconName:"link",title:"Strongly typed",description:"UIs compile to strongly typed code, so worry less about breaking changes."}),n.createElement(L,{key:"f455b6cd",iconName:"grow",title:"Works with your existing codebase",description:"Paperclip compliments your existing codebase, so use it as you go."})),n.createElement(O,{key:"a8037f19",title:"See all of your UIs in one spot",description:"No more digging around for UI elements. Open the birds-eye view to see all of your application UIs, and easily find what you're looking for.",preview:n.createElement("video",{className:"_7e1615b2 _81da3f7c _pub-81da3f7c",key:"7e1615b2",src:k(a(243)),autoplay:!0,loop:!0})}),n.createElement(O,{key:"df044f8f",title:"Cross-browser testing made easy",description:"Launch any browser directly within Paperclip and design against them in realtime.",preview:n.createElement("video",{className:"_670d24f3 _81da3f7c _pub-81da3f7c",key:"670d24f3",src:k(a(244)),autoplay:!0,loop:!0})}),n.createElement(O,{key:"4fbb521e",title:"Never miss a CSS Bug",description:"Use the visual regression tool to catch every visual state of your UI. Feel more confident about maintaining your styles.",preview:n.createElement("video",{className:"_e095383c _81da3f7c _pub-81da3f7c",key:"e095383c",src:k(a(245)),autoplay:!0,loop:!0}),ctaText:"View the API"}),n.createElement(I,{key:"38bc6288"}))}))),n.memo(n.forwardRef((function(e,t){return n.createElement("div",{className:"_b9c78028 _81da3f7c _pub-81da3f7c",ref:t,key:"b9c78028"},n.createElement("div",{className:"_80c8dc67 _81da3f7c _pub-81da3f7c",key:"80c8dc67"},n.createElement("div",{className:"_95f4ab7d _81da3f7c _pub-81da3f7c",key:"95f4ab7d"},"  \n        Paperclip is currently in closed beta, but sign up if you're interested and we'll reach out soon!\n      "),n.createElement(g,{key:"cfdfac7",className:"_3151939d_semi-bold _pub-3151939d_semi-bold semi-bold",strong:!0,href:"https://forms.gle/WJDVJEm9siYatABcA"},"Sign up for early access")))}))));t.default=function(){var e=Object(o.default)().siteConfig,t=void 0===e?{}:e;return c.a.createElement("div",{className:"home"},c.a.createElement(r.a,{className:"dograg",title:t.title+" - Rapidly build web applications at any scale.",description:"Rapidly build user interfaces, all within your existing IDE."},c.a.createElement(N,null,c.a.createElement(x,{title:c.a.createElement(c.a.Fragment,null,"Build web UIs at the speed of thought."),description:c.a.createElement(c.a.Fragment,null,"Paperclip is a free and open source tool that allows you to visually build presentational components for React, all within your existing IDE."),cta:c.a.createElement(c.a.Fragment,null,c.a.createElement(g,{className:m,href:"/docs",strong:!0},"Get Started")),preview:c.a.createElement("video",{src:"vid/paperclip-fast-demo.mp4",autoPlay:!0,loop:!0,muted:!0})}),c.a.createElement(S,{title:"Build UIs more quickly, and precisely",text:c.a.createElement(c.a.Fragment,null,"With Paperclip, you see what you're creating"," ",c.a.createElement("i",null,"as you're typing"),", no matter how large your project is. Other features such as artboards, measuring tools, and responsive testing tools are there to help you build pixel-perfect UIs in no-time. Your designers will love you. \u2764\ufe0f")}),c.a.createElement(P,null,c.a.createElement(C,{iconName:"shapes",title:"Just covers presentational components",description:c.a.createElement(c.a.Fragment,null,"Paperclip focuses purely on your application's appearance using a syntax similar to HTML & CSS. CSS is also scoped so you don't have to worry about it leaking out."),example:c.a.createElement(_.a,{className:"language-html",style:{height:500}},d)}),c.a.createElement(C,{iconName:"reactjs",title:"Import directly into your React app",description:"Paperclip files compile down to regular, performant code that you can import directly into your React app.",example:c.a.createElement(_.a,{className:"language-jsx"},s)})),c.a.createElement(B,null,c.a.createElement(L,{iconName:"chaotic-1",title:"Keeps CSS maintainable",description:"Paperclip comes with loads of safety features such as scoped styles, and visual regression testing, to ensure that your HTML & CSS is maintainable as your project grows."}),c.a.createElement(L,{iconName:"link",title:"Live previews",description:["Conveniently build UIs ",c.a.createElement("i",null,"live")," alongside your code editor and see your changes appear immediately as you're typing, no matter how large your project is."]}),c.a.createElement(L,{iconName:"grow",title:"Just like CSS-in-JS",description:c.a.createElement(c.a.Fragment,null,"Paperclip works just like other CSS-in-JS libraries such as Emotion, and Styled Components. If you don't like Paperclip, you can easily switch back.")})),c.a.createElement(O,{title:"Pairs well with existing CSS",description:["Paperclip enhances your existing CSS by keeping it ",c.a.createElement("i",null,"scoped"),", so you have absolute control over how it's used in your app, and never have to worry about styles leaking out."],preview:c.a.createElement(_.a,{className:"language-html"},'\n<import src="./tailwind.css" inject-styles />\n\n\n\x3c!--\n  @frame { width: 768, height: 768, x: 0, y: 0 }\n--\x3e\n\n<div class="font-sans bg-gray-500 h-screen w-screen">\n  <div class="bg-gray-100 rounded-lg p-8 md:p-0">\n    <div class="pt-6 text-center space-y-4">\n      <blockquote>\n        <p class="text-lg font-semibold">\n          Lorem ipsum dolor sit amet, consectetur adipiscing elit, \n          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n        </p>\n      </blockquote>\n      <figcaption class="font-medium">\n        <div class="text-blue-600">\n          sit voluptatem\n        </div>\n      </figcaption>\n    </div>\n  </div>\n</div>')}),c.a.createElement(O,{title:"Everything in one spot",description:["Use the birds-eye view to see ",c.a.createElement("i",null,"all")," of your components, and find exactly what you're looking for."],preview:c.a.createElement("video",{src:"vid/grid-demo.mp4",autoPlay:!0,loop:!0,muted:!0})}),c.a.createElement(O,{title:"Cross-browser testing made easy",description:["Launch ",c.a.createElement("i",null,"any browser")," you want directly from Paperclip to catch those elusive CSS bugs more quickly."],preview:c.a.createElement("video",{src:"vid/cross-browser-testing.mp4",autoPlay:!0,loop:!0,muted:!0})}),c.a.createElement(O,{title:"Easy visual regression test setup",description:"Paperclip comes with visual regression tooling that takes less than 10 minutes to setup and gives you nearly 100% visual regression coverage, so you can feel confident about making big style changes in your application without breaking production.",preview:c.a.createElement("video",{src:"vid/visual-regression-testing.mp4",autoPlay:!0,loop:!0,muted:!0})}),c.a.createElement(I,null))))}},156:function(e,t,a){"use strict";var n={plain:{color:"#bfc7d5",backgroundColor:"#292d3e"},styles:[{types:["comment"],style:{color:"rgb(105, 112, 152)",fontStyle:"italic"}},{types:["string","inserted"],style:{color:"rgb(195, 232, 141)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation","selector"],style:{color:"rgb(199, 146, 234)"}},{types:["variable"],style:{color:"rgb(191, 199, 213)"}},{types:["class-name","attr-name"],style:{color:"rgb(255, 203, 107)"}},{types:["tag","deleted"],style:{color:"rgb(255, 85, 114)"}},{types:["operator"],style:{color:"rgb(137, 221, 255)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["keyword"],style:{fontStyle:"italic"}},{types:["doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}},{types:["url"],style:{color:"rgb(221, 221, 221)"}}]},c=a(165),r=a(149);t.a=function(){var e=Object(r.useThemeConfig)().prism,t=Object(c.a)().isDarkTheme,a=e.theme||n,o=e.darkTheme||a;return t?o:a}},158:function(e,t,a){"use strict";var n=a(3),c=a(0),r=a.n(c),o=a(148),l={plain:{backgroundColor:"#2a2734",color:"#9a86fd"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#6c6783"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#e09142"}},{types:["property","function"],style:{color:"#9a86fd"}},{types:["tag-id","selector","atrule-id"],style:{color:"#eeebff"}},{types:["attr-name"],style:{color:"#c4b9fe"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","at-rule","placeholder","variable"],style:{color:"#ffcc99"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#c4b9fe"}}]},i={Prism:a(24).a,theme:l};function s(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function d(){return(d=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}var _=/\r\n|\r|\n/,u=function(e){0===e.length?e.push({types:["plain"],content:"",empty:!0}):1===e.length&&""===e[0].content&&(e[0].empty=!0)},p=function(e,t){var a=e.length;return a>0&&e[a-1]===t?e:e.concat(t)},m=function(e,t){var a=e.plain,n=Object.create(null),c=e.styles.reduce((function(e,a){var n=a.languages,c=a.style;return n&&!n.includes(t)||a.types.forEach((function(t){var a=d({},e[t],c);e[t]=a})),e}),n);return c.root=a,c.plain=d({},a,{backgroundColor:null}),c};function f(e,t){var a={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&-1===t.indexOf(n)&&(a[n]=e[n]);return a}var y=function(e){function t(){for(var t=this,a=[],n=arguments.length;n--;)a[n]=arguments[n];e.apply(this,a),s(this,"getThemeDict",(function(e){if(void 0!==t.themeDict&&e.theme===t.prevTheme&&e.language===t.prevLanguage)return t.themeDict;t.prevTheme=e.theme,t.prevLanguage=e.language;var a=e.theme?m(e.theme,e.language):void 0;return t.themeDict=a})),s(this,"getLineProps",(function(e){var a=e.key,n=e.className,c=e.style,r=d({},f(e,["key","className","style","line"]),{className:"token-line",style:void 0,key:void 0}),o=t.getThemeDict(t.props);return void 0!==o&&(r.style=o.plain),void 0!==c&&(r.style=void 0!==r.style?d({},r.style,c):c),void 0!==a&&(r.key=a),n&&(r.className+=" "+n),r})),s(this,"getStyleForToken",(function(e){var a=e.types,n=e.empty,c=a.length,r=t.getThemeDict(t.props);if(void 0!==r){if(1===c&&"plain"===a[0])return n?{display:"inline-block"}:void 0;if(1===c&&!n)return r[a[0]];var o=n?{display:"inline-block"}:{},l=a.map((function(e){return r[e]}));return Object.assign.apply(Object,[o].concat(l))}})),s(this,"getTokenProps",(function(e){var a=e.key,n=e.className,c=e.style,r=e.token,o=d({},f(e,["key","className","style","token"]),{className:"token "+r.types.join(" "),children:r.content,style:t.getStyleForToken(r),key:void 0});return void 0!==c&&(o.style=void 0!==o.style?d({},o.style,c):c),void 0!==a&&(o.key=a),n&&(o.className+=" "+n),o}))}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.render=function(){var e=this.props,t=e.Prism,a=e.language,n=e.code,c=e.children,r=this.getThemeDict(this.props),o=t.languages[a];return c({tokens:function(e){for(var t=[[]],a=[e],n=[0],c=[e.length],r=0,o=0,l=[],i=[l];o>-1;){for(;(r=n[o]++)<c[o];){var s=void 0,d=t[o],m=a[o][r];if("string"==typeof m?(d=o>0?d:["plain"],s=m):(d=p(d,m.type),m.alias&&(d=p(d,m.alias)),s=m.content),"string"==typeof s){var f=s.split(_),y=f.length;l.push({types:d,content:f[0]});for(var b=1;b<y;b++)u(l),i.push(l=[]),l.push({types:d,content:f[b]})}else o++,t.push(d),a.push(s),n.push(0),c.push(s.length)}o--,t.pop(),a.pop(),n.pop(),c.pop()}return u(l),i}(void 0!==o?t.tokenize(n,o,a):[n]),className:"prism-code language-"+a,style:void 0!==r?r.root:{},getLineProps:this.getLineProps,getTokenProps:this.getTokenProps})},t}(c.Component),b=a(172),g=a.n(b),h=a(173),v=a.n(h),k=a(156),E=a(60),w=a.n(E),N=a(149),x=/{([\d,-]+)}/,j=function(e){void 0===e&&(e=["js","jsBlock","jsx","python","html"]);var t={js:{start:"\\/\\/",end:""},jsBlock:{start:"\\/\\*",end:"\\*\\/"},jsx:{start:"\\{\\s*\\/\\*",end:"\\*\\/\\s*\\}"},python:{start:"#",end:""},html:{start:"\x3c!--",end:"--\x3e"}},a=["highlight-next-line","highlight-start","highlight-end"].join("|"),n=e.map((function(e){return"(?:"+t[e].start+"\\s*("+a+")\\s*"+t[e].end+")"})).join("|");return new RegExp("^\\s*(?:"+n+")\\s*$")},S=/(?:title=")(.*)(?:")/;t.a=function(e){var t=e.children,a=e.className,l=e.metastring,s=Object(N.useThemeConfig)().prism,d=Object(c.useState)(!1),_=d[0],u=d[1],p=Object(c.useState)(!1),m=p[0],f=p[1];Object(c.useEffect)((function(){f(!0)}),[]);var b=Object(c.useRef)(null),h=[],E="",P=Object(k.a)(),C=Array.isArray(t)?t.join(""):t;if(l&&x.test(l)){var B=l.match(x)[1];h=v()(B).filter((function(e){return e>0}))}l&&S.test(l)&&(E=l.match(S)[1]);var L=a&&a.replace(/language-/,"");!L&&s.defaultLanguage&&(L=s.defaultLanguage);var O=C.replace(/\n$/,"");if(0===h.length&&void 0!==L){for(var I,R="",F=function(e){switch(e){case"js":case"javascript":case"ts":case"typescript":return j(["js","jsBlock"]);case"jsx":case"tsx":return j(["js","jsBlock","jsx"]);case"html":return j(["js","jsBlock","html"]);case"python":case"py":return j(["python"]);default:return j()}}(L),T=C.replace(/\n$/,"").split("\n"),D=0;D<T.length;){var M=D+1,U=T[D].match(F);if(null!==U){switch(U.slice(1).reduce((function(e,t){return e||t}),void 0)){case"highlight-next-line":R+=M+",";break;case"highlight-start":I=M;break;case"highlight-end":R+=I+"-"+(M-1)+","}T.splice(D,1)}else D+=1}h=v()(R),O=T.join("\n")}var z=function(){g()(O),u(!0),setTimeout((function(){return u(!1)}),2e3)};return r.a.createElement(y,Object(n.a)({},i,{key:String(m),theme:P,code:O,language:L}),(function(e){var t,a=e.className,c=e.style,l=e.tokens,i=e.getLineProps,s=e.getTokenProps;return r.a.createElement(r.a.Fragment,null,E&&r.a.createElement("div",{style:c,className:w.a.codeBlockTitle},E),r.a.createElement("div",{className:w.a.codeBlockContent},r.a.createElement("div",{tabIndex:0,className:Object(o.a)(a,w.a.codeBlock,"thin-scrollbar",(t={},t[w.a.codeBlockWithTitle]=E,t))},r.a.createElement("div",{className:w.a.codeBlockLines,style:c},l.map((function(e,t){1===e.length&&""===e[0].content&&(e[0].content="\n");var a=i({line:e,key:t});return h.includes(t+1)&&(a.className=a.className+" docusaurus-highlight-code-line"),r.a.createElement("div",Object(n.a)({key:t},a),e.map((function(e,t){return r.a.createElement("span",Object(n.a)({key:t},s({token:e,key:t})))})))})))),r.a.createElement("button",{ref:b,type:"button","aria-label":"Copy code to clipboard",className:Object(o.a)(w.a.copyButton),onClick:z},_?"Copied":"Copy")))}))}},172:function(e,t,a){"use strict";const n=(e,{target:t=document.body}={})=>{const a=document.createElement("textarea"),n=document.activeElement;a.value=e,a.setAttribute("readonly",""),a.style.contain="strict",a.style.position="absolute",a.style.left="-9999px",a.style.fontSize="12pt";const c=document.getSelection();let r=!1;c.rangeCount>0&&(r=c.getRangeAt(0)),t.append(a),a.select(),a.selectionStart=0,a.selectionEnd=e.length;let o=!1;try{o=document.execCommand("copy")}catch(l){}return a.remove(),r&&(c.removeAllRanges(),c.addRange(r)),n&&n.focus(),o};e.exports=n,e.exports.default=n},173:function(e,t){function a(e){let t,a=[];for(let n of e.split(",").map((e=>e.trim())))if(/^-?\d+$/.test(n))a.push(parseInt(n,10));else if(t=n.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/)){let[e,n,c,r]=t;if(n&&r){n=parseInt(n),r=parseInt(r);const e=n<r?1:-1;"-"!==c&&".."!==c&&"\u2025"!==c||(r+=e);for(let t=n;t!==r;t+=e)a.push(t)}}return a}t.default=a,e.exports=a},200:function(e,t,a){"use strict";e.exports=function(e){var t=void 0;t="string"==typeof e?[e]:e.raw;for(var a="",n=0;n<t.length;n++)a+=t[n].replace(/\\\n[ \t]*/g,"").replace(/\\`/g,"`"),n<(arguments.length<=1?0:arguments.length-1)&&(a+=arguments.length<=n+1?void 0:arguments[n+1]);var c=a.split("\n"),r=null;return c.forEach((function(e){var t=e.match(/^(\s+)\S+/);if(t){var a=t[1].length;r=r?Math.min(r,a):a}})),null!==r&&(a=c.map((function(e){return" "===e[0]?e.slice(r):e})).join("\n")),(a=a.trim()).replace(/\\n/g,"\n")}},241:function(e,t,a){"use strict";a.r(t),a.d(t,"ReactComponent",(function(){return m}));var n=a(0);function c(){return(c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}function r(e,t){if(null==e)return{};var a,n,c=function(e,t){if(null==e)return{};var a,n,c={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(c[a]=e[a]);return c}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(c[a]=e[a])}return c}var o=n.createElement("path",{fill:"#FF8080",d:"M24 15h6v4h-6z"}),l=n.createElement("path",{fill:"#8094FF",d:"M33 15h3v4h-3z"}),i=n.createElement("path",{fill:"#80FFB2",d:"M21 22h8v4h-8z"}),s=n.createElement("path",{fill:"#DE80FF",d:"M16 29h9v4h-9zM27 8h5v4h-5z"}),d=n.createElement("path",{fill:"#FFE380",d:"M28 29h4v4h-4z"}),_=n.createElement("path",{fill:"#8094FF",d:"M14 36h8v4h-8z"}),u=n.createElement("path",{fill:"#80FFB2",d:"M25 36h9v4h-9z"}),p=n.createElement("path",{d:"M52.838 33.321l-13.424-23.25c-2.694-4.666-9.43-4.666-12.124 0l-13.857 24c-2.694 4.667.674 10.5 6.063 10.5h17.699m3.147-32.892l13.75 23.816a5.5 5.5 0 11-9.526 5.5l-9.625-16.671",stroke:"#FFF",strokeWidth:4,strokeLinecap:"round",strokeLinejoin:"round"});function m(e){var t=e.title,a=e.titleId,m=r(e,["title","titleId"]);return n.createElement("svg",c({width:64,height:62,viewBox:"0 0 64 62",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-labelledby":a},m),t?n.createElement("title",{id:a},t):null,o,l,i,s,d,_,u,p)}t.default=a.p+"9cec8c5fd90d28aef5b40f66f90c4b6d.svg"},242:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/medias/paperclip-fast-demo-c2b6969df90230ac2918a59bfb42a2b0.mp4"},243:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/medias/grid-demo-33c65dbdf058fd67661b6bc7221e3e7c.mp4"},244:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/medias/cross-browser-testing-ad84afdd569764285fc06dff2b1e55c6.mp4"},245:function(e,t,a){"use strict";a.r(t),t.default=a.p+"assets/medias/visual-regression-testing-e47de56ac5c99316145fd2e81cbc0582.mp4"}}]);