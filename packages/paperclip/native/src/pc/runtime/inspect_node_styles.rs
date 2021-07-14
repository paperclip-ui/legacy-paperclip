pub struct StyleDeclarationDetails {
  pub name: String,

  // TODO - should parse this out and provide AST here. For 
  // MVP this is fine however.
  pub value: String,

  // true / false if being used. Needs to be here in case of !important flag
  pub applied: bool
}


pub struct StyleRuleDetails {

  // computed style info. TODO: include scopes for this? 
  selector_text: String,

  // AST source information
  source_id: String,
  media: Option<String>,


  declarations: Vec<StyleDeclarationDetails>,

  // need to do docs for this
  priority: i32
}

pub struct InspectionOptions {
  screen_width: Option<i32>
}

pub fn inspect_node_styles(
  eval_info: &EvalInfo,
  graph: &DependencyGraph,
  options: &InspectionOptions
) -> Vec<LintWarning> {
  /*
  TODO:

  - scan all style selectors loaded in eval info
  - include triggers for media queries
  - parse declaration values (AST code should be coming in from CSS)
  - need to sort based on selector priority! 

  */
}