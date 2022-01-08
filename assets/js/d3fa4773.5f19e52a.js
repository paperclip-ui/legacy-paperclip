"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[5919],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return d}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),f=p(n),d=i,m=f["".concat(l,".").concat(d)]||f[d]||u[d]||o;return n?r.createElement(m,a(a({ref:t},s),{},{components:n})):r.createElement(m,a({ref:t},s))}));function d(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=f;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:i,a[1]=c;for(var p=2;p<o;p++)a[p]=n[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},19918:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return p},toc:function(){return s},default:function(){return f}});var r=n(87462),i=n(63366),o=(n(67294),n(3905)),a=["components"],c={id:"configure-jest",title:"Configure Paperclip with Jest",sidebar_label:"Jest"},l=void 0,p={unversionedId:"configure-jest",id:"configure-jest",title:"Configure Paperclip with Jest",description:"You can include Paperclip UIs directly in your Jest tests.",source:"@site/docs/configure-jest.md",sourceDirName:".",slug:"/configure-jest",permalink:"/docs/configure-jest",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/configure-jest.md",tags:[],version:"current",frontMatter:{id:"configure-jest",title:"Configure Paperclip with Jest",sidebar_label:"Jest"},sidebar:"docs",previous:{title:"Percy",permalink:"/docs/configure-percy"},next:{title:"Prettier",permalink:"/docs/configure-prettier"}},s=[{value:"Installation",id:"installation",children:[],level:2},{value:"package.json Config",id:"packagejson-config",children:[],level:2}],u={toc:s};function f(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"You can include Paperclip UIs directly in your Jest tests. "),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm install jest-paperclip --save-dev\n")),(0,o.kt)("h2",{id:"packagejson-config"},"package.json Config"),(0,o.kt)("p",null,"After installing the ",(0,o.kt)("inlineCode",{parentName:"p"},"jest-paperclip")," module, You'll need to update the ",(0,o.kt)("inlineCode",{parentName:"p"},"jest.transform")," property like so:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'"jest": {\n  "transform": {\n    "^.+\\\\.pc$": "jest-paperclip"\n  }\n}\n')),(0,o.kt)("p",null,"After that, you should be able to import ",(0,o.kt)("inlineCode",{parentName:"p"},"*.pc")," files in Jest tests."))}f.isMDXComponent=!0}}]);