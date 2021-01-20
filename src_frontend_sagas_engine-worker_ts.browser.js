/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/frontend/actions/base.ts":
/*!**************************************!*\
  !*** ./src/frontend/actions/base.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "actionCreator": () => /* binding */ actionCreator
/* harmony export */ });
var actionCreator = function (type) { return function (payload) { return ({
    type: type,
    payload: payload,
}); }; };


/***/ }),

/***/ "./src/frontend/actions/index.ts":
/*!***************************************!*\
  !*** ./src/frontend/actions/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* binding */ ActionType,
/* harmony export */   "AccountKind": () => /* binding */ AccountKind,
/* harmony export */   "accountConnected": () => /* binding */ accountConnected,
/* harmony export */   "logoutButtonClicked": () => /* binding */ logoutButtonClicked,
/* harmony export */   "sessionLoaded": () => /* binding */ sessionLoaded,
/* harmony export */   "savedProject": () => /* binding */ savedProject,
/* harmony export */   "loggedOut": () => /* binding */ loggedOut,
/* harmony export */   "engineLoaded": () => /* binding */ engineLoaded,
/* harmony export */   "engineCrashed": () => /* binding */ engineCrashed,
/* harmony export */   "saveButtonClicked": () => /* binding */ saveButtonClicked,
/* harmony export */   "codeEditorChanged": () => /* binding */ codeEditorChanged,
/* harmony export */   "workerInitialized": () => /* binding */ workerInitialized,
/* harmony export */   "appStateDiffed": () => /* binding */ appStateDiffed,
/* harmony export */   "contentChangesCreated": () => /* binding */ contentChangesCreated,
/* harmony export */   "newFileNameEntered": () => /* binding */ newFileNameEntered,
/* harmony export */   "fileItemClicked": () => /* binding */ fileItemClicked,
/* harmony export */   "syncPanelsClicked": () => /* binding */ syncPanelsClicked,
/* harmony export */   "getProjectRequestChanged": () => /* binding */ getProjectRequestChanged,
/* harmony export */   "getProjectsRequestChanged": () => /* binding */ getProjectsRequestChanged,
/* harmony export */   "getProjectFilesRequestChanged": () => /* binding */ getProjectFilesRequestChanged,
/* harmony export */   "projectHookUsed": () => /* binding */ projectHookUsed,
/* harmony export */   "projectFilesHookUsed": () => /* binding */ projectFilesHookUsed,
/* harmony export */   "allProjectsHookUsed": () => /* binding */ allProjectsHookUsed
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/frontend/actions/base.ts");

var ActionType;
(function (ActionType) {
    ActionType["PROJECT_HOOK_USED"] = "PROJECT_HOOK_USED";
    ActionType["ALL_PROJECTS_HOOK_USED"] = "ALL_PROJECTS_HOOK_USED";
    ActionType["PROJECT_FILES_HOOK_USED"] = "PROJECT_FILES_HOOK_USED";
    ActionType["REQUEST_CHANGED"] = "REQUEST_CHANGED";
    ActionType["ENGINE_LOADED"] = "ENGINE_LOADED";
    ActionType["GET_PROJECTS_REQUEST_CHANGED"] = "GET_PROJECTS_REQUEST_CHANGED";
    ActionType["GET_PROJECT_REQUEST_CHANGED"] = "GET_PROJECT_REQUEST_CHANGED";
    ActionType["GET_PROJECT_FILES_REQUEST_CHANGED"] = "GET_PROJECT_FILES_REQUEST_CHANGED";
    ActionType["LOGOUT_BUTTON_CLICKED"] = "LOGOUT_BUTTON_CLICKED";
    ActionType["ENGINE_CRASHED"] = "ENGINE_CRASHED";
    ActionType["SAVED_PROJECT"] = "SAVED_PROJECT";
    ActionType["SAVE_BUTTON_CLICKED"] = "SAVE_BUTTON_CLICKED";
    ActionType["LOGGED_OUT"] = "LOGGED_OUT";
    ActionType["SESSION_LOADED"] = "SESSION_LOADED";
    ActionType["CODE_EDITOR_TEXT_CHANGED"] = "CODE_EDITOR_TEXT_CHANGED";
    ActionType["WORKER_INITIALIZED"] = "WORKER_INITIALIZED";
    ActionType["APP_STATE_DIFFED"] = "APP_STATE_DIFFED";
    ActionType["CONTENT_CHANGES_CREATED"] = "CONTENT_CHANGES_CREATED";
    ActionType["FILE_ITEM_CLICKED"] = "FILE_ITEM_CLICKED";
    ActionType["NEW_FILE_NAME_ENTERED"] = "NEW_FILE_NAME_ENTERED";
    ActionType["SYNC_PANELS_CLICKED"] = "SYNC_PANELS_CLICKED";
    ActionType["ACCOUNT_CONNECTED"] = "ACCOUNT_CONNECTED";
})(ActionType || (ActionType = {}));
var AccountKind;
(function (AccountKind) {
    AccountKind["Google"] = "google";
    AccountKind["GitHub"] = "github";
})(AccountKind || (AccountKind = {}));
var accountConnected = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ACCOUNT_CONNECTED);
var logoutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOGOUT_BUTTON_CLICKED);
var sessionLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SESSION_LOADED);
var savedProject = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SAVED_PROJECT);
var loggedOut = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOGGED_OUT);
var engineLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_LOADED);
var engineCrashed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_CRASHED);
var saveButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SAVE_BUTTON_CLICKED);
var codeEditorChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CODE_EDITOR_TEXT_CHANGED);
var workerInitialized = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.WORKER_INITIALIZED);
var appStateDiffed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.APP_STATE_DIFFED);
var contentChangesCreated = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CONTENT_CHANGES_CREATED);
var newFileNameEntered = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.NEW_FILE_NAME_ENTERED);
var fileItemClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILE_ITEM_CLICKED);
var syncPanelsClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.SYNC_PANELS_CLICKED);
var getProjectRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECT_REQUEST_CHANGED);
var getProjectsRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECTS_REQUEST_CHANGED);
var getProjectFilesRequestChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_PROJECT_FILES_REQUEST_CHANGED);
var projectHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PROJECT_HOOK_USED);
var projectFilesHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PROJECT_FILES_HOOK_USED);
var allProjectsHookUsed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ALL_PROJECTS_HOOK_USED);


/***/ }),

/***/ "./src/frontend/sagas/engine-worker.ts":
/*!*********************************************!*\
  !*** ./src/frontend/sagas/engine-worker.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions */ "./src/frontend/actions/index.ts");
/* harmony import */ var paperclip_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! paperclip/browser */ "../paperclip/browser.js");
/* harmony import */ var paperclip_visual_editor_src_actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-visual-editor/src/actions */ "../paperclip-visual-editor/src/actions/index.ts");
/* harmony import */ var fast_json_patch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fast-json-patch */ "../../node_modules/fast-json-patch/index.mjs");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! paperclip-source-writer */ "../paperclip-source-writer/lib/index.js");
/* harmony import */ var paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _appState, _engine, _writer, _currentUri, dispatch, onCrash, handleInitialized, onEngineEvent, onEngineInit, tryOpeningCurrentFile, handleAppStateDiffed, handleCodeChange, handleVirtObjectEdited, handleContentChanges, handleRedirect;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dispatch = function (action) {
                    self.postMessage(action);
                };
                onCrash = function (e) {
                    dispatch((0,_actions__WEBPACK_IMPORTED_MODULE_0__.engineCrashed)(e));
                };
                handleInitialized = function (_a) {
                    var appState = _a.payload.appState;
                    _appState = appState;
                    tryOpeningCurrentFile();
                };
                onEngineEvent = function (event) {
                    dispatch((0,paperclip_visual_editor_src_actions__WEBPACK_IMPORTED_MODULE_2__.engineDelegateChanged)(event));
                };
                onEngineInit = function () {
                    _writer = new paperclip_source_writer__WEBPACK_IMPORTED_MODULE_5__.PCSourceWriter({
                        engine: _engine,
                        getContent: function (uri) { return _appState.designMode.documentContents[uri]; },
                    });
                    dispatch((0,_actions__WEBPACK_IMPORTED_MODULE_0__.engineLoaded)(null));
                    tryOpeningCurrentFile();
                };
                tryOpeningCurrentFile = function () {
                    if (_appState.designMode.ui.query.currentFileUri &&
                        _engine &&
                        (!_currentUri ||
                            _currentUri !== _appState.designMode.ui.query.currentFileUri)) {
                        _currentUri = _appState.designMode.ui.query.currentFileUri;
                        _engine.open(_appState.designMode.ui.query.currentFileUri);
                    }
                };
                handleAppStateDiffed = function (_a) {
                    var ops = _a.payload.ops;
                    return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            _appState = (0,fast_json_patch__WEBPACK_IMPORTED_MODULE_3__.applyPatch)(_appState, ops, false, false).newDocument;
                            return [2 /*return*/];
                        });
                    });
                };
                handleCodeChange = function (action) {
                    _engine.updateVirtualFileContent(_appState.currentCodeFileUri, action.payload);
                };
                handleVirtObjectEdited = function (action) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _a = dispatch;
                                _b = _actions__WEBPACK_IMPORTED_MODULE_0__.contentChangesCreated;
                                _c = {};
                                return [4 /*yield*/, _writer.getContentChanges(action.payload.mutations)];
                            case 1:
                                _a.apply(void 0, [_b.apply(void 0, [(_c.changes = _d.sent(),
                                            _c)])]);
                                return [2 /*return*/];
                        }
                    });
                }); };
                handleContentChanges = function (_a) {
                    var changes = _a.payload.changes;
                    for (var uri in changes) {
                        _engine.updateVirtualFileContent(uri, _appState.designMode.documentContents[uri]);
                    }
                };
                handleRedirect = function (action) {
                    tryOpeningCurrentFile();
                };
                self.onmessage = function (_a) {
                    var action = _a.data;
                    switch (action.type) {
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.WORKER_INITIALIZED:
                            return handleInitialized(action);
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.APP_STATE_DIFFED:
                            return handleAppStateDiffed(action);
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.CODE_EDITOR_TEXT_CHANGED:
                            return handleCodeChange(action);
                        case paperclip_visual_editor_src_actions__WEBPACK_IMPORTED_MODULE_2__.ActionType.REDIRECT_REQUESTED:
                            return handleRedirect(action);
                        case paperclip_visual_editor_src_actions__WEBPACK_IMPORTED_MODULE_2__.ActionType.PC_VIRT_OBJECT_EDITED:
                            return handleVirtObjectEdited(action);
                        case _actions__WEBPACK_IMPORTED_MODULE_0__.ActionType.CONTENT_CHANGES_CREATED:
                            return handleContentChanges(action);
                    }
                };
                return [4 /*yield*/, (0,paperclip_browser__WEBPACK_IMPORTED_MODULE_1__.loadEngineDelegate)({
                        io: {
                            readFile: function (uri) {
                                return _appState.designMode.documentContents[uri];
                            },
                            fileExists: function (uri) {
                                return _appState.designMode.documentContents[uri] != null;
                            },
                            resolveFile: function (fromPath, toPath) {
                                return url__WEBPACK_IMPORTED_MODULE_4__.resolve(fromPath, toPath);
                            },
                        },
                    }, onCrash)];
            case 1:
                _engine = _a.sent();
                _engine.onEvent(onEngineEvent);
                onEngineInit();
                return [2 /*return*/];
        }
    });
}); };
init();


/***/ }),

/***/ "../paperclip-visual-editor/src/actions/base.ts":
/*!******************************************************!*\
  !*** ../paperclip-visual-editor/src/actions/base.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "actionCreator": () => /* binding */ actionCreator
/* harmony export */ });
var actionCreator = function (type) { return function (payload) { return ({
    type: type,
    payload: payload
}); }; };


/***/ }),

/***/ "../paperclip-visual-editor/src/actions/external-actions.ts":
/*!******************************************************************!*\
  !*** ../paperclip-visual-editor/src/actions/external-actions.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ExternalActionType": () => /* binding */ ExternalActionType,
/* harmony export */   "contentChanged": () => /* binding */ contentChanged,
/* harmony export */   "configChanged": () => /* binding */ configChanged
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-visual-editor/src/actions/base.ts");

var ExternalActionType;
(function (ExternalActionType) {
    ExternalActionType["CONTENT_CHANGED"] = "CONTENT_CHANGED";
    ExternalActionType["CONFIG_CHANGED"] = "CONFIG_CHANGED";
})(ExternalActionType || (ExternalActionType = {}));
var contentChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ExternalActionType.CONTENT_CHANGED);
var configChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ExternalActionType.CONFIG_CHANGED);


/***/ }),

