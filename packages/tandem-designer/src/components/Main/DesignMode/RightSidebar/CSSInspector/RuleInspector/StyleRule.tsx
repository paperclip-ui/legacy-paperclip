import React from "react";
import {
  SelectorInfo,
  StyleRuleInfo,
  SelectorInfoKind,
  memoize,
  TargetSelectorInfo,
  ClassSelectorInfo,
  BaseSelectorInfo,
} from "@paperclip-ui/utils";
import * as styles from "../index.pc";
import * as path from "path";
import { styleRuleFileNameClicked } from "../../../../../../actions";
import { SelectorScopeKind } from "@paperclip-ui/utils";
import { StyleDeclarationList } from "../DeclarationList";

export type StyleRuleProps = {
  dispatch: any;
  info: StyleRuleInfo;
  filter?: (value: string) => boolean;
};

export const StyleRule = React.memo(
  ({ dispatch, info, filter }: StyleRuleProps) => {
    const onFileNameClick = () => {
      dispatch(
        styleRuleFileNameClicked({
          styleRuleSourceId: info.sourceId,
        })
      );
    };

    return (
      <styles.StyleRule
        media={info.media?.conditionText}
        mediaActive={info.media?.active}
        onFileNameClick={onFileNameClick}
        boldSelector={filter && filter(info.selectorText)}
        isGlobal={isSelectorPartiallyGlobal(info.selectorInfo)}
        fileName={path.basename(info.sourceUri)}
        selector={generateSelector(info.selectorInfo)}
        properties={
          <StyleDeclarationList
            items={info.declarations.map((decl) => ({
              name: decl.name,
              value: decl.value,
              rawValue: decl.rawValue,
              id: decl.sourceId,
            }))}
          />
        }
      />
    );
  }
);

const isSelectorPartiallyGlobal = memoize((info: SelectorInfo) => {
  switch (info.kind) {
    // VERY crude approach to remove scope selectors + extra specificity. Ideally
    // this information would be included in the evaluated CSSOM output, instead of
    // doing guesswork here. This will fail if someone does something like :global([class].div), but
    // I suppose nobody would realistically do that.
    case SelectorInfoKind.Combo: {
      return !info.selectors.some((selector) => {
        return isScopedSelector(selector);
      });
    }
    case SelectorInfoKind.Sibling:
    case SelectorInfoKind.Adjacent:
    case SelectorInfoKind.Descendent:
    case SelectorInfoKind.Child: {
      return (
        isSelectorPartiallyGlobal(info.left) ||
        isSelectorPartiallyGlobal(info.right)
      );
    }
    case SelectorInfoKind.Class: {
      return !isClassScopeSelector(info);
    }
    case SelectorInfoKind.PseudoElement:
    case SelectorInfoKind.Not:
    case SelectorInfoKind.Element:
    case SelectorInfoKind.All:
    case SelectorInfoKind.PsuedoParamElement:
    case SelectorInfoKind.Attribute:
    case SelectorInfoKind.Id: {
      return true;
    }
  }
});

const isClassSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return info.kind === SelectorInfoKind.Class;
};
const isScopedSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return info != null && isClassSelector(info) && info.scope != null;
};

const isClassScopeSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return isScopedSelector(info) && !info.name;
};

const isClassElementScopeSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return (
    isClassScopeSelector(info) && info.scope.kind === SelectorScopeKind.Element
  );
};

const isTargetSelector = (
  info: BaseSelectorInfo<any>
): info is TargetSelectorInfo<any> => (info as any).value != null;

