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
import * as buttonStyles from "./button.pc";
import * as typography from "./styles/typography.pc";

const Editor = createComponentClass({ React, useState, useEffect, useRef });

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
      <styles2.Home>
        <styles2.Header
          title={
            <>
              Build UIs in <styles2.Highlight>realtime</styles2.Highlight>,
              directly within <styles2.Highlight>VS Code</styles2.Highlight>
            </>
          }
          description={
            <>
              Paperclip is a language designed for visual UI development. No
              more switching between the browser and code.{" "}
              <span className="_emoji">🙌</span>
            </>
          }
          cta={
            <>
              <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
              >
                Get started
              </buttonStyles.Anchor>
            </>
          }
          preview={<img src="img/realtime-editing-2.gif" />}
        />

        <styles2.MainFeatures>
          <styles2.MainFeatureItem
            iconName="shapes"
            title="Just the basics"
            description="Paperclip just covers the visuals. No logic -  just HTML, CSS, and basic component "
          />
          <styles2.MainFeatureItem
            iconName="plug"
            title="Import directly into React code"
            description="Paperclip documents compile to plain code that you can import directly into your code"
          />
        </styles2.MainFeatures>

        <styles2.VariousFeatures>
          <styles2.VariousFeatureItem
            iconName="chaotic-1"
            title="Scoped styles"
            description="Styles are only applied to the document they're in, so no more leaky CSS"
          />
          <styles2.VariousFeatureItem
            iconName="link"
            title="Strongly typed"
            description="compile to strongly typed code, so worry less about breaking changes"
          />
          <styles2.VariousFeatureItem
            iconName="grow"
            title="Incrementally adoptable"
            description="Paperclip compliments your existing codebase, so use it as you go"
          />
        </styles2.VariousFeatures>
        <styles2.BigFeature
          title="IDE integration"
          description="Realtime previews, intellisense, and other tools make up the VS Code extension to help you build UIs faster"
          preview={<img src="img/realtime-editing-2.gif" />}
        />

        <styles2.BigFeature
          title="Never miss a CSS Bug"
          description="Use the visual regression tool to catch every visual state of your UI. No more broken window CSS. 🎉"
          preview={<img src="img/realtime-editing-2.gif" />}
        />
      </styles2.Home>
    </Layout>
  );
}

export default Home;
