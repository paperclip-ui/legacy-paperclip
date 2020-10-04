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
      title={`${siteConfig.title} - build React apps live in VS Code`}
      description="Paperclip is a language for UI primitives that helps you build web apps more quickly."
    >
      <styles.Home>
        <styles.Header
          title={<>Spend less time tweaking CSS.</>}
          description={
            /* 

            Thoughts floating around in my head:

            - no more broken window CSS - feeling confident that CSS changes won't break
            - A kind-of type system for CSS changes
            - More natural than the current way of building UIs
            */
            <>
              Paperclip is a language for UI primitives that allows you to build
              React applications more quickly, and with fewer CSS bugs.
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
          preview={<img src="img/screenshot-6.png" />}
        />

        <styles.MainFeatures>
          <styles.MainFeatureItem
            iconName="shapes"
            title="Use familiar syntax"
            description={
              <>
                Paperclip uses familiar syntax for creating UI primitives. See
                your changes <strong>in realtime</strong> using the{" "}
                <a href="/docs/">VS Code extension</a>.
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
            description="Paperclip compiles the UIs into plan code that you can import directly in your React app. No runtimes needed."
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
            title="Isolated styles"
            description="Styles are only applied to the documents they're defined in, so you don't have to worry about them leaking out."
          />
          <styles.VariousFeatureItem
            iconName="link"
            title="TypeScript integration"
            description="Paperclip UIs compile to strongly typed code, so you can feel more confident that UI changes won't break anything."
          />
          <styles.VariousFeatureItem
            iconName="grow"
            title="Pays back the more you use it"
            description="Every Paperclip file is automatically covered by visual regression tests, so the more you use Paperclip, the more test coverage you'll have against CSS bugs. "
          />
          {/* <styles.VariousFeatureItem
            iconName="grow"
            title="Incrementally adoptable"
            description="Paperclip compliments your existing codebase - use it as you go."
          /> */}
        </styles.VariousFeatures>
        <styles.BigFeature
          title="Realtime previews in VS Code"
          description="The VS Code extension comes with realtime previews, so you can iterate faster on your UIs, and free up more time to work on other parts of your codebase that matter."
          preview={<img src="img/button-demo.gif" />}
          ctaText="View the extension"
          ctaHref={"https://paperclip.dev/docs"}
        />

        <styles.BigFeature
          title="Never miss a CSS Bug"
          description="Use the visual regression tool to catch every UI state. No more worrying about breaking CSS changes. 🎉"
          preview={<img src="img/snapshot.gif" />}
          ctaText="View the API"
          ctaHref={"https://paperclip.dev/docs/configure-percy"}
        />
      </styles.Home>
    </Layout>
  );
}

export default Home;
