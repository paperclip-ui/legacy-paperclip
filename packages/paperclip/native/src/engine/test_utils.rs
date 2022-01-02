use crate::engine::engine::Engine;
use crate::pc::runtime::evaluator::EngineMode;
use std::collections::HashMap;

pub fn create_mock_engine<'a>(graph: &HashMap<String, String>) -> Engine {
  let graph2 = graph.clone();
  let graph3 = graph.clone();

  Engine::new(
    Box::new(move |uri| {
      return graph2[uri].to_string();
    }),
    Box::new(move |uri| graph3.get(uri) != None),
    Box::new(|a, b| Some(b.to_string())),
    None,
    false,
    EngineMode::SingleFrame,
  )
}
