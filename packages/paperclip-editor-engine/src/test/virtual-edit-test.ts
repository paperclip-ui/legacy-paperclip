import {
  computeVirtScriptObject,
  ELEMENT_INSERT_ATTR,
  Fragment,
  Node,
  stringifyVirtualNode,
  VirtualElement,
} from "@paperclip-ui/core";
import { expect } from "chai";
import { AppendChild, EditTargetKind, VirtualObjectEditKind } from "../core";
import { createMockHost } from "./utils";

// TODO - test latency

describe(__filename + "#", () => {
  describe("html", () => {
    it(`Can update the text of a virtual node`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: { value: "<span />" },
        },
      ]);

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span>blah</div>`
      );
    });

    it(`Can update the text of a node`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.SetTextNodeValue,
          nodePath: "0.0",
          value: "Hello world",
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">Hello world</div>`
      );
    });

    it(`Can insert new node annotations`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const annotations = {
        tags: ["a", "b"],
        desc: "Some description",
        frame: { width: 100, height: 100 },
      };

      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.SetAnnotations,
          nodePath: "0",
          value: annotations,
        },
      ]);

      const node = doc.getNodeFromPath("0") as VirtualElement;
      expect(annotations).to.eql(computeVirtScriptObject(node.annotations));

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">blah</div>`
      );
    });

    it(`can insert annotations with quites`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const annotations = {
        tags: ["a", "b"],
        desc: "Some description",
        frame: {
          x: 834,
          height: 817,
          y: "-21",
          width: "100",
          title: "Something",
        },
      };

      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.SetAnnotations,
          nodePath: "0",
          value: annotations,
        },
      ]);

      const node = doc.getNodeFromPath("0") as VirtualElement;
      expect(annotations).to.eql(computeVirtScriptObject(node.annotations));

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">blah</div>`
      );
    });

    it(`Can update existing annotations`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `<!--
          @frame { width: 100, height: 100 }
        --> <div>blah</div>`,
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const annotations = {
        tags: ["a", "b"],
        desc: "Some description",
        frame: { width: 100, height: 100 },
      };

      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.SetAnnotations,
          nodePath: "0",
          value: annotations,
        },
      ]);

      const node = doc.getNodeFromPath("0") as VirtualElement;
      const source = await doc.getSource();
      expect(source.getText().replace(/[\s\n]+/g, " ")).to.eq(
        `<!-- @tags ["a","b"] @desc "Some description" @frame { height: 100, width: 100 } --> <div>blah</div>`
      );
      expect(annotations).to.eql(computeVirtScriptObject(node.annotations));

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">blah</div>`
      );
    });

    it(`Can add a new element attribute`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AddAttribute,
          target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
          name: "a",
          value: '"b"',
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222" a="b">blah</div>`
      );
    });

    xit(`Can update an element attribute value`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div a>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.UpdateAttribute,
          nodePath: "0",
          name: "a",
          value: '"b"',
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222" a="b">blah</div>`
      );
    });

    it(`Can append a child to a self-closing element`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div />",
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0",
          child: { value: "<span />" },
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`Can append a child to an element with a closing tag`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div></div>",
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0",
          child: { value: "<span />" },
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`Can append a child to an element with children`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>abba</div>",
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0",
          child: { value: "<span />" },
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">abba<span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`If text is inserted into a slot placeholder, that slot is assigned as a regular key/value attribute`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `<div component as="Test">{child}</div><Test />`,
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">[slot]</div>`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0.0",
          child: { value: "blarg" },
        },
      ]);
      expect(source.getText()).to.eql(
        `<div component as="Test">{child}</div><Test child="blarg" />`
      );
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eq(
        `<div class="_5cd17222 _pub-5cd17222">blarg</div>`
      );
    });

    it(`If an element is inserted into a slot placeholder, that slot is assigned as a regular key/script attribute`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `<div component as="Test">{child}</div><Test />`,
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">[slot]</div>`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0.0",
          child: { value: "<span />" },
        },
      ]);
      expect(source.getText()).to.eql(
        `<div component as="Test">{child}</div><Test child={<span />} />`
      );
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eq(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`Can remove a node`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `a<span />b`,
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `a<span class="_5cd17222 _pub-5cd17222"></span>b`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.DeleteNode,
          nodePath: "1",
        },
      ]);

      expect(source.getText()).to.eql(`ab`);
    });

    it(`When removing a node, the annotations are also removed if present`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `<!-- @frame { visible: false } -->node<span />`,
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `node<span class="_5cd17222 _pub-5cd17222"></span>`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.DeleteNode,
          nodePath: "0",
        },
      ]);

      expect(source.getText()).to.eql(`<span />`);
    });

    [
      [
        `When annotations are added to an element without them, a new line is also created`,
        {
          "/hello.pc": "<div />",
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.SetAnnotations,
                value: { a: "b" },
                nodePath: "0",
              },
            ],
            `<!--\n  @a "b"\n-->\n<div />`,
          ],
        },
      ],
      [
        `Can insert a text node as a frame`,
        {
          "/hello.pc": "<div />",
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                child: { value: "text" },
              },
            ],
            `<div />text`,
          ],
        },
      ],
      [
        `Can insert a new frame`,
        {
          "/hello.pc": "<div />",
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AddFrame,
                child: { value: "text" },
                box: { x: 100, y: 100.1, width: 100, height: 100 },
              },
            ],
            `<div />\n\n<!--\n  @frame { x: 100, y: 100, width: 100, height: 100 }\n-->\ntext`,
          ],
        },
      ],
      [
        `Can insert a new instance frame`,
        {
          "/hello.pc": `<import src="/hello2.pc" as="hello" /><div />`,
          "/hello2.pc": `<div export component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AddFrame,
                child: {
                  namespaces: { abba: "/hello2.pc" },
                  value: `<abba.Test />`,
                },
                box: { x: 100, y: 100.1, width: 100, height: 100 },
              },
            ],
            `<import src="/hello2.pc" as="hello" /><div />\n\n<!--\n  @frame { x: 100, y: 100, width: 100, height: 100 }\n-->\n<hello.Test />`,
          ],
        },
      ],
      [
        `Adds a ns to an import if including an instance from another doc`,
        {
          "/hello.pc": `<import src="/hello2.pc" /><div />`,
          "/hello2.pc": `<div export component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AddFrame,
                child: {
                  namespaces: { abba: "/hello2.pc" },
                  value: `<abba.Test />`,
                },
                box: { x: 100, y: 100.1, width: 100, height: 100 },
              },
            ],
            `<import as="hello2" src="/hello2.pc" /><div />\n\n<!--\n  @frame { x: 100, y: 100, width: 100, height: 100 }\n-->\n<hello2.Test />`,
          ],
        },
      ],
      [
        `If inserting an instance of element that's not imported, the import is added`,
        {
          "/hello.pc": `<div />`,
          "/hello2.pc": `<div export component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AddFrame,
                child: {
                  namespaces: { abba: "/hello2.pc" },
                  value: `<abba.Test />`,
                },
                box: { x: 100, y: 100.1, width: 100, height: 100 },
              },
            ],
            `<import src="/hello2.pc" as="hello2" />\n<div />\n\n<!--\n  @frame { x: 100, y: 100, width: 100, height: 100 }\n-->\n<hello2.Test />`,
          ],
        },
      ],
      [
        `When inserting an instance into an element, the instance is auto-imported`,
        {
          "/hello.pc": `<div />`,
          "/hello2.pc": `<div export component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: {
                  namespaces: { abba: "/hello2.pc" },
                  value: `<abba.Test />`,
                },
              },
            ],
            `<import src="/hello2.pc" as="hello2" />\n<div>\n  <hello2.Test />\n</div>`,
          ],
        },
      ],
      [
        `Auto-imports a module if an import shares the same NS but not source`,
        {
          "/hello.pc": `<import src="/hello2.pc" as="hello" /><div />`,
          "/hello2.pc": `<div export component as="Test" />`,
          "/hello3.pc": `<div export component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AddFrame,
                child: {
                  namespaces: { abba: "/hello3.pc" },
                  value: `<abba.Test />`,
                },
                box: { x: 100, y: 100.1, width: 100, height: 100 },
              },
            ],
            `<import src="/hello3.pc" as="hello3" />\n<import src="/hello2.pc" as="hello" /><div />\n\n<!--\n  @frame { x: 100, y: 100, width: 100, height: 100 }\n-->\n<hello3.Test />`,
          ],
        },
      ],
      [
        `Can add a child to a self-closing element at the end of the document`,
        {
          "/hello.pc": `<span /><div />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "1",
                child: {
                  value: "Hello",
                },
              },
            ],
            `<span /><div>\n  Hello\n</div>`,
          ],
        },
      ],
      [
        `Can insert a instance of a component within the same document`,
        {
          "/hello.pc": `<div component as="Test" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                child: {
                  namespaces: { abba: "/hello.pc" },
                  value: `<abba.Test />`,
                },
              },
            ],
            `<div component as="Test" /><Test />`,
          ],
        },
      ],
      [
        `When inserting an instance into a slot of an instance that's also imported, the import is added to the slot instance doc`,
        {
          "/hello.pc": `<import src="/hello2.pc" as="hello" /><hello.Test1 />`,
          "/hello2.pc": `<div export component as="Test1">{child}</div>`,
          "/hello3.pc": `<div export component as="Test2" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0.0",
                child: {
                  namespaces: { abba: "/hello3.pc" },
                  value: `<abba.Test2 />`,
                },
              },
            ],
            `<import src="/hello3.pc" as="hello3" />\n<import src="/hello2.pc" as="hello" /><hello.Test1 child={<hello3.Test2 />} />`,
          ],
        },
      ],
      [
        `When inserting a child into a children slot, the child is added as a regular child of an element`,
        {
          "/hello.pc": `<div component as="Test">{children}</div><Test />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0.0",
                child: {
                  value: "Something",
                },
              },
            ],
            `<div component as="Test">{children}</div><Test>\n  Something\n</Test>`,
          ],
        },
      ],
      [
        `Appending child to instance without children slot results in no-op`,
        {
          "/hello.pc": `<div component as="Test">{child}</div><Test />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: {
                  value: "Something",
                },
              },
            ],
            `<div component as="Test">{child}</div><Test />`,
          ],
        },
      ],
      [
        `Can delete a nested element`,
        {
          "/hello.pc": `<div>abc</div>`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.DeleteNode,
                nodePath: "0.0",
              },
            ],
            `<div></div>`,
          ],
        },
      ],
      [
        `When deleting a slotted string attribute, the attribute is removed`,
        {
          "/hello.pc": `<div component as="Test">{child}</div><Test child="abba" />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.DeleteNode,
                nodePath: "0.0",
              },
            ],
            `<div component as="Test">{child}</div><Test  />`,
          ],
        },
      ],
      [
        `When deleting a slotted node attribute, the attribute is removed`,
        {
          "/hello.pc": `<div component as="Test">{child}</div><Test child={<div />} />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.DeleteNode,
                nodePath: "0.0",
              },
            ],
            `<div component as="Test">{child}</div><Test  />`,
          ],
        },
      ],
      [
        `When deleting a slotted script attribute, the attribute is removed`,
        {
          "/hello.pc": `<div component as="Test">{child}</div><Test child={"a"} />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.DeleteNode,
                nodePath: "0.0",
              },
            ],
            `<div component as="Test">{child}</div><Test  />`,
          ],
        },
      ],
      [
        `If deleting a child of a slotted element, that child is deleted`,
        {
          "/hello.pc": `<div component as="Test">{child}</div><Test child={<div>to delete</div>} />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.DeleteNode,
                nodePath: "0.0.0",
              },
            ],
            `<div component as="Test">{child}</div><Test child={<div></div>} />`,
          ],
        },
      ],
      [
        `When appending to element with ${ELEMENT_INSERT_ATTR}, the ${ELEMENT_INSERT_ATTR} attr is removed`,
        {
          "/hello.pc": `<div ${ELEMENT_INSERT_ATTR}></div>`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: { value: "<span />" },
              },
            ],
            `<div>\n  <span />\n</div>`,
          ],
        },
      ],
      [
        `If appending to an element without children, the indentation is based on parent spacing`,
        {
          "/hello.pc": ` <div></div>`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: { value: "<span />" },
              },
            ],
            ` <div>\n   <span />\n </div>`,
          ],
        },
      ],
      [
        `If appending to an element with a child, the indentation is maintained based on the previous child`,
        {
          "/hello.pc": `<div>\n    child</div>`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: { value: "<span />" },
              },
            ],
            `<div>\n    child\n    <span />\n</div>`,
          ],
        },
      ],
      [
        `When adding a child to a nested self-closing element, the parent end tag matches the start`,
        {
          "/hello.pc": `<a>\n  <b />\n</a>`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0.0",
                child: { value: "<span />" },
              },
            ],
            `<a>\n  <b>\n    <span />\n  </b>\n</a>`,
          ],
        },
      ],
      [
        `Can append a child to a self-closing element with an insertion attr`,
        {
          "/hello.pc": `<div data-pc-show-insert />`,
        },
        {
          "/hello.pc": [
            [
              {
                kind: VirtualObjectEditKind.AppendChild,
                nodePath: "0",
                child: { value: "<span />" },
              },
            ],
            `<div>\n  <span />\n</div>`,
          ],
        },
      ],
      [
        `Can change a style declaration on a specific declaration ID`,
        {
          "/hello.pc": `<div><style>width: 100px;height: 100px;</style></div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              // console.log(JSON.stringify(ast, null, 2));
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: {
                    kind: EditTargetKind.Expression,
                    sourceId: "5cd17222-1-1",
                  },
                  name: "width",
                  value: "999px",
                },
              ];
            },
            `<div><style>width: 999px;height: 100px;</style></div>`,
          ],
        },
      ],
      [
        `When setting a style declaration on an element that doesn't have a style block, a new style block is added`,
        {
          "/hello.pc": `<div />`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "width",
                  value: "999px",
                },
              ];
            },
            `<div>\n  <style>\n    width: 999px;\n  </style>\n</div>`,
          ],
        },
      ],
      [
        `When setting a style declaration on an element that doesn't have a style block and has a children, the style is prepended to the beginning`,
        {
          "/hello.pc": `<div>\n  <span />\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "width",
                  value: "999px",
                },
              ];
            },
            `<div>\n  <style>\n    width: 999px;\n  </style>\n  <span />\n</div>`,
          ],
        },
      ],
      [
        `When setting a style declaration on an element with a style and the declaration doesn't exist, the declaration is added`,
        {
          "/hello.pc": `<div>\n  <style>\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "height",
                  value: "100px",
                },
              ];
            },
            `<div>\n  <style>\n    height: 100px;\n  </style>\n</div>`,
          ],
        },
      ],
      [
        `When setting a style declaration on an element with a style that includes an existing declaration, the declaration is added at the end`,
        {
          "/hello.pc": `<div>\n  <style>\n    width: 100px;\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "height",
                  value: "100px",
                },
              ];
            },
            `<div>\n  <style>\n    width: 100px;\n    height: 100px;\n  </style>\n</div>`,
          ],
        },
      ],
      [
        `When setting a style that already exists on an element, that style is replaced`,
        {
          "/hello.pc": `<div>\n  <style>\n    background: red;\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "background",
                  value: "blue",
                },
              ];
            },
            `<div>\n  <style>\n    background: blue;\n  </style>\n</div>`,
          ],
        },
      ],
      [
        `Can rename a style on a style element`,
        {
          "/hello.pc": `<div>\n  <style>\n    background: red;\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "color",
                  oldName: "background",
                  value: "blue",
                },
              ];
            },
            `<div>\n  <style>\n    color: blue;\n  </style>\n</div>`,
          ],
        },
      ],
      [
        `Clearing the name of a declaration removes it`,
        {
          "/hello.pc": `<div>\n  <style>\n    background: red;\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "",
                  oldName: "background",
                  value: "blue",
                },
              ];
            },

            `<div>\n  <style>\n    \n  </style>\n</div>`,
          ],
        },
      ],
      [
        `Clearing the value of a declaration removes it`,
        {
          "/hello.pc": `<div>\n  <style>\n    background: red;\n  </style>\n</div>`,
        },
        {
          "/hello.pc": [
            (ast: Fragment) => {
              return [
                {
                  kind: VirtualObjectEditKind.SetStyleDeclaration,
                  target: { kind: EditTargetKind.VirtualNode, nodePath: "0" },
                  name: "background",
                  value: "",
                },
              ];
            },

            `<div>\n  <style>\n    \n  </style>\n</div>`,
          ],
        },
      ],
    ].forEach(([name, graph, change]: any) => {
      it(name, async () => {
        const { server, engine } = await createMockHost(graph);
        const client = server.createHostClient();
        for (const fileName in change) {
          const [edits, expected] = change[fileName];
          const doc = await client.getDocuments().open(fileName);
          const source = await doc.getSource();
          doc.editVirtualObjects(
            typeof edits === "function"
              ? edits(engine.getLoadedAst(fileName))
              : edits
          );
          expect(source.getText()).to.eql(expected);
        }
      });
    });
  });
});
