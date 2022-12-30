<template>
  <div>
    <div v-if="loading" class="w-screen h-screen flex justify-center items-center">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else class="flex flex-1 flex-col ">
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl" @click="$router.push('/');">Write</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-secondary gap-2">
                <Icon :icon="icons.pencil" />
                <div>Create Pad</div>
            </button>
            <div tabIndex={0} className="mt-3 card card-compact dropdown-content bg-base-300 shadow" :hidden="!create_visible">
              <div className="card-body" >
                <CreatePad @pad-created="padCreated"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RouterView />
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
