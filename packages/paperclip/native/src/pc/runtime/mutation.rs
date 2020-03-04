use super::virt;

pub struct InsertChild<'a> {
  node: virt::Node<'a>,
  index: usize
}

pub struct DeleteChild<'a> {
  index: usize
}

pub struct SetAttribute<'a> {
  name: &'a str,
  value: &'a str
}

pub enum Action {
  InsertChild(InsertChild<'a>),
  DeleteChild(InsertChild<'a>),
  SetAttribute(SetAttribute<'a>)
}

pub enum Mutation<'a> {
  nodePath: Vec<usize>,
  action: Action<'a>
}