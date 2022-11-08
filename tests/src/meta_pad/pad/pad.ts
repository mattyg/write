
import { DnaSource, Record, ActionHash } from "@holochain/client";
import { pause, runScenario } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;

import { metaPadDna } from  "../../utils";


export default () => test("pad CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const dnas: DnaSource[] = [{path: metaPadDna }];

    const [alice, bob]  = await scenario.addPlayersWithHapps([dnas, dnas]);

    await scenario.shareAllAgents();

    const createInput = {
      "title": "go a is",
      "content": "Do you have any idea how long it takes those cups to decompose.  go, go, go, go, go! We gotta burn the rain forest, dump toxic waste, pollute the air, and rip up the OZONE!"
    };

    // Alice creates a pad
    const createActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "pad",
      fn_name: "create_pad",
      payload: createInput,
    });
    t.ok(createActionHash);

    // Wait for the created entry to be propagated to the other node.
    await pause(100);

    // Alice lists her authored pads
    const aliceAuthoredPads = await bob.cells[0].callZome({
      zome_name: "pad",
      fn_name: "list_my_authored_pads",
      payload: (),
    });
    t.deepEqual([createInput], decode(aliceAuthoredPads as any) as ActionHash[]);
    

    // Bob gets the created pad
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "pad",
      fn_name: "get_pad",
      payload: createActionHash,
    });
    t.deepEqual(createInput, decode((createReadOutput.entry as any).Present.entry) as any);
    
    
    // Alice updates the pad
    const contentUpdate = {
  "title": "a show own",
  "content": "If any movie people are watching this show, please, for me, have some respect. It's a delight to trust somebody so completely. 'Cause maybe if we screw up this planet enough, they won't want it anymore!"
}

    const updateInput = {
      original_action_hash: createActionHash,
      updated_pad: contentUpdate,
    };

    const updateActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "pad",
      fn_name: "update_pad",
      payload: updateInput,
    });
    t.ok(updateActionHash); 

    // Wait for the updated entry to be propagated to the other node.
    await pause(100);

      
    // Bob gets the updated pad
    const readUpdatedOutput: Record = await bob.cells[0].callZome({
      zome_name: "pad",
      fn_name: "get_pad",
      payload: updateActionHash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput.entry as any).Present.entry) as any); 

    
    
    // Alice deletes the pad
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "pad",
      fn_name: "delete_pad",
      payload: createActionHash,
    });
    t.ok(deleteActionHash); 

      
    // Wait for the deletion action to be propagated to the other node.
    await pause(100);

    // Bob tries to get the deleted pad, but he doesn't get it because it has been deleted
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "pad",
      fn_name: "get_pad",
      payload: createActionHash,
    });
    t.notOk(readDeletedOutput);



    
  });

});
