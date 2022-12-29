<template>
  <div>
    <div v-if="loading" class="w-screen h-screen flex justify-center items-center">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else class="flex flex-1 flex-col">
      <div class="fixed w-full bg-black text-white font-bold flex justify-between items-center py-2 px-4 h-12 z-30">
        <div class="cursor-default hover:border-b-2 border-0 text-2xl" @click="$router.push('/');">Write</div>
        <button @click="create_visible = true;" class="bg-green-700 hover:bg-green-800 text-lg text-white font-bold shadow rounded-md px-2 py-1 flex items-center space-x-2">
          <Icon :icon="icons.pencil" />
          <div>Create New Pad</div>
        </button>
      </div>

      <RouterView />


    <div v-show="create_visible" class="z-20">
        <div class="absolute left-0 top-0 w-screen h-screen bg-gray-800 opacity-70 z-20" @click.prevent="create_visible = false;"></div>  
        <div class="absolute left-0 top-0 w-screen h-screen  flex justify-center items-center">
            <div class="bg-white opacity-100 z-30">
                <CreatePad @pad-created="padCreated"/>
            </div>
        </div>
    </div>
  </div>
  </div>
</template>
<script lang="ts">
import './assets/index.css';
import { defineComponent, computed } from 'vue';
import { AppWebsocket, ActionHash, AppAgentClient, AppAgentWebsocket } from '@holochain/client';
import '@material/mwc-circular-progress';
import CreatePad from './components/meta_pad/pad/CreatePad.vue';
import PadDetail from './pages/PadDetail.vue';
import { RouterView } from 'vue-router';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Icon } from '@iconify/vue/dist/offline';
import pencil from '@iconify-icons/mdi/pencil';

export default defineComponent({
  components: {
    RouterView,
    CreatePad, 
    PadDetail,
    Icon,
  },
  data(): {
    client: AppAgentClient | undefined;
    loading: boolean;
    actionHash: ActionHash | undefined;
    create_visible: boolean;
    icons: any;
  } {
    return {
      client: undefined,
      loading: true,
      actionHash: undefined,
      create_visible: false,
      icons: {
        pencil,
      }
    };
  },
  methods: {
    navigateToPad(actionHash: any) {
      this.$router.push(`/pad/${actionHash}`);
    },
    padCreated(actionHash: ActionHash) {
        this.create_visible = false; 
        this.$router.push(`/pad/${serializeHash(actionHash)}`);
    },
  },
  async mounted() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const appWebsocket = await AppWebsocket.connect(``);
    this.client = await AppAgentWebsocket.connect(appWebsocket, 'meta-pad');
    
    this.loading = false;
  },
  provide() {
    return {
      client: computed(() => this.client),
    };
  },
});
</script>
