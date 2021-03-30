import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
// import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import MAIN_DEMO_GRAPH from "../demos/main";
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
        title={`${siteConfig.title} - A hybrid approach to designing & coding UIs`}
        description="Paperclip is a free & open-source tool that gives you a designer-like experience for creating web interfaces."
      >
        <styles.Home>
          <styles.Header
            // title={<>A hybrid approach to building web applications</>}
            // title={<>Live previews for web development</>}
            // title={<>Build web application in no time.</>}
            // title={<>Realtime visual web development.</>}
            title={<>Rapidly build web applications at any scale</>}
            description={
              /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
              <>
                Paperclip is a free and open source template language for
                presentational components that comes with a designer-like
                experience for creating user interfaces in realtime, all within
                your existing IDE.
                {/* Paperclip is a free and open source tool for presentational components that brings web development closer to a designer-like experience. */}
                {/* Paperclip is a free & open-source tool that gives you a
                designer-like experience for creating web interfaces. */}
                {/* out UIs faster than ever. */}
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
                href="http://github.com/crcn/paperclip"
                secondary
              >
                Check out on GitHub
              </buttonStyles.Anchor> */}
              </>
            }
            preview={
              <video src="vid/paperclip-fast-demo.mp4" autoPlay loop muted />
            }
          />

          <styles.Summary
            title="Build UIs more quickly, and precisely"
            text={
              <>
                You shouldn't be bogged down by developer tooling in order to
                see your UIs. With Paperclip, you see what you're creating{" "}
                <i>as you're typing</i>, no matter how large your project is.
                Other features such as artboards, measuring tools, and
                responsive testing tools are there to help you build
                pixel-perfect UIs in no-time. Your designers will love you. ❤️
                {/* // Paperclip just covers the <i>appearance</i> of your application, and comes with loads of features to help you do that quickly: realtime previews, artboards, measuring tools, responsive testing tools, visual */}
                {/* // regression coverage, and more to help you build pixel-perfect UIs in no-time. Your designers will love you. ❤️ */}
                {/* Paperclip is a template language specifically designed around visual development. This allows for a hybrid approach to building UIs
          that's faster */}
                {/* Nothing sucks more than waiting around for your browser to see CSS changes. With Paperclip there's none of that - just open up the live preview
          window and start typing code. Watch as your changes appear in realtime.  */}
                {/* Paperclip comes with loads of features such as realtime previews that update <i>as you're typing</i>, measuring tools, artboards, responsive tooling, and more that help you build
                pixel perfect UIs in no time. Your designers will love you. ❤️ */}
                {/* Paperclip comes with realtime previews of your UIs that update <i>as you're typing</i>, so you can iterate faster on your HTML & CSS, and ship products
                pixel-perfect UIs in no time. Your designers will love you. ❤️ */}
                {/* UI development is visual, and tooling should reflect that. Paperclip */}
              </>
            }
          />

          <styles.MainFeatures>
            <styles.MainFeatureItem
              iconName="shapes"
              title="Just covers presentational components"
              description={
                <>
                  Paperclip focuses purely on your application's appearance
                  using a syntax similar to HTML & CSS. CSS is also scoped so
                  you don't have to worry about it leaking out.
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
              description="After you quickly crank out all of your HTML & CSS, you can import your Paperclip files like regular code. No runtime needed."
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
              title="HTML & CSS however you want"
              description="Paperclip comes with loads of safety features to make sure that your code stays maintainble, and you can confidently make updates without introducing visual bugs."
            />
            <styles.VariousFeatureItem
              iconName="link"
              title="Live previews in VS Code"
              description={[
                "Conveniently build UIs ",
                <i>live</i>,
                " within VS Code. No more need to switch back and forth between the browser & your code editor."
              ]}
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Just like CSS-in-JS"
              description={
                <>
                  <a href="https://playground.paperclip.dev">Try it out!</a>{" "}
                  Paperclip works just like other CSS-in-JS libraries such as
                  Emotion, and Styled Components. If you don't like Paperclip,
                  you can easily switch back.
                </>
              }
            />
          </styles.VariousFeatures>
          <styles.BigFeature
            title="Pairs well with existing CSS"
            description={[
              "Paperclip enhances your existing CSS by keeping it ",
              <i>scoped</i>,
              ", so you have absolute control over how it's used in your app, and never have to worry about styles leaking out."
            ]}
            preview={
              <CodeBlock className="language-html">
                {THIRD_PART_CSS_EXAMPLE}
              </CodeBlock>
            }
          />
          <styles.BigFeature
            title="Everything in one spot"
            description={[
              "Use the birds-eye view to see ",
              <i>all</i>,
              " of your components, and find exactly what you're looking for."
            ]}
            preview={<video src="vid/grid-demo.mp4" autoPlay loop muted />}
          />
          <styles.BigFeature
            title="Cross-browser testing made easy"
            description={[
              "Launch ",
              <i>any browser</i>,
              " you want directly from Paperclip to catch those elusive CSS bugs more quickly."
            ]}
            preview={
              <video src="vid/cross-browser-testing.mp4" autoPlay loop muted />
            }
          />

          <styles.BigFeature
            title="Easy visual regression test setup"
            description="Paperclip comes with visual regression tooling that takes less than 10 minutes to setup and gives you nearly 100% visual regression coverage, so you can feel confident about making big style changes in your application without breaking production."
            preview={
              <video
                src="vid/visual-regression-testing.mp4"
                autoPlay
                loop
                muted
              />
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
