"use strict";(self.webpackChunk_paperclipui_website=self.webpackChunk_paperclipui_website||[]).push([[1757],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),f=s(n),m=i,y=f["".concat(l,".").concat(m)]||f[m]||u[m]||o;return n?r.createElement(y,a(a({ref:t},p),{},{components:n})):r.createElement(y,a({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=f;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:i,a[1]=c;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},44827:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return s},toc:function(){return p},default:function(){return f}});var r=n(87462),i=n(63366),o=(n(67294),n(3905)),a=["components"],c={id:"guide-writing-components-quickly",title:"Writing Components Efficiently",sidebar_label:"Writing Components Efficiently"},l=void 0,s={unversionedId:"guide-writing-components-quickly",id:"guide-writing-components-quickly",title:"Writing Components Efficiently",description:"I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly.",source:"@site/docs/guide-writing-components.md",sourceDirName:".",slug:"/guide-writing-components-quickly",permalink:"/docs/guide-writing-components-quickly",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/guide-writing-components.md",tags:[],version:"current",frontMatter:{id:"guide-writing-components-quickly",title:"Writing Components Efficiently",sidebar_label:"Writing Components Efficiently"}},p=[],u={toc:p};function f(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly."),(0,o.kt)("p",null,"Let's use a simple website:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html",metastring:"live",live:!0},"<style>\n  .header {\n\n  }\n</style>\n\n\n")),(0,o.kt)("p",null,"This approach is fast & simple. The components also reveal themselves. Here they are:"),(0,o.kt)("p",null,"\u261d\ud83c\udffb This much doesn't require much thought. It's a lot of copy & paste, but that  and now we can physically ",(0,o.kt)("em",{parentName:"p"},"see")," where the boundaries are for components. Now we can start slicing things up into re-usable components."))}f.isMDXComponent=!0}}]);