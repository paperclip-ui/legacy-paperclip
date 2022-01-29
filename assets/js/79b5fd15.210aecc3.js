"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[313],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),d=c(r),m=o,f=d["".concat(l,".").concat(m)]||d[m]||s[m]||a;return r?n.createElement(f,i(i({ref:t},u),{},{components:r})):n.createElement(f,i({ref:t},u))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:o,i[1]=p;for(var c=2;c<a;c++)i[c]=r[c];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},4432:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return p},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var n=r(7462),o=r(3366),a=(r(7294),r(3905)),i=["components"],p={id:"guide-modules",title:"Writing Paperclip Modules",sidebar_label:"Paperclip Modules"},l=void 0,c={unversionedId:"guide-modules",id:"guide-modules",title:"Writing Paperclip Modules",description:"Paperclip can be modularized for re-usability across packages or NPM. To get started, make sure that you have a paperclip.config.json",source:"@site/docs/guide-modules.md",sourceDirName:".",slug:"/guide-modules",permalink:"/docs/guide-modules",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/guide-modules.md",tags:[],version:"current",frontMatter:{id:"guide-modules",title:"Writing Paperclip Modules",sidebar_label:"Paperclip Modules"}},u=[],s={toc:u};function d(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Paperclip can be modularized for re-usability across packages or NPM. To get started, make sure that you have a ",(0,a.kt)("a",{parentName:"p",href:"/docs/configure-paperclip"},"paperclip.config.json"),"\nfile in the ",(0,a.kt)("em",{parentName:"p"},"same")," directory as your ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json")," file like so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"packages/\n  my-module/\n    package.json\n    paperclip.config.json\n    src/ # source files\n")),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u261d It's important that ",(0,a.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," is in the same directory as ",(0,a.kt)("inlineCode",{parentName:"p"},"package.json"),", because this is how the Paperclip engine\nidentify that this is a Paperclip module.")),(0,a.kt)("p",null,"Going back to your ",(0,a.kt)("em",{parentName:"p"},"project's")," ",(0,a.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," file, add a new ",(0,a.kt)("inlineCode",{parentName:"p"},"moduleDirs")," property like so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "moduleDirs": ["node_modules"]\n}\n')),(0,a.kt)("p",null,"Next, assuming that ",(0,a.kt)("inlineCode",{parentName:"p"},"my-module")," is already installed in the ",(0,a.kt)("inlineCode",{parentName:"p"},"node_modules")," directory (via Yarn workspaces or Lerna), you can go ahead and\nimport your module files into your project."))}d.isMDXComponent=!0}}]);