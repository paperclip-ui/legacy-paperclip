import { TextEdit } from "./crdt-document";

export const mapParallelEditsToSequential = (
  input: string,
  changes: TextEdit[]
): TextEdit[] => {
  let output = input;
  const sequentialChanges: TextEdit[] = [];

  for (let i = 0, n = changes.length; i < n; i++) {
    const { index, deleteCount, chars } = changes[i];

    const start = index;
    const value = chars.join("");
    const end = index + deleteCount;

    let offsetStartIndex = start;
    let offsetEndIndex = end;
    let invalid = false;
    const insertion = start === end;

    // based on all of the previous edits, calculate where this edit is
    for (let j = 0; j < i; j++) {
      const { index, deleteCount, chars } = changes[i];
      const previousStartIndex = index;
      const previousEndIndex = index + deleteCount;
      const previousNewValue = chars.join("");

      const prevInsertion = previousStartIndex === previousEndIndex;
      const startIndicesMatch = start === previousStartIndex;
      const endIndicesMatch = end === previousEndIndex;

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
      if (previousStartIndex < end && previousStartIndex > start) {
        offsetEndIndex = offsetEndIndex - (end - previousStartIndex);
      }

      // input :  a b c d e f g h i
      // prev  :   ^-----^
      // ✔     :       ^-------^
      if (previousEndIndex > start && previousEndIndex < end) {
        offsetStartIndex = offsetStartIndex + (previousEndIndex - start);
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
        ((start > previousStartIndex && end < previousEndIndex) ||
          (start < previousStartIndex && end > previousEndIndex)) &&
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
      if (previousStartIndex <= start && end > previousStartIndex) {
        const prevValueLengthDelta =
          previousNewValue.length - (previousEndIndex - previousStartIndex);

        // shift left or right
        offsetStartIndex = Math.max(0, offsetStartIndex + prevValueLengthDelta);
        offsetEndIndex = Math.max(0, offsetEndIndex + prevValueLengthDelta);
      }
    }

    if (!invalid) {
      sequentialChanges.push({
        index: offsetStartIndex,
        deleteCount: offsetEndIndex - offsetStartIndex,
        chars: value.split(""),
      });
    } else {
      console.log("INV");
    }
  }

  return sequentialChanges;
};
