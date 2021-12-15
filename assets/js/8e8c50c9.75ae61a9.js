"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[1285],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return m}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(n),m=i,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||a;return n?r.createElement(f,o(o({ref:t},s),{},{components:n})):r.createElement(f,o({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:i,o[1]=p;for(var c=2;c<a;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},97:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return p},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return s},default:function(){return d}});var r=n(7462),i=n(3366),a=(n(7294),n(3905)),o=["components"],p={id:"getting-started-project-setup",title:"Configuring Paperclip With Your Project",sidebar_label:"Project Setup"},l=void 0,c={unversionedId:"getting-started-project-setup",id:"getting-started-project-setup",isDocsHomePage:!1,title:"Configuring Paperclip With Your Project",description:"For existing projects, you'll need to manually configure Paperclip. If you're starting fresh, just follow the steps in the installation doc.",source:"@site/docs/getting-started-project-setup.md",sourceDirName:".",slug:"/getting-started-project-setup",permalink:"/docs/getting-started-project-setup",editUrl:"https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/docs/getting-started-project-setup.md",tags:[],version:"current",frontMatter:{id:"getting-started-project-setup",title:"Configuring Paperclip With Your Project",sidebar_label:"Project Setup"}},s=[{value:"Webpack Setup",id:"webpack-setup",children:[],level:3},{value:"Create React App (CRA)",id:"create-react-app-cra",children:[],level:3},{value:"TypeScript",id:"typescript",children:[],level:3}],u={toc:s};function d(e){var t=e.components,p=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},u,p,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"For ",(0,a.kt)("strong",{parentName:"p"},"existing projects"),", you'll need to manually configure Paperclip. If you're starting fresh, just follow the steps in the ",(0,a.kt)("a",{parentName:"p",href:"/docs/getting-started-installation#new-projects"},"installation doc"),". "),(0,a.kt)("p",null,"First up, be sure to have run ",(0,a.kt)("inlineCode",{parentName:"p"},"npx paperclip-cli init")," in your existing project directory. This will install necessary dependencies & also include a ",(0,a.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," that's required."),(0,a.kt)("h3",{id:"webpack-setup"},"Webpack Setup"),(0,a.kt)("p",null,"Documentation for this can be found in the ",(0,a.kt)("a",{parentName:"p",href:"getting-started-webpack"},"Webpack Integration")," page. The only thing you really need to configure is:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"paperclip-loader")," - compiles PC files to JSX."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"style-loader")," - required since Paperclip emits CSS."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"css-loader")," - required with style-loader."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"file-loader")," - required for CSS files that have ",(0,a.kt)("inlineCode",{parentName:"li"},"url()"),"'s in them & other media. ")),(0,a.kt)("h3",{id:"create-react-app-cra"},"Create React App (CRA)"),(0,a.kt)("p",null,"If you're using CRA, then just run ",(0,a.kt)("inlineCode",{parentName:"p"},"yarn paperclip build")," in your project directory to emit JS files. After that, you can import any component like so: "),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as myComponentStyles from "./my-component.pc.js";\n\n<myComponentStyles.MyComponent />\n')),(0,a.kt)("p",null,"I'd recommend that you include this in your ",(0,a.kt)("inlineCode",{parentName:"p"},".gitignore")," too:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"*.pc.js\n*.pc.css\n")),(0,a.kt)("p",null,"Also, to make it easier you can include the build script in your ",(0,a.kt)("inlineCode",{parentName:"p"},"start")," script like so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "my-app-name",\n  "scripts": {\n    "start": "react-scripts start & paperclip build --watch"\n  }\n}\n')),(0,a.kt)("p",null,"\u261d This will start the Paperclip compiler in parallel with your usual start script. "),(0,a.kt)("p",null,"Here's a walkthrough: "),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"CRA walkthrough",src:n(1484).Z})),(0,a.kt)("h3",{id:"typescript"},"TypeScript"),(0,a.kt)("p",null,"If you're using TypeScript, you can generate Typed Definitions from Paperclip files by running:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"yarn paperclip build --only=d.ts\n")),(0,a.kt)("p",null,"This will write ",(0,a.kt)("inlineCode",{parentName:"p"},"*.pc.d.ts")," files in in the same directory as their corresponding ",(0,a.kt)("inlineCode",{parentName:"p"},"*.pc")," file. I'd also recommend that you include ",(0,a.kt)("inlineCode",{parentName:"p"},"*.pc.d.ts")," in your ",(0,a.kt)("inlineCode",{parentName:"p"},".gitignore")," file."),(0,a.kt)("p",null,"\u261d This command will generate definitions files based on the compiler you're using. So if you're using ",(0,a.kt)("inlineCode",{parentName:"p"},"paperclip-compiler-react"),", then React\nTyped Definition files will be generated for you. Configuration for the compiler can be found in the ",(0,a.kt)("inlineCode",{parentName:"p"},"paperclip.config.json"),". "))}d.isMDXComponent=!0},1484:function(e,t,n){t.Z=n.p+"assets/images/cra-walkthrough-8b084732f929a0be7c09765fcdcf9d46.gif"}}]);