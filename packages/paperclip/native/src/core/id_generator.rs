use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct IDGenerator {
  pub seed: String,
  pub count: u32,
}

impl IDGenerator {
  pub fn new(seed: String) -> IDGenerator {
    IDGenerator { seed, count: 0 }
  }

  pub fn new_id(&mut self) -> String {
    let id_count = self.count + 1;
    self.count = id_count;
    format!("{}-{}", self.seed, id_count)
  }
  pub fn new_seed(&mut self) -> String {
    self.new_id()
  }
}

pub fn generate_seed() -> String {
  Uuid::new_v4().to_string()
}
