extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;


#[macro_use]
extern crate matches;
extern crate console_error_panic_hook;


mod base;
mod css;
mod pc;
mod js;
mod engine;

use ::futures::executor::block_on;
use engine::{Engine};

extern crate web_sys;


#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct NativeEngine {
  target: Engine
}

#[wasm_bindgen]
impl NativeEngine {
    pub fn new(read_file: js_sys::Function, file_exists: js_sys::Function, resolve_file: js_sys::Function) -> NativeEngine {
      NativeEngine {
        target: Engine::new(Box::new(move |uri| {
          let this = JsValue::NULL;
          let arg = JsValue::from(uri);
          read_file.call1(&this, &arg).unwrap().as_string().unwrap()
        }), Box::new(move |uri| {
          let this = JsValue::NULL;
          let arg = JsValue::from(uri);
          file_exists.call1(&this, &arg).unwrap().as_bool().unwrap()
        }), Box::new(move |from_path, relative_path| {
          let this = JsValue::NULL;
          let arg = JsValue::from(from_path);
          let arg2 = JsValue::from(relative_path);
          resolve_file.call2(&this, &arg, &arg2).unwrap().as_string().unwrap()
        }))
      }
    }
    pub fn load(&mut self, uri: String, part: Option<String>) {
      block_on(self.target.load(&uri, part));
    }
    pub fn add_listener(&mut self, listener: js_sys::Function) {
      self.target.add_listener(Box::new(move |event| {
        let this = JsValue::NULL;
        let arg = JsValue::from_serde(&event).unwrap();
        listener.call1(&this, &arg).unwrap();
      }));
    }
    pub fn evaluate_content_styles(&mut self, content: String, uri: String) -> JsValue {
      console_error_panic_hook::set_once();
      let result = block_on(self.target.evaluate_content_styles(&content, &uri));
      JsValue::from_serde(&result).unwrap()
    }
    pub fn evaluate_file_styles(&mut self, uri: String) -> JsValue {
      console_error_panic_hook::set_once();
      let result = block_on(self.target.evaluate_file_styles(&uri));
      JsValue::from_serde(&result).unwrap()
    }
    pub fn parse_content(&mut self, content: String) -> JsValue {
      console_error_panic_hook::set_once();
      let result = block_on(self.target.parse_content(&content));
      JsValue::from_serde(&result).unwrap()
    }
    pub fn parse_file(&mut self, uri: String) -> JsValue {
      console_error_panic_hook::set_once();
      let result = block_on(self.target.parse_file(&uri));
      JsValue::from_serde(&result).unwrap()
    }
    pub fn update_virtual_file_content(&mut self, uri: String, content: String) {
      console_error_panic_hook::set_once();
      block_on(self.target.update_virtual_file_content(&uri, &content));
    }
}
