<template>
  <div v-if="pad" class="flex justify-between items-center cursor-pointer w-64"  @click="$router.push(`/pad/${actionHashString}`)" >
    <div class="w-full mr-8 text-lg bg-gray-200 hover:bg-blue-400 text-black p-2 rounded flex items-center justify-start">
      <holo-identicon v-if="actionHash" :hash="actionHashString"></holo-identicon>

      <div class="w-full text-center">
        {{pad.title}}
      </div>
    </div>
  </div>
  <div v-else-if="error" class="bg-red-400">
    Error: {{ error.data }}
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { InstalledCell, AppWebsocket, Record, AppAgentClient } from '@holochain/client';
import { Pad } from '../../../types/meta_pad/pad';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';
import '@material/mwc-circular-progress';
import { AgentPubKeyMap, serializeHash } from '@holochain-open-dev/utils';

interface Data {
  record?: Record;
  error?: any;
}

export default defineComponent({
  props: {
    actionHash: {
      required: true
    }
  },
  data(): Data {
    return {
      record: undefined,
      error: undefined,
    }
  },
  computed: {
    actionHashString() {
      return serializeHash(this.actionHash as Uint8Array);
    },
    pad() {
      if (!this.record) return undefined;

      return decode((this.record.entry as any).Present.entry) as Pad;
    }
  },
  async mounted() {

    try {
      this.record = await this.client.callZome({
        cap_secret: null,
        role_name: 'meta-pad',
        zome_name: 'pads',
        fn_name: 'get_pad',
        payload: this.actionHash,
      });
    } catch(e) {
      this.error = e;
    }
  },
  setup() {
      const client = (inject('client') as ComputedRef<AppAgentClient>).value;
      
      return {
        client,
      };
  },
})
</script>