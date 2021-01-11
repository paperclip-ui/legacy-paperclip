import React, {
  memo,
  ReactChild,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import * as styles from "./index.pc";

type InfiniteScrollerProps = {
  size: number;
  minVerticalItems: number;
  tagName?: any;
  itemHeight: number;
  children: (
    cursor: number,
    maxVerticalItems: number
  ) => ReactChild[] | ReactChild;
};

export const InfiniteScroller = memo(
  ({
    size,
    itemHeight,
    minVerticalItems,
    tagName,
    children
  }: InfiniteScrollerProps) => {
    const ref = useRef<HTMLDivElement>();
    const [actualHeight, setActualHeight] = useState<number>(0);
    const [scrollPosition, setScrollPosition] = useState<number>(0);

    useEffect(() => {
      setScrollPosition(0);
    }, [size]);

    useEffect(() => {
      if (!ref.current) {
        return;
      }

      const calcSize = () => {
        setActualHeight(ref.current.getBoundingClientRect().height);
      };

      window.addEventListener("resize", calcSize);

      calcSize();
      return () => {
        window.removeEventListener("resize", calcSize);
      };
    }, [ref.current]);

    const onScroll = useCallback((event: React.WheelEvent<any>) => {
      setScrollPosition(ref.current.scrollTop);
    }, []);

    const scrollHeight = itemHeight * size;

    const percScroll = scrollPosition / scrollHeight;

    const resizerStyle = useMemo(() => {
      return {
        height: scrollHeight
      };
    }, [scrollHeight]);

    const contentStyle = useMemo(() => {
      const offset = scrollPosition % itemHeight;
      return {
        top: -offset,
        position: "sticky"
      };
    }, [scrollPosition, itemHeight]);

    const cursor = Math.floor(size * percScroll);
    const maxVerticalItems = Math.ceil(actualHeight / itemHeight);

    return (
      <styles.Container
        tagName={tagName}
        ref={ref}
        resizerStyle={resizerStyle}
        contentStyle={contentStyle}
        onScroll={onScroll}
      >
        {children(cursor, Math.max(minVerticalItems, maxVerticalItems))}
      </styles.Container>
    );
  }
);