import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import IMPORT_CODE_DEMO_SOURCE from "../demos/import-code";
import PRIMITIVE_UI_EXAMPLE from "../demos/simple-pc";
import THIRD_PART_CSS_EXAMPLE from "../demos/third-party-css";
import CodeBlock from "@theme-init/CodeBlock";
import * as styles from "../styles/index.pc";
import * as buttonStyles from "../styles/button.pc";
import * as typography from "../styles/typography.pc";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  // const prismTheme = usePrismTheme();
  return (
    <div className="home">
      <Layout
        className="dograg"
        title={`${siteConfig.title} - Scalable HTML & CSS for any kind of web application.`}
        description="Paperclip offers a way to write CSS that is scoped to the document that it's defined in, so you never have to worry about styles leaking again."
      >
        <styles.Home>
          <styles.Header
            title={
              <>
                Paperclip is a UI layer that brings <strong>scalable</strong>{" "}
                HTML & CSS to any kind of web application
                {/* Paperclip is a fast, scalable UI layer that brings <strong>scoped CSS</strong> to any kind of web application. */}
              </>
            }
            cta={
              <>
                <buttonStyles.Anchor
                  className={typography.classNames["semi-bold"]}
                  href="/docs/installation"
                  strong
                >
                  Get Started
                </buttonStyles.Anchor>
                {/* <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
                href="/docs/installation"
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
            // title="No more leaky styles"
            // text="Paperclip is a UI layer without the frills. No logic, just pure focus the appearance of your application, with tools to help you write that stuff more quickly, and precisely. Your designers will love you. ❤️"
            // text="Paperclip is a UI layer that help you focus on just the HTML & CSS for your application, with tools to help you do that more quickly, and accurately. Your designers will love you. ❤️"
            text={
              <>
                Writing scalable HTML and CSS is hard, especially with global
                styles, slow developer tooling, and lack of automation for
                catching visual regressions. Paperclip focuses purely on these
                problems, with features to help you build scalable UIs more
                quickly, and accurately.
              </>
            }
          />

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="shapes"
              title="Fast and scalable"
              description="Paperclip just covers the appearance of your application, and exposes presentational components that you can throughout your application."
            />
            <styles.VariousFeatureItem
              iconName="hammer"
              title="Rich developer tooling"
              description="Paperclip comes with tools such as a visual editor, linter, and visual regression tool to help you write clean HTML & CSS, and keep it that way."
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Compliments your existing codebase"
              description={
                <>
                  Paperclip can be used in whatever kind of codebase you want,
                  and helps you start writing
                </>
              }
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
