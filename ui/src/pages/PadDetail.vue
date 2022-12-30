<template>
  <div v-if="!pad || !editorjs" style="flex justify-center items-center">
    <mwc-circular-progress indeterminate></mwc-circular-progress>
  </div>
  <div v-else class="flex flex-col pt-14 min-h-screen">
    <div class="flex justify-between items-center mx-8 my-4">
      <div class="my-4">
        <div class="text-start text-gray-800">
          <div class="text-6xl flex">
            <div class="mr-4"><holo-identicon :hash="actionHashString"></holo-identicon></div>
            {{ pad.title }}
          </div>
          
        </div>
      </div>
      
      <div>
        <div class="flex flex-col items-end">
          <button class="btn btn-primary" @click="saveContent">
            <div class="flex space-x-2">
              <Icon :icon="icons.contentSaveOutline"  />
              <div>Save</div>
            </div>
          </button>
          <h6 v-if="pad && lastSaved" class="text-neutral">{{lastSaved}} ago</h6>
        </div>
      </div>
    </div>

    <div class="w-full mx-16" id="editorjs"  @keyup.enter="saveContent"></div>
    
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import {  Record, ActionHash, AppAgentClient } from '@holochain/client';
import { Pad } from '../types/meta_pad/pad';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';
import '@material/mwc-circular-progress';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import Table from '@editorjs/table';
import NestedList from '@editorjs/nested-list';
import Delimiter from '@editorjs/delimiter';
import ParagraphTool from '../lib/paragraph-block.js';
import ImageFromUrlBlock from '../lib/image-url-block.ts';
import ZomeCallBlock from '../lib/zome-call-block.ts';
import fromUnixTime from 'date-fns/fromUnixTime';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import "@holochain-open-dev/elements/holo-identicon";
import { decode } from '@msgpack/msgpack';
import { Icon } from '@iconify/vue/dist/offline';
import contentSaveOutline from '@iconify-icons/mdi/content-save-outline';

interface Data {
  record?: Record;
  editorjs?: EditorJS;
  latestActionHash?: ActionHash;
  error?: any;
  icons: any;
}

export default defineComponent({
  components: {
    Icon,
  },
  props: {
    actionHashString: {
      type: String,
      required: true
    }
  },
  data(): Data {
    return {
      record: undefined,
      editorjs: undefined,
      latestActionHash: undefined,
      error: undefined,
      icons: {
        contentSaveOutline
      }
    }
  },
  computed: {
    lastSaved() {
      if(!this.contentObj?.time) return;

      return formatDistanceToNow(fromUnixTime(this.contentObj.time/1000));
    },
    contentObj() {
      if(!this.pad || this.pad?.content === "") return {};

      return JSON.parse(this.pad.content);
    },
    pad() {
      if (!this.record) return undefined;

      return decode((this.record.entry as any).Present.entry) as Pad;
    }
  },
  methods: {
    async saveContent() {
      if(!this.editorjs || !this.pad) return;
      
      const value = await this.editorjs.save();
      console.log('save', value);
      
      this.latestActionHash = await this.client.callZome({
        cap_secret: null,
        role_name: 'meta-pad',
        zome_name: 'pads',
        fn_name: 'update_pad',
        payload: {
          original_action_hash: deserializeHash(this.actionHashString),
          updated_pad: {
            ...this.pad,
            content: JSON.stringify(value),
          }
        },
      });

      console.log('Saved. New Action Hash', this.latestActionHash);
      this.fetchPad()
    },
    async fetchPad() {
      try {
        console.log('hash', deserializeHash(this.actionHashString));
        this.record = await this.client.callZome({
          cap_secret: null,
          role_name: 'meta-pad',
          zome_name: 'pads',
          fn_name: 'get_pad_latest',
          payload: deserializeHash(this.actionHashString),
        });

        console.log('record is ', this.record);
      } catch (err) {
        this.error = err;
      }
    },
    setupEditorjs() {
      this.editorjs =  new EditorJS({
        /**
         * Id of Element that should contain Editor instance
         */
        holder: 'editorjs',
        
        tools: { 
          header: Header, 
          list: {
            class: NestedList,
            inlineToolbar: true,
          },
          paragraph: {
            class: ParagraphTool,
          },
          image: {
            class: ImageFromUrlBlock
          },
          delimiter: Delimiter,
          table: Table,
        }, 
        autofocus: true,
        
        data: this.contentObj
      });
    },
  },
  watch: {
    pad(newVal, oldVal) {
      if(newVal && !oldVal) {
        this.setupEditorjs();
      }
    },
    actionHashString(newVal, oldVal) {
      if(newVal) {
        this.fetchPad();
      }
    }
  },
  mounted() {
    this.fetchPad();
  },
  setup() {
      const client = (inject('client') as ComputedRef<AppAgentClient>).value;
      
      return {
        client,
      };
  },
})
</script>
<style>
h1 {
  @apply text-6xl
}
h2 {
  @apply text-5xl
}
h3 {
  @apply text-4xl
}
h4 {
  @apply text-3xl
}
h5 {
  @apply text-2xl
}
h6 {
  @apply text-xl
}
</style>