import { ColorInfo, Suggestion } from "./base";
import { remoteChannel } from "@paperclip-ui/common";

export const documentColors = remoteChannel<{ uri: string }, ColorInfo[]>(
  "documentColors"
);
export const updateDocument = remoteChannel<{ uri: string; value: string }>(
  "updateDocument"
);
export const getSuggestions = remoteChannel<
  { uri: string; text: string },
  Suggestion[]
>("getSuggestions");
