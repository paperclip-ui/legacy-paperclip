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
      .getAllAvailableNodes()
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

  it(`when getAllAvailableNodes is included with active document URI, the namespace is included with components`, () => {});
});
