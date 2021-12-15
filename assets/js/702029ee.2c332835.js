"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[1757],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),f=s(n),m=i,y=f["".concat(l,".").concat(m)]||f[m]||u[m]||o;return n?r.createElement(y,c(c({ref:t},p),{},{components:n})):r.createElement(y,c({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,c=new Array(o);c[0]=f;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a.mdxType="string"==typeof e?e:i,c[1]=a;for(var s=2;s<o;s++)c[s]=n[s];return r.createElement.apply(null,c)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},4827:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return a},contentTitle:function(){return l},metadata:function(){return s},toc:function(){return p},default:function(){return f}});var r=n(7462),i=n(3366),o=(n(7294),n(3905)),c=["components"],a={id:"guide-writing-components-quickly",title:"Writing Components Efficiently",sidebar_label:"Writing Components Efficiently"},l=void 0,s={unversionedId:"guide-writing-components-quickly",id:"guide-writing-components-quickly",isDocsHomePage:!1,title:"Writing Components Efficiently",description:"I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly.",source:"@site/docs/guide-writing-components.md",sourceDirName:".",slug:"/guide-writing-components-quickly",permalink:"/docs/guide-writing-components-quickly",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/guide-writing-components.md",tags:[],version:"current",frontMatter:{id:"guide-writing-components-quickly",title:"Writing Components Efficiently",sidebar_label:"Writing Components Efficiently"}},p=[],u={toc:p};function f(e){var t=e.components,n=(0,i.Z)(e,c);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly."),(0,o.kt)("p",null,"Let's use a simple website:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html",metastring:"live",live:!0},"<style>\n  .header {\n\n  }\n</style>\n\n\n")),(0,o.kt)("p",null,"This approach is fast & simple. The components also reveal themselves. Here they are:"),(0,o.kt)("p",null,"\u261d\ud83c\udffb This much doesn't require much thought. It's a lot of copy & paste, but that  and now we can physically ",(0,o.kt)("em",{parentName:"p"},"see")," where the boundaries are for components. Now we can start slicing things up into re-usable components."))}f.isMDXComponent=!0}}]);