<template>
  <div v-if="pad" class="flex justify-start items-center cursor-pointer w-full h-32 bg-base-200 shadow-lg"  @click="$router.push(`/pad/${actionHashString}`)" >
      <holo-identicon v-if="actionHash" :hash="actionHashString" class="h-16 w-16"></holo-identicon>
      <div>
        <h2 class="text-5xl flex-1 mb-4">
          {{pad.title}}
        </h2>

        <div v-if="isAuthor">
          <div class="text-md badge badge-lg gap-2">Author</div>
        </div>
        <div v-else-if="author" class="text-sm color-neutral">
          {{ author }}
        </div>
      </div>
      
  </div>
  <div v-else-if="error" class="bg-red-400 w-full">
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
import "@holochain-open-dev/elements/holo-identicon";

interface Data {
  record?: Record;
  error?: any;
  appInfo?: any;
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
      appInfo: undefined,
    }
  },
  computed: {
    actionHashString() {
      return serializeHash(this.actionHash as Uint8Array);
    },
    pad() {
      if (!this.record) return undefined;

      return decode((this.record.entry as any).Present.entry) as Pad;
    },
    author() {
      if (!this.pad) return undefined;

      return serializeHash(this.pad.author);
    },
    isAuthor() {
      if(!this.appInfo || !this.pad) return false;
      console.log(this.appInfo);
      return true;
    }
  },
  async mounted() {
    try {
      this.appInfo = await this.client.appInfo();

      console.log('app info ', this.appInfo);

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