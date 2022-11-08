use hdi::prelude::*;

mod pad;
pub use pad::Pad;


#[hdk_entry_helper]
#[derive(Clone)]
pub struct Anchor(pub String);

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
  #[entry_def()]
  Pad(Pad),

  #[entry_def()]
  Anchor(Anchor)
}

#[hdk_link_types]
pub enum LinkTypes {
    AgentToAuthoredPad,
    AllPads,
  }


#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
