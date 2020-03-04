// see https://github.com/paritytech/jsonrpc/blob/master/pubsub/more-examples/examples/pubsub_ws.rs
// #![recursion_limit="1024"]

#[macro_use]
extern crate matches;

mod base;
mod css;
mod pc;
mod js;
mod engine;

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
    part: Option<String>
}

#[derive(Deserialize, Debug, Serialize)]
struct UnloadParams {
    uri: String
}

#[derive(Deserialize, Debug, Serialize)]
struct ParseFileParams {
    uri: String
}

#[derive(Deserialize, Debug, Serialize)]
struct ParseContentParams {
    content: String
}

#[derive(Deserialize, Debug, Serialize)]
struct EvaluateFileStylesParams {
    uri: String
}

#[derive(Deserialize, Debug, Serialize)]
struct EvaluateContentStylesParams {
    content: String,
    uri: String
}

#[derive(Deserialize, Debug, Serialize)]
struct UpdateVirtualFileContentParams {
    uri: String,
    content: String
}

fn main() {
    // let args: Vec<String> = env::args().collect();

    // let port: String = args[1].to_string();
    // let http_path: Option<String> = if args.len() > 2 { Some(args[2].to_string()) } else { None};

    // // TODO - http opts
    // let engine_mutex = Arc::new(Mutex::new(Engine::new(http_path)));

    // let mut io = IoHandler::new();
    // let load_engine_mutex = engine_mutex.clone();
	// io.add_method("load", move |params: Params| {
    //     let params: LoadParams = params.parse().unwrap();
    //     block_on(load_engine_mutex.lock().unwrap().load(&params.uri, params.part));
	// 	Ok(Value::String("ok".into()))
    // });

    // let unload_engine_mutex = engine_mutex.clone();
	// io.add_method("unload", move |params: Params| {
	// 	let params: UnloadParams = params.parse().unwrap();
    //     unload_engine_mutex.lock().unwrap().unload(params.uri);
	// 	Ok(Value::String("ok".into()))
    // });

    // let parse_file_engine_mutex = engine_mutex.clone();
	// io.add_method("parse_file", move |params: Params| {
    //     let params: ParseFileParams = params.parse().unwrap();
    //     let result = block_on(parse_file_engine_mutex.lock().unwrap().parse_file(&params.uri));
    //     let json = match result {
    //         Ok(node) => serde_json::to_string(&node).unwrap(),
    //         Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
    //     };
	// 	Ok(Value::String(json.to_string()))
    // });

    // let parse_content_engine_mutex = engine_mutex.clone();
	// io.add_method("parse_content", move |params: Params| {
    //     let params: ParseContentParams = params.parse().unwrap();
    //     let result = block_on(parse_content_engine_mutex.lock().unwrap().parse_content(&params.content));
    //     let json = match result {
    //         Ok(node) => serde_json::to_string(&node).unwrap(),
    //         Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
    //     };
	// 	Ok(Value::String(json.into()))
    // });


    // let evaluate_file_styles_mutex = engine_mutex.clone();
	// io.add_method("evaluate_file_styles", move |params: Params| {
    //     let params: EvaluateFileStylesParams = params.parse().unwrap();
    //     let result = block_on(evaluate_file_styles_mutex.lock().unwrap().evaluate_file_styles(&params.uri));
    //     let json = match result {
    //         Ok(sheet) => serde_json::to_string(&sheet).unwrap(),
    //         Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
    //     };
	// 	Ok(Value::String(json.into()))
    // });
    

    // let evaluate_file_styles_mutex = engine_mutex.clone();
	// io.add_method("evaluate_content_styles", move |params: Params| {
    //     let params: EvaluateContentStylesParams = params.parse().unwrap();
    //     let result = block_on(evaluate_file_styles_mutex.lock().unwrap().evaluate_content_styles(&params.content, &params.uri));
    //     let json = match result {
    //         Ok(sheet) => serde_json::to_string(&sheet).unwrap(),
    //         Err(error) => format!("{{\"error\":{}}}", serde_json::to_string(&error).unwrap())
    //     };
	// 	Ok(Value::String(json.into()))
    // });
    
    // let update_virtual_file_content_engine_mutex = engine_mutex.clone();
	// io.add_method("update_virtual_file_content", move |params: Params| {
    //     let params: UpdateVirtualFileContentParams = params.parse().unwrap();
    //     block_on(update_virtual_file_content_engine_mutex.lock().unwrap().update_virtual_file_content(&params.uri, &params.content));
	// 	Ok(Value::String("ok".into()))
    // });
    
    // let drain_events_engine_mutex = engine_mutex.clone();
	// io.add_method("drain_events", move |_params| {
    //     let events = drain_events_engine_mutex.lock().unwrap().drain_events();
	// 	Ok(Value::String(serde_json::to_string(&events).unwrap()))
    // });

	// let server = ServerBuilder::new(io)
    // .start(&format!("127.0.0.1:{}", port).parse().unwrap())
    // .expect("Server must start with no issues");

    // println!("--READY--");

    // server.wait();
}
