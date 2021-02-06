use std::collections::HashMap;
// use curl::easy::Easy;

pub type FileReaderFn = dyn Fn(&String) -> String;
pub type FileExistsFn = dyn Fn(&String) -> bool;
pub type FileResolverFn = dyn Fn(&String, &String) -> Option<String>;

#[allow(dead_code)]
pub struct VirtualFileSystem {
  read_file: Box<FileReaderFn>,
  resolve_file: Box<FileResolverFn>,
  file_exists: Box<FileExistsFn>,
  pub contents: HashMap<String, String>,
}

#[allow(dead_code)]
impl VirtualFileSystem {
  pub fn new(
    read_file: Box<FileReaderFn>,
    file_exists: Box<FileExistsFn>,
    resolve_file: Box<FileResolverFn>,
  ) -> VirtualFileSystem {
    VirtualFileSystem {
      read_file,
      file_exists,
      resolve_file,
      contents: HashMap::new(),
    }
  }
  pub fn reset(&mut self) {
    self.contents = HashMap::new();
  }
  pub async fn load(&mut self, uri: &String) -> Result<&String, &'static str> {
    if self.contents.contains_key(uri) {
      Ok(self.contents.get(uri).unwrap())
    } else {
      self.reload(uri).await
    }
  }

  pub fn resolve(&self, from_path: &String, relative_path: &String) -> Option<String> {
    (self.resolve_file)(from_path, relative_path)
  }
  pub fn purge_unlinked_files(&mut self) -> Vec<String> {
    let mut unlinked: Vec<String> = Vec::new();

    for (uri, _) in self.contents.iter() {
      if !(self.file_exists)(uri) {
        unlinked.push(uri.clone());
      }
    }

    for uri in &unlinked {
      self.contents.remove(uri);
    }

    unlinked
  }

  pub async fn update(&mut self, uri: &String, content: &String) -> Result<&String, &'static str> {
    if !(self.file_exists)(uri) {
      return Err("File does not exist");
    }
    self.contents.insert(uri.to_string(), content.to_string());
    Ok(self.contents.get(uri).unwrap())
  }

  pub async fn reload(&mut self, uri: &String) -> Result<&String, &'static str> {
    if !(self.file_exists)(uri) {
      return Err("File does not exist");
    }
    let content = (self.read_file)(uri);

    self.contents.insert(uri.to_string(), content);
    Ok(self.contents.get(uri).unwrap())
  }
}
