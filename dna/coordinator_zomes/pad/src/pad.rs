use hdk::prelude::*;
use pad_integrity::Pad;
use pad_integrity::Anchor;
use pad_integrity::EntryTypes;
use pad_integrity::LinkTypes;

#[hdk_extern]
pub fn get_pad(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  get(action_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_pad_latest(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let maybe_details: Option<Details> = get_details(action_hash, GetOptions::default())?;

  if let Some(Details::Record(details)) = maybe_details {

    return match details.updates.len() {
      0 => {
        Ok(Some(details.record))
      }
      _ => {
        let mut updates = details.updates.clone();
        updates.sort_by_key(|k| k.action().timestamp().as_millis());


        return match updates.last() {
          Some(last_update) => { 
              let action_hash = last_update.action_address();

              let record = get(action_hash.clone(), GetOptions::default())?;

              Ok(record)
          }
          None => Ok(None)
        }
      }
    }
  }

  Ok(None)
}



#[derive(Serialize, Deserialize, Debug)]
pub struct CreatePadInput {
  title: String
}


#[hdk_extern]
pub fn create_pad(pad_input: CreatePadInput) -> ExternResult<ActionHash> {
  let pad = Pad { author: agent_info()?.agent_initial_pubkey, title: pad_input.title, content: "".into() };

  let action_hash = create_entry(&EntryTypes::Pad(pad.clone()))?;
  
  // Link from author agent -> pad
  create_link(
    agent_info()?.agent_initial_pubkey,
    action_hash.clone(),
    LinkTypes::AgentToAuthoredPad,
    ()
  )?;

  // Link from 'all_pads' -> pad
  let all_pads_entry_hash = hash_entry(EntryTypes::Anchor(Anchor(String::from("all_pads"))))?;
  
  create_link(
    all_pads_entry_hash,
    action_hash.clone(),
    LinkTypes::AllPads,
    (),
  )?;

  Ok(action_hash)
}


#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePadInput {
  original_action_hash: ActionHash,
  updated_pad: Pad
}

#[hdk_extern]
pub fn update_pad(input: UpdatePadInput) -> ExternResult<ActionHash> {
  update_entry(input.original_action_hash, &input.updated_pad)
}


#[hdk_extern]
pub fn delete_pad(action_hash: ActionHash) -> ExternResult<ActionHash> {
  delete_entry(action_hash)
}

#[hdk_extern]
pub fn list_my_authored_pads(_: ()) -> ExternResult<Vec<ActionHash>> {
  let links = get_links(
    agent_info()?.agent_initial_pubkey,
    LinkTypes::AgentToAuthoredPad,
    None
  )?;

  let pad_action_hashes = links.iter()
    .map(|link| link.target.clone().into())
    .collect::<Vec<ActionHash>>();

  Ok(pad_action_hashes)
}

#[hdk_extern]
pub fn list_all_pads(_: ()) -> ExternResult<Vec<ActionHash>> {
  let all_pads_entry_hash = hash_entry(EntryTypes::Anchor(Anchor(String::from("all_pads"))))?;

  let links = get_links(
    all_pads_entry_hash,
    LinkTypes::AllPads,
    None
  )?;

  let pad_action_hashes = links.iter()
    .map(|link| link.target.clone().into())
    .collect::<Vec<ActionHash>>();

  Ok(pad_action_hashes)
}