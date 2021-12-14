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
            title={
              <>
                Paperclip is a{" "}
                <strong>
                  tiny language that brings scoped CSS to any kind of web
                  application.
                </strong>
              </>
            }
            description={
              /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
              <>
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

          {/* <styles.Summary title="Keep your HTML & CSS maintainable" text="Writing maintinable HTML & CSS is hard, especially with global CSS. Paperclip is a tiny language that focuses purely on the visual aspect of your application, and provides features to help you keep " /> */}

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="link"
              title="Incrementally adoptable"
              description={
                <>
                  Paperclip files are compiled to plain code, and can be
                  incrementally adoptable in your existing codebase.
                </>
              }
            />
            <styles.VariousFeatureItem
              iconName="chaotic-1"
              title="Scoped CSS"
              description="No more leaky CSS. Paperclip only applies CSS to the documents where it's defined."
            />
            <styles.VariousFeatureItem
              iconName="grow"
              title="Just the UI"
              description="Paperclip only covers primitive components, and uses basic HTML & SASS syntax."
            />
          </styles.VariousFeatures>

          <styles.BigFeature
            title="Spot UI bugs more easily"
            description={
              <>
                Paperclip files are automatically covered for bugs, so you can
                ship UI changes more confidently.
              </>
            }
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
            title="Pairs well with existing CSS"
            description={[
              "Paperclip enhances your existing CSS by keeping it ",
              <i>scoped</i>,
              ", so you have control over how it's used in your app."
            ]}
            preview={
              <CodeBlock className="language-html">
                {THIRD_PART_CSS_EXAMPLE}
              </CodeBlock>
            }
          />

          <styles.BigFeature
            title="Live editing"
            description="Visual tooling allows you see what you're creating as you're typing. Features such as artboards, measuring tools, and responsive testing tools help you build pixel-perfect UIs in no-time."
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
