// 🙈

import React from "react";
import {
  BoxNodeInfo,
  Point,
  Transform,
  Box,
  boxIntersectsPoint
} from "../../../../../../state";
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

  // west edge
  // const se = to.box.y > from.box.x ? right(to.box) : to.box.x;
  const ne = bottom(to.box) < from.box.y ? bottom(to.box) : to.box.y;
  const ee = to.box.x > right(from.box) ? to.box.x : right(to.box);
  const se = to.box.y > bottom(from.box) ? to.box.y : bottom(to.box);
  const we = right(to.box) < from.box.x ? right(to.box) : to.box.x;

  if (ne < from.box.y) {
    const distance = from.box.y - ne;
    const left = from.box.x + from.box.width / 2;
    const isLeft = right(to.box) < left;
    const isRight = to.box.x > left;
    sticks.push(
      <styles.MeasuringStick
        key="north"
        vertical
        flipLabel={false}
        distance={Math.round(distance)}
        style={{
          left: left * canvasTransform.z,
          height: distance * canvasTransform.z - 3,
          top: ne * canvasTransform.z
        }}
      />
    );

    if (isLeft) {
      sticks.push(
        <styles.Guide
          key="north-west-guide"
          style={{
            left: right(to.box) * canvasTransform.z,
            width: (left - right(to.box)) * canvasTransform.z,
            top: ne * canvasTransform.z
          }}
        />
      );
    }
    if (isRight) {
      sticks.push(
        <styles.Guide
          key="north-east-guide"
          style={{
            left: left * canvasTransform.z,
            width: (to.box.x - left) * canvasTransform.z,
            top: ne * canvasTransform.z
          }}
        />
      );
    }
  }

  if (ee > right(from.box)) {
    const distance = ee - right(from.box);
    const left = right(from.box);
    const top = from.box.y + from.box.height / 2;
    const isAbove = bottom(to.box) < top;
    const isBelow = to.box.y > bottom(from.box);
    sticks.push(
      <styles.MeasuringStick
        key="east"
        horizontal
        flipLabel={false}
        distance={Math.round(distance)}
        style={{
          left: left * canvasTransform.z + 3,
          width: distance * canvasTransform.z - 3,
          top: top * canvasTransform.z
        }}
      />
    );

    if (isAbove) {
      sticks.push(
        <styles.Guide
          key="east-north-guide"
          style={{
            left: (left + distance) * canvasTransform.z,
            height: (top - bottom(to.box)) * canvasTransform.z,
            top: bottom(to.box) * canvasTransform.z
          }}
        />
      );
    }

    if (isBelow) {
      sticks.push(
        <styles.Guide
          key="east-south-guide"
          style={{
            left: (left + distance) * canvasTransform.z,
            height: (bottom(to.box) - top) * canvasTransform.z,
            top: top * canvasTransform.z
          }}
        />
      );
    }
  }

  if (we < from.box.x) {
    const distance = from.box.x - we;
    const top = from.box.y + from.box.height / 2;
    const isBelow = to.box.y > bottom(from.box);
    const isAbove = bottom(to.box) < from.box.y;
    const left = we;
    sticks.push(
      <styles.MeasuringStick
        key="west"
        horizontal
        flipLabel={isBelow}
        distance={Math.round(distance)}
        style={{
          left: left * canvasTransform.z,
          width: distance * canvasTransform.z - 3,
          top: top * canvasTransform.z
        }}
      />
    );

    if (isBelow) {
      sticks.push(
        <styles.Guide
          key="west-south-guide"
          style={{
            left: left * canvasTransform.z,
            height:
              (to.box.y - bottom(from.box) + from.box.height / 2) *
              canvasTransform.z,
            top: top * canvasTransform.z
          }}
        />
      );
    }

    if (isAbove) {
      sticks.push(
        <styles.Guide
          key="west-north-guide"
          style={{
            left: left * canvasTransform.z,
            height: (top - bottom(to.box)) * canvasTransform.z,
            top: bottom(to.box) * canvasTransform.z
          }}
        />
      );
    }
  }

  if (se > bottom(from.box)) {
    const distance = se - bottom(from.box);
    const left = from.box.x + from.box.width / 2;
    const isLeft = right(to.box) < left;
    const isRight = to.box.x > left;

    sticks.push(
      <styles.MeasuringStick
        key="south"
        vertical
        flipLabel={!isLeft}
        distance={Math.round(distance)}
        style={{
          top: bottom(from.box) * canvasTransform.z + 3,
          height: distance * canvasTransform.z - 3,
          left: left * canvasTransform.z
        }}
      />
    );

    if (isLeft) {
      sticks.push(
        <styles.Guide
          key="south-west-guide"
          style={{
            left: right(to.box) * canvasTransform.z,
            width: (left - right(to.box)) * canvasTransform.z,
            top: (bottom(from.box) + distance) * canvasTransform.z
          }}
        />
      );
    }
    if (isRight) {
      sticks.push(
        <styles.Guide
          key="south-east-guide"
          style={{
            left: left * canvasTransform.z,
            width: (to.box.x - left) * canvasTransform.z,
            top: (bottom(from.box) + distance) * canvasTransform.z
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
