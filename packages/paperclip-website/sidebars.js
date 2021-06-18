module.exports = {
  docs: [
    {
      type: "doc",
      id: "introduction"
    },
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: ["getting-started-webpack", "getting-started-new-project"]
    },
    {
      type: "doc",
      id: "visual-tooling"
    },
    {
      type: "category",
      label: "API Reference",
      collapsed: false,
      items: ["usage-react", "usage-syntax", "usage-cli", "configure-paperclip"]
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
        "configure-typescript",
        "configure-percy",
        "configure-jest",
        "configure-prettier"
      ]
    }
  ]
};
