import React from "react";
import { BoxNodeInfo, Point, Transform, Box } from "../../../../../../state";
import * as styles from "./index.pc";
import { clamp } from "lodash";

type Props = {
  canvasScroll: Point;
  canvasTransform: Transform;
  from: BoxNodeInfo;
  to: BoxNodeInfo;
};

const right = (box: Box) => box.x + box.width;
const bottom = (box: Box) => box.y + box.height;

export const Distance = ({
  from,
  to,
  canvasScroll,
  canvasTransform
}: Props) => {
  const sticks = [];

  // top most
  const tm = Math.min(from.box.y, to.box.y);

  // bottom most
  const bm = Math.max(bottom(from.box), bottom(to.box));

  // west edge
  // const se = to.box.y > from.box.x ? right(to.box) : to.box.x;
  const we = right(to.box) < from.box.x ? right(to.box) : to.box.x;

  // west stick
  if (we < from.box.x) {
    const distance = from.box.x - we;
    const top = from.box.y + from.box.height / 2;
    const isBelow = to.box.y > bottom(from.box);
    sticks.push(
      <styles.MeasuringStick
        key="west"
        horizontal
        flipLabel={isBelow}
        distance={Math.round(distance)}
        style={{
          left: we * canvasTransform.z,
          width: (distance - 4) * canvasTransform.z,
          top
        }}
      />
    );

    if (isBelow) {
      sticks.push(
        <styles.Guide
          key="west-vertical-guide"
          style={{
            left: we * canvasTransform.z,
            height: to.box.y - bottom(from.box),
            top
          }}
        />
      );
    }
  }

  return (
    <styles.Container
      style={{
        transform: `translateX(${-canvasScroll.x * canvasTransform.z +
          canvasTransform.x}px) translateY(${-canvasScroll.y *
          canvasTransform.z +
          canvasTransform.y}px)`
      }}
    >
      {sticks}
      <styles.ToOutline
        style={{
          transform: `translateX(${to.box.x *
            canvasTransform.z}px) translateY(${to.box.y *
            canvasTransform.z}px)`,
          width: to.box.width * canvasTransform.z,
          height: to.box.height * canvasTransform.z,
          transformOrigin: `top left`
        }}
      />
    </styles.Container>
  );
};
