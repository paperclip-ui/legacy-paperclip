export default {
  plugins: [],
  themes: [],
  customFields: {},
  themeConfig: {
    navbar: {
      title: "Paperclip",
      links: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left"
        },
        {
          href: "https://github.com/crcn/paperclip",
          label: "GitHub",
          position: "left"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Syntax",
              to: "docs/usage-syntax"
            },
            {
              label: "React usage",
              to: "docs/usage-react"
            },
            {
              label: "Visual regression testing",
              to: "docs/safety-visual-regression"
            }
          ]
        }
      ],
      copyright: "Copyright © 2020 Craig Condon"
    }
  },
  title: "Paperclip",
  tagline: "A language for building UI primitives",
  url: "https://paperclip.dev",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "crcn",
  projectName: "paperclip",
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          homePageId: "getting-started-installation",
          sidebarPath:
            "/Users/craigcondon/Developer/public/paperclip/packages/paperclip-website/sidebars.js",
          editUrl:
            "https://github.com/crcn/paperclip/packages//edit/master/website/"
        },
        theme: {
          customCss:
            "/Users/craigcondon/Developer/public/paperclip/packages/paperclip-website/src/css/custom.css"
        }
      }
    ]
  ]
};
