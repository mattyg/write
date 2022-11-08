<template>
  <div class="h-full">
    <div v-if="loading" class="w-screen h-screen flex justify-center items-center">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else class="h-full">
      <div class="w-full bg-black text-white font-bold flex justify-between py-2 px-4 h-12">
        <div class="cursor-pointer" @click="$router.push('/');">HoloPad</div>

      </div>
      <RouterView class="h-full" />
    </div>
  </div>
</template>
<script lang="ts">
import './assets/index.css';
import { defineComponent, computed } from 'vue';
import { AppWebsocket, ActionHash, InstalledAppInfo } from '@holochain/client';
import '@material/mwc-circular-progress';
import CreatePad from './components/meta_pad/pad/CreatePad.vue';
import PadDetail from './pages/PadDetail.vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  components: {
    RouterView,
    CreatePad, 
    PadDetail, 
  },
  data(): {
    appWebsocket: AppWebsocket | undefined;
    loading: boolean;
    appInfo: InstalledAppInfo | undefined;
    actionHash: ActionHash | undefined;
    createPadVisible: boolean;
  } {
    return {
      appWebsocket: undefined,
      loading: true,
      appInfo: undefined,
      actionHash: undefined,
      createPadVisible: false,
    };
  },
  methods: {
    navigateToPad(actionHash: any) {
      this.$router.push(`/pad/${actionHash}`);
    },
    showCreatePad() {
      this.createPadVisible = true;
    },
    hideCreatePad() {
      this.createPadVisible = false;
    }
  },
  async mounted() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.appWebsocket = await AppWebsocket.connect(`ws://localhost:${import.meta.env.VITE_HC_PORT}`);
    this.appInfo = await this.appWebsocket.appInfo({ installed_app_id: 'meta-pad' });

    this.loading = false;
  },
  provide() {
    return {
      appWebsocket: computed(() => this.appWebsocket),
      appInfo: computed(() => this.appInfo),
    };
  },
});
</script>
