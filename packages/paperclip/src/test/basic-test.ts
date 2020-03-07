import * as path from "path";
import { Engine } from "../engine";
import { expect } from "chai";
import { EngineEventKind, EvaluatedEvent } from "../events";
import { stringifyVirtualNode } from "../stringify-virt-node";
import { createMockEngine, Graph } from "./utils";


describe(__filename + "#", () => {

  const waitForEvaluated = async (engine: Engine): Promise<EvaluatedEvent> => {
    return new Promise((resolve, reject) => {
      engine.onEvent(event => {
        if (event.kind === EngineEventKind.Error) {
          return reject(event);
        }

        if (event.kind === EngineEventKind.Evaluated) {
          resolve(event);
        }
      });
    });
  };

  [
    // basic parsing
    [
      {
        "/entry.pc": `Hello World`
      },
      {},
      `Hello World`
    ],
    [
      {
        "/entry.pc": `<span>more text</span>`
      },
      {},
      `<span data-pc-80f4925f><style></style>more text</span>`
    ],

    // styles
    [
      {
        "/entry.pc": `
          <style>
            span {
              color: red;
            }
          </style>
          <span>more text</span>
        `
      },
      {},
      `
      <style>span[data-pc-80f4925f] { color:red; }</style><span data-pc-80f4925f>more text</span> 
      `
    ],

    // components
    [
      {
        "/button.pc": `
          <style>
            span {
              color: red;
            }
          </style>
          <span>{children}!</span>

        `,
        "/entry.pc": `
          <import id="something" src="./button.pc" />
          <something>hello world</something>
        `
      },
      {},
      `
      <style>span[data-pc-1d7dbc06] { color:red; }</style><span data-pc-1d7dbc06>hello world!</span>`
    ],

    // basic css
    [
      {
        "/button.pc": `
          <style>
            /* indivisual selectors */
            .class { }
            .class1.class2 {}
            .class1 .class2 {}
            #id {}
            * {}
            element {}
            element.class {}
            [attribute] {}
            [attribute=value]  {}
            [attribute="value"]  {}
            [attribute='value']  {}
            /*[attribute~='value']  {}
            [attribute^='value']  {}
            [attribute$='value']  {}
            [attribute$='value']  {}
            [attribute*='value']  {}*/
            div[attr1][attr1]  {}
            :active {}
            ::active {}
            element::active {}
            ::after {}

            /* functions */
            ::lang(it) {}
            p::lang(it) {}
            :not(p) {}
            :nth-child(5) {}
            :placeholder {}

            /* groups */
            element1, element2 {}
            element, .class, #id.class {}

            /* descendent */
            element1 element2 {}
            element1.class element2[attr][attr2] {}
            element1.class element2[attr], #id.group {}

            /* children */
            element1 > element2 {}
            element1 > .child .descendent {}
            element1 > .child .descendent, [group-attr="something"] {}

            /* next sibling */
            element1 + element2 {}

            /* sibling */
            element1 ~ element2 {}

            /* media queries */
            @media only screen and (max-width: 600px) {
              div {
                color: red;
              }
            }

            /* keyframes */
            @keyframes mymove {
              from {top: 0px;}
              to {top: 200px;}
            }
            
          </style>
          <span>{children}!</span>

        `,
        "/entry.pc": `
          <import id="something" src="./button.pc" />
          <something>hello world</something>
        `
      },
      {},
      `<style>.class[data-pc-1d7dbc06] { } .class1.class2[data-pc-1d7dbc06] { } .class1[data-pc-1d7dbc06] .class2[data-pc-1d7dbc06] { } #id[data-pc-1d7dbc06] { } [data-pc-1d7dbc06] { } element[data-pc-1d7dbc06] { } element.class[data-pc-1d7dbc06] { } [attribute][data-pc-1d7dbc06] { } [attribute="value"][data-pc-1d7dbc06] { } [attribute="value"][data-pc-1d7dbc06] { } [attribute="value"][data-pc-1d7dbc06] { } div[attr1][attr1][data-pc-1d7dbc06] { } :active { } ::active { } element[data-pc-1d7dbc06]::active { } ::after { } :lang(it) { } p[data-pc-1d7dbc06]:lang(it) { } [data-pc-1d7dbc06]:not(p[data-pc-1d7dbc06]) { } :nth-child(5) { } :placeholder { } element1[data-pc-1d7dbc06], element2[data-pc-1d7dbc06] { } element[data-pc-1d7dbc06], .class[data-pc-1d7dbc06], #id.class[data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] element2[data-pc-1d7dbc06] { } element1.class[data-pc-1d7dbc06] element2[attr][attr2][data-pc-1d7dbc06] { } element1.class[data-pc-1d7dbc06] element2[attr][data-pc-1d7dbc06], #id.group[data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] > element2[data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] > .child[data-pc-1d7dbc06] .descendent[data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] > .child[data-pc-1d7dbc06] .descendent[data-pc-1d7dbc06], [group-attr="something"][data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] + element2[data-pc-1d7dbc06] { } element1[data-pc-1d7dbc06] ~ element2[data-pc-1d7dbc06] { } @media only screen and (max-width: 600px) { div[data-pc-1d7dbc06] { color:red; } } </style><span data-pc-1d7dbc06>hello world!</span>`

      // TODO - import css
    ],
    [
      // parse different tag names
      {
        "/entry.pc": `
          {_someRef}
          {_some5ref}
          {_ref}
          {$$ref}
          <preview>
            <self 
              _someRef="a" 
              _some5ref="b" 
              _ref="c"
              $$ref="d"
            />
          </preview>
        `
      },
      {},
      `<style></style>abcd`
    ]
  ].forEach(([graph, context, expectedHTML]: [Graph, Object, string]) => {
    it(`can render "${JSON.stringify(graph)}"`, async () => {
      const engine = createMockEngine(graph);


      const p = waitForEvaluated(engine);
      engine.load("/entry.pc");
      const event = await p;
      const nodeStr = stringifyVirtualNode(event.node);
      expect(nodeStr.replace(/[\r\n\t\s]+/g, " ").trim()).to.eql(
        String(expectedHTML).replace(/[\r\n\t\s]+/g, " ").trim()
      );
    });
  });
});
