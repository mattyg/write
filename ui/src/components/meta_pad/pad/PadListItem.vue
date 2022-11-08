<template>
  <div v-if="pad" class="flex justify-between items-center cursor-pointer w-64"  @click="$router.push(`/pad/${actionHashString}`)" >
    <div class="w-full mr-8 text-lg bg-gray-200 hover:bg-blue-400 text-black p-2 rounded flex items-center justify-start">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>

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