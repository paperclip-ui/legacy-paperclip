// see https://github.com/paritytech/jsonrpc/blob/master/pubsub/more-examples/examples/pubsub_ws.rs
// #![recursion_limit="1024"]

#[macro_use]
extern crate matches;

#[macro_use]
extern crate lazy_static;

mod base;
mod core;
mod css;
mod engine;
mod js;
mod pc;

use serde::{Deserialize, Serialize};
// use jsonrpc_core::*;
// use std::sync::{Arc, Mutex};
// use std::env;
// use jsonrpc_tcp_server::*;
// use ::futures::executor::block_on;

// use engine::{Engine};

#[derive(Deserialize, Debug, Serialize)]
struct LoadParams {
  uri: String,
  part: Option<String>,
}

#[derive(Deserialize, Debug, Serialize)]
struct UnloadParams {
  uri: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct ParseFileParams {
  uri: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct ParseContentParams {
  content: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct EvaluateFileStylesParams {
  uri: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct EvaluateContentStylesParams {
  content: String,
  uri: String,
}

#[derive(Deserialize, Debug, Serialize)]
struct UpdateVirtualFileContentParams {
  uri: String,
  content: String,
}

fn main() {
}
