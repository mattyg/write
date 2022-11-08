use hdi::prelude::*;





#[hdk_entry_helper]
#[derive(Clone)]
pub struct Pad {
  pub author: AgentPubKey,
  pub title: String,
  pub content: String,
}