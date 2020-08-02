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
      title={`${siteConfig.title} - build web applications in record time`}
      description="Import HTML & CSS building blocks directly into your web application."
    >
      <styles.Home>
        <styles.Header
          title={
            <>
              Use plain HTML & CSS to build web applications{" "}
              <styles.Highlight>record time.</styles.Highlight>
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
              Paperclip allows you to import HTML & CSS directly into code, and
              comes with tooling such as{" "}
              <styles.Highlight>realtime previews</styles.Highlight> &{" "}
              <styles.Highlight>
                automatic visual regression tests
              </styles.Highlight>{" "}
              to help you build UIs in no time.
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
          preview={<img src="img/realtime-editing-2.gif" />}
        />

        <styles.MainFeatures>
          <styles.MainFeatureItem
            iconName="shapes"
            title="Write plain HTML & CSS"
            description="Use plain 'ol HTML & CSS to define your application's UI building blocks."
            example={
              <CodeBlock className="language-html" style={{ height: 500 }}>
                {PRIMITIVE_UI_EXAMPLE}
              </CodeBlock>
            }
          />
          <styles.MainFeatureItem
            iconName="reactjs"
            title="Import directly into React code"
            description="Paperclip compiles your HTML & CSS that you can then import directly into code."
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
            description="Styles are only applied to the documents they're defined in, so you don't have to worry about them leaking out."
          />
          <styles.VariousFeatureItem
            iconName="link"
            title="Strongly typed"
            description="Paperclip UIs compile to strongly typed code, so you can feel more confident that UI changes won't break anything."
          />
          <styles.VariousFeatureItem
            iconName="grow"
            title="Pays back the more you use it"
            description="Every Paperclip file is covered with visual regression tests, so the more you use Paperclip, the more test coverage you'll have against CSS bugs. "
          />
          {/* <styles.VariousFeatureItem
            iconName="grow"
            title="Incrementally adoptable"
            description="Paperclip compliments your existing codebase - use it as you go."
          /> */}
        </styles.VariousFeatures>
        <styles.BigFeature
          title="Realtime previews in VS Code"
          description="The VS Code extension comes with a super fast realtime preview that's powered by Rust, so you can enjoy uninterupted UI development, regardless of your project size. "
          preview={<img src="img/button-demo.gif" />}
          ctaText="View the extension"
          ctaHref={"https://paperclip.dev/docs/getting-started-vscode"}
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
