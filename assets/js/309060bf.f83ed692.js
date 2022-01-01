"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[220],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return h}});var o=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,o,a=function(e,t){if(null==e)return{};var n,o,a={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=o.createContext({}),c=function(e){var t=o.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=c(e.components);return o.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},d=o.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,p=r(e,["components","mdxType","originalType","parentName"]),d=c(n),h=a,m=d["".concat(l,".").concat(h)]||d[h]||u[h]||i;return n?o.createElement(m,s(s({ref:t},p),{},{components:n})):o.createElement(m,s({ref:t},p))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,s=new Array(i);s[0]=d;var r={};for(var l in t)hasOwnProperty.call(t,l)&&(r[l]=t[l]);r.originalType=e,r.mdxType="string"==typeof e?e:a,s[1]=r;for(var c=2;c<i;c++)s[c]=n[c];return o.createElement.apply(null,s)}return o.createElement.apply(null,n)}d.displayName="MDXCreateElement"},48809:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return r},contentTitle:function(){return l},metadata:function(){return c},assets:function(){return p},toc:function(){return u},default:function(){return h}});var o=n(87462),a=n(63366),i=(n(67294),n(3905)),s=["components"],r={title:"Introducing Paperclip",description:"Introducing Paperclip, a DSL for presentational components",slug:"introducing-paperclip",authors:[{name:"Craig Condon",title:"Creator of Paperclip",url:"https://github.com/crcn",image_url:"https://github.com/crcn.png"}],image:"https://i.imgur.com/mErPwqL.png",hide_table_of_contents:!1},l=void 0,c={permalink:"/blog/introducing-paperclip",source:"@site/blog/2020-03-01-introducing-paperclip.md",title:"Introducing Paperclip",description:"Introducing Paperclip, a DSL for presentational components",date:"2020-03-01T00:00:00.000Z",formattedDate:"March 1, 2020",tags:[],readingTime:10.27,truncated:!0,authors:[{name:"Craig Condon",title:"Creator of Paperclip",url:"https://github.com/crcn",image_url:"https://github.com/crcn.png",imageURL:"https://github.com/crcn.png"}]},p={authorsImageUrls:[void 0]},u=[{value:"A hybrid tool between design &amp; code",id:"a-hybrid-tool-between-design--code",children:[],level:2},{value:"How to use Paperclip in your app",id:"how-to-use-paperclip-in-your-app",children:[],level:2},{value:"Perfect for your design system",id:"perfect-for-your-design-system",children:[],level:2},{value:"Explicit CSS",id:"explicit-css",children:[],level:2},{value:"Building UIs more accurately",id:"building-uis-more-accurately",children:[],level:2},{value:"Extensive visual bug protection",id:"extensive-visual-bug-protection",children:[],level:2},{value:"Where\u2019s Paperclip heading?",id:"wheres-paperclip-heading",children:[],level:2}],d={toc:u};function h(e){var t=e.components,r=(0,a.Z)(e,s);return(0,i.kt)("wrapper",(0,o.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"I\u2019ve been building front-end applications for a while now, and one of my biggest gripes is just how slow and un-fun it is. If anyone were to ask me what the biggest time sink in web development is, I\u2019d say that it\u2019s writing HTML and CSS. That\u2019s not what I want to spend my time on!"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Slow HMR Demo",src:n(28164).Z})),(0,i.kt)("p",null,"HTML & CSS development is mostly visual, yet, developers write it by hand, then have to wait a few seconds to see their UI appear in the browser. That\u2019s not so bad for small projects, but larger projects that take 3+ seconds to reload can be excruciating to work with. Not only that, but this bottleneck can also affect the quality of the app."),(0,i.kt)("p",null,"I\u2019ve worked with many designers and developers over the years, and the consistent pattern I\u2019ve seen with every team is that developers would often-times either cut design corners in order to ship features on time, or give large estimates so that they could spend 90% of their time making sure that the UI is perfect. To pile on to that, I\u2019ve found that developers typically wouldn\u2019t translate designs correctly, and UIs would be just a little off. Since designers can\u2019t really make changes themselves, they usually ask their developer to fix the problem who then points them to \u201cfile a bug in GitHub\u201d in the endless sea of tickets, never to be seen again. This is a problem that I wanted to fix."),(0,i.kt)("p",null,"I starting focusing on UI builders four years ago, there should be a better tool for creating web UIs that has an experience similar to Figma or Sketch. Three years later and after many failed ideas, I finally feel like I built something that\u2019s practical enough to use."),(0,i.kt)("h2",{id:"a-hybrid-tool-between-design--code"},"A hybrid tool between design & code"),(0,i.kt)("p",null,"Paperclip is a free and open source DSL for presentational components that brings web development closer to a designer-like experience, all within your existing IDE. Here\u2019s the look and feel of it:"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Realtime preview",src:n(35925).Z})),(0,i.kt)("p",null,"You never have to leave your editor to create UIs, or wait around for changes to appear. Previews update instantly as you\u2019re making changes, even for very large projects."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Large projects",src:n(9065).Z})),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"If you\u2019re not using one of the supported IDEs, you can run the command line tool instead to launch the standalone preview app. From there you can use any text editor you want.")),(0,i.kt)("p",null,"Paperclip just covers your application\u2019s appearance, and the tooling is designed to help you build your UI out as quickly as possible. The syntax is simple, and just covers HTML, CSS, and primitive components. Here\u2019s an example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<style>\n  div {\n    color: red;\n  }\n</style>\n\n\x3c!--\n  Frames are kind of like artboards, and allow you to do responsive testing.  \n  @frame { title: "Desktop", width: 1024, height: 768 }\n--\x3e\n\n<div export component as="Message">\n  Hello {name}!\n</div>\n')),(0,i.kt)("p",null,"It\u2019s pure UI development focus without logic and other stuff getting in the way. After you\u2019ve defined your Paperclip UIs, you can import them into into your app."),(0,i.kt)("h2",{id:"how-to-use-paperclip-in-your-app"},"How to use Paperclip in your app"),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Paperclip is designed to support many different languages and frameworks. For the Beta however, it only supports React, and TypeScript apps.")),(0,i.kt)("p",null,"Paperclip UIs compile to plain code by either using the command line tool, or by using the Webpack loader for a cleaner integration. From there you can just import a UI file like a normal module:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as styles from "./styles.pc";\n\nfunction MyApp() {\n  return <styles.Message name="Bob" />;\n}\n')),(0,i.kt)("p",null,"If you\u2019re familiar with Styled Components and other CSS-in-JS libraries, you\u2019ll find that the API is similar. Just like CSS-in-JS libraries, styles are isolated to the components they\u2019re assigned to, so you don\u2019t have to worry about CSS leaking out to the rest of your app."),(0,i.kt)("p",null,"Here\u2019s a more complete example of a design file:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<import src="@captec/design-system/src/components.pc" as="ds" />\n\n\x3c!--\n ... more code above ...\n--\x3e\n\n\x3c!--\n  @frame { visible: false }\n--\x3e\n<div export component as="Title">\n  <div>\n    <style>\n      margin-top: 46px;\n      font-size: 20px;\n      font-family: Eina03;\n      line-height: 32px;\n    </style>\n    {children}\n  </div>\n  <div>\n    <style>\n      margin-top: 8px;\n      color: var(--color-text-subdued);\n      margin-bottom: 32px;\n    </style>\n    {subtitle}\n  </div>\n</div>\n\n\x3c!--\n  @frame { visible: false }\n--\x3e\n<div export component as="ProgressPills">\n  <style>\n    display: flex;\n  </style>\n  {children}\n</div>\n\n\x3c!--\n  @frame { visible: false }\n--\x3e\n<ds.Card export component as="AccountTypeOption" interactive {onClick}>\n  <ds.Checkbox {checked?} />\n  <ds.Detail title={name} {description} />\n</ds.Card>\n\n\x3c!--\n ... more code below ...\n--\x3e\n')),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"This is a snippet taken from production code, and isn\u2019t as clean as it could be since there are some CSS properties that should be derived from design tokens (such as margin-top: 46px, font-family: Eina03). However, this isn\u2019t that big of a problem with Paperclip since this file is covered for visual regressions (more on that later). We can confidently refactor this later without changing what the UI looks like.")),(0,i.kt)("p",null,"Here\u2019s some of the React code associated with this design file above:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-javascript"},'import * as styles from "./styles.pc";\n\nconst InvestorSignupPage = () => {\n  const {\n    title,\n    accountKinds,\n    onAccountKindChange,\n    onContinue,\n    onSignup,\n  } = useSignupPage();\n\n  return (\n    <styles.Wrapper>\n      <styles.Header\n        title={title}\n        accessLink={<NavLink to="/login">Log in</NavLink>}\n      />\n      <styles.Content>\n        <styles.Title subtitle="Select the option that best aligns with you">\n      Choose an account\n    </styles.Title>\n        <styles.AccountTypeOption\n      checked={accountKinds.includes(AccountKind.PortfolioAnalytics)}\n      name="Portfolio analytics"\n      description="Analyze your portfolio companies in real-time and help them to access non-dilutive financing offers."\n      onClick={() => onAccountKindChange(AccountKind.PortfolioAnalytics)}\n    />\n    <styles.AccountTypeOption\n      checked={accountKinds.includes(AccountKind.CreditInvesting)}\n      name="Credit investing"\n      description="Source debt investments from our database of over +1,500 companies on our platform."\n      onClick={() => onAccountKindChange(AccountKind.CreditInvesting)}\n    />\n    <Button wfull v3 primary onClick={onContinue}>\n          Continue\n    </Button>\n      </styles.Content>\n    </styles.Wrapper>\n  );\n};\n')),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"screenshot",src:n(46723).Z})),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"With Paperclip, you can create just about any web UI you want with few restrictions. You can also use as much or as little of it as you want.")),(0,i.kt)("h2",{id:"perfect-for-your-design-system"},"Perfect for your design system"),(0,i.kt)("p",null,"Paperclip is a great tool for your design system since it gives you a fast and free-form environment for creating building blocks that you can re-use throughout your application. Here\u2019s an example of a design system that I\u2019m currently working on at the time of writing this article:"),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"screenshot",src:n(8327).Z})),(0,i.kt)("p",null,"You can build your design system out quickly since every style change appears instantly across your entire app. For finicky things such as layout, this is a very useful feature to have."),(0,i.kt)("p",null,"If you prefer to keep your UIs organized in separate files, you can do that and your UIs will be just as searchable by developers looking for a particular component."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"screenshot",src:n(73375).Z})),(0,i.kt)("p",null,"Paperclip is not only a great tool for your design system because it\u2019s a fast environment, there\u2019s also a great amount of safety that Paperclip offers to help you build scalable and maintainable UIs that are resilient to visual production bugs and software rot."),(0,i.kt)("h2",{id:"explicit-css"},"Explicit CSS"),(0,i.kt)("p",null,"One of the problems I find with CSS is the global nature of it. It can be manageable for small projects, but can quickly become unwieldy when your app and team gets larger. Typically what happens I\u2019ve found is that with global CSS, it becomes unknown about what parts of the app styles are applied to. As a result of that, engineers can feel comfortable about making CSS changes and decide that the safest route is to leave it alone (or risk shipping a bug to production). Over the course of years as CSS piles up, it\u2019s easy for the whole styling system to become a giant Rube Goldberg machine. That tech debt never usually goes away, developers just deal with it."),(0,i.kt)("p",null,"Today, developers have systems in place such as CSS Modules, CSS-in-JS, SMACSS, and such to help manage some of the issues around CSS. However, most of the tooling still allows developers to easily write global CSS in some way (like nested style selectors which has caused visual bugs in my experience). In Paperclip, that risk is greatly diminished."),(0,i.kt)("p",null,"In Paperclip, CSS is scoped in the document it\u2019s defined in. Here\u2019s an example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},"\x3c!-- \n  You can define styles at the top of the document, and they will\n  be applied to all elements within this file.\n--\x3e\n<style>\n  div {\n    color: red;\n  }\n</style>\n\n<div>\n  I'm red!\n\n  <span>\n    \n    \x3c!-- \n      You can also define styles within an element, \n      and they will only be applied to that element, \n      along with all of its descendents. \n    --\x3e\n    <style>\n      color: purple;\n    </style>\n    I'm purple!\n  </span>\n</div>\n")),(0,i.kt)("p",null,"If you want to stylize another document, you need to be explicit about it. Here\u2019s an example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<import src="./Message.pc" as="Message" />\n\n<style>\n  .my-style-override {\n    color: red;\n    font-weight: 800;\n  }\n</style>\n\n\x3c!-- The $ syntax tells Paperclip to inject this style into the imported component --\x3e\n<Message labelClass="$my-style-override">\n  Craig\n</Message>\n')),(0,i.kt)("p",null,"In Message.pc, all you need to do is define labelClass on the element that you would like to allow style overrides:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- Message.pc --\x3e\n<div export component as="default">\n  <span class={labelClass}>\n    Hello\n  </span> {children}!\n</div>\n')),(0,i.kt)("p",null,"This allows you to be clear about your module boundaries since you know exactly what can and can\u2019t be styled by other modules. This also goes the other way around for modules that you\u2019d like to use styles from, which is great for third-party CSS. For example, here\u2019s how you might use Tailwind with Paperclip:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<import src="tailwind.css" as="tw"  />\n\n\n\x3c!--\n  @frame { width: 768, height: 768, x: 0, y: 0 }\n--\x3e\n\n<div class="$tw.font-sans $tw.bg-gray-500 $tw.h-screen $tw.w-screen">\n  <div class="$tw.bg-gray-100 $tw.rounded-lg $tw.p-8 $tw.md:p-0">\n    <div class="$tw.pt-6 $tw.text-center $tw.space-y-4">\n      <blockquote>\n        <p class="$tw.text-lg $tw.font-semibold">\n          Lorem ipsum dolor sit amet, consectetur adipiscing elit, \n          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n        </p>\n      </blockquote>\n      <figcaption class="$tw.font-medium">\n        <div class="$tw.text-blue-600">\n          sit voluptatem\n        </div>\n      </figcaption>\n    </div>\n  </div>\n</div>\n')),(0,i.kt)("p",null,"With this approach, you know exactly how third-party CSS is used, and don\u2019t have to worry about it accidentally styling other parts of your app. Of course, you can always use global CSS if you want to (and you may need it for certain edge cases), but you must be explicit about that. For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},"<style>\n  :global(*) {\n    box-sizing: border-box;\n  }\n</style>\n")),(0,i.kt)("p",null,"This way there\u2019s no guessing about what is and isn\u2019t global."),(0,i.kt)("h2",{id:"building-uis-more-accurately"},"Building UIs more accurately"),(0,i.kt)("p",null,"Building web UIs can be a finicky thing, especially when you\u2019re considering things like box model, borders, and other layout properties that can change the size and spacing of your elements. Paperclip comes with measuring tools and other inspection utilities to help make it easier to match your UIs with your design."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"screenshot",src:n(69097).Z})),(0,i.kt)("h2",{id:"extensive-visual-bug-protection"},"Extensive visual bug protection"),(0,i.kt)("p",null,"Every frame that is defined within Paperclip is automatically covered for visual bugs. All you need to do is run Paperclip\u2019s visual regression tool against your project, and you\u2019ll have protection against visual issues in production. It\u2019s really that easy."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"screenshot",src:n(43800).Z})),(0,i.kt)("p",null,"Why is this awesome? It means that you can be more confident about making big sweeping style changes across your app. Reskinning your app? No problem. Don\u2019t know what that CSS does? Delete it, you\u2019re covered."),(0,i.kt)("p",null,"Responsive testing is also easy to set up. Just create a new frame, resize it to whatever width you want, and you\u2019re done. If you have the visual regression tool set up, it will automatically capture this new frame and provide you with protection."),(0,i.kt)("h2",{id:"wheres-paperclip-heading"},"Where\u2019s Paperclip heading?"),(0,i.kt)("p",null,"Eventually there will be more visual tooling for things like CSS grid, spacing, and other CSS features that make sense to edit visually. My goal is to eventually build a tool that finds a good balance between coding and design."),(0,i.kt)("p",null,"I\u2019m also aiming to build more tooling that makes product development more accessible to designers, giving them control over the actual UI. It\u2019s my sense that designers need to be in control since designs that are translated by developers are almost always a little off."),(0,i.kt)("p",null,"Designer tooling could be in the form of a tool that synchronizes Figma designs to Paperclip sources (via Zeplin or Avocode), or maybe designers will feel comfortable enough to use a UI builder that writes Paperclip files. Maybe both options. And with safety tools such as visual regression testing, I believe that designers will be able to confidently ship features without needing the assistance of developers (probably just for code reviews). For now though, Paperclip will remain developer-focused. Once the foundation is solid, Paperclip will move onto becoming a more accessible tool for designers and other non-coders who want to help build production-ready UIs. If you\u2019re interested in trying out Paperclip, let me know!"))}h.isMDXComponent=!0},8327:function(e,t,n){t.Z=n.p+"assets/images/ds-screenshot-5ddd6d7cb58a2d8a1975f9948ce3e2d5.png"},73375:function(e,t,n){t.Z=n.p+"assets/images/grid-view-66f1e4529ee72b805e63f562621420f5.gif"},28164:function(e,t,n){t.Z=n.p+"assets/images/hmr-demo-5e9bc229817135e5c56795593d09f9ad.gif"},46723:function(e,t,n){t.Z=n.p+"assets/images/investor-signup-demo-fde8dca3fa5fcaed9a8d8f11370aecbe.png"},69097:function(e,t,n){t.Z=n.p+"assets/images/measing-cdad885fb5a56c94c9a89ca3954b9801.gif"},43800:function(e,t,n){t.Z=n.p+"assets/images/percy-fdb5fa441633ce0cab1ab6575b9de862.gif"},9065:function(e,t,n){t.Z=n.p+"assets/images/preview-large-projects-2a84c9a7a17929291754dcb36565f0bc.gif"},35925:function(e,t,n){t.Z=n.p+"assets/images/realtime-preview-1-231ee5de4b3b49543abc453432f6cbc7.gif"}}]);