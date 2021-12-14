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
        title={`${siteConfig.title} - Rapidly build web applications at any scale.`}
        description="Rapidly build user interfaces, all within your existing IDE."
      >
        <styles.Home>
          <styles.Header
            // title={<>A hybrid approach to building web applications</>}
            // title={<>Live previews for web development</>}
            // title={<>Build web application in no time.</>}
            // title={<>Realtime visual web development.</>}
            // title={<>Rapidly build web applications at any scale</>}
            // title={<>Build web UIs at the speed of thought.</>}
            title={<>Durable HTML & CSS for any kind of web application.</>}
            description={
              /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
              <>
                Scoped CSS, automatic visual regression coverage, and more.
                Paperclip generic solution for all languages
                {/* Paperclip is a template language for presentational components that comes with a visual editor, all within your existing IDE. */}
                {/* Paperclip is a visual editor for presentational web components, 
                Paperclip is a tiny template language that compiles to designed for realtime visual
                web development, all within your existing IDE. */}
                {/* Paperclip is a free and open source template language for
                presentational components that comes with a designer-like
                experience for rapidly building user interfaces, all within your
                existing IDE. */}
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
              <CodeBlock className="language-html" style={{ height: 500 }}>
                {PRIMITIVE_UI_EXAMPLE}
              </CodeBlock>
              // <video src="vid/paperclip-fast-demo.mp4" autoPlay loop muted />
            }
          />

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="chaotic-1"
              title="Scoped CSS"
              description="Paperclip comes with loads of safety features such as scoped styles, and visual regression testing, to ensure that your HTML & CSS is maintainable as your project grows."
            />
            <styles.VariousFeatureItem
              iconName="link"
              title="Live previews"
              description={[
                "Conveniently build UIs ",
                <i>live</i>,
                " alongside your code editor and see your changes appear immediately as you're typing, no matter how large your project is."
              ]}
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Just like CSS-in-JS"
              description={
                <>
                  {/* <a href="https://playground.paperclip.dev">Try it out!</a>{" "} */}
                  Paperclip works just like other CSS-in-JS libraries such as
                  Emotion, and Styled Components. If you don't like Paperclip,
                  you can easily switch back.
                </>
              }
            />
          </styles.VariousFeatures>

          <styles.BigFeature
            title="Import directly into your app"
            description={[
              "Paperclip files compile down to regular, performant code that you can import directly into your React app."
            ]}
            preview={
              <CodeBlock className="language-jsx">
                {IMPORT_CODE_DEMO_SOURCE}
              </CodeBlock>
            }
          />

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
            title="Live editing"
            description="Paperclip comes with visual regression tooling that takes less than 10 minutes to setup and gives you nearly 100% visual regression coverage, so you can feel confident about making big style changes in your application without breaking production."
            preview={
              <video src="vid/paperclip-fast-demo.mp4" autoPlay loop muted />
            }
            // ctaText="View the docs"
            // ctaHref={"https://paperclip.dev/docs/configure-percy"}
          />
          <styles.BigFeature
            title="Live editing"
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

          <styles.Footer />
        </styles.Home>
      </Layout>
    </div>
  );
}

export default Home;
