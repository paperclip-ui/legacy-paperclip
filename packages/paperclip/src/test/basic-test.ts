import { Engine } from "../engine";
import { expect } from "chai";
import * as http from "http";
import { EngineEventKind, EvaluatedEvent } from "../events";
import { stringifyVirtualNode } from "../stringify-virt-node";

const TEST_SERVER_PORT = 8999;

xdescribe(__filename + "#", () => {
  let server: http.Server;
  let currentGraph = {};

  before(next => {
    server = http.createServer((req, res) => {
      res.end(currentGraph[req.url.substr(1)]);
    });
    server.listen(TEST_SERVER_PORT);
    setTimeout(next, 100);
  });

  after(() => {
    server.close();
  });

  const waitForEvaluated = async (engine: Engine): Promise<EvaluatedEvent> => {
    return new Promise(resolve => {
      engine.onEvent(event => {
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
      `<span data-pc-3402f12b><style></style>more text</span>`
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
      `<span data-pc-3402f12b>
        <style>
          span[data-pc-3402f12b] { 
            color:red;
          }
        </style>
        more text
      </span>`
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
          <span>{{children}}!</span>

        `,
        "/entry.pc": `
          <import id="something" src="./button.pc" />
          <something>hello world</something>
        `
      },
      {},
      `<spandata-pc-4aa1ff40>
        <style>
          span[data-pc-4aa1ff40] {
            color:red;
          }
        </style>
        hello world!
      </span>`
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
            [attribute~='value']  {}
            [attribute^='value']  {}
            [attribute$='value']  {}
            [attribute$='value']  {}
            [attribute*='value']  {}
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

            @charset "UTF-8"; 
            
          </style>
          <span>{{children}}!</span>

        `,
        "/entry.pc": `
          <import id="something" src="./button.pc" />
          <something>hello world</something>
        `
      },
      {},
      `<spandata-pc-4aa1ff40>
        <style>
          span[data-pc-4aa1ff40] {
            color:red;
          }
        </style>
        hello world!
      </span>`

      // TODO - import css
    ]
  ].forEach(([graph, context, expectedHTML]) => {
    it(`can render "${JSON.stringify(graph)}"`, async () => {
      currentGraph = graph;
      const engine = new Engine({
        // httpFilePath: `http://0.0.0.0:${TEST_SERVER_PORT}/`
      });
      engine.load("/entry.pc");
      const event = await waitForEvaluated(engine);
      const nodeStr = stringifyVirtualNode(event.node);
      expect(nodeStr.replace(/[\r\n\t\s]+/g, "")).to.eql(
        String(expectedHTML).replace(/[\r\n\t\s]+/g, "")
      );
    });
  });
});
