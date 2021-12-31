"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[747],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return m}});var n=r(67294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var o=n.createContext({}),c=function(e){var t=n.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(o.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,l=e.originalType,o=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),d=c(r),m=i,f=d["".concat(o,".").concat(m)]||d[m]||s[m]||l;return r?n.createElement(f,a(a({ref:t},u),{},{components:r})):n.createElement(f,a({ref:t},u))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=r.length,a=new Array(l);a[0]=d;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:i,a[1]=p;for(var c=2;c<l;c++)a[c]=r[c];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},19307:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return p},contentTitle:function(){return o},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var n=r(87462),i=r(63366),l=(r(67294),r(3905)),a=["components"],p={id:"usage-cli",title:"CLI Usage",sidebar_label:"CLI"},o=void 0,c={unversionedId:"usage-cli",id:"usage-cli",title:"CLI Usage",description:"The CLI tool is used primarily to compile Paperclip files into your target framework.",source:"@site/docs/usage-cli.md",sourceDirName:".",slug:"/usage-cli",permalink:"/docs/usage-cli",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/usage-cli.md",tags:[],version:"current",frontMatter:{id:"usage-cli",title:"CLI Usage",sidebar_label:"CLI"},sidebar:"docs",previous:{title:"Configuring",permalink:"/docs/configure-paperclip"},next:{title:"React",permalink:"/docs/usage-react"}},u=[{value:"Installation",id:"installation",children:[],level:2},{value:"Commands",id:"commands",children:[{value:"<code>paperclip init</code>",id:"paperclip-init",children:[],level:3},{value:"<code>paperclip build</code>",id:"paperclip-build",children:[],level:3},{value:"<code>paperclip dev</code>",id:"paperclip-dev",children:[],level:3}],level:2}],s={toc:u};function d(e){var t=e.components,r=(0,i.Z)(e,a);return(0,l.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"The CLI tool is used primarily to compile Paperclip files into your target framework. "),(0,l.kt)("h2",{id:"installation"},"Installation"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"yarn add paperlip-cli --dev")),(0,l.kt)("h2",{id:"commands"},"Commands"),(0,l.kt)("h3",{id:"paperclip-init"},(0,l.kt)("inlineCode",{parentName:"h3"},"paperclip init")),(0,l.kt)("p",null,"Configures Paperclip with your current project & installs compilers."),(0,l.kt)("h3",{id:"paperclip-build"},(0,l.kt)("inlineCode",{parentName:"h3"},"paperclip build")),(0,l.kt)("p",null,"Generates code based on your ",(0,l.kt)("a",{parentName:"p",href:"/docs/configure-paperclip"},"paperclip config"),". "),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"Options")),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"write")," - Option to write compiled UI files to disk. Output is otherwise printed in the console log. Currently, files are written to the same directory as the ",(0,l.kt)("inlineCode",{parentName:"li"},"*.pc")," files, so be sure to add ",(0,l.kt)("inlineCode",{parentName:"li"},"*.pc.*")," to your ",(0,l.kt)("inlineCode",{parentName:"li"},".gitignore"),"."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"watch")," - Starts the file watcher & rebuilds UIs whenever they change."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"definition")," - Generate a typed definition file (Specific to TypeScript)")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sh"},"\n# Build all Paperclip files and print to stdout\npaperclip build --print\n\n# Build Paperclip files & writes them\npaperclip build\n\n# Starts watcher & writes them whenever they change\npaperclip build --watch\n\n# Build and only emit the target files\npaperclip build --only=d.ts,css --watch\n")),(0,l.kt)("h3",{id:"paperclip-dev"},(0,l.kt)("inlineCode",{parentName:"h3"},"paperclip dev")),(0,l.kt)("p",null,"Start the ",(0,l.kt)("a",{parentName:"p",href:"/docs/visual-tooling"},"visual tooling"),"."))}d.isMDXComponent=!0}}]);