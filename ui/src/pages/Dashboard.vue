<template>
    <div class="m-4">

        <button @click="create_visible = true;" class="bg-green-700 hover:bg-green-800 text-white font-bold shadow rounded-md p-2">Create New Pad</button>

        <div v-show="create_visible">
            <div class="absolute left-0 top-0 w-screen h-screen bg-gray-800 opacity-70"></div>  
            <div class="absolute left-0 top-0 w-screen h-screen  flex justify-center items-center">
                <div class="bg-white opacity-100">
                    <CreatePad @pad-created="padCreated"/>
                </div>
            </div>
        </div>
        
        <div class="flex flex-wrap justify-center space-x-16 my-24" v-if="my_pads_action_hashes.length + all_pads_action_hashes.length > 0">
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
import CreatePad from '../components/meta_pad/pad/CreatePad.vue';
import { difference } from 'lodash';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';


interface Data {
    my_pads_action_hashes: ActionHash[];
    all_pads_action_hashes: ActionHash[];
    create_visible: boolean;
}

export default defineComponent({
    components: {
        PadsList,
        PadListItem,
        CreatePad
    },
    data(): Data {
        return {
            my_pads_action_hashes: [],
            all_pads_action_hashes: [],
            create_visible: false,
        };
    },
    computed: {
        otherPadHashes() {
            return difference(this.all_pads_action_hashes.map((h) => serializeHash(h)), this.my_pads_action_hashes.map((h) => serializeHash(h))).map((h) => deserializeHash(h));
        }
    },
    methods: {
        padCreated(actionHash: ActionHash) {
            this.create_visible = false; 
            this.$router.push(`/pad/${serializeHash(actionHash)}`);
        },
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