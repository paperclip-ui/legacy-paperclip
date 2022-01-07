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
                catching visual regressions. Paperclip is a tiny language that
                focuses purely on these problems, with features to help you
                build scalable UIs more quickly, and accurately. Your users will
                love you. ❤️
              </>
            }
          />

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="shapes"
              title="Fast and scalable"
              description={
                <>
                  Paperclip compiles to plain, readable code, that also keeps{" "}
                  <strong>CSS scoped</strong>, you can write maintainable CSS
                  that never leaks again.{" "}
                </>
              }
            />
            <styles.VariousFeatureItem
              iconName="hammer"
              title="Rich developer tooling"
              description={
                <>
                  Paperclip comes with a <strong>visual editor</strong> to help
                  you build UIs quickly, and{" "}
                  <strong>visual regression tooling</strong> to help you catch
                  every visual change before shipping to production.{" "}
                </>
              }
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Compiles to any language"
              description={
                <>
                  Paperclip is designed to be compiled into whatever language
                  you're using, and currently supports React and vanilla HTML
                  out of the box. You can even use Paperclip to{" "}
                  <strong>compliment your existing codebase</strong>.
                </>
              }
            />
          </styles.VariousFeatures>

          <styles.BigFeature
            title="Catch most CSS bugs"
            description={
              <>
                Paperclip UIs are <strong>automatically</strong> covered for
                visual regressions, so you can confidently make big changes
                knowing that you'll be aware how those change affect every other
                part of your application across different browsers and screen
                sizes.
              </>
            }
            ctaText="Learn about visual regression tooling"
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
            title="Total control over CSS frameworks"
            description={[
              "No more worrying about CSS frameworks accidentally overriding styles. Paperclip keeps CSS frameworks scoped, so you know exactly how they're used in your application. "
              // "Feel free to use any CSS framework you want. Paperclip keeps them scoped so that you have complete control how they're used throughout "
              // "Paperclip keeps CSS frameworks scoped, so you have complete control over how they're used in your application. No more lock-in."
              // "No more global CSS with. Paperclip gives you complete control over how they're used throughout your application."
              // "Paperclip enhances your third-pary CSS by keeping it scoped, so you have explicit control over how it's used in your app."
            ]}
            ctaText="Learn more"
            ctaHref="/docs/guide-third-party-libraries"
            preview={
              <CodeBlock className="language-html">
                {THIRD_PART_CSS_EXAMPLE}
              </CodeBlock>
            }
          />

          <styles.BigFeature
            title="UI development in your IDE"
            description={
              <>
                No more waiting for code to compile in order to see how your UI
                looks. Paperclip comes with a visual editor that allows you to
                build your UIs in <strong>realtime</strong>, directly within VS
                Code. Not using VS Code? No worries, you launch the visual
                editor using the CLI command.
              </>
            }
            ctaText="Learn about the visual tools"
            ctaHref="/docs/visual-tooling"
            preview={
              <video src="vid/paperclip-fast-demo.mp4" autoPlay loop muted />
            }
            // ctaText="View the docs"
            // ctaHref={"https://paperclip.dev/docs/configure-percy"}
          />

          <styles.BigFeature
            title="Down to try it out?"
            description="Installation is an easy process. "
            ctaText="Get started"
            ctaHref="/docs/installation"
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
