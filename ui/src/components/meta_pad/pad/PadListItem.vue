<template>
  <div v-if="pad" class="flex justify-between items-center cursor-pointer w-64"  @click="$router.push(`/pad/${actionHashString}`)" >
    <div class="w-full mr-8 text-lg bg-gray-200 hover:bg-blue-400 text-black p-2 rounded flex items-center justify-start">
      <holo-identicon v-if="actionHash" :hash="actionHashString"></holo-identicon>

      <div class="w-full text-center">
        {{pad.title}}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { InstalledCell, AppWebsocket, InstalledAppInfo, Record } from '@holochain/client';
import { Pad } from '../../../types/meta_pad/pad';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';
import '@material/mwc-circular-progress';
import { AgentPubKeyMap, serializeHash } from '@holochain-open-dev/utils';

interface Data {
  pad: Pad | undefined;
}

export default defineComponent({
  props: {
    actionHash: {
      type: Uint8Array,
      required: true
    }
  },
  data(): Data {
    return {
      pad: undefined,
    }
  },
  computed: {
    actionHashString() {
      return serializeHash(this.actionHash);
    }
  },
  async mounted() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'meta_pad')!;

    const record: Record | undefined = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'pad',
      fn_name: 'get_pad',
      payload: this.actionHash,
      provenance: cellData.cell_id[1]
    });
    
    if (record) {
      this.pad = decode((record.entry as any).Present.entry) as Pad;
    }


  },
  setup() {
    const appWebsocket = (inject('appWebsocket') as ComputedRef<AppWebsocket>).value;
    const appInfo = (inject('appInfo') as ComputedRef<InstalledAppInfo>).value;
    return {
      appInfo,
      appWebsocket,
    };
  },
})
</script>