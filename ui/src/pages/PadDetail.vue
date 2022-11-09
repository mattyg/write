<template>
  <div v-if="!pad || !editorjs" style="flex justify-center items-center">
    <mwc-circular-progress indeterminate></mwc-circular-progress>
  </div>
  <div v-else class="flex flex-col bg-yellow-100 pt-14 min-h-screen">
    <div class="flex justify-between items-center mx-8 my-4">
      <div class="my-4">
        <div class="text-6xl text-start text-gray-800">{{pad.title}}</div>
        <a class="text-sm text-start text-gray-400">{{actionHashString}}</a>
      </div>
      
      <div>
        <div class="flex justify-between">
          <span class="mdi mdi-content-save"></span>
          <button class="text-md p-2 bg-green-200 hover:bg-green-300" @click="saveContent">Save</button>
        </div>
        <div v-if="pad && lastSaved" class="text-gray-400 text-xs">{{lastSaved}} ago</div>
      </div>
    </div>

    <div class="w-full" id="editorjs"  @keyup.enter="saveContent"></div>
    
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { InstalledCell, AppWebsocket, InstalledAppInfo, Record, ActionHash } from '@holochain/client';
import { Pad } from '../types/meta_pad/pad';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';
import '@material/mwc-circular-progress';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import Table from '@editorjs/table';
import NestedList from '@editorjs/nested-list';
import ImageTool from '@editorjs/image';
import SimpleImage from '@editorjs/simple-image';
import Delimiter from '@editorjs/delimiter';
import ParagraphTool from '../lib/paragraph-block.js';
import fromUnixTime from 'date-fns/fromUnixTime';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

interface Data {
  pad: Pad | undefined;
  editorjs: EditorJS | undefined;
  latestActionHash: ActionHash | undefined;
}

export default defineComponent({
  props: {
    actionHashString: {
      type: String,
      required: true
    }
  },
  data(): Data {
    return {
      pad: undefined,
      editorjs: undefined,
      latestActionHash: undefined
    }
  },
  computed: {
    lastSaved() {
      if(!this.contentObj?.time) return;

      return formatDistanceToNow(fromUnixTime(this.contentObj.time/1000));
    },
    contentObj() {
      if(!this.pad || this.pad.content === "") return {};

      return JSON.parse(this.pad.content);
    }
  },
  methods: {
    async saveContent() {
      if(!this.editorjs || !this.pad) return;
      
      const value = await this.editorjs.save();
      console.log('save', value);
      
      const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'meta_pad')!;

      this.latestActionHash = await this.appWebsocket.callZome({
        cap_secret: null,
        cell_id: cellData.cell_id,
        zome_name: 'pad',
        fn_name: 'update_pad',
        payload: {
          original_action_hash: deserializeHash(this.actionHashString),
          updated_pad: {
            ...this.pad,
            content: JSON.stringify(value),
          }
        },
        provenance: cellData.cell_id[1]
      });

      console.log('Saved. New Action Hash', this.latestActionHash);
      this.fetchPad()
    },
    async fetchPad() {
      const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'meta_pad')!;

      const record: Record | undefined = await this.appWebsocket.callZome({
        cap_secret: null,
        cell_id: cellData.cell_id,
        zome_name: 'pad',
        fn_name: 'get_pad_latest',
        payload: deserializeHash(this.actionHashString),
        provenance: cellData.cell_id[1]
      });

      console.log('fetching', record);

      if (record) {
        this.pad = decode((record.entry as any).Present.entry) as Pad;
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
          /*
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file) {
                  console.log('Uploading from File')
                },
                uploadByUrl(url) {
                  console.log('Fetching from URL')
                }
              }
            }
          },*/
          image: SimpleImage,
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
    const appWebsocket = (inject('appWebsocket') as ComputedRef<AppWebsocket>).value;
    const appInfo = (inject('appInfo') as ComputedRef<InstalledAppInfo>).value;
    return {
      appInfo,
      appWebsocket,
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