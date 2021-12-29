"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[9448],{3905:function(e,n,t){t.d(n,{Zo:function(){return l},kt:function(){return g}});var r=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=r.createContext({}),p=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},l=function(e){var n=p(e.components);return r.createElement(c.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),f=p(t),g=i,h=f["".concat(c,".").concat(g)]||f[g]||u[g]||o;return t?r.createElement(h,a(a({ref:n},l),{},{components:t})):r.createElement(h,a({ref:n},l))}));function g(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=f;var s={};for(var c in n)hasOwnProperty.call(n,c)&&(s[c]=n[c]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var p=2;p<o;p++)a[p]=t[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},18024:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return s},contentTitle:function(){return c},metadata:function(){return p},toc:function(){return l},default:function(){return f}});var r=t(87462),i=t(63366),o=(t(67294),t(3905)),a=["components"],s={id:"configure-percy",title:"Setting Up Visual Regression Tests",sidebar_label:"Percy"},c=void 0,p={unversionedId:"configure-percy",id:"configure-percy",title:"Setting Up Visual Regression Tests",description:"Installation",source:"@site/docs/configure-percy.md",sourceDirName:".",slug:"/configure-percy",permalink:"/docs/configure-percy",editUrl:"https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/docs/configure-percy.md",tags:[],version:"current",frontMatter:{id:"configure-percy",title:"Setting Up Visual Regression Tests",sidebar_label:"Percy"},sidebar:"docs",previous:{title:"Webpack",permalink:"/docs/getting-started-webpack"},next:{title:"Jest",permalink:"/docs/configure-jest"}},l=[{value:"Installation",id:"installation",children:[],level:2},{value:"Setting up with GitHub actions",id:"setting-up-with-github-actions",children:[],level:2}],u={toc:l};function f(e){var n=e.components,s=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},u,s,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"Paperclip integrates with ",(0,o.kt)("a",{parentName:"p",href:"https://percy.io"},"Percy")," to allow you test for CSS bugs in your Paperclip UI files. To get started, install the NPM module:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm install percy-paperclip --save-dev\n")),(0,o.kt)("p",null,"Next, grab your percy token, then run the following command in the same directory as your ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," file:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"PERCY_TOKEN=[TOKEN] yarn percy-paperclip\n")),(0,o.kt)("p",null,"After that, you should see something like this:"),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"Percy demo",src:t(58472).Z})),(0,o.kt)("p",null,"That's it! You're now set up to catch visual regressions in your UIs. "),(0,o.kt)("h2",{id:"setting-up-with-github-actions"},"Setting up with GitHub actions"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"percy-paperclip")," pairs nicely with GitHub actions, especially for PR checks. Here's a GitHub action you can use: "),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-yml"},'name: PR Checks\non:  \n  pull_request\n\njobs:\n  visual-regression-test:\n    name: Visual Regression Test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - uses: actions/setup-node@v1\n      - uses: actions/checkout@v2\n        with:\n          fetch-depth: 0 # fetches all branches\n      - name: Maybe snapshot\n        run: |\n          CHANGED_PC_FILES=$(git diff --name-only origin/${{ github.base_ref }} origin/${{ github.head_ref }} -- "./**/*.pc")\n          if [ -n "$CHANGED_PC_FILES" ]; then\n            yarn add percy percy-paperclip\n            percy exec -- percy-paperclip\n          fi\n        working-directory: ./path/to/frontend\n        env: \n          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}\n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Be sure to change ",(0,o.kt)("inlineCode",{parentName:"p"},"working-directory")," to point to where your ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," file is. ")),(0,o.kt)("p",null,"\u261d\ud83c\udffb This script will run only when PC files change, so if you're working with people working on the back-end, for instance, they won't get this check (since we're assuming they won't touch PC files). "),(0,o.kt)("p",null,"To go along with the script above, you'll need to set up a ",(0,o.kt)("a",{parentName:"p",href:"https://docs.percy.io/docs/baseline-picking-logic"},"baseline")," for your master branch. Here's a script for that:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-yml"},'name: Master Checks\non:\n  push:\n    branches:\n      - master\n    \njobs:\n  visual-regression-test:\n    name: Visual Regression Test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - uses: actions/setup-node@v1\n      - uses: actions/checkout@v2\n        with:\n          fetch-depth: 0\n      - name: Maybe snapshot\n        run: |\n          CHANGED_PC_FILES=$(git diff --name-only origin/master^ origin/master -- "./**/*.pc")\n          if [ -n "$CHANGED_PC_FILES" ]; then\n            yarn add percy\n            yarn snapshot\n          fi\n        working-directory: ./path/to/frontend\n        env: \n          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}\n          \n')),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Again, be sure to change ",(0,o.kt)("inlineCode",{parentName:"p"},"working-directory")," to point to where your ",(0,o.kt)("inlineCode",{parentName:"p"},"paperclip.config.json")," file is. ")),(0,o.kt)("p",null,"\u261d\ud83c\udffb This script runs whenever a ",(0,o.kt)("inlineCode",{parentName:"p"},"*.pc")," file changes on master, and ensures that subsequent PRs are visually testing against the correct baseline."))}f.isMDXComponent=!0},58472:function(e,n,t){n.Z=t.p+"assets/images/snapshot-5e440d397b2ae377b3bb0b246ffb25b4.gif"}}]);