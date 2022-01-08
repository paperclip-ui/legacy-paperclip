"use strict";(self.webpackChunk_paperclip_ui_website=self.webpackChunk_paperclip_ui_website||[]).push([[9514,2206],{36310:function(e,t,a){a.r(t),a.d(t,{default:function(){return ee}});var n=a(67294),l=a(3905),r=a(19039),o=a(58447),i=a(86010),c=a(87193),s=a(82037),d=a(52564),u=a(87462);var m=function(e){return n.createElement("svg",(0,u.Z)({width:"20",height:"20","aria-hidden":"true"},e),n.createElement("g",{fill:"#7a7a7a"},n.createElement("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),n.createElement("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})))},p=a(87601),b=a(63366),h=a(57729),f=a(21141),v=a(93462),E="menuLinkText_OKON",g="hasHref_TwRn",_=a(30642),k=["items"],C=["item"],Z=["item","onItemClick","activePath","level"],S=["item","onItemClick","activePath","level"],N=(0,n.memo)((function(e){var t=e.items,a=(0,b.Z)(e,k);return n.createElement(n.Fragment,null,t.map((function(e,t){return n.createElement(I,(0,u.Z)({key:t,item:e},a))})))}));function I(e){var t=e.item,a=(0,b.Z)(e,C);return"category"===t.type?0===t.items.length?null:n.createElement(T,(0,u.Z)({item:t},a)):n.createElement(w,(0,u.Z)({item:t},a))}function T(e){var t,a=e.item,l=e.onItemClick,r=e.activePath,o=e.level,s=(0,b.Z)(e,Z),d=a.items,m=a.label,f=a.collapsible,v=a.className,k=a.href,C=function(e){var t=(0,_.Z)();return(0,n.useMemo)((function(){return e.href?e.href:!t&&e.collapsible?(0,c.Wl)(e):void 0}),[e,t])}(a),S=(0,c._F)(a,r),I=(0,c.uR)({initialState:function(){return!!f&&(!S&&a.collapsed)}}),T=I.collapsed,w=I.setCollapsed,y=I.toggleCollapsed;return function(e){var t=e.isActive,a=e.collapsed,l=e.setCollapsed,r=(0,c.D9)(t);(0,n.useEffect)((function(){t&&!r&&a&&l(!1)}),[t,r,a,l])}({isActive:S,collapsed:T,setCollapsed:w}),n.createElement("li",{className:(0,i.Z)(c.kM.docs.docSidebarItemCategory,c.kM.docs.docSidebarItemCategoryLevel(o),"menu__list-item",{"menu__list-item--collapsed":T},v)},n.createElement("div",{className:"menu__list-item-collapsible"},n.createElement(h.Z,(0,u.Z)({className:(0,i.Z)("menu__link",(t={"menu__link--sublist":f&&!k,"menu__link--active":S},t[E]=!f,t[g]=!!C,t)),onClick:f?function(e){null==l||l(a),k?w(!1):(e.preventDefault(),y())}:function(){null==l||l(a)},href:f?null!=C?C:"#":C},s),m),k&&f&&n.createElement("button",{"aria-label":(0,p.I)({id:"theme.DocSidebarItem.toggleCollapsedCategoryAriaLabel",message:"Toggle the collapsible sidebar category '{label}'",description:"The ARIA label to toggle the collapsible sidebar category"},{label:m}),type:"button",className:"clean-btn menu__caret",onClick:function(e){e.preventDefault(),y()}})),n.createElement(c.zF,{lazy:!0,as:"ul",className:"menu__list",collapsed:T},n.createElement(N,{items:d,tabIndex:T?-1:0,onItemClick:l,activePath:r,level:o+1})))}function w(e){var t=e.item,a=e.onItemClick,l=e.activePath,r=e.level,o=(0,b.Z)(e,S),s=t.href,d=t.label,m=t.className,p=(0,c._F)(t,l);return n.createElement("li",{className:(0,i.Z)(c.kM.docs.docSidebarItemLink,c.kM.docs.docSidebarItemLinkLevel(r),"menu__list-item",m),key:d},n.createElement(h.Z,(0,u.Z)({className:(0,i.Z)("menu__link",{"menu__link--active":p}),"aria-current":p?"page":void 0,to:s},(0,f.Z)(s)&&{onClick:a?function(){return a(t)}:void 0},o),(0,f.Z)(s)?d:n.createElement("span",null,d,n.createElement(v.Z,null))))}var y="sidebar_a3j0",M="sidebarWithHideableNavbar_VlPv",A="sidebarHidden_OqfG",F="sidebarLogo_hmkv",x="menu_cyFh",B="menuWithAnnouncementBar_+O1J",L="collapseSidebarButton_eoK2",P="collapseSidebarButtonIcon_e+kA";function R(e){var t=e.onClick;return n.createElement("button",{type:"button",title:(0,p.I)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,p.I)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,i.Z)("button button--secondary button--outline",L),onClick:t},n.createElement(m,{className:P}))}function D(e){var t,a,l=e.path,r=e.sidebar,o=e.onCollapse,s=e.isHidden,u=function(){var e=(0,c.nT)().isActive,t=(0,n.useState)(e),a=t[0],l=t[1];return(0,c.RF)((function(t){var a=t.scrollY;e&&l(0===a)}),[e]),e&&a}(),m=(0,c.LU)(),p=m.navbar.hideOnScroll,b=m.hideableSidebar;return n.createElement("div",{className:(0,i.Z)(y,(t={},t[M]=p,t[A]=s,t))},p&&n.createElement(d.Z,{tabIndex:-1,className:F}),n.createElement("nav",{className:(0,i.Z)("menu thin-scrollbar",x,(a={},a[B]=u,a))},n.createElement("ul",{className:(0,i.Z)(c.kM.docs.docSidebarMenu,"menu__list")},n.createElement(N,{items:r,activePath:l,level:1}))),b&&n.createElement(R,{onClick:o}))}var H=function(e){var t=e.toggleSidebar,a=e.sidebar,l=e.path;return n.createElement("ul",{className:(0,i.Z)(c.kM.docs.docSidebarMenu,"menu__list")},n.createElement(N,{items:a,activePath:l,onItemClick:function(e){"category"===e.type&&e.href&&t(),"link"===e.type&&t()},level:1}))};function O(e){return n.createElement(c.Cv,{component:H,props:e})}var W=n.memo(D),j=n.memo(O);function q(e){var t=(0,s.Z)(),a="desktop"===t||"ssr"===t,l="mobile"===t;return n.createElement(n.Fragment,null,a&&n.createElement(W,e),l&&n.createElement(j,e))}var z=a(67878),Y=a(82206),K="backToTopButton_i9tI",U="backToTopButtonShow_wCmF";function V(){var e=(0,n.useRef)(null);return{smoothScrollTop:function(){var t;e.current=(t=null,function e(){var a=document.documentElement.scrollTop;a>0&&(t=requestAnimationFrame(e),window.scrollTo(0,Math.floor(.85*a)))}(),function(){return t&&cancelAnimationFrame(t)})},cancelScrollToTop:function(){return null==e.current?void 0:e.current()}}}var G=function(){var e,t=(0,n.useState)(!1),a=t[0],l=t[1],r=(0,n.useRef)(!1),o=V(),s=o.smoothScrollTop,d=o.cancelScrollToTop;return(0,c.RF)((function(e,t){var a=e.scrollY,n=null==t?void 0:t.scrollY;if(n)if(r.current)r.current=!1;else{var o=a<n;if(o||d(),a<300)l(!1);else if(o){var i=document.documentElement.scrollHeight;a+window.innerHeight<i&&l(!0)}else l(!1)}})),(0,c.SL)((function(e){e.location.hash&&(r.current=!0,l(!1))})),n.createElement("button",{"aria-label":(0,p.I)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,i.Z)("clean-btn",c.kM.common.backToTopButton,K,(e={},e[U]=a,e)),type:"button",onClick:function(){return s()}})},J=a(76775),Q={docPage:"docPage_lDyR",docMainContainer:"docMainContainer_r8cw",docSidebarContainer:"docSidebarContainer_0YBq",docMainContainerEnhanced:"docMainContainerEnhanced_SOUu",docSidebarContainerHidden:"docSidebarContainerHidden_Qlt2",collapsedDocSidebar:"collapsedDocSidebar_zZpm",expandSidebarButtonIcon:"expandSidebarButtonIcon_cxi8",docItemWrapperEnhanced:"docItemWrapperEnhanced_aT5H"},X=a(62608);function $(e){var t,a,r,s=e.currentDocRoute,d=e.versionMetadata,u=e.children,b=e.sidebarName,h=(0,c.Vq)(),f=d.pluginId,v=d.version,E=(0,n.useState)(!1),g=E[0],_=E[1],k=(0,n.useState)(!1),C=k[0],Z=k[1],S=(0,n.useCallback)((function(){C&&Z(!1),_((function(e){return!e}))}),[C]);return n.createElement(o.Z,{wrapperClassName:c.kM.wrapper.docsPages,pageClassName:c.kM.page.docsDocPage,searchMetadata:{version:v,tag:(0,c.os)(f,v)}},n.createElement("div",{className:Q.docPage},n.createElement(G,null),h&&n.createElement("aside",{className:(0,i.Z)(Q.docSidebarContainer,(t={},t[Q.docSidebarContainerHidden]=g,t)),onTransitionEnd:function(e){e.currentTarget.classList.contains(Q.docSidebarContainer)&&g&&Z(!0)}},n.createElement(q,{key:b,sidebar:h,path:s.path,onCollapse:S,isHidden:C}),C&&n.createElement("div",{className:Q.collapsedDocSidebar,title:(0,p.I)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,p.I)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:S,onClick:S},n.createElement(m,{className:Q.expandSidebarButtonIcon}))),n.createElement("main",{className:(0,i.Z)(Q.docMainContainer,(a={},a[Q.docMainContainerEnhanced]=g||!h,a))},n.createElement("div",{className:(0,i.Z)("container padding-top--md padding-bottom--lg",Q.docItemWrapper,(r={},r[Q.docItemWrapperEnhanced]=g,r))},n.createElement(l.Zo,{components:z.Z},u)))))}var ee=function(e){var t=e.route.routes,a=e.versionMetadata,l=e.location,o=t.find((function(e){return(0,J.LX)(l.pathname,e)}));if(!o)return n.createElement(Y.default,null);var i=o.sidebar,s=i?a.docsSidebars[i]:null;return n.createElement(n.Fragment,null,n.createElement(X.Z,null,n.createElement("html",{className:a.className})),n.createElement(c.qu,{version:a},n.createElement(c.bT,{sidebar:s},n.createElement($,{currentDocRoute:o,versionMetadata:a,sidebarName:i},(0,r.Z)(t,{versionMetadata:a})))))}},82206:function(e,t,a){a.r(t);var n=a(67294),l=a(58447),r=a(87601);t.default=function(){return n.createElement(l.Z,{title:(0,r.I)({id:"theme.NotFound.title",message:"Page Not Found"})},n.createElement("main",{className:"container margin-vert--xl"},n.createElement("div",{className:"row"},n.createElement("div",{className:"col col--6 col--offset-3"},n.createElement("h1",{className:"hero__title"},n.createElement(r.Z,{id:"theme.NotFound.title",description:"The title of the 404 page"},"Page Not Found")),n.createElement("p",null,n.createElement(r.Z,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page"},"We could not find what you were looking for.")),n.createElement("p",null,n.createElement(r.Z,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page"},"Please contact the owner of the site that linked you to the original URL and let them know their link is broken."))))))}},29625:function(e,t,a){var n=a(98906),l=a(67294),r=a(80646);t.Z=function(e){return e.live?l.createElement(o,{expanded:"false"!==e.expanded,fullScreen:e.fullScreen,height:e.height,showAllFrames:e.showAllFrames},e.children):l.createElement(r.Z,e)};var o=function(e){var t=e.children,n=e.height,r=void 0===n?400:n,o=e.fullScreen,c=(e.expanded,e.showAllFrames),s=(0,l.useRef)(),d=(0,l.useMemo)((function(){return i(t)}),[t]);return(0,l.useEffect)((function(){if(s.current&&"undefined"!=typeof window){var e={};o?Object.assign(e,{height:"100vh"}):Object.assign(e,{height:r,margin:"16px 0px"}),Object.assign(s.current.style,e),Promise.all([a.e(532),a.e(9606),a.e(2936),a.e(1346),a.e(9805),a.e(5548)]).then(a.bind(a,85548)).then((function(e){new e.App({files:d,entry:Object.keys(d)[0],activeFrame:c?null:0},s.current).init()}))}}),[s.current]),l.createElement("div",{ref:s})},i=function(e){for(var t,a,l=String(e).split(/\/\/\s*file:\s*/g).filter(Boolean),r={},o=(0,n.Z)(l);!(a=o()).done;){var i=a.value,c=(i.match(/(.*?\.pc)/)||[,"main.pc"])[1];t||(t=c);var s=i.replace(c,"").trim();r["file:///"+c]=s}return r}}}]);