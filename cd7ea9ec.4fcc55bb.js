(window.webpackJsonp=window.webpackJsonp||[]).push([[53],{133:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return u}));var r=n(3),o=n(7),a=(n(0),n(147)),i={id:"visual-tooling",title:"Visual Tooling",sidebar_label:"Visual Tooling"},c={unversionedId:"visual-tooling",id:"visual-tooling",isDocsHomePage:!1,title:"Visual Tooling",description:"Paperclip comes with visual tooling that allows you to see your UI changes instantly.",source:"@site/docs/visual-tooling.md",slug:"/visual-tooling",permalink:"/docs/visual-tooling",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/visual-tooling.md",version:"current",sidebar_label:"Visual Tooling",sidebar:"docs",previous:{title:"New Project",permalink:"/docs/getting-started-new-project"},next:{title:"Using Paperclip In React Apps",permalink:"/docs/usage-react"}},l=[{value:"VS Code extension",id:"vs-code-extension",children:[]},{value:"CLI dev server",id:"cli-dev-server",children:[]}],s={toc:l};function u(e){var t=e.components,i=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},s,i,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Paperclip comes with visual tooling that allows you to see your UI changes instantly."),Object(a.b)("p",null,"There are two options:"),Object(a.b)("ol",null,Object(a.b)("li",{parentName:"ol"},"For VS Code users, you can install the ",Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode"}),"extension"),"."),Object(a.b)("li",{parentName:"ol"},"For non-vscode users, you can install the ",Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"#cli-dev-server"}),"CLI tools"),".")),Object(a.b)("h3",{id:"vs-code-extension"},"VS Code extension"),Object(a.b)("p",null,"I highly recommend using the ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode"}),"VS Code extension")," since you can launch previews directly from the IDE, and changes appear ",Object(a.b)("em",{parentName:"p"},"as you type"),".  "),Object(a.b)("p",null,Object(a.b)("img",{alt:"alt Realtime editing",src:n(160).default})),Object(a.b)("p",null,"Check out the ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"guide-vscode"}),"VS Code extension guide")," for more info."),Object(a.b)("h3",{id:"cli-dev-server"},"CLI dev server"),Object(a.b)("p",null,"If you don't have VS Code, you can just run the CLI tool:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{}),"npx paperclip-cli dev\n")),Object(a.b)("p",null,"This will launch Paperclip's visual tooling in the browser. Changes that are saved locally will appear immediately here. "),Object(a.b)("p",null,Object(a.b)("img",{alt:"alt Realtime editing",src:n(174).default})),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},"Note that there are some limitations to the dev server. For example, you won't be able to move frames around, and you won't be able to jump to source code via ",Object(a.b)("inlineCode",{parentName:"p"},"meta + click"),". That functionality is only available for the IDE extensions.")))}u.isMDXComponent=!0},147:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),u=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=u(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,i=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=u(n),d=r,m=p["".concat(i,".").concat(d)]||p[d]||b[d]||a;return n?o.a.createElement(m,c(c({ref:t},s),{},{components:n})):o.a.createElement(m,c({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=d;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var s=2;s<a;s++)i[s]=n[s];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},160:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/vscode-measure-04c548edf45f10b5473ae1e8e7b29c71.gif"},174:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/demo-dev-server-1540797b77660a34747d8bd890815f91.gif"}}]);