<template>
  <div class="m-4 flex flex-col justify-start items-center" @keydown.enter="createPad()">
    <div class="text-2xl mb-4">
      Create New Pad
    </div>

    <div class="mb-4">
      <input class="input" v-model="title" />
    </div>
    
    <div>
      <button 
        className="btn btn-primary gap-2"
        :disabled="!isPadValid()"
        @click="createPad()"
      >Create Pad</button>
    </div>
  </div>
</template>
<script lang="ts">
import '@material/mwc-button';
import { defineComponent, inject, ComputedRef } from 'vue';
import { InstalledCell, AppWebsocket, AppAgentClient } from '@holochain/client';
import { Pad, PadCreateInput} from '../../../types/meta_pad/pad';
import '@type-craft/title/create-title';

export default defineComponent({
  data(): Partial<Pad> {
    return {
      title: undefined,
    }
  },

  methods: {
    isPadValid() {
      return this.title
    },
    async createPad() {
      const pad: PadCreateInput = {
        title: this.title!,
      };

      const actionHash = await this.client.callZome({
        cap_secret: null,
        role_name: 'meta-pad',
        zome_name: 'pads',
        fn_name: 'create_pad',
        payload: pad,
      });

      this.$emit('pad-created', actionHash);
      this.title = undefined;
    },
  },
  emits: ['pad-created'],
  setup() {
      const client = (inject('client') as ComputedRef<AppAgentClient>).value;
      
      return {
        client,
      };
  },
})
</script>