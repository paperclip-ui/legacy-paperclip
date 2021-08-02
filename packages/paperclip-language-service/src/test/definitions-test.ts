import { expect } from "chai";
import { collectASTInfo } from "../collect-ast-info";
import { createMockEngineDelegate } from "paperclip-test-utils";

describe(__filename + "#", () => {
  [
    [
      `Returns definition info about component instance`,
      {
        "/entry.pc": `
          <div component as="Test" />
          <Test />
        `
      },
      [
        {
          sourceUri: "/entry.pc",
          sourceLocation: {
            start: 11,
            end: 38
          },
          sourceDefinitionLocation: {
            start: 11,
            end: 38
          },
          instanceLocation: {
            start: 50,
            end: 54
          }
        }
      ]
    ],
    [
      `Returns definition info about component that's also an instance`,
      {
        "/entry.pc": `
          <div component as="Test" />
          <Test component as="Test2" />
          <Test2 />
        `
      },
      [
        {
          sourceUri: "/entry.pc",
          sourceLocation: {
            start: 11,
            end: 38
          },
          sourceDefinitionLocation: {
            start: 11,
            end: 38
          },
          instanceLocation: {
            start: 50,
            end: 54
          }
        },
        {
          sourceUri: "/entry.pc",
          sourceLocation: {
            start: 49,
            end: 78
          },
          sourceDefinitionLocation: {
            start: 49,
            end: 78
          },
          instanceLocation: {
            start: 90,
            end: 95
          }
        }
      ]
    ],
    [
      `Returns definition info about imported component`,
      {
        "/entry.pc": `
          <import src="/module.pc" as="Test" />
          <Test.Test />
        `,
        "/module.pc": `
          <div export component as="Test" />
        `
      },
      [
        {
          sourceUri: "/module.pc",
          sourceLocation: {
            start: 11,
            end: 45
          },
          sourceDefinitionLocation: {
            start: 11,
            end: 45
          },
          instanceLocation: {
            start: 60,
            end: 69
          }
        }
      ]
    ],
    [
      `Returns definition info about default imported component`,
      {
        "/entry.pc": `
          <import src="/module.pc" as="Test" />
          <Test />
        `,
        "/module.pc": `
          <div export component as="default" />
        `
      },
      [
        {
          sourceUri: "/module.pc",
          sourceLocation: {
            start: 11,
            end: 48
          },
          sourceDefinitionLocation: {
            start: 11,
            end: 48
          },
          instanceLocation: {
            start: 60,
            end: 64
          }
        }
      ]
    ]
  ].forEach(([name, graph, expectedLinks]: any) => {
    it(name, () => {
      const engine = createMockEngineDelegate(graph);
      engine.open("/entry.pc");
      const info = collectASTInfo(
        "/entry.pc",
        engine.getLoadedGraph(),
        engine.getAllLoadedData()
      );

      // console.log(JSON.stringify(info.definitions, null, 2));

      expect(info.definitions).to.eql(expectedLinks);
    });
  });
});
