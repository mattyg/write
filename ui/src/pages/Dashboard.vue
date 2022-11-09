<template>
    <div class="m-4">
        <div v-if="my_pads_action_hashes.length + all_pads_action_hashes.length > 0" class="flex flex-wrap justify-center space-x-16 my-24">
           <PadsList v-if="my_pads_action_hashes.length > 0" :action_hashes="my_pads_action_hashes" title="My Pads" />
           <PadsList v-if="otherPadHashes?.length > 0" :action_hashes="otherPadHashes" title="All Pads" />
        </div>
        <div v-else class="flex flex-wrap justify-center space-x-16 my-24 text-2xl text-gray-400">
            No pads found...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { InstalledCell, AppWebsocket, InstalledAppInfo, Record, ActionHash } from '@holochain/client';
import PadListItem from '../components/meta_pad/pad/PadListItem.vue';
import PadsList from '../components/meta_pad/pad/PadsList.vue';
import { difference } from 'lodash';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';


interface Data {
    my_pads_action_hashes: ActionHash[];
    all_pads_action_hashes: ActionHash[];
}

export default defineComponent({
    components: {
        PadsList,
        PadListItem,
    },
    data(): Data {
        return {
            my_pads_action_hashes: [],
            all_pads_action_hashes: [],
        };
    },
    computed: {
        otherPadHashes() {
            return difference(this.all_pads_action_hashes.map((h) => serializeHash(h)), this.my_pads_action_hashes.map((h) => serializeHash(h))).map((h) => deserializeHash(h));
        }
    },
    methods: {
        async fetchMyPads() {
            const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'meta_pad')!;

            const action_hashes: ActionHash[] = await this.appWebsocket.callZome({
                cap_secret: null,
                cell_id: cellData.cell_id,
                zome_name: 'pad',
                fn_name: 'list_my_authored_pads',
                payload: null,
                provenance: cellData.cell_id[1]
            });
            console.log('my pads', action_hashes);

            
            if (action_hashes?.length > 0 ) {            
                this.my_pads_action_hashes = action_hashes;
            }
        },
        async fetchAllPads() {
            const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'meta_pad')!;

            const action_hashes: ActionHash[] = await this.appWebsocket.callZome({
                cap_secret: null,
                cell_id: cellData.cell_id,
                zome_name: 'pad',
                fn_name: 'list_all_pads',
                payload: null,
                provenance: cellData.cell_id[1]
            });
            console.log('all pads', action_hashes);
            
            if (action_hashes?.length > 0 ) {            
                this.all_pads_action_hashes = action_hashes;
            }
        }
    },
    async mounted() {
        this.fetchMyPads();
        this.fetchAllPads();
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

<style scoped>

</style>