import { memoize } from "paperclip-utils";
import React, {
  memo,
  ReactChild,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { envOptionClicked } from "../../../../actions";
import { useAppStore } from "../../../../hooks/useAppStore";
import { EnvOption, EnvOptionKind } from "../../../../state";
import { InfiniteScroller } from "../../../InfiniteScroller";
import { useTextInput } from "../../../TextInput";
import * as styles from "./index.pc";

type Option = {
  label: string;
} & EnvOption;

export type EnvironmentPopupProps = {
  onBlur: () => void;
};

export const EnvironmentPopup = memo(({ onBlur }: EnvironmentPopupProps) => {
  const { state, dispatch } = useAppStore();

  const options: Option[] = useMemo(() => {
    return [
      { kind: EnvOptionKind.Public, label: "public" },
      { kind: EnvOptionKind.Private, label: "localhost" },
      ...(state.availableBrowsers || []).map((browser) => {
        return {
          kind: EnvOptionKind.Browserstack,
          label: browser.browser,
          version: browser.browserVersion,
          launchOptions: browser,
        };
      }),
    ];
  }, [state.availableBrowsers]) as any;

  const [filter, setFilter] = useState<string>();
  const [visible, setVisible] = useState<boolean>();

  useEffect(() => setVisible(true), []);

  const { inputProps } = useTextInput({
    value: filter,
    onValueChange: setFilter,
  });

  const onFilterBlur = () => {
    setVisible(false);
    setTimeout(onBlur, 250);
  };

  const onOptionClick = (option: Option) => {
    dispatch(
      envOptionClicked({ option, path: location.pathname + location.search })
    );
  };

  const filteredOptions = filterOptions(filter, options);

  return (
    <styles.EnvironmentPopup
      visible={visible}
      filterInputRef={inputProps.ref}
      filterValue={inputProps.defaultValue}
      onFilterChange={inputProps.onChange}
      onFilterBlur={onFilterBlur}
      options={
        <InfiniteScroller
          size={filteredOptions.length}
          minVerticalItems={10}
          itemHeight={22}
        >
          {(cursor, maxVerticalItems) => {
            console.log(cursor, filteredOptions.length);
            return filteredOptions
              .slice(cursor, cursor + maxVerticalItems)
              .map((option) => {
                return (
                  <EnvironmentOption
                    option={option}
                    onOptionClick={onOptionClick}
                  />
                );
              });
          }}
        </InfiniteScroller>
      }
    />
  );
});

const getFilterable = memoize((option: Option) => {
  if (option.kind === EnvOptionKind.Browserstack) {
    return [
      option.launchOptions.browser,
      option.launchOptions.browserVersion,
      option.launchOptions.os,
      stripWS(option.launchOptions.os),
      option.launchOptions.osVersion,
    ].filter(Boolean);
  }
  return [option.label];
});

const stripWS = (value = "") => value.replace(/\s+/g, "");

const filterOptions = memoize((filter: string, options: Option[]) => {
  const filterParts = filter?.toLowerCase().split(" ");
  return options.filter((option) => {
    if (!filterParts) {
      return true;
    }

    const filterable = getFilterable(option)
      .filter(Boolean)
      .map((p) => p.toLowerCase());

    return filterParts.every((item) => {
      for (const filterableItem of filterable) {
        if (filterableItem.includes(item)) {
          return true;
        }
      }
    });
  });
});

type EnvironmentOptionProps = {
  option: Option;
  onOptionClick: (option: Option) => void;
};

const EnvironmentOption = ({
  option,
  onOptionClick,
}: EnvironmentOptionProps) => {
  const onClick = useCallback(() => {
    onOptionClick(option);
  }, [option]);
  return (
    <styles.EnvironmentOption
      kind={
        option.kind === EnvOptionKind.Browserstack
          ? option.launchOptions.browser
          : option.kind.toLowerCase()
      }
      onClick={onClick}
      version={option.launchOptions?.browserVersion}
      os={option.launchOptions?.os}
      osVersion={option.launchOptions?.osVersion}
    >
      {option.label.toLowerCase()}
    </styles.EnvironmentOption>
  );
};
