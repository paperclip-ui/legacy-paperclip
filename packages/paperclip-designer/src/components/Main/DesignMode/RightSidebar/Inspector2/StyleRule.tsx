import React from "react";
import {
  SelectorInfo,
  StyleRuleInfo,
  SelectorInfoKind,
  memoize,
  TargetSelectorInfo,
  ClassSelectorInfo,
  BaseSelectorInfo
} from "paperclip-utils";
import * as styles from "./index.pc";
import * as path from "path";
import { StyleDeclaration } from "./Declaration";
import { useAppStore } from "../../../../../hooks/useAppStore";
import { virtualStyleDeclarationValueChanged } from "../../../../../actions";
import { SelectorScopeKind } from "paperclip-utils";

export type StyleRuleProps = {
  info: StyleRuleInfo;
};

export const StyleRule = React.memo(({ info }: StyleRuleProps) => {
  const { dispatch } = useAppStore();

  const onDeclarationValueChange = (
    declarationId: string,
    name: string,
    value: string
  ) => {
    dispatch(
      virtualStyleDeclarationValueChanged({
        declarationId,
        name,
        value
      })
    );
  };

  return (
    <styles.StyleRule
      isGlobal={isSelectorPartiallyGlobal(info.selectorInfo)}
      fileName={path.basename(info.sourceUri)}
      selector={generateSelector(info.selectorInfo)}
      properties={info.declarations.map((declaration, i) => {
        return (
          <StyleDeclaration
            key={i}
            info={declaration}
            onValueChange={value => {
              onDeclarationValueChange(
                declaration.sourceId,
                declaration.name,
                value
              );
            }}
          />
        );
      })}
    />
  );
});

const isSelectorPartiallyGlobal = memoize((info: SelectorInfo) => {
  switch (info.kind) {
    // VERY crude approach to remove scope selectors + extra specificity. Ideally
    // this information would be included in the evaluated CSSOM output, instead of
    // doing guesswork here. This will fail if someone does something like :global([class].div), but
    // I suppose nobody would realistically do that.
    case SelectorInfoKind.Combo: {
      return !info.selectors.some(selector => {
        return isClassScopeSelector(selector);
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

const isClassScopeSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return (
    info != null && isClassSelector(info) && !info.name && info.scope != null
  );
};

const isClassElementScopeSelector = (
  info: BaseSelectorInfo<any>
): info is ClassSelectorInfo => {
  return (
    isClassScopeSelector(info) && info.scope.kind === SelectorScopeKind.Element
  );
};

const generateSelector = memoize((info: SelectorInfo) => {
  switch (info.kind) {
    // VERY crude approach to remove scope selectors + extra specificity. Ideally
    // this information would be included in the evaluated CSSOM output, instead of
    // doing guesswork here. This will fail if someone does something like :global([class].div), but
    // I suppose nobody would realistically do that.
    case SelectorInfoKind.Combo: {
      const cleanedSelectors = info.selectors.concat();

      if (cleanedSelectors.length === 2) {
        // remove extra specificity. Classes use special [class] attribute
        // since they need to pierce through documents
        if (
          (cleanedSelectors[0] as TargetSelectorInfo<any>).value ===
            "[class]" &&
          cleanedSelectors[1].kind === SelectorInfoKind.Class
        ) {
          cleanedSelectors.shift();

          // for everything else, specificity is added at the end of the selector.
        } else if (isClassScopeSelector(cleanedSelectors[1])) {
          cleanedSelectors.pop();
        }
      }

      if (cleanedSelectors.length > 2) {
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
        if (info.scope.kind === SelectorScopeKind.Document) {
          return "*";
        } else {
          return <styles.ScopedElementSelector />;
        }
      } else {
        return "." + info.name;
      }
    }
    case SelectorInfoKind.Sibling: {
      return [
        generateSelector(info.left as SelectorInfo),
        " ~ ",
        generateSelector(info.right as SelectorInfo)
      ];
    }
    case SelectorInfoKind.Adjacent: {
      return [
        generateSelector(info.left as SelectorInfo),
        " + ",
        generateSelector(info.right as SelectorInfo)
      ];
    }
    case SelectorInfoKind.Descendent: {
      return [
        generateSelector(info.left as SelectorInfo),
        " ",
        generateSelector(info.right as SelectorInfo)
      ];
    }
    case SelectorInfoKind.Child: {
      return [
        generateSelector(info.left as SelectorInfo),
        " > ",
        generateSelector(info.right as SelectorInfo)
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
