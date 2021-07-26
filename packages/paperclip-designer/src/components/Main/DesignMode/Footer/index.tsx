import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { useSelector } from "react-redux";
import { AppState } from "../../../../state";

export const Footer = React.memo(() => {
  const state: AppState = useSelector(identity);
  if (state.designer.ui.query.expanded) {
    return null;
  }
  return <Breadcrumbs />;
});

const identity = v => v;