/***/ "../paperclip-visual-editor/src/actions/index.ts":
/*!*******************************************************!*\
  !*** ../paperclip-visual-editor/src/actions/index.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.ActionType,
/* harmony export */   "birdseyeFilterChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.birdseyeFilterChanged,
/* harmony export */   "birdseyeTopFilterBlurred": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.birdseyeTopFilterBlurred,
/* harmony export */   "canvasMouseLeave": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseLeave,
/* harmony export */   "canvasMouseMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseMoved,
/* harmony export */   "canvasMouseUp": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasMouseUp,
/* harmony export */   "canvasPanEnd": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanEnd,
/* harmony export */   "canvasPanStart": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanStart,
/* harmony export */   "canvasPanned": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasPanned,
/* harmony export */   "canvasResized": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.canvasResized,
/* harmony export */   "clientConnected": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.clientConnected,
/* harmony export */   "collapseFrameButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.collapseFrameButtonClicked,
/* harmony export */   "dirLoaded": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.dirLoaded,
/* harmony export */   "engineDelegateChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineDelegateChanged,
/* harmony export */   "engineDelegateEventsHandled": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineDelegateEventsHandled,
/* harmony export */   "engineErrored": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.engineErrored,
/* harmony export */   "envOptionClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.envOptionClicked,
/* harmony export */   "errorBannerClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.errorBannerClicked,
/* harmony export */   "expandFrameButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.expandFrameButtonClicked,
/* harmony export */   "fileOpened": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.fileOpened,
/* harmony export */   "frameTitleChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.frameTitleChanged,
/* harmony export */   "frameTitleClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.frameTitleClicked,
/* harmony export */   "fsItemClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.fsItemClicked,
/* harmony export */   "getAllScreensRequested": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.getAllScreensRequested,
/* harmony export */   "globalBackspaceKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalBackspaceKeyPressed,
/* harmony export */   "globalBackspaceKeySent": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalBackspaceKeySent,
/* harmony export */   "globalEscapeKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalEscapeKeyPressed,
/* harmony export */   "globalHKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalHKeyDown,
/* harmony export */   "globalMetaKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalMetaKeyDown,
/* harmony export */   "globalMetaKeyUp": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalMetaKeyUp,
/* harmony export */   "globalSaveKeyPress": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalSaveKeyPress,
/* harmony export */   "globalYKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalYKeyDown,
/* harmony export */   "globalZKeyDown": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.globalZKeyDown,
/* harmony export */   "gridButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.gridButtonClicked,
/* harmony export */   "gridHotkeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.gridHotkeyPressed,
/* harmony export */   "locationChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.locationChanged,
/* harmony export */   "metaClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.metaClicked,
/* harmony export */   "pasted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pasted,
/* harmony export */   "pcFileLoaded": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pcFileLoaded,
/* harmony export */   "pcVirtObjectEdited": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.pcVirtObjectEdited,
/* harmony export */   "popoutButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.popoutButtonClicked,
/* harmony export */   "popoutWindowRequested": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.popoutWindowRequested,
/* harmony export */   "rectsCaptured": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rectsCaptured,
/* harmony export */   "redirectRequest": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.redirectRequest,
/* harmony export */   "rendererChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererChanged,
/* harmony export */   "rendererMounted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererMounted,
/* harmony export */   "rendererUnounted": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.rendererUnounted,
/* harmony export */   "resizerMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerMoved,
/* harmony export */   "resizerPathMoved": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerPathMoved,
/* harmony export */   "resizerPathStoppedMoving": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerPathStoppedMoving,
/* harmony export */   "resizerStoppedMoving": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.resizerStoppedMoving,
/* harmony export */   "titleDoubleClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.titleDoubleClicked,
/* harmony export */   "zoomInButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInButtonClicked,
/* harmony export */   "zoomInKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInKeyPressed,
/* harmony export */   "zoomInputChanged": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomInputChanged,
/* harmony export */   "zoomOutButtonClicked": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomOutButtonClicked,
/* harmony export */   "zoomOutKeyPressed": () => /* reexport safe */ _instance_actions__WEBPACK_IMPORTED_MODULE_0__.zoomOutKeyPressed,
/* harmony export */   "ServerActionType": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.ServerActionType,
/* harmony export */   "allPCContentLoaded": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.allPCContentLoaded,
/* harmony export */   "browserstackBrowsersLoaded": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.browserstackBrowsersLoaded,
/* harmony export */   "crashed": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.crashed,
/* harmony export */   "initParamsDefined": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.initParamsDefined,
/* harmony export */   "instanceChanged": () => /* reexport safe */ _server_actions__WEBPACK_IMPORTED_MODULE_1__.instanceChanged,
/* harmony export */   "ExternalActionType": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.ExternalActionType,
/* harmony export */   "configChanged": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.configChanged,
/* harmony export */   "contentChanged": () => /* reexport safe */ _external_actions__WEBPACK_IMPORTED_MODULE_2__.contentChanged
/* harmony export */ });
/* harmony import */ var _instance_actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./instance-actions */ "../paperclip-visual-editor/src/actions/instance-actions.ts");
/* harmony import */ var _server_actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./server-actions */ "../paperclip-visual-editor/src/actions/server-actions.ts");
/* harmony import */ var _external_actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./external-actions */ "../paperclip-visual-editor/src/actions/external-actions.ts");





/***/ }),

/***/ "../paperclip-visual-editor/src/actions/instance-actions.ts":
/*!******************************************************************!*\
  !*** ../paperclip-visual-editor/src/actions/instance-actions.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActionType": () => /* binding */ ActionType,
/* harmony export */   "pcVirtObjectEdited": () => /* binding */ pcVirtObjectEdited,
/* harmony export */   "engineDelegateChanged": () => /* binding */ engineDelegateChanged,
/* harmony export */   "gridButtonClicked": () => /* binding */ gridButtonClicked,
/* harmony export */   "frameTitleClicked": () => /* binding */ frameTitleClicked,
/* harmony export */   "frameTitleChanged": () => /* binding */ frameTitleChanged,
/* harmony export */   "titleDoubleClicked": () => /* binding */ titleDoubleClicked,
/* harmony export */   "rendererMounted": () => /* binding */ rendererMounted,
/* harmony export */   "rendererUnounted": () => /* binding */ rendererUnounted,
/* harmony export */   "birdseyeFilterChanged": () => /* binding */ birdseyeFilterChanged,
/* harmony export */   "redirectRequest": () => /* binding */ redirectRequest,
/* harmony export */   "engineDelegateEventsHandled": () => /* binding */ engineDelegateEventsHandled,
/* harmony export */   "fileOpened": () => /* binding */ fileOpened,
/* harmony export */   "errorBannerClicked": () => /* binding */ errorBannerClicked,
/* harmony export */   "pcFileLoaded": () => /* binding */ pcFileLoaded,
/* harmony export */   "expandFrameButtonClicked": () => /* binding */ expandFrameButtonClicked,
/* harmony export */   "collapseFrameButtonClicked": () => /* binding */ collapseFrameButtonClicked,
/* harmony export */   "resizerPathMoved": () => /* binding */ resizerPathMoved,
/* harmony export */   "locationChanged": () => /* binding */ locationChanged,
/* harmony export */   "envOptionClicked": () => /* binding */ envOptionClicked,
/* harmony export */   "metaClicked": () => /* binding */ metaClicked,
/* harmony export */   "resizerPathStoppedMoving": () => /* binding */ resizerPathStoppedMoving,
/* harmony export */   "birdseyeTopFilterBlurred": () => /* binding */ birdseyeTopFilterBlurred,
/* harmony export */   "resizerMoved": () => /* binding */ resizerMoved,
/* harmony export */   "resizerStoppedMoving": () => /* binding */ resizerStoppedMoving,
/* harmony export */   "rectsCaptured": () => /* binding */ rectsCaptured,
/* harmony export */   "canvasMouseUp": () => /* binding */ canvasMouseUp,
/* harmony export */   "canvasMouseLeave": () => /* binding */ canvasMouseLeave,
/* harmony export */   "canvasPanned": () => /* binding */ canvasPanned,
/* harmony export */   "canvasPanStart": () => /* binding */ canvasPanStart,
/* harmony export */   "canvasPanEnd": () => /* binding */ canvasPanEnd,
/* harmony export */   "canvasResized": () => /* binding */ canvasResized,
/* harmony export */   "canvasMouseMoved": () => /* binding */ canvasMouseMoved,
/* harmony export */   "rendererChanged": () => /* binding */ rendererChanged,
/* harmony export */   "engineErrored": () => /* binding */ engineErrored,
/* harmony export */   "zoomInButtonClicked": () => /* binding */ zoomInButtonClicked,
/* harmony export */   "zoomOutButtonClicked": () => /* binding */ zoomOutButtonClicked,
/* harmony export */   "zoomInputChanged": () => /* binding */ zoomInputChanged,
/* harmony export */   "popoutWindowRequested": () => /* binding */ popoutWindowRequested,
/* harmony export */   "globalEscapeKeyPressed": () => /* binding */ globalEscapeKeyPressed,
/* harmony export */   "globalBackspaceKeyPressed": () => /* binding */ globalBackspaceKeyPressed,
/* harmony export */   "globalBackspaceKeySent": () => /* binding */ globalBackspaceKeySent,
/* harmony export */   "globalMetaKeyDown": () => /* binding */ globalMetaKeyDown,
/* harmony export */   "globalZKeyDown": () => /* binding */ globalZKeyDown,
/* harmony export */   "popoutButtonClicked": () => /* binding */ popoutButtonClicked,
/* harmony export */   "clientConnected": () => /* binding */ clientConnected,
/* harmony export */   "globalYKeyDown": () => /* binding */ globalYKeyDown,
/* harmony export */   "globalHKeyDown": () => /* binding */ globalHKeyDown,
/* harmony export */   "globalSaveKeyPress": () => /* binding */ globalSaveKeyPress,
/* harmony export */   "globalMetaKeyUp": () => /* binding */ globalMetaKeyUp,
/* harmony export */   "dirLoaded": () => /* binding */ dirLoaded,
/* harmony export */   "fsItemClicked": () => /* binding */ fsItemClicked,
/* harmony export */   "pasted": () => /* binding */ pasted,
/* harmony export */   "gridHotkeyPressed": () => /* binding */ gridHotkeyPressed,
/* harmony export */   "getAllScreensRequested": () => /* binding */ getAllScreensRequested,
/* harmony export */   "zoomInKeyPressed": () => /* binding */ zoomInKeyPressed,
/* harmony export */   "zoomOutKeyPressed": () => /* binding */ zoomOutKeyPressed
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-visual-editor/src/actions/base.ts");

var ActionType;
(function (ActionType) {
    ActionType["RENDERER_CHANGED"] = "RENDERER_CHANGED";
    ActionType["LOCATION_CHANGED"] = "LOCATION_CHANGED";
    ActionType["RENDERER_MOUNTED"] = "RENDERER_MOUNTED";
    ActionType["REDIRECT_REQUESTED"] = "REDIRECT_REQUESTED";
    ActionType["ZOOM_IN_KEY_PRESSED"] = "ZOOM_IN_KEY_PRESSED";
    ActionType["ZOOM_OUT_KEY_PRESSED"] = "ZOOM_OUT_KEY_PRESSED";
    ActionType["BIRDSEYE_FILTER_CHANGED"] = "BIRDSEYE_FILTER_CHANGED";
    ActionType["ENV_OPTION_CLICKED"] = "ENV_OPTION_CLICKED";
    ActionType["BIRDSEYE_TOP_FILTER_BLURRED"] = "BIRDSEYE_TOP_FILTER_BLURRED";
    ActionType["RENDERER_UNMOUNTED"] = "RENDERER_UNMOUNTED";
    ActionType["PC_FILE_OPENED"] = "PC_FILE_OPENED";
    ActionType["GRID_BUTTON_CLICKED"] = "GRID_BUTTON_CLICKED";
    ActionType["CLIENT_CONNECTED"] = "CLIENT_CONNECTED";
    ActionType["ENGINE_ERRORED"] = "ENGINE_ERRORED";
    ActionType["ERROR_BANNER_CLICKED"] = "ERROR_BANNER_CLICKED";
    ActionType["CANVAS_MOUSE_LEAVE"] = "CANVAS_MOUSE_LEAVE";
    ActionType["CANVAS_MOUSE_UP"] = "CANVAS_MOUSE_UP";
    ActionType["ZOOM_IN_BUTTON_CLICKED"] = "ZOOM_IN_BUTTON_CLICKED";
    ActionType["POPOUT_BUTTON_CLICKED"] = "POPOUT_BUTTON_CLICKED";
    ActionType["POPOUT_WINDOW_REQUESTED"] = "POPOUT_WINDOW_REQUESTED";
    ActionType["PASTED"] = "PASTED";
    ActionType["ZOOM_OUT_BUTTON_CLICKED"] = "ZOOM_OUT_BUTTON_CLICKED";
    ActionType["ZOOM_INPUT_CHANGED"] = "ZOOM_INPUT_CHANGED";
    ActionType["CANVAS_RESIZED"] = "CANVAS_RESIZED";
    ActionType["CANVAS_MOUSE_MOVED"] = "CANVAS_MOUSE_MOVED";
    ActionType["TITLE_DOUBLE_CLICKED"] = "TITLE_DOUBLE_CLICKED";
    ActionType["DIR_LOADED"] = "DIR_LOADED";
    ActionType["FS_ITEM_CLICKED"] = "FS_ITEM_CLICKED";
    ActionType["CANVAS_PAN_START"] = "CANVAS_PAN_START";
    ActionType["CANVAS_PAN_END"] = "CANVAS_PAN_END";
    ActionType["CANVAS_PANNED"] = "CANVAS_PANNED";
    ActionType["RECTS_CAPTURED"] = "RECTS_CAPTURED";
    ActionType["GLOBAL_ESCAPE_KEY_PRESSED"] = "GLOBAL_ESCAPE_KEY_PRESSED";
    ActionType["GLOBAL_META_KEY_DOWN"] = "GLOBAL_META_KEY_DOWN";
    ActionType["GLOBAL_Z_KEY_DOWN"] = "GLOBAL_Z_KEY_DOWN";
    ActionType["GLOBAL_Y_KEY_DOWN"] = "GLOBAL_Y_KEY_DOWN";
    ActionType["GLOBAL_H_KEY_DOWN"] = "GLOBAL_H_KEY_DOWN";
    ActionType["GRID_HOTKEY_PRESSED"] = "GRID_HOTKEY_PRESSED";
    ActionType["GET_ALL_SCREENS_REQUESTED"] = "GET_ALL_SCREENS_REQUESTED";
    ActionType["GLOBAL_SAVE_KEY_DOWN"] = "GLOBAL_SAVE_KEY_DOWN";
    ActionType["GLOBAL_BACKSPACE_KEY_PRESSED"] = "GLOBAL_BACKSPACE_KEY_PRESSED";
    ActionType["GLOBAL_BACKSPACE_KEY_SENT"] = "GLOBAL_BACKSPACE_KEY_SENT";
    ActionType["GLOBAL_META_KEY_UP"] = "GLOBAL_META_KEY_UP";
    ActionType["ENGINE_DELEGATE_CHANGED"] = "ENGINE_DELEGATE_CHANGED";
    ActionType["ENGINE_DELEGATE_EVENTS_HANDLED"] = "ENGINE_DELEGATE_EVENTS_HANDLED";
    ActionType["FRAME_TITLE_CLICKED"] = "FRAME_TITLE_CLICKED";
    ActionType["FILE_OPENED"] = "FILE_OPENED";
    ActionType["RESIZER_PATH_MOUSE_MOVED"] = "RESIZER_PATH_MOUSE_MOVED";
    ActionType["RESIZER_MOVED"] = "RESIZER_MOVED";
    ActionType["RESIZER_STOPPED_MOVING"] = "RESIZER_STOPPED_MOVING";
    ActionType["RESIZER_PATH_MOUSE_STOPPED_MOVING"] = "RESIZER_PATH_MOUSE_STOPPED_MOVING";
    ActionType["META_CLICKED"] = "META_CLICKED";
    ActionType["PC_VIRT_OBJECT_EDITED"] = "PC_VIRT_OBJECT_EDITED";
    ActionType["FRAME_TITLE_CHANGED"] = "FRAME_TITLE_CHANGED";
    ActionType["EXPAND_FRAME_BUTTON_CLICKED"] = "EXPAND_FRAME_BUTTON_CLICKED";
    ActionType["COLLAPSE_FRAME_BUTTON_CLICKED"] = "COLLAPSE_FRAME_BUTTON_CLICKED";
    ActionType["VISUAL_EDITOR_INSTANCE_CHANGED"] = "VISUAL_EDITOR_INSTANCE_CHANGED";
})(ActionType || (ActionType = {}));
var pcVirtObjectEdited = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PC_VIRT_OBJECT_EDITED);
var engineDelegateChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_DELEGATE_CHANGED);
var gridButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GRID_BUTTON_CLICKED);
var frameTitleClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FRAME_TITLE_CLICKED);
var frameTitleChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FRAME_TITLE_CHANGED);
var titleDoubleClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.TITLE_DOUBLE_CLICKED);
var rendererMounted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_MOUNTED);
var rendererUnounted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_UNMOUNTED);
var birdseyeFilterChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.BIRDSEYE_FILTER_CHANGED);
var redirectRequest = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.REDIRECT_REQUESTED);
var engineDelegateEventsHandled = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_DELEGATE_EVENTS_HANDLED);
var fileOpened = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FILE_OPENED);
var errorBannerClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ERROR_BANNER_CLICKED);
var pcFileLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PC_FILE_OPENED);
var expandFrameButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.EXPAND_FRAME_BUTTON_CLICKED);
var collapseFrameButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.COLLAPSE_FRAME_BUTTON_CLICKED);
var resizerPathMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_PATH_MOUSE_MOVED);
var locationChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.LOCATION_CHANGED);
var envOptionClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENV_OPTION_CLICKED);
var metaClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.META_CLICKED);
var resizerPathStoppedMoving = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_PATH_MOUSE_STOPPED_MOVING);
var birdseyeTopFilterBlurred = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.BIRDSEYE_TOP_FILTER_BLURRED);
var resizerMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_MOVED);
var resizerStoppedMoving = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RESIZER_STOPPED_MOVING);
var rectsCaptured = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RECTS_CAPTURED);
var canvasMouseUp = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_UP);
var canvasMouseLeave = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_LEAVE);
var canvasPanned = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PANNED);
var canvasPanStart = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PAN_START);
var canvasPanEnd = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_PAN_END);
var canvasResized = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_RESIZED);
var canvasMouseMoved = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CANVAS_MOUSE_MOVED);
var rendererChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.RENDERER_CHANGED);
var engineErrored = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ENGINE_ERRORED);
var zoomInButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_IN_BUTTON_CLICKED);
var zoomOutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_OUT_BUTTON_CLICKED);
var zoomInputChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_INPUT_CHANGED);
var popoutWindowRequested = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.POPOUT_WINDOW_REQUESTED);
var globalEscapeKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_ESCAPE_KEY_PRESSED);
var globalBackspaceKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_BACKSPACE_KEY_PRESSED);
var globalBackspaceKeySent = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_BACKSPACE_KEY_SENT);
var globalMetaKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_META_KEY_DOWN);
var globalZKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_Z_KEY_DOWN);
var popoutButtonClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.POPOUT_BUTTON_CLICKED);
var clientConnected = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.CLIENT_CONNECTED);
var globalYKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_Y_KEY_DOWN);
var globalHKeyDown = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_H_KEY_DOWN);
var globalSaveKeyPress = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_SAVE_KEY_DOWN);
var globalMetaKeyUp = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GLOBAL_META_KEY_UP);
var dirLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.DIR_LOADED);
var fsItemClicked = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.FS_ITEM_CLICKED);
var pasted = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.PASTED);
var gridHotkeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GRID_HOTKEY_PRESSED);
var getAllScreensRequested = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.GET_ALL_SCREENS_REQUESTED);
var zoomInKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_IN_KEY_PRESSED);
var zoomOutKeyPressed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ActionType.ZOOM_OUT_KEY_PRESSED);


