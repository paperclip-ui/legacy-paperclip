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
  itemHeight: number;
  children: (cursor: number, maxVerticalItems: number) => ReactChild[];
};

export const InfiniteScroller = memo(
  ({ size, itemHeight, minVerticalItems, children }: InfiniteScrollerProps) => {
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

    const style = useMemo(() => {
      return {
        height: itemHeight * size
      };
    }, [size, itemHeight]);

    const cursor = Math.round(size * percScroll);
    const maxVerticalItems = Math.ceil(actualHeight / itemHeight);

    return (
      <styles.Container ref={ref} resizerStyle={style} onScroll={onScroll}>
        {children(cursor, Math.max(minVerticalItems, maxVerticalItems))}
      </styles.Container>
    );
  }
);