const generateSelector = memoize((info: SelectorInfo) => {
  switch (info.kind) {
    // VERY crude approach to remove scope selectors + extra specificity. Ideally
    // this information would be included in the evaluated CSSOM output, instead of
    // doing guesswork here. This will fail if someone does something like :global([class].div), but
    // I suppose nobody would realistically do that.
    case SelectorInfoKind.Combo: {
      const cleanedSelectors = info.selectors.concat();

      // there's only ever one scope selector, so if the combo is 2, then that
      // simplifies things
      if (cleanedSelectors.length === 2) {
        // it's a class selector
        if (
          isTargetSelector(cleanedSelectors[0]) &&
          (cleanedSelectors[0] as any).value === "[class]"
        ) {
          cleanedSelectors.shift();

          // other attr selector
        } else if (isClassScopeSelector(cleanedSelectors[1])) {
          cleanedSelectors.pop();
        }
      } else if (cleanedSelectors.length >= 2) {
        const lastSelector = cleanedSelectors[cleanedSelectors.length - 1];

        // scope selector comes before pseudo element. E.g: .div._59bb:before
        const maybeScopeSelector =
          lastSelector.kind === SelectorInfoKind.PseudoElement ||
          lastSelector.kind === SelectorInfoKind.PsuedoParamElement
            ? cleanedSelectors[cleanedSelectors.length - 2]
            : lastSelector;

        // is the last selector a scope??
        if (isClassScopeSelector(maybeScopeSelector)) {
          cleanedSelectors.splice(
            cleanedSelectors.indexOf(maybeScopeSelector),
            1
          );
        }

        // scan for element scopes. This can be anywhere. E.g:
        // & > b, &.& &.test.&
        for (let i = cleanedSelectors.length; i--; ) {
          const selector = cleanedSelectors[i];

          // Dirty, but we check for [class] since it's just a specificity prop. Note this
          // will break if someone does [class] willy-nill but oh well, that's a less common bug.
          if (isTargetSelector(selector) && selector.value === "[class]") {
            cleanedSelectors.splice(i, 1);
            continue;
          }

          if (
            isClassElementScopeSelector(selector) &&
            i &&
            isClassElementScopeSelector(cleanedSelectors[i - 1])
          ) {
            cleanedSelectors.splice(i, 1);

            // skip previous selector in case of && specificity
            i--;
          }
        }
      }

      const combo: any[] = [];
      for (const selector of cleanedSelectors) {
        combo.push(generateSelector(selector));
      }

      return combo;
    }
    case SelectorInfoKind.Class: {
      if (!info.name) {
        if (info.scope?.kind === SelectorScopeKind.Document) {
          return "*";
        } else {
          return <styles.ScopedElementSelector key={info.name} />;
        }
      } else {
        return "." + info.name;
      }
    }
    case SelectorInfoKind.Sibling: {
      return [
        generateSelector(info.left as SelectorInfo),
        " ~ ",
        generateSelector(info.right as SelectorInfo),
      ];
    }
    case SelectorInfoKind.Adjacent: {
      return [
        generateSelector(info.left as SelectorInfo),
        " + ",
        generateSelector(info.right as SelectorInfo),
      ];
    }
    case SelectorInfoKind.Descendent: {
      return [
        generateSelector(info.left as SelectorInfo),
        " ",
        generateSelector(info.right as SelectorInfo),
      ];
    }
    case SelectorInfoKind.Child: {
      return [
        generateSelector(info.left as SelectorInfo),
        " > ",
        generateSelector(info.right as SelectorInfo),
      ];
    }
    case SelectorInfoKind.All: {
      return "*";
    }
    case SelectorInfoKind.Element: {
      return info.value;
    }
    case SelectorInfoKind.Not: {
      return [":not(", generateSelector(info.selector as SelectorInfo), ")"];
    }
    case SelectorInfoKind.PseudoElement:
    case SelectorInfoKind.PsuedoParamElement:
    case SelectorInfoKind.Attribute:
    case SelectorInfoKind.Id: {
      return info.value;
    }
  }

  return "";
});

type StyleRuleHeaderProps = {
  info: StyleRuleInfo;
};

// const StyleRuleHeader = React.memo(({ info }: StyleRuleHeaderProps) => {
//   return (
//     <styles.SelectorInfo
//       title={info.selectorText}
//       computedText={info.selectorText}
//       fileName={path.basename(info.sourceUri)}
//     />
//   );
// });