/***/ }),

/***/ "../paperclip-visual-editor/src/actions/server-actions.ts":
/*!****************************************************************!*\
  !*** ../paperclip-visual-editor/src/actions/server-actions.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ServerActionType": () => /* binding */ ServerActionType,
/* harmony export */   "instanceChanged": () => /* binding */ instanceChanged,
/* harmony export */   "initParamsDefined": () => /* binding */ initParamsDefined,
/* harmony export */   "crashed": () => /* binding */ crashed,
/* harmony export */   "allPCContentLoaded": () => /* binding */ allPCContentLoaded,
/* harmony export */   "browserstackBrowsersLoaded": () => /* binding */ browserstackBrowsersLoaded
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../paperclip-visual-editor/src/actions/base.ts");

var ServerActionType;
(function (ServerActionType) {
    ServerActionType["INSTANCE_CHANGED"] = "INSTANCE_CHANGED";
    ServerActionType["CRASHED"] = "CRASHED";
    ServerActionType["ALL_PC_CONTENT_LOADED"] = "ALL_PC_CONTENT_LOADED";
    ServerActionType["INIT_PARAM_DEFINED"] = "INIT_PARAM_DEFINED";
    ServerActionType["BROWSERSTACK_BROWSERS_LOADED"] = "INIT_PARAM_BROWSERSTACK_BROWSERS_LOADEDDEFINED";
})(ServerActionType || (ServerActionType = {}));
var instanceChanged = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.INSTANCE_CHANGED);
var initParamsDefined = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.INIT_PARAM_DEFINED);
var crashed = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.CRASHED);
var allPCContentLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.ALL_PC_CONTENT_LOADED);
var browserstackBrowsersLoaded = (0,_base__WEBPACK_IMPORTED_MODULE_0__.actionCreator)(ServerActionType.BROWSERSTACK_BROWSERS_LOADED);


/***/ }),

/***/ "../paperclip-source-writer/lib/index.js":
/*!***********************************************!*\
  !*** ../paperclip-source-writer/lib/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./writer */ "../paperclip-source-writer/lib/writer.js"), exports);
__exportStar(__webpack_require__(/*! ./mutations */ "../paperclip-source-writer/lib/mutations.js"), exports);


/***/ }),

/***/ "../paperclip-source-writer/lib/mutations.js":
/*!***************************************************!*\
  !*** ../paperclip-source-writer/lib/mutations.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PCMutationActionKind = void 0;
var PCMutationActionKind;
(function (PCMutationActionKind) {
    PCMutationActionKind["ANNOTATIONS_CHANGED"] = "ANNOTATIONS_CHANGED";
    PCMutationActionKind["EXPRESSION_DELETED"] = "EXPRESSION_DELETED";
})(PCMutationActionKind = exports.PCMutationActionKind || (exports.PCMutationActionKind = {}));


/***/ }),

/***/ "../paperclip-source-writer/lib/writer.js":
/*!************************************************!*\
  !*** ../paperclip-source-writer/lib/writer.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PCSourceWriter = void 0;
var mutations_1 = __webpack_require__(/*! ./mutations */ "../paperclip-source-writer/lib/mutations.js");
var paperclip_utils_1 = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
var ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];
var PCSourceWriter = /** @class */ (function () {
    function PCSourceWriter(_options) {
        this._options = _options;
    }
    PCSourceWriter.prototype.getContentChanges = function (mutations) {
        return __awaiter(this, void 0, void 0, function () {
            var changes, engine, _i, mutations_2, _a, exprSource, action, ast, _b, _c, changesByUri, _d, changes_1, change;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        changes = [];
                        engine = this._options.engine;
                        _i = 0, mutations_2 = mutations;
                        _e.label = 1;
                    case 1:
                        if (!(_i < mutations_2.length)) return [3 /*break*/, 4];
                        _a = mutations_2[_i], exprSource = _a.exprSource, action = _a.action;
                        _c = (_b = engine).parseContent;
                        return [4 /*yield*/, this._options.getContent(exprSource.uri)];
                    case 2:
                        ast = _c.apply(_b, [_e.sent()]);
                        switch (action.kind) {
                            case mutations_1.PCMutationActionKind.ANNOTATIONS_CHANGED: {
                                changes.push(this._getAnnotationChange(exprSource, action.annotationsSource, action.annotations));
                                break;
                            }
                            case mutations_1.PCMutationActionKind.EXPRESSION_DELETED: {
                                changes.push.apply(changes, this._getExpressionDeletedChanged(exprSource, ast));
                                break;
                            }
                        }
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        changesByUri = {};
                        for (_d = 0, changes_1 = changes; _d < changes_1.length; _d++) {
                            change = changes_1[_d];
                            if (!changesByUri[change.uri]) {
                                changesByUri[change.uri] = [];
                            }
                            changesByUri[change.uri].push(change);
                        }
                        return [2 /*return*/, changesByUri];
                }
            });
        });
    };
    PCSourceWriter.prototype._getExpressionDeletedChanged = function (exprSource, ast) {
        var node = getAssocNode(exprSource, ast);
        var parent = paperclip_utils_1.getParentNode(node, ast);
        var childIndex = parent.children.findIndex(function (child) { return child === node; });
        var changes = [];
        var beforeChild = childIndex > 0 ? parent.children[childIndex - 1] : null;
        // if before child is a comment, then assume it's an annotation
        if (beforeChild && beforeChild.kind === paperclip_utils_1.NodeKind.Comment) {
            changes.push({
                uri: exprSource.uri,
                start: beforeChild.location.start,
                end: beforeChild.location.end,
                value: "",
            });
        }
        changes.push({
            uri: exprSource.uri,
            start: exprSource.location.start,
            end: exprSource.location.end,
            value: "",
        });
        return changes;
    };
    PCSourceWriter.prototype._getAnnotationChange = function (exprSource, annotationsSource, annotations) {
        var buffer = ["<!--\n"];
        for (var key in annotations) {
            var chunk = ["  @" + key + " "];
            var value = annotations[key];
            if (Array.isArray(value) ||
                typeof value === "string" ||
                typeof value === "number") {
                chunk.push(JSON.stringify(value));
            }
            else {
                chunk.push("{ ");
                var items = [];
                var sortedKeys = Object.keys(value).sort(function (a, b) {
                    return ANNOTATION_KEYS.indexOf(a) < ANNOTATION_KEYS.indexOf(b)
                        ? -1
                        : 1;
                });
                for (var _i = 0, sortedKeys_1 = sortedKeys; _i < sortedKeys_1.length; _i++) {
                    var k = sortedKeys_1[_i];
                    items.push(k + ": " + JSON.stringify(value[k]));
                }
                chunk.push(items.join(", "), " }");
            }
            buffer.push(chunk.join(""), "\n");
        }
        buffer.push("-->");
        // insertion - give it some padding
        if (!annotationsSource) {
            buffer.unshift("\n");
            buffer.push("\n");
        }
        return {
            uri: exprSource.uri,
            start: annotationsSource
                ? annotationsSource.location.start
                : exprSource.location.start,
            end: annotationsSource
                ? annotationsSource.location.end
                : exprSource.location.start,
            value: buffer.join(""),
        };
    };
    return PCSourceWriter;
}());
exports.PCSourceWriter = PCSourceWriter;
var getAssocNode = function (exprSource, root) {
    var foundExpr;
    paperclip_utils_1.traverseExpression(root, function (node) {
        if (node.location.start === exprSource.location.start &&
            node.location.end === exprSource.location.end) {
            foundExpr = node;
            return false;
        }
    });
    // should NOT happen
    if (!foundExpr) {
        console.error("[PCSourceWriter] Cannot find associated node, content is likely out of sync with visual editor.");
    }
    return foundExpr;
};


/***/ }),

/***/ "../paperclip-utils/index.js":
/*!***********************************!*\
  !*** ../paperclip-utils/index.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib */ "../paperclip-utils/lib/index.js");


/***/ }),

