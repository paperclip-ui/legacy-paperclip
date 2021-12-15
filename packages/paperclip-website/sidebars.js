module.exports = {
  docs: [
    {
      type: "doc",
      id: "installation"
    },
    {
      type: "category",
      label: "API Reference",
      collapsed: false,
      items: ["usage-syntax", "usage-cli", "configure-paperclip"]
    },
    {
      type: "category",
      label: "Code Usage",
      collapsed: false,
      items: ["usage-react"]
    },
    {
      type: "doc",
      id: "visual-tooling"
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        "guide-how-to-use",
        "guide-organization",
        "guide-migrating-to-paperclip",
        "guide-third-party-libraries",
        "guide-dynamic-styles",
        "guide-modules",
        "guide-theming",
        "guide-vscode"
      ]
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
    }
  ]
};
