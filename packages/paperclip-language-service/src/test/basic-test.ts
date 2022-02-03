import { expect } from "chai";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { PaperclipLanguageService } from "..";
import { AvailableNodeKind } from "../state";

describe(__filename + "#", () => {
  it(`Can return all available elements in a project`, () => {
    const engine = createMockEngine({
      "/entry.pc": `
      <div export component as="Test" />
      <div component as="Test2" />
      `,
    });
    engine.open("/entry.pc");
    const service = new PaperclipLanguageService(engine);
    const nodes = service
      .getAllAvailableNodes({ activeUri: undefined })
      .filter((node) => node.kind === AvailableNodeKind.Instance);
    expect(nodes).to.eql([
      {
        kind: AvailableNodeKind.Instance,
        displayName: "Test",
        name: "Test",
        sourceUri: "/entry.pc",
        description: "",
      },
    ]);
  });

  it(`Returns private instances of document if URI is active`, () => {
    const engine = createMockEngine({
      "/entry.pc": `
      <div export component as="Test" />
      <div component as="Test2" />
      `,
    });
    engine.open("/entry.pc");
    const service = new PaperclipLanguageService(engine);
    const nodes = service
      .getAllAvailableNodes({ activeUri: "/entry.pc" })
      .filter((node) => node.kind === AvailableNodeKind.Instance);
    expect(nodes).to.eql([
      {
        kind: AvailableNodeKind.Instance,
        displayName: "Test",
        name: "Test",
        sourceUri: "/entry.pc",
        description: "",
      },
      {
        kind: AvailableNodeKind.Instance,
        displayName: "Test2",
        name: "Test2",
        sourceUri: "/entry.pc",
        description: "",
      },
    ]);
  });
});
