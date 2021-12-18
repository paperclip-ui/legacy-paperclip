import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const features = [
  {
    title: <>Just the primitives</>,
    // imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Paperclip just covers basic HTML, CSS, and primitive components that you
        can use in your React code.
      </>
    )
  },
  {
    title: <>Visual programming</>,
    // imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: <>Watch your changes live, directly within VS Code.</>
  },
  {
    title: <>Visual regression testing</>,
    // imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Paperclip allows you to test for visual regressions right out of the
        box. Just run <code>percy-paperclip</code>
      </>
    )
  }
];

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

function BigFeature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className="container">
      <div className="row">
        <div className={clsx("col col--6", styles.feature)}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className={clsx("col col--6", styles.feature)}>
          <img src={imageUrl} />
        </div>
      </div>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}></div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
        {/* <section className={styles.features}>
          <div className="container">
            <div className="row">
              <BigFeature title="Visual programming" description="Watch your changes live, directly within VS Code." imageUrl="img/realtime-editing-2.gif" />
            </div>
          </div>
        </section> */}
      </main>
    </Layout>
  );
}

export default Home;
