var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import * as path from "path";
import * as url from "url";
import { expect } from "chai";
import { createEngine } from "../../../";
import {
  stringifyLoadResult,
  TEST_FIXTURE_DIRECTORY,
  waitForError,
  noop
} from "../utils";
describe(__filename + "#", () => {
  it("Can load an entry that has an import", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const e = yield createEngine();
      const result = stringifyLoadResult(
        yield e.run(
          url
            .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "good-import.pc"))
            .toString()
        )
      );
      expect(result.replace(/ data-pc-[^>\s]+/, "")).to.eql(
        `<style></style><div>I'm a secret! </div>`
      );
    }));
  it("Won't load module src where the casing is incorrect", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const e = yield createEngine();
      const ep = waitForError(e);
      e.run(
        url
          .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "bad-import.pc"))
          .toString()
      ).catch(noop);
      const error = yield ep;
      expect(error.errorKind).to.eql("Graph");
      expect(error.info.message).to.eql("import not found");
    }));
  it("Displays an error for 404 CSS url", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const e = yield createEngine();
      let err;
      try {
        yield e.run(
          url
            .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "bad-css-url.pc"))
            .toString()
        );
      } catch (e) {
        err = e;
      }
      expect(err).not.to.eq(null);
      expect(err.errorKind).to.eql("Runtime");
      expect(err.message).to.eql("Unable to resolve file.");
    }));
  it("can resolve module using module path syntax", () =>
    __awaiter(void 0, void 0, void 0, function*() {
      const e = yield createEngine();
      const result = yield e.run(
        url
          .pathToFileURL(path.join(TEST_FIXTURE_DIRECTORY, "mod-import.pc"))
          .toString()
      );
      expect(
        stringifyLoadResult(result).replace(/ data-pc-[^>\s]+/, "")
      ).to.eql(`<style></style><div>I'm a secret! </div>`);
    }));
});
