import { expect } from "chai";
import { EngineMode } from "paperclip";
import { createMockEngine } from "paperclip/lib/test/utils";
import { generateCodeCoverageReport } from "..";

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
    const engine = createMockEngine(
      graph,
      () => {},
      {},
      EngineMode.MultiFrame,
      true
    );

    const result = engine.open("entry.pc");
    const coverageReport = await generateCodeCoverageReport(
      Object.keys(graph),
      engine
    );
    expect(coverageReport).to.eql(expectedCoverage);
  });
});
