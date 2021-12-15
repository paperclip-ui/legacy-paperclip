"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[1194],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=c(n),m=o,f=d["".concat(s,".").concat(m)]||d[m]||p[m]||a;return n?r.createElement(f,i(i({ref:t},u),{},{components:n})):r.createElement(f,i({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var c=2;c<a;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},4897:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),i=["components"],l={id:"getting-started-vscode",title:"Installing the visual tools",sidebar_label:"Installing visual tools"},s=void 0,c={unversionedId:"getting-started-vscode",id:"getting-started-vscode",isDocsHomePage:!1,title:"Installing the visual tools",description:"Paperclip comes with visual tooling that eliminiates the compile step so that you can see your changes immediately after you save (or type if you're using VS Code extension). You'll be happy to use them!",source:"@site/docs/getting-started-vscode.md",sourceDirName:".",slug:"/getting-started-vscode",permalink:"/docs/getting-started-vscode",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/getting-started-vscode.md",tags:[],version:"current",frontMatter:{id:"getting-started-vscode",title:"Installing the visual tools",sidebar_label:"Installing visual tools"}},u=[{value:"VS Code extension",id:"vs-code-extension",children:[],level:2},{value:"CLI dev server",id:"cli-dev-server",children:[],level:2}],p={toc:u};function d(e){var t=e.components,l=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},p,l,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Paperclip comes with visual tooling that eliminiates the compile step so that you can see your changes immediately after you save (or type if you're using VS Code extension). You'll be happy to use them! "),(0,a.kt)("p",null,"There are two options currently for getting started locally:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"For VS Code users, you can install the extension."),(0,a.kt)("li",{parentName:"ol"},"For non-vscode users, you can install the CLI tools.")),(0,a.kt)("h2",{id:"vs-code-extension"},"VS Code extension"),(0,a.kt)("p",null,"I highly recommend using the ",(0,a.kt)("a",{parentName:"p",href:"https://marketplace.visualstudio.com/items?itemName=crcn.paperclip-vscode"},"VS Code extension")," since you can launch previews directly from the IDE, and changes appear ",(0,a.kt)("em",{parentName:"p"},"as you type"),".  "),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"alt Realtime editing",src:n(9143).Z})),(0,a.kt)("p",null,"Check out the ",(0,a.kt)("a",{parentName:"p",href:"guide-vscode"},"VS Code extension guide")," for more info."),(0,a.kt)("h2",{id:"cli-dev-server"},"CLI dev server"),(0,a.kt)("p",null,"If you don't have VS Code, you can just run the CLI tool:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"npx paperclip dev\n")),(0,a.kt)("p",null,"This will launch Paperclip's visual tooling in the browser. Changes that are saved locally will appear immediately here. "),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"alt Realtime editing",src:n(6683).Z})),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"Note that there are some limitations to the dev server. For example, you won't be able to move frames around, and you won't be able to jump to source code via ",(0,a.kt)("inlineCode",{parentName:"p"},"meta + click"),". That functionality is only available for the IDE extensions.")))}d.isMDXComponent=!0},6683:function(e,t,n){t.Z=n.p+"assets/images/demo-dev-server-1540797b77660a34747d8bd890815f91.gif"},9143:function(e,t,n){t.Z=n.p+"assets/images/vscode-measure-04c548edf45f10b5473ae1e8e7b29c71.gif"}}]);