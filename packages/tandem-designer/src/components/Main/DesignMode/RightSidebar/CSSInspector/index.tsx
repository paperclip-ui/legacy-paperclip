import React, { useState } from "react";
import * as styles from "./index.pc";
import { Container as PaneContainer } from "../../../../Pane/index.pc";
import { RulesInspector } from "./RuleInspector";
import { ComputedInspector } from "./ComputedInspector";

enum Tabs {
  Computed = "Computed",
  Rules = "Rules",
}

export const ElementInspector = React.memo(() => {
  const [activeTab, setActiveTab] = useState(Tabs.Computed);

  return (
    <>
      <PaneContainer>
        <styles.Tabs>
          {Object.keys(Tabs).map((tab) => {
            return (
              <styles.Tab
                active={activeTab === Tabs[tab]}
                onClick={() => setActiveTab(Tabs[tab])}
              >
                {tab}
              </styles.Tab>
            );
          })}
        </styles.Tabs>
        {activeTab === Tabs.Rules && <RulesInspector />}
        {activeTab === Tabs.Computed && <ComputedInspector />}
      </PaneContainer>
    </>
  );
});
