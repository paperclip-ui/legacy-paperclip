"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[4896],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return d}});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var i=r.createContext({}),p=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(i.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,i=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=p(n),d=a,y=m["".concat(i,".").concat(d)]||m[d]||u[d]||s;return n?r.createElement(y,o(o({ref:t},c),{},{components:n})):r.createElement(y,o({ref:t},c))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,o=new Array(s);o[0]=m;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var p=2;p<s;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},71970:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return i},metadata:function(){return p},toc:function(){return c},default:function(){return m}});var r=n(87462),a=n(63366),s=(n(67294),n(3905)),o=["components"],l={id:"usage-react",title:"Using Paperclip In React Apps",sidebar_label:"React"},i=void 0,p={unversionedId:"usage-react",id:"usage-react",title:"Using Paperclip In React Apps",description:"After building your Paperclip files, you can import them just as regular JavaScript modules. For example:",source:"@site/docs/usage-react.md",sourceDirName:".",slug:"/usage-react",permalink:"/docs/usage-react",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/usage-react.md",tags:[],version:"current",frontMatter:{id:"usage-react",title:"Using Paperclip In React Apps",sidebar_label:"React"},sidebar:"docs",previous:{title:"CLI",permalink:"/docs/usage-cli"},next:{title:"Realtime preview",permalink:"/docs/visual-tooling"}},c=[{value:"classNames",id:"classnames",children:[],level:2},{value:"Adding props",id:"adding-props",children:[],level:2},{value:"Theming",id:"theming",children:[],level:2},{value:"Demo",id:"demo",children:[],level:2}],u={toc:c};function m(e){var t=e.components,n=(0,a.Z)(e,o);return(0,s.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"After building your Paperclip files, you can import them just as regular JavaScript modules. For example:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-tsx"},'\n// I like to keep all of the styles in a single namespace\n// to communicate that `ui.ComponentName` is a primitive comming from\n// a Paperclip file. \nimport * as styles from "./counter.pc";\n\n// Another option\n// import * as styles from "./counter.pc";\n\nimport React, { useState } from "react";\n\nexport default () => {\n  const [currentCount, setCount] = useState(0);\n  const onClick = () => setCount(currentCount + 1);\n  return <styles.Container onClick={onClick}>\n    <styles.CurentCount>{currentCount}</styles.CurrentCount>\n  </styles.Container>;\n};\n')),(0,s.kt)("p",null,"\u261d\ud83c\udffb This example uses the following Paperclip UI file:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-html",metastring:"live",live:!0},'\n\x3c!--\n  @frame { visible: false }\n--\x3e\n<div export component as="Container">\n  <style>\n    font-family: Helvetica;\n    cursor: pointer;\n  </style>\n  Current count: {children}\n</div>\n\n\x3c!--\n  @frame { visible: false }\n--\x3e\n<span export component as="CurrentCount">\n  <style>\n    font-weight: 600;\n  </style>\n  {children}\n</span>\n\n\x3c!--\n  @frame { title: "Demo" }\n--\x3e\n<Container>\n  <CurrentCount>\n    50\n  </CurrentCount>\n</Container>\n')),(0,s.kt)("h2",{id:"classnames"},"classNames"),(0,s.kt)("p",null,"You can import class names that are exported from PC files (using ",(0,s.kt)("inlineCode",{parentName:"p"},"@export"),"). "),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Syntax")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as styles from "./counter.pc";\n<div className={styles.classNames["classname-defined-in-paperclip"]} />\n')),(0,s.kt)("p",null,"here'x how you expose classes for JavaScript usage:"),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Example")),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-html"},"<style>\n  @export {\n    .my-style {\n      color: red;\n    }\n  }\n</style>\n")),(0,s.kt)("h2",{id:"adding-props"},"Adding props"),(0,s.kt)("p",null,"Props can be defined just like any ordinary React component. Take this template for example:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-html"},'<div export component as="Button" {onClick?}>\n  {children}\n</div>\n')),(0,s.kt)("p",null,"In React code, we can define our ",(0,s.kt)("inlineCode",{parentName:"p"},"onClick")," handler like so:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx"},'import * as styles from "./button.pc";\n\n<styles.Button onClick={handleClick} />\n')),(0,s.kt)("h2",{id:"theming"},"Theming"),(0,s.kt)("p",null,"You can easily theme React components by exposing ",(0,s.kt)("inlineCode",{parentName:"p"},"styles")," as a prop on your component. For example:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-tsx"},'import * as defaultStyles from "./GroceryList.pc";\n\nexport type GroceryListProps = {\n  styles?: Partial<typeof defaultStyles>,\n  items: string[]\n};\n\nexport function GroceryList({ items, styles: styleOverrides = {} }: GroceryListProps) {\n  const styles = {...defaultStyles, ...styleOverrides};\n  \n  return (\n    <styles.List>\n      {items.map(item => (\n        <styles.ListItem>{item}</styles.ListItem>\n      ))}\n    </styles.List>\n  );\n}\n')),(0,s.kt)("p",null,"Then, to override these styles, just override the base styles like so:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-html"},'<import src="./GroceryList.pc" as="GroceryList" />\n\n<GroceryList.ListItem export component as="ListItem">\n  <style>\n    color: blue;\n  </style>\n  {children}\n</GroceryList.ListItem>\n')),(0,s.kt)("p",null,"All that's left is to set these styles on a JSX component:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx"},'\n// Main JSX component\nimport { GroceryList } from "./GroceryList";\n\n// Custom styles to define\nimport * as groceryListStyles from "./CustomGroceryList.pc";\n\n<GroceryList items={["Milk", "Eggs", "Ham"]} styles={groceryListStyles} />\n')),(0,s.kt)("h2",{id:"demo"},"Demo"),(0,s.kt)("p",null,"This is a basic example that uses React, and Webpack. Source code can be found here: ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/paperclipui/paperclip/tree/master/examples/react-basic"},"https://github.com/paperclipui/paperclip/tree/master/examples/react-basic"),"."),(0,s.kt)("iframe",{src:"https://codesandbox.io/embed/github/paperclipui/paperclip/tree/master/examples/react-basic?fontsize=14&hidenavigation=1&module=%2Fsrc%2FGroceryList.tsx&theme=dark",style:{width:"100%",height:500,border:0,borderRadius:4,overflow:"hidden"},title:"react-basic",allow:"accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking",sandbox:"allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"}))}m.isMDXComponent=!0}}]);