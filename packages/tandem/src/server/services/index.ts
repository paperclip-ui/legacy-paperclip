import { Engine } from "paperclip";
import { BaseLanguageService } from "./base";
import { PCHTMLLanguageService } from "./html";

/**
 * Generic service facade for handling Paperclip ASTs
 */

export class LanguageServices {
  constructor(private _services: BaseLanguageService[]) {}
  getService(uri: string) {
    return this._services.find(service => service.supports(uri));
  }
}

export const createServices = (engine: Engine) => {
  return new LanguageServices([
    // new PCCSSLanguageService(engine),
    // new PCJSLanguageService(engine),
    new PCHTMLLanguageService(engine)
  ]);
};
