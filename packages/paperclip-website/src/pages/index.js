import React, { useState, useEffect, useRef } from "react";
import { createComponentClass } from "paperclip-mini-editor";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import usePrismTheme from "@theme/hooks/usePrismTheme";
import dedent from "dedent";
import MAIN_DEMO_GRAPH from "./demos/main";
import IMPORT_CODE_DEMO_SOURCE from "./demos/import-code";
import CodeBlock from "@theme-init/CodeBlock";
import * as styles2 from "./index.pc";

const Editor = createComponentClass({ React, useState, useEffect, useRef });

const features = [
  {
    title: <>Just the visuals</>,
    // imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Paperclip compliments your existing codebase by covering basic,
        re-usable components.
      </>
    )
  },
  {
    title: <>Scoped styles</>,
    // imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Styles are only applied to the document they're defined in, so you can
        worry less about leaky CSS rules.
      </>
    )
  },
  {
    title: <>Strongly typed</>,
    // imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Paperclip UIs compile to strongly typed code, so you never have to deal
        with missing props.
      </>
    )
  }
];

const DEMO_URL = Object.keys(MAIN_DEMO_GRAPH)[0];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const prismTheme = usePrismTheme();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <styles2.Header></styles2.Header>
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("docs/")}
            >
              Get Started
            </Link>
          </div>
          <div className={clsx(styles.heroDemo, "row")}>
            <div className="col col--12">
              <Editor
                graph={MAIN_DEMO_GRAPH}
                responsive={false}
                defaultUri={DEMO_URL}
                theme={prismTheme}
              />
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <BigFeature
                title="Build UIs faster"
                description={
                  <>
                    You should be able to <i>see</i> what you're building in
                    realtime, and that's what Paperclip provides - tooling to
                    build your UIs <i>visually</i>. No more need to jump back
                    and forth between the browser and code.
                  </>
                }
                preview={
                  <img
                    className={styles.preview}
                    src="img/realtime-editing-2.gif"
                  />
                }
              />
            </div>
          </div>
        </section>
        <section className={styles.features}>
          <div className="container">
            <div className={clsx("col col--12", styles.nuggets)}>
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <BigFeature
                title="Import directly into your React app"
                preview={
                  <CodeBlock className="language-jsx">
                    {IMPORT_CODE_DEMO_SOURCE}
                  </CodeBlock>
                }
              />
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <BigFeature
                title="Never miss a CSS bug"
                description="Watch your changes live, directly within VS Code."
                preview={<img src="img/realtime-editing-2.gif" />}
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
