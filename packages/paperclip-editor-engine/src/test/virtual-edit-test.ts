import {
  computeVirtScriptObject,
  stringifyVirtualNode,
  VirtualElement,
} from "@paperclip-ui/core";
import { expect } from "chai";
import {
  AppendChild,
  ChildInsertionKind,
  EditTargetKind,
  VirtualObjectEditKind,
} from "../core";
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
          node: { kind: ChildInsertionKind.Element, value: "<span />" },
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span>blah</div>`
      );
    });

    it(`Can insert multiple nodes in the same edit`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": "<div>blah</div>",
      });

      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: { kind: ChildInsertionKind.Element, value: "<a />" },
        },
        {
          kind: VirtualObjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: { kind: ChildInsertionKind.Element, value: "<b />" },
        },
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.equals(
        `<div class="_5cd17222 _pub-5cd17222"><b class="_5cd17222 _pub-5cd17222"></b><a class="_5cd17222 _pub-5cd17222"></a>blah</div>`
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
          child: { kind: ChildInsertionKind.Element, value: "<span />" },
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
          child: { kind: ChildInsertionKind.Element, value: "<span />" },
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
          child: { kind: ChildInsertionKind.Element, value: "<span />" },
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
          child: { kind: ChildInsertionKind.Text, value: "blarg" },
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
          child: { kind: ChildInsertionKind.Element, value: "<span />" },
        },
      ]);
      expect(source.getText()).to.eql(
        `<div component as="Test">{child}</div><Test child={<span />} />`
      );
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eq(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    // just a quick smoke test
    it(`Can insert multiple slots at the same time`, async () => {
      const { server } = await createMockHost({
        "/hello.pc": `<div component as="Test">{child}{child2}</div><Test />`,
      });
      const client = server.createHostClient();

      const doc = await client.getDocuments().open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">[slot][slot]</div>`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0.0",
          child: { kind: ChildInsertionKind.Element, value: "<a />" },
        },
        {
          kind: VirtualObjectEditKind.AppendChild,
          nodePath: "0.1",
          child: { kind: ChildInsertionKind.Element, value: "<b />" },
        },
      ]);
      expect(source.getText()).to.eql(
        `<div component as="Test">{child}{child2}</div><Test child2={<b />} child={<a />} />`
      );
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eq(
        `<div class="_5cd17222 _pub-5cd17222"><a class="_5cd17222 _pub-5cd17222"></a><b class="_5cd17222 _pub-5cd17222"></b></div>`
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
                child: { kind: ChildInsertionKind.Text, value: "text" },
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
                child: { kind: ChildInsertionKind.Text, value: "text" },
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
                  kind: ChildInsertionKind.Instance,
                  sourceUri: "/hello2.pc",
                  name: "Test",
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
                  kind: ChildInsertionKind.Instance,
                  sourceUri: "/hello2.pc",
                  name: "Test",
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
                  kind: ChildInsertionKind.Instance,
                  sourceUri: "/hello2.pc",
                  name: "Test",
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
                  kind: ChildInsertionKind.Instance,
                  sourceUri: "/hello2.pc",
                  name: "Test",
                },
              },
            ],
            `<import src="/hello2.pc" as="hello2" />\n<div><hello2.Test /></div>`,
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
                  kind: ChildInsertionKind.Instance,
                  sourceUri: "/hello3.pc",
                  name: "Test",
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
                  kind: ChildInsertionKind.Text,
                  value: "Hello",
                },
              },
            ],
            `<span /><div>Hello</div>`,
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
                  kind: ChildInsertionKind.Instance,
                  name: "Test",
                  sourceUri: "/hello.pc",
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
                  kind: ChildInsertionKind.Instance,
                  name: "Test2",
                  sourceUri: "/hello3.pc",
                },
              },
            ],
            `<import src="/hello3.pc" as="hello3" />\n<import src="/hello2.pc" as="hello" /><hello.Test1 child={<hello3.Test2 />} />`,
          ],
        },
      ],
    ].forEach(([name, graph, change]: any) => {
      it(name, async () => {
        const { server } = await createMockHost(graph);
        const client = server.createHostClient();
        for (const fileName in change) {
          const [edits, expected] = change[fileName];
          const doc = await client.getDocuments().open(fileName);
          const source = await doc.getSource();
          doc.editVirtualObjects(edits);
          expect(source.getText()).to.eql(expected);
        }
      });
    });
  });
});
