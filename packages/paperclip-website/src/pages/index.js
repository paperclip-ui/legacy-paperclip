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
  const prismTheme = usePrismTheme();
  return (
    <Layout
      title={`${siteConfig.title} - build React apps live in VS Code`}
      description="Paperclip is a language for UI primitives that helps you build web apps more quickly."
    >
      <styles.Home>
        <styles.Header
          // title={<>A hybrid approach to building web applications</>}
          // title={<>Live previews for web development</>}
          title={<>Build web application in no time.</>}
          description={
            /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
            <>
              Paperclip is a template language that comes with visual tooling to
              help you build UIs faster, bug-free, and more precicely.
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
                Get started
              </buttonStyles.Anchor>
              <buttonStyles.Anchor
                className={typography.classNames["semi-bold"]}
                href="http://github.com/crcn/paperclip"
                secondary
              >
                Check out on GitHub
              </buttonStyles.Anchor>
            </>
          }
          preview={<video src="vid/paperclip-fast-demo.mp4" autoPlay loop />}
        />

        <styles.Summary
          title=""
          text={
            <>
              {/* Paperclip is a template language specifically designed around visual development. This allows for a hybrid approach to building UIs
          that's faster */}
              {/* Nothing sucks more than waiting around for your browser to see CSS changes. With Paperclip there's none of that - just open up the live preview
          window and start typing code. Watch as your changes appear in realtime.  */}
              Web development is slow & CSS tends to become unmanageable over
              time, especially as projects & teams become larger. Paperclip
              helps with that by providing you with tooling to manage visual
              changes, keep CSS scoped, and a visual editor for creating UIs in
              realtime.
              {/* UI development is visual, and tooling should reflect that. Paperclip */}
            </>
          }
        />

        <styles.MainFeatures>
          <styles.MainFeatureItem
            iconName="shapes"
            title="Simple syntax"
            description={
              <>
                Paperclip uses familiar syntax, so there the learning curve is
                small. Use the <a href="/docs/">visual tooling</a>&nbsp; to see
                your visual changes live.
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
            title="Import directly into React code"
            description="Templates compile into plan code that you can import directly in your React app. No runtimes needed."
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
            title="No global CSS"
            description="Styles are scoped to the documents they're defined in, so you don't have to worry about them leaking out."
          />
          <styles.VariousFeatureItem
            iconName="link"
            title="Live previews in VS Code"
            description="Paperclip comes with a live preview extension in VS Code, so you never have to leave your editor to see your HTML & CSS."
          />
          <styles.VariousFeatureItem
            iconName="grow"
            title="Safer the more you use it"
            description="Every Paperclip file is automatically covered by visual regression tests, so the more you use Paperclip, the more test coverage you'll have against CSS bugs. "
          />
        </styles.VariousFeatures>
        {/* <styles.BigFeature
          title="Pairs well with existing CSS"
          description="Just import your regular CSS to keep it scoped."
          preview={<CodeBlock className="language-html">
          {THIRD_PART_CSS_EXAMPLE}
        </CodeBlock>}
        /> */}
        <styles.BigFeature
          title="See all of your UIs in one spot"
          description="No more digging around for UI elements. Open the birds-eye view to see all of your application UIs, and easily find what you're looking for."
          preview={<video src="vid/grid-demo.mp4" autoPlay loop />}
        />
        <styles.BigFeature
          title="Cross-browser testing made easy"
          description="Launch any browser directly within Paperclip and design against them in realtime."
          preview={<video src="vid/cross-browser-testing.mp4" autoPlay loop />}
        />

        <styles.BigFeature
          title="Never miss a CSS Bug"
          description="Every single Paperclip UI is covered with visual regression tests - hardly any setup required. Just setup the Percy integration and you're good to go."
          preview={
            <video src="vid/visual-regression-testing.mp4" autoPlay loop />
          }
          ctaText="View the docs"
          ctaHref={"https://paperclip.dev/docs/configure-percy"}
        />
      </styles.Home>
    </Layout>
  );
}

export default Home;
