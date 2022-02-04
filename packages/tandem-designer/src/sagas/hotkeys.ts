import Mousetrap, { addKeycodes } from "mousetrap";
import { put, take, select } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as qs from "querystring";
import {
  globalEscapeKeyPressed,
  globalBackspaceKeyPressed,
  globalMetaKeyDown,
  globalZKeyDown,
  globalYKeyDown,
  globalMetaIKeyPressed,
  globalMetaKeyUp,
  globalSaveKeyPress,
  globalHKeyDown,
  gridHotkeyPressed,
  zoomOutKeyPressed,
  zoomInKeyPressed,
  globalOptionKeyDown,
  globalOptionKeyUp,
} from "../actions";
import { AppState } from "../state";

export function* handleKeyCommands(mount: HTMLElement) {
  const state: AppState = yield select();

  // if compact, then only capture events on mount, othwewise we'll expect
  // the designer to take the whole page.
  const keyBindingMount = state.compact ? mount : document;
  const embedded = state.designer.ui.query.embedded;
  const chan = eventChannel((emit) => {
    const handler = new Mousetrap(keyBindingMount);
    handler.bind("esc", (e) => {
      if (isInput(e.target)) {
        return;
      }
      emit(globalEscapeKeyPressed(null));
      return false;
    });
    handler.bind("meta", () => {
      emit(globalMetaKeyDown(null));
    });
    handler.bind(
      "meta",
      () => {
        emit(globalMetaKeyUp(null));
      },
      "keyup"
    );
    handler.bind("option", () => {
      emit(globalOptionKeyDown(null));
    });
    handler.bind(
      "option",
      () => {
        emit(globalOptionKeyUp(null));
      },
      "keyup"
    );
    handler.bind("meta+z", () => {
      emit(globalZKeyDown(null));
      return false;
    });
    handler.bind("meta+y", () => {
      emit(globalYKeyDown(null));
      return false;
    });
    handler.bind("meta+h", () => {
      emit(globalHKeyDown(null));
      return false;
    });
    handler.bind("meta+g", () => {
      emit(gridHotkeyPressed(null));
      return false;
    });
    handler.bind("meta+=", () => {
      emit(zoomInKeyPressed(null));
      return false;
    });
    handler.bind("meta+-", () => {
      emit(zoomOutKeyPressed(null));
      return false;
    });
    handler.bind("i", (e) => {
      if (isInput(e.target)) {
        return;
      }
      emit(globalMetaIKeyPressed(null));
      return false;
    });
    handler.bind("meta+s", (e) => {
      emit(globalSaveKeyPress(null));
      if (!embedded) {
        e.preventDefault();
      }
      return !embedded;
    });
    handler.bind("meta+shift+z", () => {
      emit(globalYKeyDown(null));
      return false;
    });
    handler.bind("backspace", (e) => {
      if (isInput(e.target)) {
        return;
      }
      emit(globalBackspaceKeyPressed(null));
      return false;
    });

    // https://github.com/ccampbell/mousetrap/pull/215
    addKeycodes({ 173: "-" });

    // eslint-disable-next-line
    return () => {};
  });

  while (1) {
    yield put(yield take(chan));
  }
}

const isInput = (node: HTMLElement) =>
  /textarea|input/.test(node.tagName.toLowerCase());
