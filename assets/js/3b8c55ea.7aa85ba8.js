"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[3217],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return d}});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),f=p(n),d=o,m=f["".concat(c,".").concat(d)]||f[d]||s[d]||i;return n?r.createElement(m,a(a({ref:t},u),{},{components:n})):r.createElement(m,a({ref:t},u))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var p=2;p<i;p++)a[p]=n[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},71425:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return c},metadata:function(){return p},toc:function(){return u},default:function(){return f}});var r=n(87462),o=n(63366),i=(n(67294),n(3905)),a=["components"],l={id:"installation",title:"Installation",sidebar_label:"Installation"},c=void 0,p={unversionedId:"installation",id:"installation",title:"Installation",description:"To get started with Paperclip, just run this command in your project directory:",source:"@site/docs/installation.md",sourceDirName:".",slug:"/installation",permalink:"/docs/installation",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/installation.md",tags:[],version:"current",frontMatter:{id:"installation",title:"Installation",sidebar_label:"Installation"},sidebar:"docs",next:{title:"Syntax",permalink:"/docs/usage-syntax"}},u=[],s={toc:u};function f(e){var t=e.components,n=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"To get started with Paperclip, just run this command in your project directory:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"npx paperclip-cli init\n")),(0,i.kt)("p",null,"This will walk you through the setup process that will ask you to pick a target compiler. After it's done running, you'll notice a few new files. Next, just run this command:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"npx paperclip-cli build\n")),(0,i.kt)("p",null,"You should notice a few more generated files, ",(0,i.kt)("strong",{parentName:"p"},"these ones can be imported directly into your codebase"),". And that's it! You're ready to start using Paperclip."))}f.isMDXComponent=!0}}]);