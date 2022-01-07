// https://github.com/crcn/tandem/blob/0.1.1/packages/aerial-common2/src/string/editor.ts

import { ContentChange } from "@paperclipui/source-writer";

export const editString = (input: string, mutations: ContentChange[]) => {
  let output = input;

  const computedReplacements: Array<[number, number, string]> = [];

  for (let i = 0, n = mutations.length; i < n; i++) {
    const { start: startIndex, end: endIndex, value } = mutations[i];

    let offsetStartIndex = startIndex;
    let offsetEndIndex = endIndex;
    let invalid = false;
    const insertion = startIndex === endIndex;

    // based on all of the previous edits, calculate where this edit is
    for (let j = 0; j < i; j++) {
      const {
        start: previousStartIndex,
        end: previousEndIndex,
        value: previousNewValue
      } = mutations[j];

      const prevInsertion = previousStartIndex === previousEndIndex;
      const startIndicesMatch = startIndex === previousStartIndex;
      const endIndicesMatch = endIndex === previousEndIndex;

      // input :  a b c d e f g h i
      // prev  :     ^-------^
      // ✔     :     ^
      const insertBeginning = startIndicesMatch && insertion;

      // input :  a b c d e f g h i
      // prev  :     ^-------^
      // ✔     :             ^
      const insertEnd = endIndicesMatch && insertion;

      // input :  a b c d e f g h i
      // prev  :     ^
      // ✔     :     ^-------^
      const prevInsertBeginning = startIndicesMatch && prevInsertion;

      // input :  a b c d e f g h i
      // prev  :     ^
      // ✔     :     ^-------^
      const prevInsertEnd = endIndicesMatch && prevInsertion;

      const currOrPrevInserting =
        insertBeginning || insertEnd || prevInsertBeginning || prevInsertEnd;

      // input :  a b c d e f g h i
      // prev  :         ^-------^
      // ✔     :     ^-------^
      if (previousStartIndex < endIndex && previousStartIndex > startIndex) {
        offsetEndIndex = offsetEndIndex - (endIndex - previousStartIndex);
      }

      // input :  a b c d e f g h i
      // prev  :   ^-----^
      // ✔     :       ^-------^
      if (previousEndIndex > startIndex && previousEndIndex < endIndex) {
        offsetStartIndex = offsetStartIndex + (previousEndIndex - startIndex);
      }

      // Invalid edit because previous replacement
      // completely clobbers this one. There's nothing else to edit.
      // input :  a b c d e f g h i
      // prev  :   ^---------^
      // ✔     :     ^---^
      // ✔     : ^-------------^
      // ✘     :   ^
      // ✘     :             ^
      // ✘     :   ^-----------^
      if (
        ((startIndex >= previousStartIndex && endIndex <= previousEndIndex) ||
          (startIndex < previousStartIndex && endIndex >= previousEndIndex)) &&
        !currOrPrevInserting
      ) {
        invalid = true;
        break;
      }

      // input :  a b c d e f g h
      // prev  :     ^-----^
      // ✔     :       ^-----^
      // ✔     :           ^---^
      // ✔     :               ^-^
      // ✔     : ^-----^
      // ✘     : ^---^
      // ✘     :   ^-^
      // ✘     :     ^

      // input :  a b c d e f g h
      // prev  : ^---^
      // ✔     :   ^---^
      if (previousStartIndex <= startIndex && endIndex > previousStartIndex) {
        const prevValueLengthDelta =
          previousNewValue.length - (previousEndIndex - previousStartIndex);

        // shift left or right
        offsetStartIndex = Math.max(0, offsetStartIndex + prevValueLengthDelta);
        offsetEndIndex = Math.max(0, offsetEndIndex + prevValueLengthDelta);
      }
    }

    if (!invalid) {
      output =
        output.substr(0, offsetStartIndex) +
        value +
        output.substr(offsetEndIndex);
    }
  }
  return output;
};
