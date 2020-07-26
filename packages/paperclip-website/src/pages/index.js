import React, { useState, useEffect, useRef } from "react";
import { createComponentClass } from "paperclip-mini-editor";
import clsx from "clsx";
import Layout from "@theme/Layout";
// import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import usePrismTheme from "@theme/hooks/usePrismTheme";
import MAIN_DEMO_GRAPH from "../demos/main";
import IMPORT_CODE_DEMO_SOURCE from "../demos/import-code";
import PRIMITIVE_UI_EXAMPLE from "../demos/simple-pc";
import CodeBlock from "@theme-init/CodeBlock";
import * as styles from "../styles/index.pc";
import * as buttonStyles from "../styles/button.pc";
import * as typography from "../styles/typography.pc";

// const Editor = createComponentClass({ React, useState, useEffect, useRef });

const DEMO_URL = Object.keys(MAIN_DEMO_GRAPH)[0];

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const prismTheme = usePrismTheme();
  return (
    <Layout
      title={`${siteConfig.title} - build UIs faster`}
      description="A language for building UI faster, safer, and more accurately"
    >
      <styles.Home>
        <styles.Header
          title={
            <>
              Build UIs in <styles.Highlight>realtime</styles.Highlight>,
              directly within <styles.Highlight>VS Code</styles.Highlight>
            </>
          }
          description={
            <>
              Paperclip is a language designed for visual UI development. No
              more wasting time switching between the browser and code.{" "}
              <span className={styles.classNames["_emoji"]}>🙌</span>
            </>
          }
          cta={
            <>
              <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
                href="/docs"
              >
                Get started
              </buttonStyles.Anchor>
            </>
          }
          preview={<img src="img/realtime-editing-2.gif" />}
        />

        <styles.MainFeatures>
          <styles.MainFeatureItem
            iconName="shapes"
            title="Minimalistic UI language"
            description="Paperclip just covers the visuals. No logic -  just HTML, CSS, and primitive components."
            example={
              <CodeBlock className="language-html" style={{ height: 500 }}>
                {PRIMITIVE_UI_EXAMPLE}
              </CodeBlock>
            }
          />
          <styles.MainFeatureItem
            iconName="reactjs"
            title="Import directly into React code"
            description="Paperclip UIs compile to plain code that you can import directly into your app."
            example={
              <CodeBlock className="language-jsx">
                {IMPORT_CODE_DEMO_SOURCE}
              </CodeBlock>
            }
          />
        </styles.MainFeatures>

        <styles.VariousFeatures>
          <styles.VariousFeatureItem
            iconName="chaotic-1"
            title="Scoped styles"
            description="Styles are only applied to the document they're defined in, so you don't have to worry about them leaking."
          />
          <styles.VariousFeatureItem
            iconName="link"
            title="Strongly typed"
            description="Paperclip UIs compile to strongly typed code, so you can feel more confident that UI changes won't break anything."
          />
          <styles.VariousFeatureItem
            iconName="grow"
            title="Incrementally adoptable"
            description="Paperclip compliments your existing codebase - use it as you go."
          />
        </styles.VariousFeatures>
        <styles.BigFeature
          title="Build UIs faster"
          description="The VS Code extension comes with a super fast realtime preview that's powered by Rust, so you can enjoy uninterupted UI development, regardless of your project size. "
          preview={<img src="img/button-demo.gif" />}
        />

        <styles.BigFeature
          title="Never miss a CSS Bug"
          description="Use the visual regression tool to catch every UI state. No more worrying about how changes to CSS affect your app. 🎉"
          preview={<img src="img/snapshot.gif" />}
        />
      </styles.Home>
    </Layout>
  );
}

export default Home;