/***/ "../paperclip-utils/lib/ast.js":
/*!*************************************!*\
  !*** ../paperclip-utils/lib/ast.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getNestedReferences = exports.getCompletionItems = exports.traverseExpression = exports.isAttributeValue = exports.isAttribute = exports.isNode = exports.getMixins = exports.isComponentInstance = exports.getTreeNodeMap = exports.getParentNode = exports.getNodePath = exports.flattenTreeNode = exports.hasAttribute = exports.getLogicElement = exports.getDefaultPart = exports.getPartIds = exports.getParts = exports.getVisibleChildNodes = exports.isVisibleNode = exports.isVisibleElement = exports.getStyleElements = exports.getAttributeStringValue = exports.getAttributeValue = exports.getAttribute = exports.getMetaValue = exports.findByNamespace = exports.getChildrenByTagName = exports.getStyleScopeId = exports.getChildren = exports.getImportById = exports.getImportIds = exports.getRelativeFilePath = exports.getImports = exports.DynamicStringAttributeValuePartKind = exports.AttributeValueKind = exports.AttributeKind = exports.AnnotationPropertyKind = exports.NodeKind = void 0;
var js_ast_1 = __webpack_require__(/*! ./js-ast */ "../paperclip-utils/lib/js-ast.js");
var css_ast_1 = __webpack_require__(/*! ./css-ast */ "../paperclip-utils/lib/css-ast.js");
var crc32 = __webpack_require__(/*! crc32 */ "../../node_modules/crc32/lib/crc32.js");
var resolve_1 = __webpack_require__(/*! ./resolve */ "../paperclip-utils/lib/resolve.js");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js");
var memo_1 = __webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js");
var NodeKind;
(function (NodeKind) {
    NodeKind["Fragment"] = "Fragment";
    NodeKind["Text"] = "Text";
    NodeKind["Annotation"] = "Annotation";
    NodeKind["Comment"] = "Comment";
    NodeKind["Element"] = "Element";
    NodeKind["StyleElement"] = "StyleElement";
    NodeKind["Slot"] = "Slot";
})(NodeKind = exports.NodeKind || (exports.NodeKind = {}));
var AnnotationPropertyKind;
(function (AnnotationPropertyKind) {
    AnnotationPropertyKind["Text"] = "Text";
    AnnotationPropertyKind["Declaration"] = "Declaration";
})(AnnotationPropertyKind = exports.AnnotationPropertyKind || (exports.AnnotationPropertyKind = {}));
var AttributeKind;
(function (AttributeKind) {
    AttributeKind["ShorthandAttribute"] = "ShorthandAttribute";
    AttributeKind["KeyValueAttribute"] = "KeyValueAttribute";
    AttributeKind["SpreadAttribute"] = "SpreadAttribute";
    AttributeKind["PropertyBoundAttribute"] = "PropertyBoundAttribute";
})(AttributeKind = exports.AttributeKind || (exports.AttributeKind = {}));
var AttributeValueKind;
(function (AttributeValueKind) {
    AttributeValueKind["DyanmicString"] = "DyanmicString";
    AttributeValueKind["String"] = "String";
    AttributeValueKind["Slot"] = "Slot";
})(AttributeValueKind = exports.AttributeValueKind || (exports.AttributeValueKind = {}));
var DynamicStringAttributeValuePartKind;
(function (DynamicStringAttributeValuePartKind) {
    DynamicStringAttributeValuePartKind["Literal"] = "Literal";
    DynamicStringAttributeValuePartKind["ClassNamePierce"] = "ClassNamePierce";
    DynamicStringAttributeValuePartKind["Slot"] = "Slot";
})(DynamicStringAttributeValuePartKind = exports.DynamicStringAttributeValuePartKind || (exports.DynamicStringAttributeValuePartKind = {}));
var a = null;
exports.getImports = function (ast) {
    return exports.getChildrenByTagName("import", ast).filter(function (child) {
        return exports.hasAttribute("src", child);
    });
};
exports.getRelativeFilePath = function (fs) { return function (fromFilePath, importFilePath) {
    var logicPath = resolve_1.resolveImportFile(fs)(fromFilePath, importFilePath);
    var relativePath = path.relative(path.dirname(fromFilePath), logicPath);
    if (relativePath.charAt(0) !== ".") {
        relativePath = "./" + relativePath;
    }
    return relativePath;
}; };
exports.getImportIds = function (ast) {
    return exports.getImports(ast)
        .map(function (node) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, node); })
        .filter(Boolean);
};
exports.getImportById = function (id, ast) {
    return exports.getImports(ast).find(function (imp) {
        return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, imp) === id;
    });
};
exports.getChildren = function (ast) {
    if (ast.kind === NodeKind.Element || ast.kind === NodeKind.Fragment) {
        return ast.children;
    }
    return [];
};
exports.getStyleScopeId = function (filePath) { return crc32(filePath); };
exports.getChildrenByTagName = function (tagName, parent) {
    return exports.getChildren(parent).filter(function (child) {
        return child.kind === NodeKind.Element && child.tagName === tagName;
    });
};
exports.findByNamespace = function (namespace, current, allChildrenByNamespace) {
    if (allChildrenByNamespace === void 0) { allChildrenByNamespace = []; }
    if (current.kind === NodeKind.Element) {
        if (current.tagName.split(".")[0] === namespace) {
            allChildrenByNamespace.push(current);
        }
    }
    for (var _i = 0, _a = exports.getChildren(current); _i < _a.length; _i++) {
        var child = _a[_i];
        exports.findByNamespace(namespace, child, allChildrenByNamespace);
    }
    if (current.kind === NodeKind.Element) {
        for (var _b = 0, _c = current.attributes; _b < _c.length; _b++) {
            var attribute = _c[_b];
            if (attribute.kind === AttributeKind.KeyValueAttribute &&
                attribute.value) {
                if (attribute.value.attrValueKind === AttributeValueKind.Slot &&
                    attribute.value.script.jsKind === js_ast_1.JsExpressionKind.Node) {
                    exports.findByNamespace(namespace, attribute.value.script, allChildrenByNamespace);
                }
            }
        }
    }
    return allChildrenByNamespace;
};
exports.getMetaValue = function (name, root) {
    var metaElement = exports.getChildrenByTagName("meta", root).find(function (meta) {
        return exports.hasAttribute("src", meta) &&
            exports.getAttributeStringValue("name", meta) === name;
    });
    return metaElement && exports.getAttributeStringValue("content", metaElement);
};
exports.getAttribute = function (name, element) {
    return element.attributes.find(function (attr) {
        return attr.kind === AttributeKind.KeyValueAttribute && attr.name === name;
    });
};
exports.getAttributeValue = function (name, element) {
    var attr = exports.getAttribute(name, element);
    return attr && attr.value;
};
exports.getAttributeStringValue = function (name, element) {
    var value = exports.getAttributeValue(name, element);
    return (value && value.attrValueKind === AttributeValueKind.String && value.value);
};
exports.getStyleElements = function (ast) {
    var styleElements = [];
    exports.traverseExpression(ast, function (node) {
        if (node.kind === NodeKind.StyleElement) {
            styleElements.push(node);
        }
    });
    return styleElements;
};
exports.isVisibleElement = function (ast) {
    return !/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);
};
exports.isVisibleNode = function (node) {
    return node.kind === NodeKind.Text ||
        node.kind === NodeKind.Fragment ||
        node.kind === NodeKind.Slot ||
        (node.kind === NodeKind.Element && exports.isVisibleElement(node));
};
exports.getVisibleChildNodes = function (ast) {
    return exports.getChildren(ast).filter(exports.isVisibleNode);
};
exports.getParts = function (ast) {
    return exports.getChildren(ast).filter(function (child) {
        return (child.kind === NodeKind.Element &&
            exports.hasAttribute("component", child) &&
            exports.hasAttribute(constants_1.AS_ATTR_NAME, child));
    });
};
exports.getPartIds = function (ast) {
    return exports.getParts(ast)
        .map(function (node) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, node); })
        .filter(Boolean);
};
exports.getDefaultPart = function (ast) {
    return exports.getParts(ast).find(function (part) { return exports.getAttributeStringValue(constants_1.AS_ATTR_NAME, part) === constants_1.DEFAULT_PART_ID; });
};
exports.getLogicElement = function (ast) {
    return exports.getChildren(ast).find(function (child) { return child.kind === NodeKind.Element && child.tagName === constants_1.LOGIC_TAG_NAME; });
};
exports.hasAttribute = function (name, element) {
    return exports.getAttribute(name, element) != null;
};
// https://github.com/crcn/tandem/blob/10.0.0/packages/common/src/state/tree.ts#L137
exports.flattenTreeNode = memo_1.memoize(function (current) {
    var treeNodeMap = exports.getTreeNodeMap(current);
    return Object.values(treeNodeMap);
});
exports.getNodePath = memo_1.memoize(function (node, root) {
    var map = exports.getTreeNodeMap(root);
    for (var path_1 in map) {
        var c = map[path_1];
        if (c === node)
            return path_1;
    }
});
// TODO
exports.getParentNode = function (node, root) {
    var nodePath = exports.getNodePath(node, root).split(".");
    nodePath.pop();
    var map = exports.getTreeNodeMap(root);
    return map[nodePath.join(".")];
};
exports.getTreeNodeMap = memo_1.memoize(function (current, path) {
    var _a;
    if (path === void 0) { path = "0"; }
    var map = (_a = {},
        _a[path] = current,
        _a);
    if (current.kind === NodeKind.Fragment ||
        current.kind === NodeKind.Element) {
        Object.assign.apply(Object, __spreadArrays([map], current.children.map(function (child, i) {
            return exports.getTreeNodeMap(child, path + "." + i);
        })));
    }
    return map;
});
exports.isComponentInstance = function (node, importIds) {
    return (node.kind === NodeKind.Element &&
        importIds.indexOf(node.tagName.split(".").shift()) !== -1);
};
var maybeAddReference = function (stmt, _statements) {
    if (_statements === void 0) { _statements = []; }
    if (stmt.jsKind === js_ast_1.JsExpressionKind.Reference) {
        _statements.push([stmt, null]);
    }
};
exports.getMixins = function (ast) {
    var styles = exports.getStyleElements(ast);
    var mixins = {};
    for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
        var style = styles_1[_i];
        css_ast_1.traverseSheet(style.sheet, function (rule) {
            if (rule && css_ast_1.isRule(rule) && rule.kind === css_ast_1.RuleKind.Mixin) {
                mixins[rule.name.value] = rule;
            }
        });
    }
    return mixins;
};
exports.isNode = function (ast) {
    return NodeKind[ast.kind] != null;
};
exports.isAttribute = function (ast) {
    return AttributeKind[ast.kind] != null;
};
exports.isAttributeValue = function (ast) {
    return AttributeValueKind[ast.attrValueKind] != null;
};
exports.traverseExpression = function (ast, each) {
    if (each(ast) === false) {
        return false;
    }
    if (exports.isNode(ast)) {
        switch (ast.kind) {
            case NodeKind.Element: {
                return (traverseExpressions(ast.attributes, each) &&
                    traverseExpressions(ast.children, each));
            }
            case NodeKind.Fragment: {
                return traverseExpressions(ast.children, each);
            }
            case NodeKind.StyleElement: {
                return css_ast_1.traverseSheet(ast.sheet, each);
            }
        }
    }
    return true;
};
exports.getCompletionItems = function (root, position) {
    var parent;
    var previousSibling;
    exports.traverseExpression(root, function (expr) {
        if (!expr.location) {
            console.error("ERRRR", expr);
        }
    });
};
var traverseExpressions = function (expressions, each) {
    for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
        var child = expressions_1[_i];
        if (!exports.traverseExpression(child, each)) {
            return false;
        }
    }
    return true;
};
exports.getNestedReferences = function (node, _statements) {
    if (_statements === void 0) { _statements = []; }
    if (node.kind === NodeKind.Slot) {
        maybeAddReference(node.script, _statements);
    }
    else {
        if (node.kind === NodeKind.Element) {
            for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
                var attr = _a[_i];
                if (attr.kind == AttributeKind.KeyValueAttribute &&
                    attr.value &&
                    attr.value.attrValueKind === AttributeValueKind.Slot) {
                    if (attr.value.script.jsKind === js_ast_1.JsExpressionKind.Node) {
                        exports.getNestedReferences(attr.value.script, _statements);
                    }
                    else if (attr.value.script.jsKind === js_ast_1.JsExpressionKind.Reference) {
                        _statements.push([attr.value.script, attr.name]);
                    }
                }
                else if (attr.kind === AttributeKind.ShorthandAttribute &&
                    attr.reference.jsKind === js_ast_1.JsExpressionKind.Reference) {
                    _statements.push([attr.reference, attr.reference[0]]);
                }
                else if (attr.kind === AttributeKind.SpreadAttribute &&
                    attr.script.jsKind === js_ast_1.JsExpressionKind.Reference) {
                    _statements.push([attr.script, attr.script[0]]);
                }
            }
        }
        for (var _b = 0, _c = exports.getChildren(node); _b < _c.length; _b++) {
            var child = _c[_b];
            if (child.kind === NodeKind.Element &&
                exports.hasAttribute(constants_1.PREVIEW_ATTR_NAME, child)) {
                continue;
            }
            exports.getNestedReferences(child, _statements);
        }
    }
    return _statements;
};


/***/ }),

/***/ "../paperclip-utils/lib/base-ast.js":
/*!******************************************!*\
  !*** ../paperclip-utils/lib/base-ast.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/base-virt.js":
/*!*******************************************!*\
  !*** ../paperclip-utils/lib/base-virt.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/config.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/config.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/constants.js":
/*!*******************************************!*\
  !*** ../paperclip-utils/lib/constants.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LOGIC_TAG_NAME = exports.AS_ATTR_NAME = exports.FRAGMENT_TAG_NAME = exports.PREVIEW_ATTR_NAME = exports.COMPONENT_ATTR_NAME = exports.EXPORT_TAG_NAME = exports.DEFAULT_PART_ID = exports.PC_CONFIG_FILE_NAME = void 0;
exports.PC_CONFIG_FILE_NAME = "paperclip.config.json";
exports.DEFAULT_PART_ID = "default";
exports.EXPORT_TAG_NAME = "export";
exports.COMPONENT_ATTR_NAME = "component";
exports.PREVIEW_ATTR_NAME = "preview";
exports.FRAGMENT_TAG_NAME = "fragment";
exports.AS_ATTR_NAME = "as";
// deprecated
exports.LOGIC_TAG_NAME = "logic";


/***/ }),

