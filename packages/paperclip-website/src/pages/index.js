import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
// import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import IMPORT_CODE_DEMO_SOURCE from "../demos/import-code";
import PRIMITIVE_UI_EXAMPLE from "../demos/simple-pc";
import THIRD_PART_CSS_EXAMPLE from "../demos/third-party-css";
import CodeBlock from "@theme-init/CodeBlock";
import * as styles from "../styles/index.pc";
import * as buttonStyles from "../styles/button.pc";
import * as typography from "../styles/typography.pc";

// const Editor = createComponentClass({ React, useState, useEffect, useRef });

// const DEMO_URL = Object.keys(MAIN_DEMO_GRAPH)[0];

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  // const prismTheme = usePrismTheme();
  return (
    <div className="home">
      <Layout
        className="dograg"
        title={`${siteConfig.title} - Scoped HTML & CSS for any kind of web application.`}
        description="Paperclip offers a way to write CSS that is scoped to the document that it's defined in, so you never have to worry about styles leaking again."
      >
        <styles.Home>
          <styles.Header
            title={
              <>
                Paperclip is a tiny language that brings{" "}
                <strong>scoped CSS to any kind of web application.</strong>
              </>
            }
            cta={
              <>
                <buttonStyles.Anchor
                  className={typography.classNames["semi-bold"]}
                  href="/docs"
                  strong
                >
                  Get Started
                </buttonStyles.Anchor>
                {/* <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
                href="/docs"
                strong
              >
                Get started
              </buttonStyles.Anchor>
              <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
                href="http://github.com/paperclipui/paperclip"
                secondary
              >
                Check out on GitHub
              </buttonStyles.Anchor> */}
              </>
            }
            preview={
              <styles.HeaderExamples
                left={
                  <CodeBlock className="language-html">
                    {PRIMITIVE_UI_EXAMPLE}
                  </CodeBlock>
                }
                right={
                  <CodeBlock className="language-jsx">
                    {IMPORT_CODE_DEMO_SOURCE}
                  </CodeBlock>
                }
              ></styles.HeaderExamples>
            }
          />

          <styles.Summary
            title="Keep your HTML & CSS clean"
            text="Maintaining HTML & CSS is hard, especially with global CSS. Paperclip offers a way to write CSS that is scoped to the document that it's defined in, so you never have to worry about accidentally styling elements again."
          />

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="shapes"
              title="Just the UI"
              description="Paperclip just covers the appearance of your application, and exposes presentational components that you can throughout your application."
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Incrementally adoptable"
              description={
                <>
                  Presentational components can be used in your existing
                  codebase, and they're helpful in wrangling any current CSS
                  that you have.
                </>
              }
            />
            <styles.VariousFeatureItem
              iconName="hammer"
              title="Productivity tools"
              description="Paperclip comes with tools such as a visual editor, linter, and visual regression tool to help you write clean HTML & CSS, and keep it that way."
            />
          </styles.VariousFeatures>

          <styles.BigFeature
            title="Compiles to plain code"
            noShadow
            smallerPreview
            description={[
              "Paperclip is designed to be compiled into whatever language you're using, and currently supports React out of the box. You can even build a compiler that fits your specific needs."
            ]}
            ctaText="Learn about compilers"
            ctaHref="/docs/guide-compilers"
            preview={<img src="img/compile-to-many-2.png" />}
          />

          <styles.BigFeature
            title="Pairs well with third-party CSS"
            description={[
              "Paperclip enhances your third-pary CSS by keeping it scoped, so you have explicit control over how it's used in your app."
            ]}
            ctaText="Learn how to use third-party CSS"
            ctaHref="/docs/guide-third-party-libraries"
            preview={
              <CodeBlock className="language-html">
                {THIRD_PART_CSS_EXAMPLE}
              </CodeBlock>
            }
          />

          <styles.BigFeature
            title="Better coverage for UI bugs"
            description={
              <>
                Paperclip files are automatically covered for visual
                regressions. Just set up the Percy integration and you're good
                to go.
              </>
            }
            ctaText="Learn how to set up Percy"
            ctaHref="/docs/configure-percy"
            preview={
              <video
                src="vid/visual-regression-testing.mp4"
                autoPlay
                loop
                muted
              />
            }
          />
          <styles.BigFeature
            title="Build UIs more quickly"
            description="Paperclip's visual editor allows you to build your primitive components in realtime, and also comes with tools to help you build UIs more accurately."
            ctaText="Learn about the visual tools"
            ctaHref="/docs/visual-tooling"
            preview={
              <video src="vid/paperclip-fast-demo.mp4" autoPlay loop muted />
            }
            // ctaText="View the docs"
            // ctaHref={"https://paperclip.dev/docs/configure-percy"}
          />

          <styles.Footer />
        </styles.Home>
      </Layout>
    </div>
  );
}

export default Home;
