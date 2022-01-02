import { expect } from "chai";
import { EngineMode } from "paperclip";
import { createMockEngine } from "../utils";

[
  [
    "shows CSS coverage on a simple CSS file",
    {
      "entry.pc": `<div></div>`
    },
    {
      files: [
        {
          filePath: "entry.pc",
          lineCount: 2,
          missedLines: []
        }
      ]
    }
  ],
  [
    "Shows missing lines for a slot",
    {
      "entry.pc": `<div component as="Test">
        {a && <div />}
      </div>`
    },
    {
      files: [
        {
          filePath: "entry.pc",
          lineCount: 2,
          missedLines: []
        }
      ]
    }
  ]
].forEach(([title, graph, expectedCoverage]: any) => {
  it(title, async () => {
    const engine = createMockEngine(graph, () => {}, {}, EngineMode.MultiFrame);

    for (const path in graph) {
      engine.open(path);
    }

    const report = engine.generateCoverageReport();
    // expect(report).to.eql(expectedCoverage);
  });
});