/***/ "../paperclip-utils/lib/css-ast.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/css-ast.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSelectorClassNames = exports.traverseStyleExpression = exports.isIncludePart = exports.isStyleDeclaration = exports.isRule = exports.traverseSheet = exports.getRuleClassNames = exports.getSheetClassNames = exports.StyleDeclarationKind = exports.SelectorKind = exports.RuleKind = void 0;
var RuleKind;
(function (RuleKind) {
    RuleKind["Style"] = "Style";
    RuleKind["Charset"] = "Charset";
    RuleKind["Namespace"] = "Namespace";
    RuleKind["Include"] = "Include";
    RuleKind["FontFace"] = "FontFace";
    RuleKind["Media"] = "Media";
    RuleKind["Mixin"] = "Mixin";
    RuleKind["Export"] = "Export";
    RuleKind["Supports"] = "Supports";
    RuleKind["Page"] = "Page";
    RuleKind["Document"] = "Document";
    RuleKind["Keyframes"] = "Keyframes";
})(RuleKind = exports.RuleKind || (exports.RuleKind = {}));
var SelectorKind;
(function (SelectorKind) {
    SelectorKind["Group"] = "Group";
    SelectorKind["Combo"] = "Combo";
    SelectorKind["Descendent"] = "Descendent";
    SelectorKind["PseudoElement"] = "PseudoElement";
    SelectorKind["PseudoParamElement"] = "PseudoParamElement";
    SelectorKind["Not"] = "Not";
    SelectorKind["Child"] = "Child";
    SelectorKind["Adjacent"] = "Adjacent";
    SelectorKind["Sibling"] = "Sibling";
    SelectorKind["Id"] = "Id";
    SelectorKind["Element"] = "Element";
    SelectorKind["Attribute"] = "Attribute";
    SelectorKind["Class"] = "Class";
    SelectorKind["AllSelector"] = "AllSelector";
})(SelectorKind = exports.SelectorKind || (exports.SelectorKind = {}));
var StyleDeclarationKind;
(function (StyleDeclarationKind) {
    StyleDeclarationKind["KeyValue"] = "KeyValue";
    StyleDeclarationKind["Include"] = "Include";
    StyleDeclarationKind["Media"] = "Media";
    StyleDeclarationKind["Content"] = "Content";
})(StyleDeclarationKind = exports.StyleDeclarationKind || (exports.StyleDeclarationKind = {}));
exports.getSheetClassNames = function (sheet, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    return getRulesClassNames(sheet.rules, allClassNames);
};
var getRulesClassNames = function (rules, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        exports.getRuleClassNames(rule, allClassNames);
    }
    return allClassNames;
};
exports.getRuleClassNames = function (rule, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    switch (rule.kind) {
        case RuleKind.Media: {
            getRulesClassNames(rule.rules, allClassNames);
            break;
        }
        case RuleKind.Style: {
            exports.getSelectorClassNames(rule.selector, allClassNames);
            break;
        }
    }
    return allClassNames;
};
exports.traverseSheet = function (sheet, each) {
    return traverseStyleExpressions(sheet.rules, each);
};
var traverseStyleExpressions = function (rules, each) {
    for (var _i = 0, rules_2 = rules; _i < rules_2.length; _i++) {
        var rule = rules_2[_i];
        if (!exports.traverseStyleExpression(rule, each)) {
            return false;
        }
    }
    return true;
};
exports.isRule = function (expression) {
    return RuleKind[expression.kind] != null;
};
exports.isStyleDeclaration = function (expression) {
    return (StyleDeclarationKind[expression.declarationKind] !=
        null);
};
exports.isIncludePart = function (expression) {
    return expression.name != null;
};
exports.traverseStyleExpression = function (rule, each) {
    if (each(rule) === false) {
        return false;
    }
    if (exports.isRule(rule)) {
        switch (rule.kind) {
            case RuleKind.Media: {
                return traverseStyleExpressions(rule.rules, each);
            }
            case RuleKind.Export: {
                return traverseStyleExpressions(rule.rules, each);
            }
            case RuleKind.Style: {
                return (traverseStyleExpressions(rule.declarations, each) &&
                    traverseStyleExpressions(rule.children, each));
            }
            case RuleKind.Mixin: {
                return traverseStyleExpressions(rule.declarations, each);
            }
        }
    }
    else if (exports.isStyleDeclaration(rule)) {
        switch (rule.declarationKind) {
            case StyleDeclarationKind.Include: {
                for (var _i = 0, _a = rule.mixinName.parts; _i < _a.length; _i++) {
                    var part = _a[_i];
                    if (!exports.traverseStyleExpression(part, each)) {
                        return false;
                    }
                }
                return true;
            }
        }
    }
    return true;
};
exports.getSelectorClassNames = function (selector, allClassNames) {
    if (allClassNames === void 0) { allClassNames = []; }
    switch (selector.kind) {
        case SelectorKind.Combo:
        case SelectorKind.Group: {
            for (var _i = 0, _a = selector.selectors; _i < _a.length; _i++) {
                var child = _a[_i];
                exports.getSelectorClassNames(child, allClassNames);
            }
            break;
        }
        case SelectorKind.Descendent: {
            exports.getSelectorClassNames(selector.ancestor, allClassNames);
            exports.getSelectorClassNames(selector.descendent, allClassNames);
            break;
        }
        case SelectorKind.PseudoElement: {
            exports.getSelectorClassNames(selector.target, allClassNames);
            break;
        }
        case SelectorKind.PseudoParamElement: {
            exports.getSelectorClassNames(selector.target, allClassNames);
            break;
        }
        case SelectorKind.Not: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            break;
        }
        case SelectorKind.Child: {
            exports.getSelectorClassNames(selector.parent, allClassNames);
            exports.getSelectorClassNames(selector.child, allClassNames);
            break;
        }
        case SelectorKind.Adjacent: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            exports.getSelectorClassNames(selector.nextSiblingSelector, allClassNames);
            break;
        }
        case SelectorKind.Sibling: {
            exports.getSelectorClassNames(selector.selector, allClassNames);
            exports.getSelectorClassNames(selector.siblingSelector, allClassNames);
            break;
        }
        case SelectorKind.Class: {
            allClassNames.push(selector.className);
            break;
        }
    }
    return allClassNames;
};


/***/ }),

/***/ "../paperclip-utils/lib/css-virt.js":
/*!******************************************!*\
  !*** ../paperclip-utils/lib/css-virt.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VirtRuleKind = void 0;
var VirtRuleKind;
(function (VirtRuleKind) {
    VirtRuleKind["Style"] = "Style";
    VirtRuleKind["Media"] = "Media";
})(VirtRuleKind = exports.VirtRuleKind || (exports.VirtRuleKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/events.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/events.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphErrorInfoType = exports.ParseErrorKind = exports.EngineErrorKind = exports.EngineDelegateEventKind = void 0;
var EngineDelegateEventKind;
(function (EngineDelegateEventKind) {
    EngineDelegateEventKind["Loading"] = "Loading";
    EngineDelegateEventKind["Loaded"] = "Loaded";
    EngineDelegateEventKind["Updating"] = "Updating";
    EngineDelegateEventKind["Evaluated"] = "Evaluated";
    EngineDelegateEventKind["Error"] = "Error";
    EngineDelegateEventKind["NodeParsed"] = "NodeParsed";
    EngineDelegateEventKind["Diffed"] = "Diffed";
    EngineDelegateEventKind["ChangedSheets"] = "ChangedSheets";
})(EngineDelegateEventKind = exports.EngineDelegateEventKind || (exports.EngineDelegateEventKind = {}));
var EngineErrorKind;
(function (EngineErrorKind) {
    EngineErrorKind["Graph"] = "Graph";
    EngineErrorKind["Runtime"] = "Runtime";
})(EngineErrorKind = exports.EngineErrorKind || (exports.EngineErrorKind = {}));
var ParseErrorKind;
(function (ParseErrorKind) {
    ParseErrorKind["EndOfFile"] = "EndOfFile";
})(ParseErrorKind = exports.ParseErrorKind || (exports.ParseErrorKind = {}));
var GraphErrorInfoType;
(function (GraphErrorInfoType) {
    GraphErrorInfoType["Syntax"] = "Syntax";
    GraphErrorInfoType["IncludeNotFound"] = "IncludeNotFound";
    GraphErrorInfoType["NotFound"] = "NotFound";
})(GraphErrorInfoType = exports.GraphErrorInfoType || (exports.GraphErrorInfoType = {}));


/***/ }),

/***/ "../paperclip-utils/lib/exports.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/exports.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../paperclip-utils/lib/graph.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/graph.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DependencyContentKind = void 0;
var DependencyContentKind;
(function (DependencyContentKind) {
    DependencyContentKind["Node"] = "Node";
    DependencyContentKind["Stylsheet"] = "Stylesheet";
})(DependencyContentKind = exports.DependencyContentKind || (exports.DependencyContentKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/index.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/index.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./events */ "../paperclip-utils/lib/events.js"), exports);
__exportStar(__webpack_require__(/*! ./virt */ "../paperclip-utils/lib/virt.js"), exports);
__exportStar(__webpack_require__(/*! ./ast */ "../paperclip-utils/lib/ast.js"), exports);
__exportStar(__webpack_require__(/*! ./js-ast */ "../paperclip-utils/lib/js-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./js-virt */ "../paperclip-utils/lib/js-virt.js"), exports);
__exportStar(__webpack_require__(/*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js"), exports);
__exportStar(__webpack_require__(/*! ./css-ast */ "../paperclip-utils/lib/css-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./base-ast */ "../paperclip-utils/lib/base-ast.js"), exports);
__exportStar(__webpack_require__(/*! ./config */ "../paperclip-utils/lib/config.js"), exports);
__exportStar(__webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js"), exports);
// export * from "./errors";
__exportStar(__webpack_require__(/*! ./graph */ "../paperclip-utils/lib/graph.js"), exports);
__exportStar(__webpack_require__(/*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js"), exports);
__exportStar(__webpack_require__(/*! ./resolve */ "../paperclip-utils/lib/resolve.js"), exports);
__exportStar(__webpack_require__(/*! ./stringify-virt-node */ "../paperclip-utils/lib/stringify-virt-node.js"), exports);
__exportStar(__webpack_require__(/*! ./css-virt */ "../paperclip-utils/lib/css-virt.js"), exports);
__exportStar(__webpack_require__(/*! ./virt-patcher */ "../paperclip-utils/lib/virt-patcher.js"), exports);
__exportStar(__webpack_require__(/*! ./exports */ "../paperclip-utils/lib/exports.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js"), exports);
__exportStar(__webpack_require__(/*! ./source-watcher */ "../paperclip-utils/lib/source-watcher.js"), exports);
__exportStar(__webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js"), exports);
__exportStar(__webpack_require__(/*! ./base-virt */ "../paperclip-utils/lib/base-virt.js"), exports);


/***/ }),

/***/ "../paperclip-utils/lib/js-ast.js":
/*!****************************************!*\
  !*** ../paperclip-utils/lib/js-ast.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JsConjunctionOperatorKind = exports.JsExpressionKind = void 0;
var JsExpressionKind;
(function (JsExpressionKind) {
    JsExpressionKind["Node"] = "Node";
    JsExpressionKind["Reference"] = "Reference";
    JsExpressionKind["Array"] = "Array";
    JsExpressionKind["Object"] = "Object";
    JsExpressionKind["String"] = "String";
    JsExpressionKind["Number"] = "Number";
    JsExpressionKind["Boolean"] = "Boolean";
    JsExpressionKind["Conjunction"] = "Conjunction";
    JsExpressionKind["Not"] = "Not";
    JsExpressionKind["Group"] = "Group";
})(JsExpressionKind = exports.JsExpressionKind || (exports.JsExpressionKind = {}));
var JsConjunctionOperatorKind;
(function (JsConjunctionOperatorKind) {
    JsConjunctionOperatorKind["And"] = "And";
    JsConjunctionOperatorKind["Or"] = "Or";
})(JsConjunctionOperatorKind = exports.JsConjunctionOperatorKind || (exports.JsConjunctionOperatorKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/js-virt.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/js-virt.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeVirtJSValue = exports.toVirtJsValue = exports.computeVirtJSObject = exports.VirtJsObjectKind = void 0;
var memo_1 = __webpack_require__(/*! ./memo */ "../paperclip-utils/lib/memo.js");
var VirtJsObjectKind;
(function (VirtJsObjectKind) {
    VirtJsObjectKind["JsObject"] = "JsObject";
    VirtJsObjectKind["JsArray"] = "JsArray";
    VirtJsObjectKind["JsBoolean"] = "JsBoolean";
    VirtJsObjectKind["JsNumber"] = "JsNumber";
    VirtJsObjectKind["JsString"] = "JsString";
})(VirtJsObjectKind = exports.VirtJsObjectKind || (exports.VirtJsObjectKind = {}));
exports.computeVirtJSObject = memo_1.memoize(function (obj) {
    var values = {};
    for (var key in obj.values) {
        values[key] = exports.computeVirtJSValue(obj.values[key]);
    }
    return values;
});
exports.toVirtJsValue = memo_1.memoize(function (value) {
    if (Array.isArray(value)) {
        return {
            kind: VirtJsObjectKind.JsArray,
            values: value.map(exports.toVirtJsValue)
        };
    }
    else if (value && typeof value === "object") {
        var values = {};
        for (var k in value) {
            values[k] = exports.toVirtJsValue(value[k]);
        }
        return {
            kind: VirtJsObjectKind.JsObject,
            values: values
        };
    }
    else if (typeof value === "number") {
        return {
            kind: VirtJsObjectKind.JsNumber,
            value: value
        };
    }
    else if (typeof value === "string") {
        return {
            kind: VirtJsObjectKind.JsString,
            value: value
        };
    }
    else if (typeof value === "boolean") {
        return {
            kind: VirtJsObjectKind.JsBoolean,
            value: value
        };
    }
});
exports.computeVirtJSValue = memo_1.memoize(function (obj) {
    switch (obj.kind) {
        case VirtJsObjectKind.JsObject: {
            return exports.computeVirtJSObject(obj);
        }
        case VirtJsObjectKind.JsArray: {
            return obj.values.map(exports.computeVirtJSValue);
        }
        case VirtJsObjectKind.JsString:
        case VirtJsObjectKind.JsBoolean:
        case VirtJsObjectKind.JsNumber: {
            return obj.value;
        }
    }
});


/***/ }),

/***/ "../paperclip-utils/lib/memo.js":
/*!**************************************!*\
  !*** ../paperclip-utils/lib/memo.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.underchange = exports.reuser = exports.shallowEquals = exports.memoize = void 0;
var LRU = __webpack_require__(/*! lru-cache */ "../paperclip-utils/node_modules/lru-cache/index.js");
var DEFAULT_LRU_MAX = 10000;
// need this for default arguments
var getArgumentCount = function (fn) {
    var str = fn.toString();
    var params = str.match(/\(.*?\)|\w+\s*=>/)[0];
    var args = params
        .replace(/[=>()]/g, "")
        .split(/\s*,\s*/)
        .filter(function (arg) { return arg.substr(0, 3) !== "..."; });
    return args.length;
};
exports.memoize = function (fn, lruMax, argumentCount) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (argumentCount === void 0) { argumentCount = getArgumentCount(fn); }
    if (argumentCount == Infinity || isNaN(argumentCount)) {
        throw new Error("Argument count cannot be Infinity, 0, or NaN.");
    }
    if (!argumentCount) {
        console.error("Argument count should not be 0. Defaulting to 1.");
        argumentCount = 1;
    }
    return compilFastMemoFn(argumentCount, lruMax > 0)(fn, new LRU({ max: lruMax }));
};
exports.shallowEquals = function (a, b) {
    var toa = typeof a;
    var tob = typeof b;
    if (toa !== tob) {
        return false;
    }
    if (toa !== "object" || !a || !b) {
        return a === b;
    }
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (var key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
};
exports.reuser = function (lruMax, getKey, equals) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (equals === void 0) { equals = exports.shallowEquals; }
    var cache = new LRU({ max: lruMax });
    return function (value) {
        var key = getKey(value);
        if (!cache.has(key) || !equals(cache.get(key), value)) {
            cache.set(key, value);
        }
        return cache.get(key);
    };
};
var _memoFns = {};
var compilFastMemoFn = function (argumentCount, acceptPrimitives) {
    var hash = "" + argumentCount + acceptPrimitives;
    if (_memoFns[hash]) {
        return _memoFns[hash];
    }
    var args = Array.from({ length: argumentCount }).map(function (v, i) { return "arg" + i; });
    var buffer = "\n  return function(fn, keyMemo) {\n    var memo = new WeakMap();\n    return function(" + args.join(", ") + ") {\n      var currMemo = memo, prevMemo, key;\n  ";
    for (var i = 0, n = args.length - 1; i < n; i++) {
        var arg = args[i];
        buffer += "\n      prevMemo = currMemo;\n      key      = " + arg + ";\n      " + (acceptPrimitives
            ? "if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(" + arg + "))) {\n        keyMemo.set(" + arg + ", key = {});\n      }"
            : "") + "\n      if (!(currMemo = currMemo.get(key))) {\n        prevMemo.set(key, currMemo = new WeakMap());\n      }\n    ";
    }
    var lastArg = args[args.length - 1];
    buffer += "\n      key = " + lastArg + ";\n      " + (acceptPrimitives
        ? "\n      if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(" + lastArg + "))) {\n        keyMemo.set(" + lastArg + ", key = {});\n      }"
        : "") + "\n\n      if (!currMemo.has(key)) {\n        try {\n          currMemo.set(key, fn(" + args.join(", ") + "));\n        } catch(e) {\n          throw e;\n        }\n      }\n\n      return currMemo.get(key);\n    };\n  };\n  ";
    return (_memoFns[hash] = new Function(buffer)());
};
/**
 * Calls target function once & proxies passed functions
 * @param fn
 */
