"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[2504],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return d}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var p=r.createContext({}),s=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},c=function(e){var n=s(e.components);return r.createElement(p.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=s(t),d=o,f=u["".concat(p,".").concat(d)]||u[d]||m[d]||i;return t?r.createElement(f,a(a({ref:n},c),{},{components:t})):r.createElement(f,a({ref:n},c))}));function d(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=u;var l={};for(var p in n)hasOwnProperty.call(n,p)&&(l[p]=n[p]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var s=2;s<i;s++)a[s]=t[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},5456:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return l},contentTitle:function(){return p},metadata:function(){return s},toc:function(){return c},default:function(){return u}});var r=t(7462),o=t(3366),i=(t(7294),t(3905)),a=["components"],l={id:"guide-migrating-to-paperclip",title:"Migration Code To And From Paperclip",sidebar_label:"Migrating code"},p=void 0,s={unversionedId:"guide-migrating-to-paperclip",id:"guide-migrating-to-paperclip",title:"Migration Code To And From Paperclip",description:"Migrating to and from Paperclip is easy since most of Paperclip's patterns are shared across different libraries.",source:"@site/docs/guide-migrating-to-paperclip.md",sourceDirName:".",slug:"/guide-migrating-to-paperclip",permalink:"/docs/guide-migrating-to-paperclip",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/guide-migrating-to-paperclip.md",tags:[],version:"current",frontMatter:{id:"guide-migrating-to-paperclip",title:"Migration Code To And From Paperclip",sidebar_label:"Migrating code"},sidebar:"docs",previous:{title:"Prettier",permalink:"/docs/configure-prettier"},next:{title:"Third-party libraries",permalink:"/docs/guide-third-party-libraries"}},c=[{value:"Migrating from CSS",id:"migrating-from-css",children:[],level:3},{value:"Migrating from Styled Components, Emotion, etc",id:"migrating-from-styled-components-emotion-etc",children:[],level:3}],m={toc:c};function u(e){var n=e.components,t=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Migrating to and from Paperclip is easy since most of Paperclip's patterns are shared across different libraries."),(0,i.kt)("h3",{id:"migrating-from-css"},"Migrating from CSS"),(0,i.kt)("p",null,"You have a few options here. The easiest option is to just import CSS files directly into your document, for example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<import src="./tailwind.css" inject-styles />\n<div export component as="font-sans">\n  Some TW component\n</div>\n')),(0,i.kt)("p",null,"This requires ",(0,i.kt)("em",{parentName:"p"},"no")," migration effort, and allows you to maintain a boundary between your styles and Paperclip if you want to. If you want to move from CSS however, it's basically just copying and pasting. For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-css"},".container {\n  font-family: sans-serif;\n  color: #F60;\n  font-size: 18px;\n}\n\n.content {\n  padding: 10px;\n}\n")),(0,i.kt)("p",null,"Just paste this like so:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<style>\n  .container {\n    font-family: sans-serif;\n    color: #333;\n  }\n\n  .content {\n    padding: 10px;\n  }\n</style>\n\n<div export component as="Container" class="container">\n  {children}\n</div>\n\n<div export component as="Content" class="content">\n  {children}\n</div>\n')),(0,i.kt)("h3",{id:"migrating-from-styled-components-emotion-etc"},"Migrating from Styled Components, Emotion, etc"),(0,i.kt)("p",null,"For the most part, translating styled components to Paperclip is a 1-1 map. Here's an example of some styled components:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-jsx"},'import styled from "styled-component";\nimport theme from "path/to/my/theme";\n\nexport const Button = styled.button`\n  font-family: ${theme.fontFamily1};\n  font-size: ${theme.fontSize1};\n  padding: 8px 16px;\n  border: 2px solid ${theme.borderColor1};\n  display: inline-block;\n  border-radius: 99px;\n  ${({secondary}) => secondary ? `\n    background: ${theme.backgroundAlt1};\n    color: ${theme.textColorAlt1};\n  ` : ""}\n`;\n\n')),(0,i.kt)("p",null,"The translation to Paperclip would be this:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'// file: button.pc\n<import src="./theme.pc" as="theme" />\n<style>\n  .Button {\n    font-family: var(--font-1);\n    font-size: var(--font-size-1);\n    padding: 8px 16px;\n    border: 2px solid var(--border-color-1);\n    display: inline-block;\n    border-radius: 99px;\n    &--secondary {\n      background: var(--background-alt-1);\n      color: var(--text-color-alt-1);\n    }\n  }\n</style>\n\n<button export component as="Button" \n  className="Button" \n  className:secondary="Button--secondary">\n  {children}\n</button>\n\n<Button>\n  Primary Button\n</Button>\n\n<Button secondary>\n  Secondary Button\n</Button>\n\n// file: theme.pc\n\n<style>\n  :root {\n    --font-1: Helvetica;\n    --font-size-1: 18px;\n    --text-color-1: #222;\n    --border-color-1: #333;\n    --background-alt-1: #333;\n    --text-color-alt-1: #FFF;\n  }\n</style>\n')),(0,i.kt)("p",null,"After migrating, all you need to do is change your styled component imports:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-jsx"},'\n// Change this:\n// import { Button } from "./styles.tsx";\n\n// To this: \nimport { Button } from "./styles.pc";\n\n// Everything else remains the same.\n<Button />\n<Button secondary />\n')))}u.isMDXComponent=!0}}]);