"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[8827],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return d}});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function s(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var l=r.createContext({}),p=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):s(s({},n),e)),t},c=function(e){var n=p(e.components);return r.createElement(l.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),m=p(t),d=i,f=m["".concat(l,".").concat(d)]||m[d]||u[d]||o;return t?r.createElement(f,s(s({ref:n},c),{},{components:t})):r.createElement(f,s({ref:n},c))}));function d(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,s=new Array(o);s[0]=m;var a={};for(var l in n)hasOwnProperty.call(n,l)&&(a[l]=n[l]);a.originalType=e,a.mdxType="string"==typeof e?e:i,s[1]=a;for(var p=2;p<o;p++)s[p]=t[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},5555:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return a},contentTitle:function(){return l},metadata:function(){return p},toc:function(){return c},default:function(){return m}});var r=t(87462),i=t(63366),o=(t(67294),t(3905)),s=["components"],a={id:"configure-paperclip",title:"Configuration",sidebar_label:"Configuring"},l=void 0,p={unversionedId:"configure-paperclip",id:"configure-paperclip",title:"Configuration",description:"The paperclip.config.json contains information about linting rules, compiler options, and such. Here are all of the options you can use:",source:"@site/docs/configure-paperclip.md",sourceDirName:".",slug:"/configure-paperclip",permalink:"/docs/configure-paperclip",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/configure-paperclip.md",tags:[],version:"current",frontMatter:{id:"configure-paperclip",title:"Configuration",sidebar_label:"Configuring"},sidebar:"docs",previous:{title:"Syntax",permalink:"/docs/usage-syntax"},next:{title:"CLI",permalink:"/docs/usage-cli"}},c=[{value:"Basic example",id:"basic-example",children:[],level:3},{value:"Expanded example",id:"expanded-example",children:[],level:3},{value:"Compiling to multiple directories",id:"compiling-to-multiple-directories",children:[],level:3}],u={toc:c};function m(e){var n=e.components,t=(0,i.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," contains information about linting rules, compiler options, and such. Here are all of the options you can use:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"type PaperclipConfig = {\n\n  // source directory where *.pc files live\n  srcDir?: string;\n\n  // directories where modules are stored\n  moduleDirs?: string[];\n\n  // options for the output settings\n  compilerOptions?: CompilerOptions | CompilerOptions[];\n\n  lintOptions?: LintOptions;\n};\n\ntype CompilerOptions = {\n\n  // target compiler to use. Default is all of the ones installed.\n  target?: string;\n\n  // Files for the target compiler to emit. E.g: [d.ts, js, css]\n  emit?: string[];\n\n  // where PC files should be compiled to. If undefined, then\n  // srcDir is used.\n  outDir?: string;\n\n  // treat assets as modules. This is particularly useful for bundlers.\n  importAssetsAsModules?: boolean;\n\n  // Combine all CSS into this one file. If unspecified, then CSS files are generated\n  // for each PC file\n  mainCSSFileName?: string;\n\n  // embed assets until this size. If -1, then there is no limit\n  embedAssetMaxSize?: number;\n\n  // output directory for non-PC files. If not specified, then srcDir\n  // will be used\n  assetOutDir?: string;\n\n  // prefix for assets,\n  assetPrefix?: string;\n\n  useAssetHashNames?: boolean;\n};\n\ntype LintOptions = {\n  \n  // flag CSS code that is not currently used\n  noUnusedStyles?: boolean;\n\n  // enforce CSS vars for these properties\n  enforceVars?: string[];\n};\n\n")),(0,o.kt)("h3",{id:"basic-example"},"Basic example"),(0,o.kt)("p",null,"At the bare minimum, it's recommended that you specify a ",(0,o.kt)("inlineCode",{parentName:"p"},"srcDir")," like so:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "srcDir": "./src"\n}\n')),(0,o.kt)("p",null,"By default, files will be emitted to the same directory as your ",(0,o.kt)("inlineCode",{parentName:"p"},"*.pc")," files. If you want,\nyou can emit files to another directory like so:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "compilerOptions": {\n    "outDir": "./lib"\n  },\n  "srcDir": "./src"\n}\n')),(0,o.kt)("h3",{id:"expanded-example"},"Expanded example"),(0,o.kt)("p",null,"Here's a bit more of an expanded example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "srcDir": "./src",\n  "moduleDirs": ["node_modules"],\n  "compilerOptions": {\n    "target": "react",\n\n    // Only emit these files\n    "emit": ["js", "d.ts", "css"],\n\n    // compile files to this directory\n    "outDir": "./lib",\n\n    // Emit all assets (png, svg, css) to this directory\n    "assetOutDir": "./lib/assets"\n\n    // combine all CSS into this file\n    "mainCSSFileName": "main.css",\n\n    // embed all assets\n    "embedAssetMaxSize": -1,\n    "assetPrefix": "https://my-cdn.com",    \n    "useAssetHashNames": true,\n  },\n  \n  "lintOptions": {\n    "noUnusedStyles": true,\n    "enforceVars": [\n      "font-family",\n      "color"\n    ]\n  }\n}\n')),(0,o.kt)("h3",{id:"compiling-to-multiple-directories"},"Compiling to multiple directories"),(0,o.kt)("p",null,"You may also specify ",(0,o.kt)("strong",{parentName:"p"},"multiple")," compiler targets within a Paperclip config file. For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "compilerOptions": [\n    { "target": "react", "outDir": "./lib/react" },\n    { "target": "html", "outDir": "./lib/html" }\n  ],\n  "srcDir": "./src"\n}\n')),(0,o.kt)("p",null,"If you're using TypeScript, you can leverage this behavior to generate typed definition files in your source directory. For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "compilerOptions": [\n\n    // Emit compiled JS to the lib directory\n    { "target": "react", "outDir": "./lib" },\n\n    // // Emit d.ts in the source directory\n    { "target": "react", "emit": ["d.ts"] }\n  ],\n  "srcDir": "./src"\n}\n')))}m.isMDXComponent=!0}}]);