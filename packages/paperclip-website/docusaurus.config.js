module.exports = {
  title: "Paperclip",
  tagline:
    "A tiny language that brings scoped CSS to any kind of web application.",
  url: "https://paperclip.dev",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "crcn", // Usually your GitHub org/user name.
  projectName: "paperclip", // Usually your repo name.
  themeConfig: {
    algolia: {
      apiKey: "692b36b7f6c2f8b247884702fc82e7c3",
      indexName: "paperclip",
    },
    prism: {
      theme: require("prism-react-renderer/themes/oceanicNext"),
      additionalLanguages: ["php"],
    },
    navbar: {
      title: "Paperclip",
      logo: {
        alt: "Paperclip",
        src: "img/logo-color.svg",
        srcDark: "img/logo-dark-2.svg",
      },
      items: [
        {
          to: "/docs/installation",
          label: "Get Started",
          position: "left",
        },
        {
          label: "API",
          to: "/docs/usage-syntax",
          position: "left",
        },
        {
          label: "Blog",
          to: "/blog",
          position: "left",
        },
        // {
        //   label: "Playground",
        //   to: "https://playground.paperclip.dev",
        //   position: "left"
        // },
        // {
        //   label: "Why",
        //   to: "/docs/guide-why",
        //   position: "left"
        // },
        // {to: 'blog', label: 'Blog', position: 'left'},
        //         {
        //           href: "https://chat.paperclip.dev/",
        //           label: "Chat",
        //           position: "right"
        //         },
        {
          href: "https://github.com/paperclipui/paperclip",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Get Started",
          items: [
            {
              label: "Installation",
              to: "docs/installation",
            },
            {
              label: "VS Code",
              to: "docs/guide-vscode",
            },
          ],
        },
        {
          title: "API",
          items: [
            {
              label: "Syntax",
              to: "docs/usage-syntax",
            },
            {
              label: "React",
              to: "docs/usage-react",
            },
            {
              label: "CLI",
              to: "docs/usage-cli",
            },
          ],
        },
        {
          title: "Integrations",
          items: [
            {
              label: "Percy",
              to: "docs/configure-percy",
            },
            {
              label: "Webpack",
              to: "docs/getting-started-webpack",
            },
            {
              label: "Jest",
              to: "docs/configure-jest",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Help",
              href: "https://chat.paperclip.dev",
            },
            {
              href: "https://github.com/paperclipui/paperclip",
              label: "GitHub",
            },
            {
              href: "https://twitter.com/paperclipui",
              label: "Twitter",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Craig Condon`,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: true,
    },
  },
  themes: [
    // TODO: turn back on when working again
    // require.resolve("./plugins/live-editor"),
    require.resolve("./plugins/paperclip"),
  ],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/paperclipui/paperclip/edit/master/packages/paperclip-website/",
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        // },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleAnalytics: {
          trackingID: "UA-173953110-1",
        },
      },
    ],
  ],
};
