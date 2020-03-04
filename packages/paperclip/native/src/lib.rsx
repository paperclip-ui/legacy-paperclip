
use neon::prelude::*;
use neon::{declare_types, register_module};

#[macro_use]
extern crate matches;

mod base;
mod css;
mod pc;
mod js;
mod engine;

use serde::{Deserialize, Serialize};
use jsonrpc_core::*;
use std::sync::{Arc, Mutex};
use std::env;
use jsonrpc_tcp_server::*;
use ::futures::executor::block_on;


use engine::{Engine};

declare_types! {
  pub class JsEngine for Engine {
    init(mut cx) {

      let js_options: Option<JsObject> = match cx.argument_opt(0) {
        Some(arg) => {
          Some(*arg.downcast::<JsObject>()
          .unwrap_or(JsObject::new(&mut cx)))
        },
        None => None
      };

      let http_prefix: Option<String> = match js_options {
        Some(options) => {
          match options.get(&mut cx, "httpFilePath") {
            Ok(value) => {
              match value.downcast::<JsString>() {
                Ok(v) => Some(v.value()),
                Err(_) => None,
              }
            },
            Err(_) => None
          }
        },
        None => None
      };

      Ok(Engine::new(http_prefix))
    }
    method load(mut cx) {
      let uri: String = cx.argument::<JsString>(0)?.value();
      let part: Option<String> = match cx.argument_opt(1) {
        Some(arg) => Some(arg.downcast::<JsString>().or_throw(&mut cx)?.value()),
        None => None
      };

      let mut this = cx.this();
      cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.load(&uri, part));
      });
        
      Ok(cx.undefined().upcast())
    }

    method parseContent(mut cx) {
      let content: String = cx.argument::<JsString>(0)?.value();

      let mut this = cx.this();
      let result = cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.parse_content(&content))
      });

      let json = match result {
        Ok(node) => serde_json::to_string(&node).unwrap(),
        Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
      };
        
      Ok(cx.string(&json).upcast())
    }

    method parseFile(mut cx) {
      let uri: String = cx.argument::<JsString>(0)?.value();

      let mut this = cx.this();
      let result = cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.parse_file(&uri))
      });

      let json = match result {
        Ok(node) => serde_json::to_string(&node).unwrap(),
        Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
      };
        
      Ok(cx.string(&json).upcast())
    }

    method evaluateFileStyles(mut cx) {
      let uri: String = cx.argument::<JsString>(0)?.value();

      let mut this = cx.this();
      let result = cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.evaluate_file_styles(&uri))
      }

      let json = match result {
        Ok(node) => serde_json::to_string(&node).unwrap(),
        Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
      };
        
      Ok(cx.string(&json).upcast())
    }

    method evaluateContentStyles(mut cx) {
      let content: String = cx.argument::<JsString>(0)?.value();
      let uri: String = cx.argument::<JsString>(1)?.value();

      let mut this = cx.this();
      let result = cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.evaluate_content_styles(&content, &uri))
      });

      let json = match result {
        Ok(node) => serde_json::to_string(&node).unwrap(),
        Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
      };
        
      Ok(cx.string(&json).upcast())
    }

    method updateVirtualFileContent(mut cx) {
      let uri: String = cx.argument::<JsString>(0)?.value();
      let content: String = cx.argument::<JsString>(1)?.value();

      let mut this = cx.this();
      cx.borrow_mut(&mut this, |mut engine| {
        block_on(engine.update_virtual_file_content(&uri, &content))
      });

      Ok(cx.undefined().upcast())
    }
    method drainEvents(mut cx) {
      let mut this = cx.this();
      let result = cx.borrow_mut(&mut this, |mut engine| {
        engine.drain_events()
      });

      let json = serde_json::to_string(&result).unwrap();

      Ok(cx.string(&json).upcast())
    }
  }
}

register_module!(mut m, { m.export_class::<JsEngine>("Engine") });