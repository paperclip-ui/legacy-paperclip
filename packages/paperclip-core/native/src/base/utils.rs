use crc::crc32;
use regex::Regex;

pub fn get_document_id<'a>(uri: &String) -> String {
  let mut buff = uri.clone();

  if !uri.starts_with("file://") {
    buff = format!("file://{}", buff);
  }

  format!("{:x}", crc32::checksum_ieee(buff.as_bytes())).to_string()
}

pub fn get_document_style_public_scope<'a>(uri: &String) -> String {
  let mut buff = uri.clone();

  if !uri.starts_with("file://") {
    buff = format!("file://{}", buff);
  }

  format!("pub-{:x}", crc32::checksum_ieee(buff.as_bytes())).to_string()
}

pub fn is_relative_path(path: &String) -> bool {
  let url_re = Regex::new(r"(https?|data):").unwrap();
  return !url_re.is_match(path.clone().as_str());
}
