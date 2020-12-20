import { EngineDelegate } from "paperclip";
import { EventEmitter } from "events";
import {
  AnnotationsChanged,
  PCMutation,
  PCMutationAction,
  PCMutationActionKind
} from "./mutations";
import { ExprSource, SourceLocation, VirtJsObject } from "paperclip-utils";

type ContentChangedHandler = (uri: string, content: string) => void;
type PCSourceWriterOptions = {
  getContent: (uri: string) => Promise<string> | string;
};

export type ContentChange = {
  start: number;
  end: number;
  value: string;
};

const ANNOTATION_KEYS = ["title", "width", "height", "x", "y"];

export class PCSourceWriter {
  constructor(private _options: PCSourceWriterOptions) {}
  async getContentChanges({ source, action }: PCMutation) {
    const content = await this._options.getContent(source.uri);
    console.log(source, action);

    const changes: ContentChange[] = [];

    switch (action.kind) {
      case PCMutationActionKind.ANNOTATIONS_CHANGED: {
        changes.push(this._getAnnotationChange(source, action.annotations));
        break;
      }
    }

    return changes;
  }
  private _getAnnotationChange(
    source: ExprSource,
    annotations: Object | null
  ): ContentChange {
    const buffer = [""];

    for (const key in annotations) {
      const chunk = [`  @${key} `];
      const value = annotations[key];
      if (
        Array.isArray(value) ||
        typeof value === "string" ||
        typeof value === "number"
      ) {
        chunk.push(JSON.stringify(value));
      } else {
        chunk.push("{ ");
        const items = [];
        const sortedKeys = Object.keys(value).sort((a, b) => {
          return ANNOTATION_KEYS.indexOf(a) < ANNOTATION_KEYS.indexOf(b)
            ? -1
            : 1;
        });

        for (const k of sortedKeys) {
          items.push(`${k}: ${JSON.stringify(value[k])}`);
        }
        chunk.push(items.join(", "), " }");
      }

      buffer.push(chunk.join(""));
    }

    buffer.push("");

    return {
      start: source.location.start,
      end: source.location.end,
      value: buffer.join("\n")
    };
  }
}
