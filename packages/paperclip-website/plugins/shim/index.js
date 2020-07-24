import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder
} from "util";

export const TextDecoder =
  typeof window !== "undefined" ? window.TextDecoder : NodeTextDecoder;
export const TextEncoder =
  typeof window !== "undefined" ? window.TextEncoder : NodeTextEncoder;
