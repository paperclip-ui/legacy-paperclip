import React, { useState } from "react";
import * as styles from "./index.pc";
import Pane, { Container as PaneContainer } from "../../../../Pane/index.pc";
import { RulesInspector } from "./RulesInspector";
import { ComputedInspector } from "./ComputedInspector";

enum Tabs {
  Rules = "Rules",
  Computed = "Computed",
}

export const ElementInspector = React.memo(() => {
  const [activeTab, setActiveTab] = useState(Tabs.Rules);

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
