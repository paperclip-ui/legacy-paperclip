import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
// import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import usePrismTheme from "@theme/hooks/usePrismTheme";
import MAIN_DEMO_GRAPH from "../demos/main";
import IMPORT_CODE_DEMO_SOURCE from "../demos/import-code";
import PRIMITIVE_UI_EXAMPLE from "../demos/simple-pc";
import THIRD_PART_CSS_EXAMPLE from "../demos/third-party-css";
import CodeBlock from "@theme-init/CodeBlock";
import * as styles from "../styles/index.pc";
import * as buttonStyles from "../styles/button.pc";
import * as typography from "../styles/typography.pc";

// const Editor = createComponentClass({ React, useState, useEffect, useRef });

const DEMO_URL = Object.keys(MAIN_DEMO_GRAPH)[0];

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  // const prismTheme = usePrismTheme();
  return (
    <div className="home">
      <Layout
        noFooter
        className="dograg"
        title={`${siteConfig.title} - build React apps live in VS Code`}
        description="Paperclip is a language for UI primitives that helps you build web apps more quickly."
      >
        <styles.Home>
          <styles.Header
            // title={<>A hybrid approach to building web applications</>}
            // title={<>Live previews for web development</>}
            // title={<>Build web application in no time.</>}
            title={<>Realtime visual web development.</>}
            description={
              /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
              <>
                <i>See</i> & design what you're coding in realtime. Paperclip is an open-source tool to help you build UIs faster than ever.
                {/* Paperclip is a fast & intuitive open-source UI tool that works with your existing codebase. */}
                {/* Build your web interfaces directly within your code editor.   */}
                {/* Paperclip is a template language designed to help you build UIs more quickly & safely. */}
                {/* See what you're building, as you're typing code.  */}
                {/* Paperclip is a template language that's optimized for visual development, so you can build UIs in record time. */}
                {/* Design & code at the same time. Paperclip is a template language that comes with visual tooling. */}
                {/* Realtime previews, visual regression testing, and more. Paperclip is a template language that comes with tooling to help you build UIs more quickly & safely.  */}
              </>

              // <>
              //   Paperclip is a simple language for building user interfaces.
              // </>
              // <>
              //   With tooling such as{" "}
              //   <styles.Highlight>realtime previews</styles.Highlight> &{" "}
              //   <styles.Highlight>
              //     automatic visual regresion tests
              //   </styles.Highlight>
              //   , you can build UIs in no time using the language you already
              //   know.
              // </>
              // <>
              //   Paperclip is a language for building user interfaces. With
              //   features such as{" "}
              //   <styles.Highlight>realtime previews</styles.Highlight>, and{" "}
              //   <styles.Highlight>tools for catching CSS bugs</styles.Highlight>,
              //   you'll be creating pixel-perfect web applications in no time.
              // </>
              // <>
              //   Paperclip comes with realtime visual editing within VS Code, visual regression tools, scoped styling. Paperclipn
              // </>
              // <>
              //   <styles.Highlight>Realtime previews</styles.Highlight>, <styles.Highlight>visual regression testing</styles.Highlight>, and more. Paperclip is a better way to build web applications in record time.
              // </>
              // <>
              //   Paperclip is a language designed for visual UI development. No
              //   more wasting time juggling between the browser and code.{" "}
              //   <span className={styles.classNames["_emoji"]}>🙌</span>
              // </>
            }
            cta={
              <>
                <buttonStyles.Anchor
                  className={typography.classNames["semi-bold"]}
                  href="https://forms.gle/FATDYcAVUdRVJvQaA"
                  strong
                >
                  Sign up for early access
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
                href="http://github.com/crcn/paperclip"
                secondary
              >
                Check out on GitHub
              </buttonStyles.Anchor> */}
              </>
            }
            preview={<video src="vid/paperclip-fast-demo.mp4" autoPlay loop />}
          />

          <styles.Summary
            title="Iterate faster"
            text={
              <>
                {/* Paperclip is a template language specifically designed around visual development. This allows for a hybrid approach to building UIs
          that's faster */}
                {/* Nothing sucks more than waiting around for your browser to see CSS changes. With Paperclip there's none of that - just open up the live preview
          window and start typing code. Watch as your changes appear in realtime.  */}
                No more waiting for the browser to reload when you make changes. Paperclip comes with a realtime preview that updates <i>as you're typing</i>, so you can iterate faster on your HTML & CSS, and ship products
                pixel-perfect UIs faster than ever.
                {/* UI development is visual, and tooling should reflect that. Paperclip */}
              </>
            }
          />

          <styles.MainFeatures>
            <styles.MainFeatureItem
              iconName="shapes"
              title="Designed for presentational components"
              description={
                <>
                  Paperclip's syntax is designed for just the <i>appearance</i> of your application: HTML, CSS, and logic-less components.
                </>
              }
              example={
                <CodeBlock className="language-html" style={{ height: 500 }}>
                  {PRIMITIVE_UI_EXAMPLE}
                </CodeBlock>
              }
            />
            <styles.MainFeatureItem
              iconName="reactjs"
              title="Import directly into your React app"
              description="Templates compile into strongly typed code that you can import directly in your existing application."
              example={
                <CodeBlock className="language-jsx">
                  {IMPORT_CODE_DEMO_SOURCE}
                </CodeBlock>
              }
            />
          </styles.MainFeatures>

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="grow"
              title="Just like CSS-in-JS"
              description="Try it out! Paperclip works just like other CSS-in-JS libraries such as Emotion, and Styled Components. If you don't like Paperclip, you can easily switch back."
            />
            <styles.VariousFeatureItem
              iconName="chaotic-1"
              title="Scoped CSS"
              description="Paperclip keeps your styles manageable by scoping them to the documents they're defined in. Never worry about leaky CSS again."
            />
            <styles.VariousFeatureItem
              iconName="link"
              title="Live VS Code extension"
              description={["Conveniently build UIs ", <i>live</i>, " within VS Code. No more need to switch back and forth between the browser."]}
            />
          </styles.VariousFeatures>
          <styles.BigFeature
          title="Pairs well with existing CSS"
          description={["Paperclip enhances the existing CSS framework you're using by keeping it ", <i>scoped</i>, ", so you have absolute control over how it's used in your app, and never have to worry about it leaking out."]}
          preview={<CodeBlock className="language-html">
          {THIRD_PART_CSS_EXAMPLE}
        </CodeBlock>}
        />
          <styles.BigFeature
            title="Everything in one spot"
            description={["Use the birds-eye view to see ", <i>all</i>, " of your components, and find exactly what you're looking for."]}
            preview={<video src="vid/grid-demo.mp4" autoPlay loop />}
          />
          <styles.BigFeature
            title="Cross-browser testing made easy"
            description={["Launch ", <i>any browser</i>, " directly from Paperclip. Cross-browser UI testing has never been easier."]}
            preview={
              <video src="vid/cross-browser-testing.mp4" autoPlay loop />
            }
          />

          <styles.BigFeature
            title="Easy visual regression test setup"
            description="Paperclip comes with visual regression tooling that takes less than 10 minutes to setup and gives you nearly 100% visual regression coverage, so you can feel confident about making big style changes in your application, and without breaking production."
            preview={
              <video src="vid/visual-regression-testing.mp4" autoPlay loop />
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
