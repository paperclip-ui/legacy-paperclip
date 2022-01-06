"use strict";(self.webpackChunkpaperclip_website=self.webpackChunkpaperclip_website||[]).push([[53],{1109:function(e){e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"docs":[{"type":"link","label":"Installation","href":"/docs/installation","docId":"installation"},{"type":"link","label":"Syntax","href":"/docs/usage-syntax","docId":"usage-syntax"},{"type":"link","label":"Configuring","href":"/docs/configure-paperclip","docId":"configure-paperclip"},{"type":"link","label":"CLI","href":"/docs/usage-cli","docId":"usage-cli"},{"type":"category","label":"Code Usage","collapsed":false,"items":[{"type":"link","label":"React","href":"/docs/usage-react","docId":"usage-react"}],"collapsible":true},{"type":"category","label":"Tools","collapsed":false,"items":[{"type":"link","label":"Visual Tools","href":"/docs/visual-tooling","docId":"visual-tooling"},{"type":"link","label":"VS Code Extension","href":"/docs/guide-vscode","docId":"guide-vscode"}],"collapsible":true},{"type":"category","label":"Integrations","collapsed":false,"items":[{"type":"link","label":"Webpack","href":"/docs/getting-started-webpack","docId":"getting-started-webpack"},{"type":"link","label":"Percy","href":"/docs/configure-percy","docId":"configure-percy"},{"type":"link","label":"Jest","href":"/docs/configure-jest","docId":"configure-jest"},{"type":"link","label":"Prettier","href":"/docs/configure-prettier","docId":"configure-prettier"}],"collapsible":true},{"type":"category","label":"Guides","collapsed":false,"items":[{"type":"link","label":"Migrating Code","href":"/docs/guide-migrating-to-paperclip","docId":"guide-migrating-to-paperclip"},{"type":"link","label":"Third-party Libraries","href":"/docs/guide-third-party-libraries","docId":"guide-third-party-libraries"},{"type":"link","label":"Previews","href":"/docs/guide-previews","docId":"guide-previews"},{"type":"link","label":"Compilers","href":"/docs/guide-compilers","docId":"guide-compilers"}],"collapsible":true}]},"docs":{"configure-jest":{"id":"configure-jest","title":"Configure Paperclip with Jest","description":"You can include Paperclip UIs directly in your Jest tests.","sidebar":"docs"},"configure-paperclip":{"id":"configure-paperclip","title":"Configuration","description":"The paperclip.config.json contains information about linting rules, compiler options, and such. Here\'s the typed definition:","sidebar":"docs"},"configure-percy":{"id":"configure-percy","title":"Setting Up Visual Regression Tests","description":"Installation","sidebar":"docs"},"configure-prettier":{"id":"configure-prettier","title":"Prettier Usage","description":"Assuming that you have Prettier installed, just run:","sidebar":"docs"},"configure-webpack":{"id":"configure-webpack","title":"Setting Up Webpack","description":"Take a look at the TODO MVC example to see how everything is put together."},"getting-started-cofigure":{"id":"getting-started-cofigure","title":"getting-started-cofigure","description":""},"getting-started-cra":{"id":"getting-started-cra","title":"Create React App","description":"This is the setup process for CRA if you\'re using that in your project."},"getting-started-first-ui":{"id":"getting-started-first-ui","title":"Using Paperclip With React","description":"Create a new file in your source directory that\'s called GroceryList.pc, then add this stuff:"},"getting-started-new-project":{"id":"getting-started-new-project","title":"New Project","description":"If you\'d like to create a new project with Paperclip, just run this command in a new directory:"},"getting-started-vscode":{"id":"getting-started-vscode","title":"Installing the visual tools","description":"Paperclip comes with visual tooling that eliminiates the compile step so that you can see your changes immediately after you save (or type if you\'re using VS Code extension). You\'ll be happy to use them!"},"getting-started-webpack":{"id":"getting-started-webpack","title":"Configuring Webpack","description":"Paperclip works with Webpack 4 and 5. To get started, install these dependencies:","sidebar":"docs"},"guide-compilers":{"id":"guide-compilers","title":"Compilers","description":"If you prefer to figure things out yourself, a few good place to start would be the React compiler, and Interim module.","sidebar":"docs"},"guide-dynamic-styles":{"id":"guide-dynamic-styles","title":"Dynamically Changing Styles Using JavaScript","description":"While Paperclip can cover most of your UI, there will probably be edge cases where you need to compute styles using code. Here\'s an example Paperclip file:"},"guide-how-to-use":{"id":"guide-how-to-use","title":"Paperclip Basics","description":"You can think of Paperclip as a language that focuses purely on your web application\'s appearance -  just covering HTML, CSS, and basic components. With that, you can construct almost all of your application UI in Paperclip. For example, here\'s a simple list:"},"guide-migrating-to-paperclip":{"id":"guide-migrating-to-paperclip","title":"Migration Code To And From Paperclip","description":"Migrating to and from Paperclip is easy since most of Paperclip\'s patterns are shared across different libraries.","sidebar":"docs"},"guide-modules":{"id":"guide-modules","title":"Writing Paperclip Modules","description":"Paperclip can be modularized for re-usability across packages or NPM. To get started, make sure that you have a paperclip.config.json"},"guide-previews":{"id":"guide-previews","title":"Paperclip Previews","description":"Previews are a way for you to see your all of your primitive components together. Here\'s a basic example:","sidebar":"docs"},"guide-theming":{"id":"guide-theming","title":"Theming","description":"You can create multiple themes (such as light, and dark) for your app by putting them in a single themes.pc file that contains all of your color variables and other theming properties. For example:"},"guide-theming2":{"id":"guide-theming2","title":"Theming","description":""},"guide-thinking-in-paperclip":{"id":"guide-thinking-in-paperclip","title":"Thinking In Paperclip","description":"Think of Paperclip as your UI layer that contains all of your HTML & CSS. These files contain no logic, just the appearance. Your React components\' role is to add interactivity to these files."},"guide-third-party-libraries":{"id":"guide-third-party-libraries","title":"Using Third-party Libraries","description":"Third-party CSS","sidebar":"docs"},"guide-visual-tools":{"id":"guide-visual-tools","title":"Visual Tooling","description":"Hello"},"guide-vscode":{"id":"guide-vscode","title":"VS Code Extension","description":"The VS Code extension provides a richer experience for Paperclp that includes code highlighting, intellisense, and realtime visual development.","sidebar":"docs"},"guide-why":{"id":"guide-why","title":"Why Paperclip?","description":"There are a number of reasons why Paperclip was created."},"guide-workarounds":{"id":"guide-workarounds","title":"Workarounds","description":"Paperclip will require some finnessing for certain cases."},"guide-writing-components-quickly":{"id":"guide-writing-components-quickly","title":"Writing Components Efficiently","description":"I think an easy way to start writing components is to simply write the HTML & CSS first. This involves writing a lot of redundant code up front, but seeing how all of the HTML & CSS is rendered will allow us to indentify what to componentize exactly."},"guide-writing-previews":{"id":"guide-writing-previews","title":"Organizing Paperclip files","description":"Still a work in progress!"},"installation":{"id":"installation","title":"Installation","description":"To get started with Paperclip, just run this command in your project directory:","sidebar":"docs"},"introduction":{"id":"introduction","title":"Introduction","description":"Paperclip is a tool that specializes in just the appearance of your application, and it only covers HTML, CSS, and primitive components."},"usage-cli":{"id":"usage-cli","title":"CLI Usage","description":"The CLI tool is used primarily to compile Paperclip files into your target framework.","sidebar":"docs"},"usage-react":{"id":"usage-react","title":"Using Paperclip In React Apps","description":"After building your Paperclip files, you can import them just as regular JavaScript modules. For example:","sidebar":"docs"},"usage-syntax":{"id":"usage-syntax","title":"Paperclip Syntax","description":"Basics","sidebar":"docs"},"usage-troubleshooting":{"id":"usage-troubleshooting","title":"Troubleshooting","description":"Not necessarily gotchas, but things to be aware of when you\'re using Paperclip."},"visual-tooling":{"id":"visual-tooling","title":"Visual tools","description":"Paperclip comes with visual tooling that enables you to build your UIs in realtime. The quickest way to start using the visual tools is to run:","sidebar":"docs"}}}')}}]);