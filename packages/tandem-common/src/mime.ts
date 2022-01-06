import * as mime from "mime-types";
import { isPaperclipFile } from "@paperclipui/utils";

export const PLAIN_TEXT_MIME_TYPES = [
  "text/plain",
  "image/svg+xml",
  "text/css"
];

// const ALT_MIME_TYPES = [
//   "application/vnd.ms-fontobject", // .eot
//   "font/ttf",
//   "font/woff",
//   "font/woff2",
//   "application/font-woff",
//   "application/font-ttf",
//   "application/font-woff2"
// ];

export const MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "video/quicktime",
  "video/mp4"
];

export const isPlainTextFile = (uri: string) => {
  return (
    isPaperclipFile(uri) ||
    PLAIN_TEXT_MIME_TYPES.includes(String(mime.lookup(uri)))
  );
};

export const isMediaFile = (uri: string) => {
  return MEDIA_MIME_TYPES.includes(String(mime.lookup(uri)));
};
