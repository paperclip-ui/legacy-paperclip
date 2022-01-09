extern crate wasm_bindgen;

use serde::Serialize;
use wasm_bindgen::prelude::*;

#[macro_use]
extern crate matches;
extern crate console_error_panic_hook;

#[macro_use]
extern crate lazy_static;

mod annotation;
mod base;
mod core;
mod coverage;
mod css;
mod engine;
mod pc;
mod script;

use crate::coverage::reporter::CoverageReport;
use crate::pc::runtime::evaluator::EngineMode;
use crate::pc::runtime::inspect_node_styles::InspectionOptions;
use crate::pc::runtime::lint::LintOptions;
use crate::pc::runtime::virt as pc_virt;
use ::futures::executor::block_on;
use engine::engine::Engine;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

extern crate web_sys;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
}

#[wasm_bindgen]
pub struct NativeEngine {
  target: Engine,
}

#[wasm_bindgen]
#[derive(Debug, PartialEq, Serialize)]
#[serde(tag = "kind")]
pub enum NativeEngineMode {
  SingleFrame,
  MultiFrame,
}

#[wasm_bindgen]
impl NativeEngine {
  pub fn new(
    read_file: js_sys::Function,
    file_exists: js_sys::Function,
    resolve_file: js_sys::Function,
    get_lint_config: js_sys::Function,
    engine_mode: NativeEngineMode,
  ) -> NativeEngine {
    console_error_panic_hook::set_once();
    NativeEngine {
      target: Engine::new(
        Box::new(move |uri| {
          let this = JsValue::NULL;
          let arg = JsValue::from(uri);
          read_file.call1(&this, &arg).unwrap().as_string().unwrap()
        }),
        Box::new(move |uri| {
          let this = JsValue::NULL;
          let arg = JsValue::from(uri);
          file_exists.call1(&this, &arg).unwrap().as_bool().unwrap()
        }),
        Box::new(move |from_path, relative_path| {
          let this = JsValue::NULL;
          let arg = JsValue::from(from_path);
          let arg2 = JsValue::from(relative_path);
          resolve_file.call2(&this, &arg, &arg2).unwrap().as_string()
        }),
        Some(Box::new(move |uri| {
          let this = JsValue::NULL;
          let arg = JsValue::from(uri);
          get_lint_config
            .call1(&this, &arg)
            .unwrap()
            .into_serde()
            .unwrap_or(None)
        })),
        false,
        match engine_mode {
          NativeEngineMode::SingleFrame => EngineMode::SingleFrame,
          NativeEngineMode::MultiFrame => EngineMode::MultiFrame,
        },
      ),
    }
  }
  pub fn generate_coverage_report(&mut self) -> JsValue {
    let result = block_on(self.target.generate_coverage_report());
    JsValue::from_serde(&result).unwrap()
  }
  pub fn load(&mut self, uri: String) -> JsValue {
    let result = block_on(self.target.load(&uri));
    JsValue::from_serde(&result).unwrap()
  }
  pub fn run(&mut self, uri: String) -> JsValue {
    let result = block_on(self.target.run(&uri));
    JsValue::from_serde(&result).unwrap()
  }
  pub fn get_graph_uris(&self) -> JsValue {
    let result = self.target.get_graph_uris();
    JsValue::from_serde(&result).unwrap()
  }
  pub fn reset(&mut self) {
    self.target.reset()
  }
  pub fn add_listener(&mut self, listener: js_sys::Function) {
    self.target.add_listener(Box::new(move |event| {
      let this = JsValue::NULL;
      let arg = JsValue::from_serde(&event).unwrap();
      listener.call1(&this, &arg).unwrap();
    }));
  }
  pub fn lint_file(&mut self, uri: String) -> JsValue {
    JsValue::from_serde(&self.target.lint_file(&uri)).unwrap()
  }
  pub fn get_virtual_node_source_info(&mut self, path: Vec<usize>, uri: String) -> JsValue {
    JsValue::from_serde(
      &self
        .target
        .get_virtual_node_source_info(&pc_virt::NodeSource {
          path,
          document_uri: uri,
        }),
    )
    .unwrap()
  }
  pub fn get_loaded_ast(&mut self, uri: String) -> JsValue {
    let result = self.target.get_loaded_ast(&uri);
    JsValue::from_serde(&result).unwrap()
  }
  pub fn get_dependency(&mut self, uri: String) -> JsValue {
    let result = self.target.get_dependency(&uri);
    JsValue::from_serde(&result).unwrap()
  }
  pub fn parse_content(&mut self, content: String, uri: String) -> JsValue {
    let result = block_on(self.target.parse_content(&content, &uri));
    JsValue::from_serde(&result).unwrap()
  }
  pub fn parse_file(&mut self, uri: String) -> JsValue {
    let result = block_on(self.target.parse_file(&uri));
    JsValue::from_serde(&result).unwrap()
  }
  pub fn purge_unlinked_files(&mut self) {
    block_on(self.target.purge_unlinked_files());
  }
  pub fn get_expression_by_id(&self, id: String) -> JsValue {
    JsValue::from_serde(&self.target.get_expression_by_id(&id)).unwrap()
  }
  pub fn inspect_node_styles(
    &mut self,
    path: Vec<usize>,
    uri: String,
    screen_width: u32,
  ) -> JsValue {
    let result = self.target.inspect_node_styles(
      &pc_virt::NodeSource {
        path,
        document_uri: uri,
      },
      &InspectionOptions {
        screen_width: Some(screen_width),
        include_inherited: true,
      },
    );

    JsValue::from_serde(&result).unwrap()
  }
  pub fn update_virtual_file_content(&mut self, uri: String, content: String) {
    console_error_panic_hook::set_once();
    block_on(self.target.update_virtual_file_content(&uri, &content));
  }
}
