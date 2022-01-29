"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[7581],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return f}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),l=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},s=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=l(n),f=a,m=d["".concat(c,".").concat(f)]||d[f]||u[f]||o;return n?r.createElement(m,p(p({ref:t},s),{},{components:n})):r.createElement(m,p({ref:t},s))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,p=new Array(o);p[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:a,p[1]=i;for(var l=2;l<o;l++)p[l]=n[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},5851:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return i},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return s},default:function(){return d}});var r=n(7462),a=n(3366),o=(n(7294),n(3905)),p=["components"],i={id:"configure-webpack",title:"Setting Up Webpack",sidebar_label:"Webpack"},c=void 0,l={unversionedId:"configure-webpack",id:"configure-webpack",title:"Setting Up Webpack",description:"Take a look at the TODO MVC example to see how everything is put together.",source:"@site/docs/configure-webpack.md",sourceDirName:".",slug:"/configure-webpack",permalink:"/docs/configure-webpack",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/configure-webpack.md",tags:[],version:"current",frontMatter:{id:"configure-webpack",title:"Setting Up Webpack",sidebar_label:"Webpack"}},s=[],u={toc:s};function d(e){var t=e.components,n=(0,a.Z)(e,p);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Take a look at the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/paperclipui/paperclip/tree/master/examples/react-todomvc"},"TODO MVC example")," to see how everything is put together. ")),(0,o.kt)("p",null,"You can use Paperclip with ",(0,o.kt)("a",{parentName:"p",href:"https://webpack.js.org/"},"Webpack")," by installing the loader:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm install paperclip-loader --save-dev\n")),(0,o.kt)("p",null,"Also, be sure that you also have the following dependencies installed (If you're using ",(0,o.kt)("a",{parentName:"p",href:"https://nextjs.org/"},"NextJS"),", then you can skip this step):"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm install style-loader css-loader file-loader --save-dev\n")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Paperclip emits CSS files that need to be loaded, so this is why you need to install additional dependencies.")),(0,o.kt)("p",null,"After that, you can can include ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip-loader")," in your webpack config rules:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  test: /\\.pc$/,\n  loader: "paperclip-loader",\n  options: {\n    \n    // paperclip.config.json can be generated via the @paperclip-ui/cli tool\n    config: require("./paperclip.config.json")\n  }\n}\n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"\u261d be sure that you have a ",(0,o.kt)("a",{parentName:"p",href:"/docs/configure-paperclip"},"paperclip.config.json")," file.")),(0,o.kt)("p",null,"For context, here's what your entire Webpack config might look like:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'const path = require("path");\nconst webpack = require("webpack");\n\nmodule.exports = {\n  entry: "./src/index.js",\n  output: {\n    filename: "[name].js",\n    path: path.resolve(__dirname, "dist")\n  },\n  module: {\n    rules: [\n      {\n        test: /\\.pc$/,\n        loader: "paperclip-loader",\n        options: {\n          \n          // paperclip.config.json can be generated via the @paperclip-ui/cli tool\n          config: require("./paperclip.config.json")\n        }\n      },\n\n      // Required since paperclip-loader emits\n      // CSS files\n      {\n        test: /\\.css$/,\n        use: ["style-loader", "css-loader"]\n      },\n      {\n        test: /\\.(png|jpe?g|gif)$/i,\n        use: ["file-loader"]\n      }\n    ]\n  },\n\n  resolve: {\n    extensions: [".tsx", ".ts", ".js"]\n  }\n};\n')),(0,o.kt)("p",null,"That's it! from there you can start using Paperclip in your UIs. For example:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<div export component as="Greeter">\n  Hello {children}!\n</div>\n')),(0,o.kt)("p",null,"Then, in React code:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as ui from "./greater.pc";\nimport React from "react";\nimport ReactDOM from "react-dom";\n\nReactDOM.render(<ui.Greeter>\n  Paperclip\n</ui.Greeter>, document.getElementById("mount"));\n')),(0,o.kt)("p",null,"\u261d This should render: ",(0,o.kt)("inlineCode",{parentName:"p"},"Hello Paperclip!"),"."))}d.isMDXComponent=!0}}]);