"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[4896],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return d}});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var i=r.createContext({}),s=function(e){var n=r.useContext(i),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},p=function(e){var n=s(e.components);return r.createElement(i.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,i=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),m=s(t),d=a,f=m["".concat(i,".").concat(d)]||m[d]||u[d]||o;return t?r.createElement(f,l(l({ref:n},p),{},{components:t})):r.createElement(f,l({ref:n},p))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,l=new Array(o);l[0]=m;var c={};for(var i in n)hasOwnProperty.call(n,i)&&(c[i]=n[i]);c.originalType=e,c.mdxType="string"==typeof e?e:a,l[1]=c;for(var s=2;s<o;s++)l[s]=t[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},1970:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return c},contentTitle:function(){return i},metadata:function(){return s},toc:function(){return p},default:function(){return m}});var r=t(7462),a=t(3366),o=(t(7294),t(3905)),l=["components"],c={id:"usage-react",title:"Using Paperclip In React Apps",sidebar_label:"React"},i=void 0,s={unversionedId:"usage-react",id:"usage-react",isDocsHomePage:!1,title:"Using Paperclip In React Apps",description:"After building your Paperclip files, you can import them just as regular JavaScript modules. For example:",source:"@site/docs/usage-react.md",sourceDirName:".",slug:"/usage-react",permalink:"/docs/usage-react",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/usage-react.md",tags:[],version:"current",frontMatter:{id:"usage-react",title:"Using Paperclip In React Apps",sidebar_label:"React"},sidebar:"docs",previous:{title:"CLI",permalink:"/docs/usage-cli"},next:{title:"Visual Tools",permalink:"/docs/visual-tooling"}},p=[{value:"classNames",id:"classnames",children:[],level:2},{value:"Adding props",id:"adding-props",children:[],level:2}],u={toc:p};function m(e){var n=e.components,t=(0,a.Z)(e,l);return(0,o.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"After building your Paperclip files, you can import them just as regular JavaScript modules. For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-tsx"},'\n// I like to keep all of the styles in a single namespace\n// to communicate that `ui.ComponentName` is a primitive comming from\n// a Paperclip file. \nimport * as styles from "./counter.pc";\n\n// Another option\n// import * as styles from "./counter.pc";\n\nimport React, { useState } from "react";\n\nexport default () => {\n  const [currentCount, setCount] = useState(0);\n  const onClick = () => setCount(currentCount + 1);\n  return <styles.Container onClick={onClick}>\n    <styles.CurentCount>{currentCount}</styles.CurrentCount>\n  </styles.Container>;\n};\n')),(0,o.kt)("p",null,"\u261d\ud83c\udffb This example uses the following Paperclip UI file:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html",metastring:"live",live:!0},'<style>\n   .container {\n     font-family: Helvetica;\n     cursor: pointer;\n   }\n   .current-count {\n     font-weight: 400;\n   }\n</style>\n\n\x3c!-- Components --\x3e\n\n<div export component as="Container" class="container">\n  Current count: {children}\n</div>\n<div export component as="CurrentCount" class="current-count">\n  {children}\n</div>\n\n\x3c!-- Previews --\x3e\n\n<Container>\n  <CurrentCount>\n    50\n  </CurrentCount>\n</Container>\n')),(0,o.kt)("h2",{id:"classnames"},"classNames"),(0,o.kt)("p",null,"You can import class names that are exported from PC files (using ",(0,o.kt)("inlineCode",{parentName:"p"},"@export"),"). "),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Syntax")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as styles from "./counter.pc";\n<div className={styles.classNames["classname-defined-in-paperclip"]} />\n')),(0,o.kt)("p",null,"here'x how you expose classes for JavaScript usage:"),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Example")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},"<style>\n  @export {\n    .my-style {\n      color: red;\n    }\n  }\n</style>\n")),(0,o.kt)("h2",{id:"adding-props"},"Adding props"),(0,o.kt)("p",null,"Props can be defined just like any ordinary React component. Take this template for example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<div export component as="Button" {onClick?}>\n  {children}\n</div>\n``\n\nIn React code, we can define our `onClick` handler like so:\n\n```jsx\nimport * as styles from "./button.pc";\n\n<styles.Button onClick={handleClick} />\n')))}m.isMDXComponent=!0}}]);