exports.underchange = function (fn) {
    var currentArgs = [];
    var ret;
    var started;
    var start = function () {
        if (started) {
            return ret;
        }
        started = true;
        return (ret = fn.apply(void 0, currentArgs.map(function (a, i) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return currentArgs[i].apply(currentArgs, args);
        }; })));
    };
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        currentArgs = args;
        return start();
    });
};


/***/ }),

/***/ "../paperclip-utils/lib/resolve.js":
/*!*****************************************!*\
  !*** ../paperclip-utils/lib/resolve.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findPCConfigUrl = exports.resolveImportFile = exports.resolveImportUri = void 0;
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var utils_1 = __webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip-utils/lib/constants.js");
exports.resolveImportUri = function (fs) { return function (fromPath, toPath, resolveOutput) {
    var filePath = exports.resolveImportFile(fs)(fromPath, toPath, resolveOutput);
    return filePath;
}; };
exports.resolveImportFile = function (fs) { return function (fromPath, toPath, resolveOutput) {
    try {
        if (/\w+:\/\//.test(toPath)) {
            return toPath;
        }
        if (toPath.charAt(0) !== ".") {
            var uri = resolveModule(fs)(fromPath, toPath, resolveOutput);
            if (!uri) {
                throw new Error("module " + toPath + " not found");
            }
            return uri;
        }
        return url.resolve(fromPath, toPath);
    }
    catch (e) {
        return null;
    }
}; };
var readJSONSync = function (fs) { return function (uri) {
    return JSON.parse(fs.readFileSync(uri, "utf8"));
}; };
var resolveModule = function (fs) { return function (fromPath, moduleRelativePath, resolveOutput) {
    var configUrl = exports.findPCConfigUrl(fs)(fromPath);
    if (!configUrl)
        return null;
    var uri = new URL(configUrl);
    // need to parse each time in case config changed.
    var config = readJSONSync(fs)(uri);
    var configPathDir = path.dirname(utils_1.stripFileProtocol(configUrl));
    var moduleFileUrl = url.pathToFileURL(path.normalize(path.join(configPathDir, config.sourceDirectory, moduleRelativePath)));
    // FIRST look for modules in the sourceDirectory
    if (fs.existsSync(moduleFileUrl)) {
        // Need to follow symlinks
        return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;
    }
    // No bueno? Move onto the module directories then
    if (config.moduleDirectories) {
        var firstSlashIndex = moduleRelativePath.indexOf("/");
        var moduleName = moduleRelativePath.substr(0, firstSlashIndex);
        var srcPath = moduleRelativePath.substr(firstSlashIndex);
        for (var i = 0, length_1 = config.moduleDirectories.length; i < length_1; i++) {
            var moduleDir = config.moduleDirectories[i];
            var moduleDirectory = path.join(resolveModuleDirectory(fs)(configPathDir, moduleDir), moduleName);
            var modulePath = path.join(moduleDirectory, srcPath);
            var moduleConfigUrl = exports.findPCConfigUrl(fs)(modulePath);
            if (moduleConfigUrl === configUrl) {
                continue;
            }
            if (fs.existsSync(modulePath)) {
                var moduleConfig = readJSONSync(fs)(new URL(moduleConfigUrl));
                var sourceDir = path.join(path.dirname(url.fileURLToPath(moduleConfigUrl)), moduleConfig.sourceDirectory);
                var outputDir = path.join(path.dirname(url.fileURLToPath(moduleConfigUrl)), moduleConfig.outputDirectory || moduleConfig.sourceDirectory);
                var actualPath = resolveOutput
                    ? modulePath.replace(sourceDir, outputDir)
                    : fs.realpathSync(modulePath);
                return url.pathToFileURL(actualPath).href;
            }
        }
    }
    return null;
}; };
var resolveModuleDirectory = function (fs) { return function (cwd, moduleDir) {
    var c0 = moduleDir.charAt(0);
    if (c0 === "/" || c0 === ".") {
        return path.join(cwd, moduleDir);
    }
    var cdir = cwd;
    do {
        var maybeDir = path.join(cdir, moduleDir);
        if (fs.existsSync(maybeDir)) {
            return maybeDir;
        }
        cdir = path.dirname(cdir);
    } while (isntRoot(cdir));
}; };
exports.findPCConfigUrl = function (fs) { return function (fromUri) {
    var cdir = utils_1.stripFileProtocol(fromUri);
    // can't cache in case PC config was moved.
    do {
        var configUrl = url.pathToFileURL(path.join(cdir, constants_1.PC_CONFIG_FILE_NAME));
        if (fs.existsSync(configUrl)) {
            return configUrl.href;
        }
        cdir = path.dirname(cdir);
    } while (isntRoot(cdir));
    return null;
}; };
var isntRoot = function (cdir) {
    return cdir !== "/" && cdir !== "." && !/^\w+:\\$/.test(cdir);
};


/***/ }),

/***/ "../paperclip-utils/lib/source-watcher.js":
/*!************************************************!*\
  !*** ../paperclip-utils/lib/source-watcher.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaperclipSourceWatcher = exports.ChangeKind = void 0;
var chokidar = __webpack_require__(/*! chokidar */ "chokidar");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
var events_1 = __webpack_require__(/*! events */ "../../node_modules/events/events.js");
var utils_1 = __webpack_require__(/*! ./utils */ "../paperclip-utils/lib/utils.js");
var ChangeKind;
(function (ChangeKind) {
    ChangeKind[ChangeKind["Removed"] = 0] = "Removed";
    ChangeKind[ChangeKind["Added"] = 1] = "Added";
    ChangeKind[ChangeKind["Changed"] = 2] = "Changed";
})(ChangeKind = exports.ChangeKind || (exports.ChangeKind = {}));
var CHOKIDAR_EVENT_MAP = {
    add: ChangeKind.Added,
    unlink: ChangeKind.Removed,
    change: ChangeKind.Changed
};
var PaperclipSourceWatcher = /** @class */ (function () {
    function PaperclipSourceWatcher(config, cwd) {
        this.config = config;
        this.cwd = cwd;
        this._em = new events_1.EventEmitter();
        this._init();
    }
    PaperclipSourceWatcher.prototype.onChange = function (listener) {
        var _this = this;
        this._em.on("change", listener);
        return function () { return _this._em.off("change", listener); };
    };
    PaperclipSourceWatcher.prototype.dispose = function () {
        this._watcher.close();
    };
    PaperclipSourceWatcher.prototype._init = function () {
        var _this = this;
        var watcher = (this._watcher = chokidar.watch(utils_1.paperclipSourceGlobPattern(this.config.sourceDirectory), { cwd: this.cwd, ignoreInitial: true }));
        watcher.on("all", function (eventName, relativePath) {
            var filePath = relativePath.charAt(0) !== "/"
                ? path.join(_this.cwd, relativePath)
                : relativePath;
            var changeKind = CHOKIDAR_EVENT_MAP[eventName];
            if (changeKind) {
                _this._em.emit("change", changeKind, url.pathToFileURL(filePath).href);
            }
        });
    };
    return PaperclipSourceWatcher;
}());
exports.PaperclipSourceWatcher = PaperclipSourceWatcher;


/***/ }),

/***/ "../paperclip-utils/lib/stringify-sheet.js":
/*!*************************************************!*\
  !*** ../paperclip-utils/lib/stringify-sheet.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyCSSSheet = void 0;
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
exports.stringifyCSSSheet = function (sheet, options) {
    if (options === void 0) { options = {}; }
    return sheet.rules.map(function (rule) { return stringifyCSSRule(rule, options); }).join("\n");
};
var stringifyCSSRule = function (rule, options) {
    switch (rule.kind) {
        case "Style":
            return stringifyStyleRule(rule, options);
        case "Page":
        case "Supports":
        case "Media":
            return stringifyConditionRule(rule, options);
        case "FontFace":
            return stringifyFontFaceRule(rule, options);
        case "Keyframes":
            return stringifyKeyframesRule(rule, options);
    }
};
var stringifyConditionRule = function (_a, options) {
    var name = _a.name, condition_text = _a.condition_text, rules = _a.rules;
    return "@" + name + " " + condition_text + " {\n    " + rules.map(function (style) { return stringifyStyleRule(style, options); }).join("\n") + "\n  }";
};
var stringifyKeyframesRule = function (_a, options) {
    var name = _a.name, rules = _a.rules;
    return "@keyframes " + name + " {\n    " + rules.map(function (style) { return stringifyKeyframeRule(style, options); }).join("\n") + "\n  }";
};
var stringifyKeyframeRule = function (_a, options) {
    var key = _a.key, style = _a.style;
    return key + " {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyFontFaceRule = function (_a, options) {
    var style = _a.style;
    return "@font-face {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyStyleRule = function (_a, options) {
    var selector_text = _a.selector_text, style = _a.style;
    return selector_text + " {\n    " + style.map(function (style) { return stringifyStyle(style, options); }).join("\n") + "\n  }";
};
var stringifyStyle = function (_a, _b) {
    var name = _a.name, value = _a.value;
    var uri = _b.uri, protocol = _b.protocol;
    if (value) {
        // required for bundling, otherwise file protocol is maintained
        if (uri) {
            var urls = value.match(/(file:\/\/.*?)(?=['")])/g) || [];
            var selfPathname = url.fileURLToPath(uri);
            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var foundUrl = urls_1[_i];
                var pathname = url.fileURLToPath(foundUrl);
                var relativePath = path.relative(path.dirname(selfPathname), pathname);
                if (relativePath.charAt(0) !== ".") {
                    relativePath = "./" + relativePath;
                }
                value = value.replace(foundUrl, relativePath);
            }
        }
        if (protocol) {
            value = value.replace(/file:/g, protocol);
        }
    }
    return name + ":" + value + ";";
};


/***/ }),

/***/ "../paperclip-utils/lib/stringify-virt-node.js":
/*!*****************************************************!*\
  !*** ../paperclip-utils/lib/stringify-virt-node.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyVirtualNode = void 0;
var stringify_sheet_1 = __webpack_require__(/*! ./stringify-sheet */ "../paperclip-utils/lib/stringify-sheet.js");
var html_entities_1 = __webpack_require__(/*! html-entities */ "../../node_modules/html-entities/lib/index.js");
var entities = new html_entities_1.Html5Entities();
exports.stringifyVirtualNode = function (node) {
    switch (node.kind) {
        case "Fragment":
            return stringifyChildren(node);
        case "Element": {
            var buffer = "<" + node.tagName;
            for (var key in node.attributes) {
                var value = node.attributes[key];
                if (value) {
                    buffer += " " + key + "=\"" + value + "\"";
                }
                else {
                    buffer += " " + key;
                }
            }
            buffer += ">" + stringifyChildren(node) + "</" + node.tagName + ">";
            return buffer;
        }
        case "StyleElement": {
            return "<style>" + stringify_sheet_1.stringifyCSSSheet(node.sheet) + "</style>";
        }
        case "Text": {
            return entities.decode(node.value);
        }
        default: {
            throw new Error("can't handle " + node.kind);
        }
    }
};
var stringifyChildren = function (node) {
    return node.children.map(exports.stringifyVirtualNode).join("");
};


/***/ }),

/***/ "../paperclip-utils/lib/utils.js":
/*!***************************************!*\
  !*** ../paperclip-utils/lib/utils.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPaperclipFile = exports.paperclipSourceGlobPattern = exports.stripFileProtocol = void 0;
var url = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
exports.stripFileProtocol = function (filePath) {
    return filePath.includes("file://") ? url.fileURLToPath(filePath) : filePath;
};
exports.paperclipSourceGlobPattern = function (dir) {
    return dir === "." ? "**/*.pc" : dir + "/**/*.pc";
};
exports.isPaperclipFile = function (filePath) { return /\.pc$/.test(filePath); };


/***/ }),

/***/ "../paperclip-utils/lib/virt-mtuation.js":
/*!***********************************************!*\
  !*** ../paperclip-utils/lib/virt-mtuation.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActionKind = void 0;
var ActionKind;
(function (ActionKind) {
    ActionKind["ReplaceNode"] = "ReplaceNode";
    ActionKind["InsertChild"] = "InsertChild";
    ActionKind["DeleteChild"] = "DeleteChild";
    ActionKind["SetAttribute"] = "SetAttribute";
    ActionKind["SetAnnotations"] = "SetAnnotations";
    ActionKind["SourceChanged"] = "SourceChanged";
    ActionKind["SourceUriChanged"] = "SourceUriChanged";
    ActionKind["SetText"] = "SetText";
    ActionKind["RemoveAttribute"] = "RemoveAttribute";
})(ActionKind = exports.ActionKind || (exports.ActionKind = {}));


/***/ }),

