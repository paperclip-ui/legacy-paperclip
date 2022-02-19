import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import IMPORT_CODE_DEMO_SOURCE from "../demos/import-code";
import PRIMITIVE_UI_EXAMPLE from "../demos/simple-pc";
import THIRD_PART_CSS_EXAMPLE from "../demos/third-party-css";
// import CodeBlock from "@theme-init/CodeBlock";
import CodeBlock from "../../plugins/theme/CodeBlock";
import * as styles from "../styles/index.pc";
import * as buttonStyles from "../styles/button.pc";
import * as typography from "../styles/typography.pc";
import { TAILWIND_AND_ANIMATE_SOURCE } from "../demos/tailwind-and-animate";
import { TAILWIND_SOURCE } from "../demos/tailwind.css";
import { Redirect } from "react-router-dom";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  // const prismTheme = usePrismTheme();
  return (
    <div className="home">
      <Layout
        className="dograg"
        title={`${siteConfig.title} - Safe, scalable HTML and CSS for any kind of web application`}
        description="Like TypeScript for HTML and CSS, Paperclip provides you with a way to write predictable, scoped CSS, and comes with tools to help track visual changes across your application to prevent bugs from shipping to production."
      >
        <styles.Home>
          <styles.Header
            title={
              <>
                Scoped CSS for everyone
                {/*Paperclip is a UI layer that brings{" "}
                <strong>safe, scalable</strong> HTML & CSS to any kind of web
                application*/}
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
                Writing HTML and CSS for large codebases is hard, especially
                with global styles, slow developer tooling, and lack of
                automation for catching visual regressions. Paperclip is a tiny
                language that focuses purely on these problems, with features to
                help you build maintainable UIs more quickly, and accurately.
              </>
            }
          />

          <styles.VariousFeatures>
            <styles.VariousFeatureItem
              iconName="shapes"
              title="Fast and scalable"
              description={
                <>
                  Paperclip compiles to plain, readable code that also keeps{" "}
                  <strong>CSS scoped</strong>, so you can write CSS however you
                  want knowing that it'll never accidentally leak into other
                  documents.
                </>
              }
            />
            <styles.VariousFeatureItem
              iconName="hammer"
              title="Rich developer tooling"
              description={
                <>
                  Paperclip provides a <strong>realtime preview</strong> to help
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
                  you're using, and currently supports React and static HTML out
                  of the box. You can use Paperclip to compliment your existing
                  codebase to an extra layer of safety.
                </>
              }
            />
          </styles.VariousFeatures>

          <styles.BigFeature
            title="Total control over CSS"
            description={[
              <>
                Paperclip gives you <i>explicit</i> syntax for using CSS that
                gives you complete control over how styles are applied, even by
                third-party modules. With Paperclip, you never have to worry
                about style collisions again.
              </>,
              // <>Paperclip keeps CSS frameworks scoped, so you know exactly how they're used in your application. No more worrying about CSS frameworks accidentally overriding styles. </>

              // "Feel free to use any CSS framework you want. Paperclip keeps them scoped so that you have complete control how they're used throughout "
              // "Paperclip keeps CSS frameworks scoped, so you have complete control over how they're used in your application. No more lock-in."
              // "No more global CSS with. Paperclip gives you complete control over how they're used throughout your application."
              // "Paperclip enhances your third-pary CSS by keeping it scoped, so you have explicit control over how it's used in your app."
            ]}
            ctaText="Learn more"
            ctaHref="/docs/guide-third-party-libraries"
            preview={
              //             <iframe src="https://codesandbox.io/embed/quirky-elion-5te3x?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Fhello-paperclip.pc&theme=dark"
              //    style={{width:"100%", height: "500px", border: 0, borderRadius: "4px", overflow:"hidden"}}
              //    title="quirky-elion-5te3x"
              //    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              //    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              //  ></iframe>
              <CodeBlock
                useLiteEditor={false}
                className="language-html"
                floatingPreview={false}
                height="500px"
              >
                {/* {TAILWIND_AND_ANIMATE_SOURCE} */}
                {THIRD_PART_CSS_EXAMPLE}
              </CodeBlock>
            }
          />

          <styles.BigFeature
            title="Easily catch CSS bugs"
            description={
              <>
                Paperclip comes with tools to help you easily keep track of{" "}
                <i>all</i> visual changes across your application, so you can
                confidently make big CSS changes knowing that you'll be able to
                track just about every visual bug that comes up.
              </>
            }
            ctaText="Learn about visual regression tooling"
            ctaHref="/docs/visual-regression-tooling"
            preview={<img src="img/coverage-report.png" autoPlay loop muted />}
          />

          <styles.BigFeature
            title="UI development in your IDE"
            description={
              <>
                No more waiting for code to compile in order to see how your UI
                looks. Paperclip comes with preview tooling that allows you to
                build your UIs in <strong>realtime</strong>, directly within VS
                Code. Not using VS Code? No worries, you can also launch the
                visual tools using the CLI command.
              </>
            }
            ctaText="Learn about the visual tools"
            ctaHref="/docs/visual-tooling"
            preview={<img src="img/ui-tool-screenshot.png" />}
            // ctaText="View the docs"
            // ctaHref={"https://paperclip.dev/docs/configure-percy"}
          />

          <styles.CTABottom
            title="Easy to set up"
            description={
              <>
                Paperclip currently compiles to <strong>React</strong> and{" "}
                <strong>static HTML</strong>, and works with frameworks such as{" "}
                <strong>NextJS</strong>, and <strong>GatsbyJS</strong>.
              </>
            }
            actions={
              <>
                <styles.CTAInstall label="NPX">
                  npx @paperclip-ui/cli init
                </styles.CTAInstall>
                <styles.CTAInstall label="Yarn">
                  yarn add @paperclip-ui/cli --dev && yarn paperclip init
                </styles.CTAInstall>
              </>
            }
          />

          <styles.Footer />
        </styles.Home>
      </Layout>
    </div>
  );
}

function Home2() {
  return <Redirect to="/docs/installation" />;
}

export default Home2;
