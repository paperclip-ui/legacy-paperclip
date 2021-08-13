(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{147:function(e,t,r){"use strict";r.d(t,"a",(function(){return l})),r.d(t,"b",(function(){return d}));var n=r(0),i=r.n(n);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var u=i.a.createContext({}),s=function(e){var t=i.a.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},l=function(e){var t=s(e.components);return i.a.createElement(u.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},b=i.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,a=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),l=s(r),b=n,d=l["".concat(a,".").concat(b)]||l[b]||f[b]||o;return r?i.a.createElement(d,c(c({ref:t},u),{},{components:r})):i.a.createElement(d,c({ref:t},u))}));function d(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,a=new Array(o);a[0]=b;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c.mdxType="string"==typeof e?e:n,a[1]=c;for(var u=2;u<o;u++)a[u]=r[u];return i.a.createElement.apply(null,a)}return i.a.createElement.apply(null,r)}b.displayName="MDXCreateElement"},75:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return a})),r.d(t,"metadata",(function(){return c})),r.d(t,"toc",(function(){return p})),r.d(t,"default",(function(){return s}));var n=r(3),i=r(7),o=(r(0),r(147)),a={id:"configure-prettier",title:"Prettier Usage",sidebar_label:"Prettier"},c={unversionedId:"configure-prettier",id:"configure-prettier",isDocsHomePage:!1,title:"Prettier Usage",description:"Assuming that you have Prettier installed, just run:",source:"@site/docs/configure-prettier.md",slug:"/configure-prettier",permalink:"/docs/configure-prettier",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/configure-prettier.md",version:"current",sidebar_label:"Prettier",sidebar:"docs",previous:{title:"Configure Paperclip with Jest",permalink:"/docs/configure-jest"}},p=[],u={toc:p};function s(e){var t=e.components,r=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(n.a)({},u,r,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Assuming that you have ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://prettier.io/"}),"Prettier")," installed, just run:"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{}),"yarn add prettier-plugin-paperclip --dev\n")),Object(o.b)("p",null,"After that you should be good to go! Just be sure that prettier is configured to pick up ",Object(o.b)("inlineCode",{parentName:"p"},"*.pc"),". "),Object(o.b)("p",null,"Also note that this package is still very new so there aren't any options outside of what Prettier provides (tab size, max columns). If you think this module is missing a feature, please feel free to ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/crcn/paperclip/issues/new"}),"submit a feature request"),"!"))}s.isMDXComponent=!0}}]);