/***/ "../paperclip-utils/lib/virt-patcher.js":
/*!**********************************************!*\
  !*** ../paperclip-utils/lib/virt-patcher.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateAllLoadedData = exports.getVirtTarget = exports.patchVirtNode = void 0;
var virt_mtuation_1 = __webpack_require__(/*! ./virt-mtuation */ "../paperclip-utils/lib/virt-mtuation.js");
var virt_1 = __webpack_require__(/*! ./virt */ "../paperclip-utils/lib/virt.js");
var events_1 = __webpack_require__(/*! ./events */ "../paperclip-utils/lib/events.js");
exports.patchVirtNode = function (root, mutations) {
    for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
        var mutation = mutations_1[_i];
        var target = exports.getVirtTarget(root, mutation.nodePath);
        var action = mutation.action;
        switch (action.kind) {
            case virt_mtuation_1.ActionKind.DeleteChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 1);
                target = __assign(__assign({}, target), { children: children });
                break;
            }
            case virt_mtuation_1.ActionKind.InsertChild: {
                var element = target;
                var children = element.children.concat();
                children.splice(action.index, 0, action.child);
                target = __assign(__assign({}, target), { children: children });
                break;
            }
            case virt_mtuation_1.ActionKind.ReplaceNode: {
                target = action.replacement;
                break;
            }
            case virt_mtuation_1.ActionKind.RemoveAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = undefined;
                target = __assign(__assign({}, target), { attributes: attributes });
                break;
            }
            case virt_mtuation_1.ActionKind.SetAttribute: {
                var element = target;
                var attributes = __assign({}, element.attributes);
                attributes[action.name] = action.value;
                target = __assign(__assign({}, target), { attributes: attributes });
                break;
            }
            case virt_mtuation_1.ActionKind.SetAnnotations: {
                target = __assign(__assign({}, target), { annotations: action.value });
                break;
            }
            case virt_mtuation_1.ActionKind.SetText: {
                target = __assign(__assign({}, target), { value: action.value });
                break;
            }
            case virt_mtuation_1.ActionKind.SourceChanged: {
                target = __assign(__assign({}, target), { source: action.newSource });
                break;
            }
        }
        root = updateNode(root, mutation.nodePath, target);
    }
    return root;
};
exports.getVirtTarget = function (mount, nodePath) {
    return nodePath.reduce(function (current, i) {
        var c = current.children[i];
        return c;
    }, mount);
};
var updateNode = function (ancestor, nodePath, newNode, depth) {
    if (depth === void 0) { depth = 0; }
    if (depth === nodePath.length) {
        return newNode;
    }
    if (ancestor.kind === virt_1.VirtualNodeKind.Text ||
        ancestor.kind === virt_1.VirtualNodeKind.StyleElement) {
        return newNode;
    }
    return __assign(__assign({}, ancestor), { children: __spreadArrays(ancestor.children.slice(0, nodePath[depth]), [
            updateNode(ancestor.children[nodePath[depth]], nodePath, newNode, depth + 1)
        ], ancestor.children.slice(nodePath[depth] + 1)) });
};
exports.updateAllLoadedData = function (allData, event) {
    var _a, _b;
    if (event.kind === events_1.EngineDelegateEventKind.Evaluated) {
        return __assign(__assign({}, allData), (_a = {}, _a[event.uri] = __assign(__assign({}, event.data), { importedSheets: getImportedSheets(allData, event) }), _a));
    }
    else if (event.kind === events_1.EngineDelegateEventKind.Diffed) {
        var existingData = allData[event.uri];
        // this will happen if client renderer loads data, but imported
        // resource has changed
        if (!existingData) {
            return allData;
        }
        return __assign(__assign({}, allData), (_b = {}, _b[event.uri] = __assign(__assign({}, existingData), { imports: event.data.imports, exports: event.data.exports, importedSheets: getImportedSheets(allData, event), allDependencies: event.data.allDependencies, sheet: event.data.sheet || existingData.sheet, preview: exports.patchVirtNode(existingData.preview, event.data.mutations) }), _b));
    }
    return allData;
};
var getImportedSheets = function (allData, _a) {
    // ick, wworks for now.
    var allDependencies = _a.data.allDependencies;
    var deps = [];
    for (var _i = 0, allDependencies_1 = allDependencies; _i < allDependencies_1.length; _i++) {
        var depUri = allDependencies_1[_i];
        var data = allData[depUri];
        if (data) {
            deps.push({ uri: depUri, sheet: data.sheet });
            // scenario won't happen for renderer since renderers are only
            // concerned about the file that's currently opened -- ignore for now. Might
        }
        else {
            // console.error(`data not loaded, this shouldn't happen 😬.`);
        }
    }
    return deps;
};


/***/ }),

/***/ "../paperclip-utils/lib/virt.js":
/*!**************************************!*\
  !*** ../paperclip-utils/lib/virt.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VirtualNodeKind = void 0;
var VirtualNodeKind;
(function (VirtualNodeKind) {
    VirtualNodeKind["Element"] = "Element";
    VirtualNodeKind["Text"] = "Text";
    VirtualNodeKind["Fragment"] = "Fragment";
    VirtualNodeKind["StyleElement"] = "StyleElement";
})(VirtualNodeKind = exports.VirtualNodeKind || (exports.VirtualNodeKind = {}));


/***/ }),

/***/ "../paperclip/browser.js":
/*!*******************************!*\
  !*** ../paperclip/browser.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadEngineDelegate": () => /* binding */ loadEngineDelegate
/* harmony export */ });
/* harmony import */ var _esm_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./esm/core */ "../paperclip/esm/core/index.js");


const loadEngineDelegate = async (options, onCrash) => {
  // need this here since webpack tree shakes it out
  await __webpack_require__.e(/*! import() */ "paperclip_native_browser_paperclip_bg_js").then(__webpack_require__.bind(__webpack_require__, /*! ./native/browser/paperclip_bg.wasm */ "../paperclip/native/browser/paperclip_bg.wasm"));

  const { NativeEngine } = await __webpack_require__.e(/*! import() */ "paperclip_native_browser_paperclip_bg_js").then(__webpack_require__.bind(__webpack_require__, /*! ./native/browser/paperclip_bg */ "../paperclip/native/browser/paperclip_bg.js"));
  const { readFile, fileExists, resolveFile } = options.io;

  return new _esm_core__WEBPACK_IMPORTED_MODULE_0__.EngineDelegate(
    NativeEngine.new(
      readFile,
      fileExists,
      resolveFile,
      options.mode || _esm_core__WEBPACK_IMPORTED_MODULE_0__.EngineMode.MultiFrame
    ),
    onCrash ||
      function(e) {
        console.error(e);
      }
  );
};


/***/ }),

/***/ "../paperclip/esm/core/delegate.js":
/*!*****************************************!*\
  !*** ../paperclip/esm/core/delegate.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EngineMode": () => /* binding */ EngineMode,
/* harmony export */   "EngineDelegateEventType": () => /* binding */ EngineDelegateEventType,
/* harmony export */   "EngineDelegate": () => /* binding */ EngineDelegate,
/* harmony export */   "keepEngineInSyncWithFileSystem2": () => /* binding */ keepEngineInSyncWithFileSystem2
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "chokidar");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "../paperclip/esm/core/utils.js");
// 🙈




var EngineMode;
(function (EngineMode) {
    EngineMode[EngineMode["SingleFrame"] = 0] = "SingleFrame";
    EngineMode[EngineMode["MultiFrame"] = 1] = "MultiFrame";
})(EngineMode || (EngineMode = {}));
const mapResult = result => {
    if (!result) {
        return result;
    }
    if (result.Ok) {
        return result.Ok;
    }
    else {
        return { error: result.Err };
    }
};
var EngineDelegateEventType;
(function (EngineDelegateEventType) {
    EngineDelegateEventType["Loaded"] = "Loaded";
    EngineDelegateEventType["ChangedSheets"] = "ChangedSheets";
})(EngineDelegateEventType || (EngineDelegateEventType = {}));
/*
Engine delegate is the bridge between JS and the rust engine. Primary reason
for this class instead of shoving functionality into the engine itself is for performance &
reducing amount of data being passed between Rust <-> JS
*/
class EngineDelegate {
    constructor(_native, _onCrash = _utils__WEBPACK_IMPORTED_MODULE_3__.noop) {
        this._native = _native;
        this._onCrash = _onCrash;
        this._listeners = [];
        this._rendered = {};
        this._onEngineDelegateEvent = (event) => {
            if (event.kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Evaluated) {
                this._rendered = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.updateAllLoadedData)(this._rendered, event);
                this._dispatch({
                    kind: paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Loaded,
                    uri: event.uri,
                    data: this._rendered[event.uri]
                });
            }
            else if (event.kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.Diffed) {
                const existingData = this._rendered[event.uri];
                this._rendered = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.updateAllLoadedData)(this._rendered, event);
                const newData = this._rendered[event.uri];
                const removedSheetUris = [];
                for (const { uri } of existingData.importedSheets) {
                    if (!newData.allDependencies.includes(uri)) {
                        removedSheetUris.push(uri);
                    }
                }
                const addedSheets = [];
                for (const depUri of event.data.allDependencies) {
                    // Note that we only do this if the sheet is already rendered -- engine
                    // doesn't fire an event in that scenario. So we need to notify any listener that a sheet
                    // has been added, including the actual sheet object.
                    if (!existingData.allDependencies.includes(depUri) &&
                        this._rendered[depUri]) {
                        addedSheets.push({
                            uri: depUri,
                            sheet: this._rendered[depUri].sheet
                        });
                    }
                }
                if (addedSheets.length || removedSheetUris.length) {
                    this._dispatch({
                        uri: event.uri,
                        kind: paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.EngineDelegateEventKind.ChangedSheets,
                        data: {
                            newSheets: addedSheets,
                            removedSheetUris: removedSheetUris,
                            allDependencies: event.data.allDependencies
                        }
                    });
                }
            }
        };
        this._tryCatch = (fn) => {
            try {
                return fn();
            }
            catch (e) {
                this._onCrash(e);
                return null;
            }
        };
        this._dispatch = (event) => {
            // try-catch since engine will throw opaque error.
            for (const listener of this._listeners) {
                listener(event);
            }
        };
        // only one native listener to for buffer performance
        this._native.add_listener(this._dispatch);
        this.onEvent(this._onEngineDelegateEvent);
        return this;
    }
    onEvent(listener) {
        if (listener == null) {
            throw new Error(`listener cannot be undefined`);
        }
        this._listeners.push(listener);
        return () => {
            const i = this._listeners.indexOf(listener);
            if (i !== -1) {
                this._listeners.splice(i, 1);
            }
        };
    }
    parseFile(uri) {
        return mapResult(this._native.parse_file(uri));
    }
    getLoadedAst(uri) {
        return this._tryCatch(() => this._native.get_loaded_ast(uri));
    }
    parseContent(content) {
        return this._tryCatch(() => mapResult(this._native.parse_content(content)));
    }
    updateVirtualFileContent(uri, content) {
        return this._tryCatch(() => {
            const ret = mapResult(this._native.update_virtual_file_content(uri, content));
            return ret;
        });
    }
    getLoadedData(uri) {
        return this._rendered[uri];
    }
    getAllLoadedData() {
        return this._rendered;
    }
    open(uri) {
        const result = this._tryCatch(() => mapResult(this._native.run(uri)));
        if (result && result.error) {
            throw result.error;
        }
        return this._rendered[uri];
    }
}
const keepEngineInSyncWithFileSystem2 = (watcher, engine) => {
    return watcher.onChange((kind, uri) => {
        if (kind === paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.ChangeKind.Changed) {
            engine.updateVirtualFileContent(uri, fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync(new url__WEBPACK_IMPORTED_MODULE_1__.URL(uri), "utf8"));
        }
    });
};


/***/ }),

/***/ "../paperclip/esm/core/index.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InferenceKind": () => /* reexport safe */ _infer__WEBPACK_IMPORTED_MODULE_0__.InferenceKind,
/* harmony export */   "infer": () => /* reexport safe */ _infer__WEBPACK_IMPORTED_MODULE_0__.infer,
/* harmony export */   "noop": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.noop,
/* harmony export */   "resolveAllAssetFiles": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.resolveAllAssetFiles,
/* harmony export */   "resolveAllPaperclipFiles": () => /* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_2__.resolveAllPaperclipFiles,
/* harmony export */   "EngineDelegate": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.EngineDelegate,
/* harmony export */   "EngineMode": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.EngineMode,
/* harmony export */   "keepEngineInSyncWithFileSystem2": () => /* reexport safe */ _delegate__WEBPACK_IMPORTED_MODULE_3__.keepEngineInSyncWithFileSystem2
/* harmony export */ });
/* harmony import */ var _infer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./infer */ "../paperclip/esm/core/infer.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in paperclip_utils__WEBPACK_IMPORTED_MODULE_1__) if(["default","EngineDelegate","EngineMode","keepEngineInSyncWithFileSystem2","InferenceKind","infer"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => paperclip_utils__WEBPACK_IMPORTED_MODULE_1__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../paperclip/esm/core/utils.js");
/* harmony import */ var _delegate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./delegate */ "../paperclip/esm/core/delegate.js");






/***/ }),

/***/ "../paperclip/esm/core/infer.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/infer.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InferenceKind": () => /* binding */ InferenceKind,
/* harmony export */   "infer": () => /* binding */ infer
/* harmony export */ });
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_0__);

