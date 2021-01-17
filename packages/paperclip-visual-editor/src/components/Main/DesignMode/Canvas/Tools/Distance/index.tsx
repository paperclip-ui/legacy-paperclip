// 🙈

import React from "react";
import {
  BoxNodeInfo,
  Point,
  Transform,
  Box,
  boxIntersectsPoint,
} from "../../../../../../state";
import * as styles from "./index.pc";
import { clamp } from "lodash";

type Props = {
  canvasScroll: Point;
  canvasTransform: Transform;
  from: Box;
  to: Box;
};

const right = (box: Box) => box.x + box.width;
const bottom = (box: Box) => box.y + box.height;

export const Distance = ({
  from,
  to,
  canvasScroll,
  canvasTransform,
}: Props) => {
  const sticks = [];

  // west edge
  // const se = to.y > from.x ? right(to) : to.x;
  const ne = bottom(to) < from.y ? bottom(to) : to.y;
  const ee = to.x > right(from) ? to.x : right(to);
  const se = to.y > bottom(from) ? to.y : bottom(to);
  const we = right(to) < from.x ? right(to) : to.x;

  if (ne < from.y) {
    const distance = from.y - ne;
    const left = from.x + from.width / 2;
    const isLeft = right(to) < left;
    const isRight = to.x > left;
    sticks.push(
      <styles.MeasuringStick
        key="north"
        vertical
        flipLabel={isRight}
        distance={Math.round(distance)}
        style={{
          left: left * canvasTransform.z,
          height: distance * canvasTransform.z - 3,
          top: ne * canvasTransform.z,
        }}
      />
    );

    if (isLeft) {
      sticks.push(
        <styles.Guide
          key="north-west-guide"
          style={{
            left: right(to) * canvasTransform.z,
            width: (left - right(to)) * canvasTransform.z,
            top: ne * canvasTransform.z,
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
            width: (to.x - left) * canvasTransform.z,
            top: ne * canvasTransform.z,
          }}
        />
      );
    }
  }

  if (ee > right(from)) {
    const distance = ee - right(from);
    const left = right(from);
    const top = from.y + from.height / 2;
    const isAbove = bottom(to) < top;
    const isBelow = to.y > top;
    sticks.push(
      <styles.MeasuringStick
        key="east"
        horizontal
        flipLabel={isBelow}
        distance={Math.round(distance)}
        style={{
          left: left * canvasTransform.z + 3,
          width: distance * canvasTransform.z - 3,
          top: top * canvasTransform.z,
        }}
      />
    );

    if (isAbove) {
      sticks.push(
        <styles.Guide
          key="east-north-guide"
          style={{
            left: (left + distance) * canvasTransform.z,
            height: (top - bottom(to)) * canvasTransform.z,
            top: bottom(to) * canvasTransform.z,
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
            height: (to.y - top) * canvasTransform.z,
            top: top * canvasTransform.z,
          }}
        />
      );
    }
  }

  if (we < from.x) {
    const distance = from.x - we;
    const top = from.y + from.height / 2;
    const isBelow = to.y > top;
    const isAbove = bottom(to) < top;
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
          top: top * canvasTransform.z,
        }}
      />
    );

    if (isBelow) {
      sticks.push(
        <styles.Guide
          key="west-south-guide"
          style={{
            left: left * canvasTransform.z,
            height: (to.y - bottom(from) + from.height / 2) * canvasTransform.z,
            top: top * canvasTransform.z,
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
            height: (top - bottom(to)) * canvasTransform.z,
            top: bottom(to) * canvasTransform.z,
          }}
        />
      );
    }
  }

  if (se > bottom(from)) {
    const distance = se - bottom(from);
    const left = from.x + from.width / 2;
    const isLeft = right(to) < left;
    const isRight = to.x > left;

    sticks.push(
      <styles.MeasuringStick
        key="south"
        vertical
        flipLabel={!isLeft}
        distance={Math.round(distance)}
        style={{
          top: bottom(from) * canvasTransform.z + 3,
          height: distance * canvasTransform.z - 3,
          left: left * canvasTransform.z,
        }}
      />
    );

    if (isLeft) {
      sticks.push(
        <styles.Guide
          key="south-west-guide"
          style={{
            left: right(to) * canvasTransform.z,
            width: (left - right(to)) * canvasTransform.z,
            top: (bottom(from) + distance) * canvasTransform.z,
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
            width: (to.x - left) * canvasTransform.z,
            top: (bottom(from) + distance) * canvasTransform.z,
          }}
        />
      );
    }
  }

  return (
    <styles.Container
      style={{
        transform: `translateX(${
          -canvasScroll.x * canvasTransform.z + canvasTransform.x
        }px) translateY(${
          -canvasScroll.y * canvasTransform.z + canvasTransform.y
        }px)`,
      }}
    >
      {sticks}
      <styles.ToOutline
        style={{
          transform: `translateX(${to.x * canvasTransform.z}px) translateY(${
            to.y * canvasTransform.z
          }px)`,
          width: to.width * canvasTransform.z,
          height: to.height * canvasTransform.z,
          transformOrigin: `top left`,
        }}
      />
    </styles.Container>
  );
};
