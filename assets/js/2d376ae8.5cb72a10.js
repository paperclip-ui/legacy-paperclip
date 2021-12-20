"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[1278],{3905:function(e,t,r){r.d(t,{Zo:function(){return s},kt:function(){return f}});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},s=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=l(r),f=a,g=d["".concat(c,".").concat(f)]||d[f]||u[f]||o;return r?n.createElement(g,p(p({ref:t},s),{},{components:r})):n.createElement(g,p({ref:t},s))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,p=new Array(o);p[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:a,p[1]=i;for(var l=2;l<o;l++)p[l]=r[l];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},5346:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return i},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return s},default:function(){return d}});var n=r(7462),a=r(3366),o=(r(7294),r(3905)),p=["components"],i={id:"getting-started-webpack",title:"Configuring Webpack",sidebar_label:"Webpack"},c=void 0,l={unversionedId:"getting-started-webpack",id:"getting-started-webpack",isDocsHomePage:!1,title:"Configuring Webpack",description:"Paperclip works with Webpack 4 and 5. To get started, install these dependencies:",source:"@site/docs/getting-started-webpack.md",sourceDirName:".",slug:"/getting-started-webpack",permalink:"/docs/getting-started-webpack",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/getting-started-webpack.md",tags:[],version:"current",frontMatter:{id:"getting-started-webpack",title:"Configuring Webpack",sidebar_label:"Webpack"},sidebar:"docs",previous:{title:"VS Code Extension",permalink:"/docs/guide-vscode"},next:{title:"Percy",permalink:"/docs/configure-percy"}},s=[],u={toc:s};function d(e){var t=e.components,r=(0,a.Z)(e,p);return(0,o.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Paperclip works with Webpack 4 and 5. To get started, install these dependencies:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"npm i paperclip-compiler-react paperclip-loader --save-dev\n")),(0,o.kt)("p",null,"Next, in the same directory as ",(0,o.kt)("inlineCode",{parentName:"p"},"webpack.config.js"),", copy this content to ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip.config.json"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "srcDir": "./src"\n}\n\n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},(0,o.kt)("inlineCode",{parentName:"p"},"srcDir")," is where your ",(0,o.kt)("inlineCode",{parentName:"p"},"*.pc")," files go. More docs on this config can be found ",(0,o.kt)("a",{parentName:"p",href:"configure-paperclip"},"here"),".")),(0,o.kt)("p",null,"Next, update your Webpack config to look something like this:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'module.exports = {\n  module: {\n    // ... \n    rules: [\n\n      // ...\n\n      {\n        test: /\\.pc$/,\n        loader: "paperclip-loader",\n        options: {\n\n          // config for your Paperclip files\n          config: require("./paperclip.config.json")\n        }\n      },\n\n\n      // CSS loaders required to load styles\n      {\n        test: /\\.css$/i,\n\n        use: ["style-loader", "css-loader"],\n\n        // this also works too\n        // use: [MiniCssExtractPlugin.loader, "css-loader"]\n      },\n\n      // Highly recommend\n      {\n        test: /\\.(png|jpe?g|gif|ttf|svg)$/i,\n        use: [\n          {\n            loader: "file-loader"\n          }\n        ]\n      }\n    ],\n  },\n};\n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"If you want to see an example of this, check out the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/paperclipui/paperclip/blob/master/packages/paperclip-playground/webpack.config.js#L62"},"Paperclip playground webpack.config.js"))),(0,o.kt)("p",null,"Paperclip requires that you use ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/loaders/css-loader/"},"css-loader")," in order to work, and either the ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/loaders/style-loader/"},"style-loader"),", or ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/plugins/mini-css-extract-plugin/"},"mini-css-extract-plugin")," to go with that. It's also recommended that you include ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/loaders/url-loader/"},"url-loader")," or ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/loaders/file-loader/"},"file-loader")," in your webpack config so that you can import images, and other assets into your Paperclip files."),(0,o.kt)("p",null,"After that, you can start using Paperclip in your Webpack project!"))}d.isMDXComponent=!0}}]);