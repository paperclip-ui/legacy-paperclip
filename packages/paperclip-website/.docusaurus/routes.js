import React from "react";
import ComponentCreator from "@docusaurus/ComponentCreator";

export default [
  {
    path: "/",
    component: ComponentCreator("/"),
    exact: true
  },
  {
    path: "/__docusaurus/debug",
    component: ComponentCreator("/__docusaurus/debug"),
    exact: true
  },
  {
    path: "/blog",
    component: ComponentCreator("/blog"),
    exact: true
  },
  {
    path: "/blog/hello-world",
    component: ComponentCreator("/blog/hello-world"),
    exact: true
  },
  {
    path: "/blog/hola",
    component: ComponentCreator("/blog/hola"),
    exact: true
  },
  {
    path: "/blog/tags",
    component: ComponentCreator("/blog/tags"),
    exact: true
  },
  {
    path: "/blog/tags/docusaurus",
    component: ComponentCreator("/blog/tags/docusaurus"),
    exact: true
  },
  {
    path: "/blog/tags/facebook",
    component: ComponentCreator("/blog/tags/facebook"),
    exact: true
  },
  {
    path: "/blog/tags/hello",
    component: ComponentCreator("/blog/tags/hello"),
    exact: true
  },
  {
    path: "/blog/tags/hola",
    component: ComponentCreator("/blog/tags/hola"),
    exact: true
  },
  {
    path: "/blog/welcome",
    component: ComponentCreator("/blog/welcome"),
    exact: true
  },
  {
    path: "/docs",
    component: ComponentCreator("/docs"),

    routes: [
      {
        path: "/docs/",
        component: ComponentCreator("/docs/"),
        exact: true
      },
      {
        path: "/docs/configuring-paperclip",
        component: ComponentCreator("/docs/configuring-paperclip"),
        exact: true
      },
      {
        path: "/docs/configuring-webpack",
        component: ComponentCreator("/docs/configuring-webpack"),
        exact: true
      },
      {
        path: "/docs/doc1",
        component: ComponentCreator("/docs/doc1"),
        exact: true
      },
      {
        path: "/docs/doc2",
        component: ComponentCreator("/docs/doc2"),
        exact: true
      },
      {
        path: "/docs/doc3",
        component: ComponentCreator("/docs/doc3"),
        exact: true
      },
      {
        path: "/docs/getting-started-vscode",
        component: ComponentCreator("/docs/getting-started-vscode"),
        exact: true
      },
      {
        path: "/docs/mdx",
        component: ComponentCreator("/docs/mdx"),
        exact: true
      },
      {
        path: "/docs/safety-typescript",
        component: ComponentCreator("/docs/safety-typescript"),
        exact: true
      },
      {
        path: "/docs/safety-visual-regression",
        component: ComponentCreator("/docs/safety-visual-regression"),
        exact: true
      },
      {
        path: "/docs/usage-cli",
        component: ComponentCreator("/docs/usage-cli"),
        exact: true
      },
      {
        path: "/docs/usage-react",
        component: ComponentCreator("/docs/usage-react"),
        exact: true
      },
      {
        path: "/docs/usage-syntax",
        component: ComponentCreator("/docs/usage-syntax"),
        exact: true
      },
      {
        path: "/docs/usage-troubleshooting",
        component: ComponentCreator("/docs/usage-troubleshooting"),
        exact: true
      }
    ]
  },

  {
    path: "*",
    component: ComponentCreator("*")
  }
];
