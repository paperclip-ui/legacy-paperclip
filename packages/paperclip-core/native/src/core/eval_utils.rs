use super::vfs::VirtualFileSystem;
use crate::base::ast::Range;
use crate::base::runtime::RuntimeError;
use crate::base::utils::is_relative_path;

pub fn resolve_asset(
  from_uri: &String,
  to_path: &String,
  range: &Range,
  vfs: &VirtualFileSystem,
) -> Result<String, RuntimeError> {
  if !is_relative_path(to_path) {
    return Ok(to_path.to_string());
  }

  let value_option = vfs.resolve(from_uri, &to_path);
  if let Some(value) = &value_option {
    if vfs.file_exists(&value) {
      return Ok(value.to_string());
    }
  }

  return Err(RuntimeError::new(
    format!("Unable to resolve file: {}", to_path),
    from_uri,
    range,
  ));
}
