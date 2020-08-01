module.exports = {
  title: "Paperclip",
  tagline: "A language for building UIs in a flash ⚡️",
  url: "https://paperclip.dev",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "crcn", // Usually your GitHub org/user name.
  projectName: "paperclip", // Usually your repo name.
  themeConfig: {
    googleAnalytics: {
      trackingID: "UA-173953110-1"
    },
    prism: {
      theme: require("prism-react-renderer/themes/oceanicNext")
    },
    navbar: {
      title: "Paperclip",
      logo: {
        alt: "Paperclip",
        src: "img/logo-color.svg",
        srcDark: "img/logo-dark-2.svg"
      },
      links: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Get Started",
          position: "left"
        },
        {
          label: "API",
          to: "/docs/usage-syntax",
          position: "left"
        },
        {
          label: "Basics",
          to: "/docs/guide-how-to-use",
          position: "left"
        },
        // {to: 'blog', label: 'Blog', position: 'left'},
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
              to: "docs/configure-percy"
            }
          ]
        }
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: 'blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/crcn/paperclip',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Craig Condon`
    },
    colorMode: {
      disableDarkMode: true,
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: true
    }
  },
  themes: [
    require.resolve("./plugins/live-editor"),
    require.resolve("./plugins/paperclip")
  ],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: "getting-started-vscode",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/crcn/paperclip/edit/master/packages/paperclip-website/"
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        // },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ]
};
