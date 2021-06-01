import { DependencyGraph } from "./state";
import { createContext2, TranslateOptions } from "./translate-utils";

/*

Generates design files with the following folder structure:

atoms.pc
figma/
  atoms/
    colors.pc
    typography.pc
    shadows.pc
  assets/
    something.svg
  designs/
    my-design-file-name/
      page1.pc
      page2.pc
    components/
      page.pc
      page2.pc
    onboarding-activation/
      dev-ready-version-2.pc


pseudocode:

<import src="@captec/design/"
*/

export const translateFigmaGraph = (
  graph: DependencyGraph,
  options: TranslateOptions
) => {
  const context = createContext2(graph, options);

  // 1. download globals
  // 2. translate pages
  // 3. t
};
