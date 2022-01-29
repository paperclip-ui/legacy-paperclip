import {
  computeVirtScriptObject,
  stringifyVirtualNode,
  VirtualElement,
} from "@paperclip-ui/core";
import { expect } from "chai";
import { ChildInsertionKind, VirtualobjectEditKind } from "../core";
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
          kind: VirtualobjectEditKind.InsertNodeBefore,
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
          kind: VirtualobjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: { kind: ChildInsertionKind.Element, value: "<a />" },
        },
        {
          kind: VirtualobjectEditKind.InsertNodeBefore,
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
          kind: VirtualobjectEditKind.SetTextNodeValue,
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
          kind: VirtualobjectEditKind.SetAnnotations,
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
          kind: VirtualobjectEditKind.SetAnnotations,
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
          kind: VirtualobjectEditKind.SetAnnotations,
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
          kind: VirtualobjectEditKind.AddAttribute,
          nodePath: "0",
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
          kind: VirtualobjectEditKind.UpdateAttribute,
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
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.AppendChild,
          nodePath: "0.0",
          child: { kind: ChildInsertionKind.Element, value: "<a />" },
        },
        {
          kind: VirtualobjectEditKind.AppendChild,
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
          kind: VirtualobjectEditKind.DeleteNode,
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
          kind: VirtualobjectEditKind.DeleteNode,
          nodePath: "0",
        },
      ]);

      expect(source.getText()).to.eql(`<span />`);
    });
    xit(`Annotations don't add extra whitespace when edited`);

    // Need to ensure that we're not out of range
    xit(`Replaced annotations properly set the delete count`);

    xit(
      `Slotted children are wrapped in a fragment if another child is inserted`
    );
    xit(
      `An import is added if inserting an instance that's not already imported`
    );
    xit(`The instance type of a component can be changed`);
  });
});