// TODO - this should be built in rust
var InferenceKind;
(function (InferenceKind) {
    InferenceKind[InferenceKind["Shape"] = 0] = "Shape";
    InferenceKind[InferenceKind["Array"] = 1] = "Array";
    InferenceKind[InferenceKind["Any"] = 2] = "Any";
})(InferenceKind || (InferenceKind = {}));
const createShapeInference = (properties = {}, fromSpread = false) => ({ kind: InferenceKind.Shape, fromSpread, properties });
const createAnyInference = () => ({ kind: InferenceKind.Any });
const ANY_INFERENCE = createAnyInference();
const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);
const addShapeInferenceProperty = (part, value, shape) => {
    var _a, _b;
    return (Object.assign(Object.assign({}, shape), { properties: Object.assign(Object.assign({}, shape.properties), { [part.name]: {
                value,
                optional: ((_a = shape.properties[part.name]) === null || _a === void 0 ? void 0 : _a.optional) === false
                    ? (_b = shape.properties[part.name]) === null || _b === void 0 ? void 0 : _b.optional : part.optional
            } }) }));
};
const mergeShapeInference = (existing, extended) => {
    if (extended.kind === InferenceKind.Any) {
        return existing;
    }
    if (extended.kind === InferenceKind.Array) {
        console.error(`Conflict: can't access properties of arra`);
        // ERRROR!
        return existing;
    }
    return Object.assign(Object.assign({}, existing), { properties: Object.assign(Object.assign({}, existing.properties), extended.properties) });
};
const addInferenceProperty = (path, value, owner, _index = 0) => {
    var _a, _b;
    if (path.length === 0) {
        return owner;
    }
    if (owner.kind === InferenceKind.Any) {
        owner = createShapeInference();
    }
    const part = path[_index];
    if (owner.kind === InferenceKind.Shape) {
        if (_index < path.length - 1) {
            let childValue = ((_a = owner.properties[part.name]) === null || _a === void 0 ? void 0 : _a.value) || createShapeInference();
            childValue = addInferenceProperty(path, value, childValue, _index + 1);
            owner = addShapeInferenceProperty(part, childValue, owner);
        }
        else {
            const existingInference = ((_b = owner.properties[part.name]) === null || _b === void 0 ? void 0 : _b.value) || ANY_INFERENCE;
            if (existingInference.kind === InferenceKind.Shape) {
                value = mergeShapeInference(existingInference, value);
            }
            owner = addShapeInferenceProperty(part, value, owner);
        }
    }
    if (owner.kind === InferenceKind.Array) {
        owner = Object.assign(Object.assign({}, owner), { value: addInferenceProperty(path, value, owner.value, _index) });
    }
    return owner;
};
const unfurlScopePath = (path, context) => {
    let cpath = path;
    if (!context.scope[path[0].name]) {
        return path;
    }
    let entirePath = path;
    while (true) {
        const property = cpath[0].name;
        const newCPath = context.scope[property];
        // if exists, but empty, then the scope is created within the template
        if (newCPath) {
            if (newCPath.length === 0) {
                return [];
            }
        }
        else {
            break;
        }
        entirePath = [...newCPath, ...entirePath.slice(1)];
        cpath = newCPath;
    }
    return entirePath;
};
const addContextInferenceProperty = (path, value, context) => (Object.assign(Object.assign({}, context), { inference: addInferenceProperty(unfurlScopePath(path, context), value, context.inference) }));
const infer = (ast) => {
    return inferNode(ast, true, {
        scope: {},
        inference: createShapeInference()
    }).inference;
};
const inferNode = (ast, isRoot, context) => {
    switch (ast.kind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Element:
            return inferElement(ast, isRoot, context);
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Slot:
            return inferSlot(ast, context);
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.NodeKind.Fragment:
            return inferFragment(ast, context);
    }
    return context;
};
const inferElement = (element, isRoot, context) => {
    for (const atttribute of element.attributes) {
        context = inferAttribute(atttribute, context);
    }
    context = inferChildren(element.children, context);
    return context;
};
const inferAttribute = (attribute, context) => {
    switch (attribute.kind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.KeyValueAttribute: {
            if (attribute.value &&
                attribute.value.attrValueKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeValueKind.Slot) {
                context = inferJsExpression(attribute.value.script, context);
            }
            if (attribute.value &&
                attribute.value.attrValueKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeValueKind.DyanmicString) {
                for (const part of attribute.value.values) {
                    if (part.partKind === paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.DynamicStringAttributeValuePartKind.Slot) {
                        context = inferJsExpression(part, context);
                    }
                }
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.PropertyBoundAttribute: {
            context = addContextInferenceProperty([{ name: attribute.bindingName, optional: true }], ANY_INFERENCE, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.ShorthandAttribute: {
            context = inferJsExpression(attribute.reference, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.AttributeKind.SpreadAttribute: {
            context = inferJsExpression(attribute.script, context, SPREADED_SHAPE_INFERENCE);
            break;
        }
    }
    return context;
};
const inferSlot = (slot, context) => {
    return inferJsExpression(slot.script, context);
};
const inferFragment = (fragment, context) => {
    return inferChildren(fragment.children, context);
};
const inferChildren = (children, context) => children.reduce((context, child) => inferNode(child, false, context), context);
const inferJsExpression = (expression, context, defaultInference = ANY_INFERENCE) => {
    switch (expression.jsKind) {
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Reference: {
            context = addContextInferenceProperty(expression.path, defaultInference, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Node: {
            context = inferNode(expression, false, context);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Object: {
            for (const property of expression.properties) {
                context = inferJsExpression(property.value, context, defaultInference);
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Array: {
            for (const value of expression.values) {
                context = inferJsExpression(value, context, defaultInference);
            }
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Conjunction: {
            context = inferJsExpression(expression.left, context, defaultInference);
            context = inferJsExpression(expression.right, context, defaultInference);
            break;
        }
        case paperclip_utils__WEBPACK_IMPORTED_MODULE_0__.JsExpressionKind.Not: {
            context = inferJsExpression(expression.expression, context, defaultInference);
            break;
        }
    }
    return context;
};


/***/ }),

/***/ "../paperclip/esm/core/utils.js":
/*!**************************************!*\
  !*** ../paperclip/esm/core/utils.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resolveAllPaperclipFiles": () => /* binding */ resolveAllPaperclipFiles,
/* harmony export */   "resolveAllAssetFiles": () => /* binding */ resolveAllAssetFiles,
/* harmony export */   "noop": () => /* binding */ noop
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ "../../node_modules/url/url.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! paperclip-utils */ "../paperclip-utils/index.js");
/* harmony import */ var paperclip_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(paperclip_utils__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "chokidar");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_3__);




// TODO - move to paperclip-utils as soon as we have a glob library that can handle virtual file systems
const findResourcesFromConfig = (get) => fs => (fromUri, relative) => {
    // symlinks may fudge module resolution, so we need to find the real path
    const fromPath = fs.realpathSync(new url__WEBPACK_IMPORTED_MODULE_1__.URL(fromUri));
    const fromPathDirname = path__WEBPACK_IMPORTED_MODULE_0__.dirname(fromPath);
    const configUrl = (0,paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.findPCConfigUrl)(fs)(fromUri);
    // If there's no config, then don't bother looking for PC files. Otherwise we're likely
    // to need esoteric logic for resolving PC that I don't think should be supported -- there should
    // just be aproach.
    if (!configUrl) {
        return [];
    }
    const configUri = new url__WEBPACK_IMPORTED_MODULE_1__.URL(configUrl);
    const config = JSON.parse(fs.readFileSync(configUri, "utf8"));
    return get(config, path__WEBPACK_IMPORTED_MODULE_0__.dirname(url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath(configUri)))
        .filter(pathname => pathname !== fromPath)
        .map(pathname => {
        if (relative) {
            const modulePath = getModulePath(configUrl, config, pathname, fromPathDirname);
            if (!path__WEBPACK_IMPORTED_MODULE_0__.isAbsolute(modulePath)) {
                return modulePath;
            }
            let relativePath = path__WEBPACK_IMPORTED_MODULE_0__.relative(fromPathDirname, modulePath);
            if (relativePath.charAt(0) !== ".") {
                relativePath = "./" + relativePath;
            }
            return relativePath;
        }
        return url__WEBPACK_IMPORTED_MODULE_1__.pathToFileURL(pathname).href;
    })
        .map(filePath => {
        return filePath.replace(/\\/g, "/");
    });
};
const resolveModuleRoots = (fromDir, roots = []) => {
    const stat = fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(fromDir);
    const realpath = stat.isSymbolicLink() ? fs__WEBPACK_IMPORTED_MODULE_3__.realpathSync(fromDir) : fromDir;
    const newStat = realpath === fromDir ? stat : fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(realpath);
    if (!newStat.isDirectory()) {
        return roots;
    }
    if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(path__WEBPACK_IMPORTED_MODULE_0__.join(fromDir, "package.json"))) {
        roots.push(fromDir);
    }
    else {
        for (const dirname of fs__WEBPACK_IMPORTED_MODULE_3__.readdirSync(realpath)) {
            resolveModuleRoots(path__WEBPACK_IMPORTED_MODULE_0__.join(fromDir, dirname), roots);
        }
    }
    return roots;
};
const filterAllFiles = (filter) => {
    const scan = (currentPath, results = []) => {
        const stat = fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(currentPath);
        const realpath = stat.isSymbolicLink()
            ? fs__WEBPACK_IMPORTED_MODULE_3__.realpathSync(currentPath)
            : currentPath;
        const newStat = realpath === currentPath ? stat : fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync(realpath);
        if (newStat.isDirectory()) {
            for (const dirname of fs__WEBPACK_IMPORTED_MODULE_3__.readdirSync(realpath)) {
                const dirpath = path__WEBPACK_IMPORTED_MODULE_0__.join(currentPath, dirname);
                scan(dirpath, results);
            }
        }
        else {
            if (filter(currentPath)) {
                results.push(currentPath);
            }
        }
        return results;
    };
    return scan;
};
const resolveResources = (config, cwd, filterFiles) => {
    const sourceDir = config.sourceDirectory === "."
        ? cwd
        : path__WEBPACK_IMPORTED_MODULE_0__.join(cwd, config.sourceDirectory);
    const filePaths = filterFiles(sourceDir);
    if (config.moduleDirectories) {
        for (const modulesDirname of config.moduleDirectories) {
            const moduleDirPath = path__WEBPACK_IMPORTED_MODULE_0__.join(cwd, modulesDirname);
            const moduleRoots = resolveModuleRoots(moduleDirPath);
            for (const moduleDir of moduleRoots) {
                // need to scan until there's a package. This covers @organization namespaces.
                if (!moduleDir) {
                    continue;
                }
                const pcConfigPath = path__WEBPACK_IMPORTED_MODULE_0__.join(moduleDir, paperclip_utils__WEBPACK_IMPORTED_MODULE_2__.PC_CONFIG_FILE_NAME);
                if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(pcConfigPath)) {
                    continue;
                }
                const moduleConfig = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_3__.readFileSync(pcConfigPath, "utf8"));
                const moduleSources = filterFiles(path__WEBPACK_IMPORTED_MODULE_0__.join(moduleDir, moduleConfig.sourceDirectory));
                filePaths.push(...moduleSources);
            }
        }
    }
    return filePaths;
};
const resolveAllPaperclipFiles = findResourcesFromConfig((config, cwd) => {
    return resolveResources(config, cwd, filterAllFiles(filePath => path__WEBPACK_IMPORTED_MODULE_0__.extname(filePath) === ".pc"));
});
const resolveAllAssetFiles = findResourcesFromConfig((config, cwd) => {
    // const ext = `+(jpg|jpeg|png|gif|svg)`;
    const exts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".ttf"];
    // const sourceDir = config.sourceDirectory;
    return resolveResources(config, cwd, filterAllFiles(filePath => exts.includes(path__WEBPACK_IMPORTED_MODULE_0__.extname(filePath))));
    // if (sourceDir === ".") {
    //   return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(cwd);
    //   // return glob.sync(`**/*.${ext}`, { cwd, realpath: true });
    // }
    // // return glob.sync(`${sourceDir}/**/*.${ext}`, { cwd, realpath: true });
    // return filterAllFiles(filePath => exts.includes(path.extname(filePath)))(path.join(cwd, sourceDir));
});
const getModulePath = (configUri, config, fullPath, fromDir) => {
    var _a;
    const configDir = path__WEBPACK_IMPORTED_MODULE_0__.dirname(url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath(configUri));
    const moduleDirectory = path__WEBPACK_IMPORTED_MODULE_0__.join(configDir, config.sourceDirectory) + "/";
    if (fullPath.indexOf(moduleDirectory) === 0) {
        const modulePath = fullPath.replace(moduleDirectory, "");
        const relativePath = path__WEBPACK_IMPORTED_MODULE_0__.relative(fromDir, fullPath);
        if (((_a = relativePath.match(/\.\.\//g)) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            return modulePath;
        }
    }
    if (config.moduleDirectories) {
        for (const moduleDirectory of config.moduleDirectories) {
            const fullModulePath = path__WEBPACK_IMPORTED_MODULE_0__.join(configDir, moduleDirectory);
            if (fullPath.indexOf(fullModulePath) === 0) {
                return fullPath.replace(fullModulePath, "").substr(1);
            }
        }
    }
    return fullPath;
};
// eslint-disable-next-line
const noop = () => { };


/***/ }),

/***/ "chokidar":
/*!*********************!*\
  !*** external "{}" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = {};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module
/******/ 		__webpack_require__("./src/frontend/sagas/engine-worker.ts");
/******/ 		// This entry module used 'exports' so it can't be inlined
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".browser.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".css";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_crc32_lib_crc32_js-node_modules_events_events_js-node_modules_fast-json--a1661b").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_frontend_sagas_engine-worker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var chunkLoadingCallback = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				importScripts("" + __webpack_require__.u(chunkId));
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkpaperclip_playground"] = self["webpackChunkpaperclip_playground"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = chunkLoadingCallback;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/wasm chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.v = (exports, wasmModuleId, wasmModuleHash, importsObj) => {
/******/ 			var req = fetch(__webpack_require__.p + "" + wasmModuleHash + ".module.wasm");
/******/ 			if (typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 				return WebAssembly.instantiateStreaming(req, importsObj)
/******/ 					.then((res) => Object.assign(exports, res.instance.exports));
/******/ 			}
/******/ 			return req
/******/ 				.then((x) => x.arrayBuffer())
/******/ 				.then((bytes) => WebAssembly.instantiate(bytes, importsObj))
/******/ 				.then((res) => Object.assign(exports, res.instance.exports));
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// run startup
/******/ 	__webpack_require__.x();
/******/ })()
;