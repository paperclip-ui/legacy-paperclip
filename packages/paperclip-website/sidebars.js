module.exports = {
  docs: [
    {
      type: "doc",
      id: "installation"
    },
    {
      type: "doc",
      id: "usage-syntax"
    },
    {
      type: "doc",
      id: "configure-paperclip"
    },
    {
      type: "doc",
      id: "usage-cli"
    },
    {
      type: "category",
      label: "Code Usage",
      collapsed: false,
      items: ["usage-react"]
    },
    {
      type: "category",
      label: "Tools",
      collapsed: false,
      items: ["visual-tooling", "visual-regression-tooling", "guide-vscode"]
    },
    {
      type: "category",
      label: "Integrations",
      collapsed: false,
      items: [
        "getting-started-webpack",
        "configure-percy",
        "configure-jest",
        "configure-prettier"
      ]
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        // "guide-how-to-use",
        "guide-migrating-to-paperclip",
        "guide-third-party-libraries",
        "guide-previews",
        // "guide-dynamic-styles",
        // "guide-modules",
        // "guide-theming2",
        "guide-compilers"
      ]
    }
  ]
};
