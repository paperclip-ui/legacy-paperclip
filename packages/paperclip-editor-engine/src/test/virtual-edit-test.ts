import {
  computeVirtScriptObject,
  stringifyVirtualNode,
  VirtualElement,
  VirtualText
} from "@paperclip-ui/core";
import { expect } from "chai";
import { VirtualobjectEditKind } from "../core";
import { createMockHost, timeout } from "./utils";

// TODO - test latency

describe(__filename + "#", () => {
  describe("html", () => {
    it(`Can update the text of a virtual node`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: "<span />"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span>blah</div>`
      );
    });

    it(`Can insert multiple nodes in the same edit`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: "<a />"
        },
        {
          kind: VirtualobjectEditKind.InsertNodeBefore,
          beforeNodePath: "0.0",
          node: "<b />"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.equals(
        `<div class="_5cd17222 _pub-5cd17222"><b class="_5cd17222 _pub-5cd17222"></b><a class="_5cd17222 _pub-5cd17222"></a>blah</div>`
      );
    });

    it(`Can update the text of a node`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.SetTextNodeValue,
          nodePath: "0.0",
          value: "Hello world"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">Hello world</div>`
      );
    });

    it(`Can insert new node annotations`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      const annotations = {
        tags: ["a", "b"],
        desc: "Some description",
        frame: { width: 100, height: 100 }
      };

      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.SetAnnotations,
          nodePath: "0",
          value: annotations
        }
      ]);

      const node = doc.getNodeFromPath("0") as VirtualElement;
      expect(annotations).to.eql(computeVirtScriptObject(node.annotations));

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">blah</div>`
      );
    });

    it(`Can update existing annotations`, async () => {
      const { server } = createMockHost({
        "/hello.pc": `<!--
          @frame { width: 100, height: 100 }
        --> <div>blah</div>`
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      const annotations = {
        tags: ["a", "b"],
        desc: "Some description",
        frame: { width: 100, height: 100 }
      };

      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.SetAnnotations,
          nodePath: "0",
          value: annotations
        }
      ]);

      const node = doc.getNodeFromPath("0") as VirtualElement;
      const source = await doc.getSource();
      expect(source.getText().replace(/[\s\n]+/g, " ")).to.eq(
        `<!-- @tags ["a","b"] @desc "Some description" @frame {width:100,height:100} --> <div>blah</div>`
      );
      expect(annotations).to.eql(computeVirtScriptObject(node.annotations));

      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">blah</div>`
      );
    });

    it(`Can add a new element attribute`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.AddAttribute,
          nodePath: "0",
          name: "a",
          value: '"b"'
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222" a="b">blah</div>`
      );
    });

    xit(`Can update an element attribute value`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div a>blah</div>"
      });

      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.UpdateAttribute,
          nodePath: "0",
          name: "a",
          value: '"b"'
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222" a="b">blah</div>`
      );
    });

    it(`Can append a child to a self-closing element`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div />"
      });
      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.AppendChild,
          nodePath: "0",
          child: "<span />"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`Can append a child to an element with a closing tag`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div></div>"
      });
      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.AppendChild,
          nodePath: "0",
          child: "<span />"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`Can append a child to an element with children`, async () => {
      const { server } = createMockHost({
        "/hello.pc": "<div>abba</div>"
      });
      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.AppendChild,
          nodePath: "0",
          child: "<span />"
        }
      ]);
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">abba<span class="_5cd17222 _pub-5cd17222"></span></div>`
      );
    });

    it(`If a node is inserted into a slot placeholder, that slot is assigned`, async () => {
      const { server } = createMockHost({
        "/hello.pc": `<div component as="Test">{child}</div><Test />`
      });
      const client = server.createHostClient();

      const doc = await client.open("/hello.pc");
      const source = await doc.getSource();
      expect(stringifyVirtualNode(doc.getContent().preview, "[slot]")).to.eql(
        `<div class="_5cd17222 _pub-5cd17222">[slot]</div>`
      );
      doc.editVirtualObjects([
        {
          kind: VirtualobjectEditKind.AppendChild,
          nodePath: "0.0",
          child: "blarg"
        }
      ]);
      expect(source.getText()).to.eql(
        `<div component as="Test">{child}</div><Test child="blarg" />`
      );
      expect(stringifyVirtualNode(doc.getContent().preview)).to.eq(
        `<div class="_5cd17222 _pub-5cd17222">blarg</div>`
      );
    });

    xit(
      `Slotted children are wrapped in a fragment if another child is inserted`
    );
    xit(
      `An import is added if inserting an instance that's not already imported`
    );
    xit(`The instance type of a component can be changed`);
  });

  describe("styles", () => {});
});
