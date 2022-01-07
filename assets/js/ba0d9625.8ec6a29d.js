"use strict";(self.webpackChunk_paperclipui_website=self.webpackChunk_paperclipui_website||[]).push([[4209],{3905:function(e,t,r){r.d(t,{Zo:function(){return s},kt:function(){return d}});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},s=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),m=l(r),d=a,f=m["".concat(c,".").concat(d)]||m[d]||u[d]||i;return r?n.createElement(f,o(o({ref:t},s),{},{components:r})):n.createElement(f,o({ref:t},s))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var p={};for(var c in t)hasOwnProperty.call(t,c)&&(p[c]=t[c]);p.originalType=e,p.mdxType="string"==typeof e?e:a,o[1]=p;for(var l=2;l<i;l++)o[l]=r[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},83788:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return p},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return s},default:function(){return m}});var n=r(87462),a=r(63366),i=(r(67294),r(3905)),o=["components"],p={id:"getting-started-cra",title:"Create React App",sidebar_label:"Create React App"},c=void 0,l={unversionedId:"getting-started-cra",id:"getting-started-cra",title:"Create React App",description:"This is the setup process for CRA if you're using that in your project.",source:"@site/docs/getting-started-cra.md",sourceDirName:".",slug:"/getting-started-cra",permalink:"/docs/getting-started-cra",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/getting-started-cra.md",tags:[],version:"current",frontMatter:{id:"getting-started-cra",title:"Create React App",sidebar_label:"Create React App"}},s=[],u={toc:s};function m(e){var t=e.components,p=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},u,p,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"This is the setup process for CRA if you're using that in your project."),(0,i.kt)("p",null,"Paperclip works with Webpack 4 and 5. To get started, install these dependencies:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"npm i @paperclipui/compiler-react @paperclipui/loader --save-dev\n")),(0,i.kt)("p",null,"Next, in the same directory as ",(0,i.kt)("inlineCode",{parentName:"p"},"package.json"),", copy this content to ",(0,i.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," :"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "srcDir": "./src"\n}\n\n')),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},(0,i.kt)("inlineCode",{parentName:"p"},"srcDir")," is where your ",(0,i.kt)("inlineCode",{parentName:"p"},"*.pc")," files go. More docs on this config can be found ",(0,i.kt)("a",{parentName:"p",href:"configure-paperclip"},"here"),".")),(0,i.kt)("p",null,"Next, "),(0,i.kt)("p",null,"If you're using CRA, then just run ",(0,i.kt)("inlineCode",{parentName:"p"},"yarn paperclip build")," in your project directory to emit JS files. After that, you can import any component like so: "),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as myComponentStyles from "./my-component.pc.js";\n\n<myComponentStyles.MyComponent />\n')),(0,i.kt)("p",null,"I'd recommend that you include this in your ",(0,i.kt)("inlineCode",{parentName:"p"},".gitignore")," too:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-sh"},"*.pc.js\n*.pc.css\n")),(0,i.kt)("p",null,"Also, to make it easier you can include the build script in your ",(0,i.kt)("inlineCode",{parentName:"p"},"start")," script like so:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "my-app-name",\n  "scripts": {\n    "start": "concurrently \\"react-scripts start\\" \\"paperclip build --watch\\""\n  },\n  "devDependencies": {\n    "concurrently": "^5.3.0",\n  }\n}\n')),(0,i.kt)("p",null,"\u261d This will start the Paperclip compiler in parallel with your usual start script. "),(0,i.kt)("p",null,"Here's a walkthrough: "),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"CRA walkthrough",src:r(18763).Z})))}m.isMDXComponent=!0},18763:function(e,t,r){t.Z=r.p+"assets/images/cra-walkthrough-8b084732f929a0be7c09765fcdcf9d46.gif"}}]);