
mod pad;
pub use pad::*;
use hdk::prelude::*;
use pads_integrity::EntryTypes;
use pads_integrity::Anchor;


#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    // Link from 'all-pads' anchor -> pad
    let _anchor = create_entry(EntryTypes::Anchor(Anchor(String::from("all_pads"))))?;

    Ok(InitCallbackResult::Pass)
}