<template>
    <div class="m-4">
        <div v-if="my_pads_action_hashes.length + all_pads_action_hashes.length > 0" class="flex justify-center space-x-16 my-24 w-full">
           <PadsList v-if="unionAllPadHashes.length > 0" :action_hashes="unionAllPadHashes" />
        </div>
        <div v-else class="flex flex-wrap justify-center space-x-16 my-24 text-2xl text-gray-400">
            No pads found...
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ComputedRef } from 'vue';
import { decode } from '@msgpack/msgpack';
import { ActionHash, AppAgentClient } from '@holochain/client';
import PadListItem from '../components/meta_pad/pad/PadListItem.vue';
import PadsList from '../components/meta_pad/pad/PadsList.vue';
import { difference, union, orderBy } from 'lodash';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';


interface Data {
    my_pads_action_hashes: Uint8Array[];
    all_pads_action_hashes: Uint8Array[];
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
        },
        unionAllPadHashes() {
            return union(this.my_pads_action_hashes.map((h) => serializeHash(h)), this.all_pads_action_hashes.map((h) => serializeHash(h))).map((h) => deserializeHash(h));
        },
    },
    methods: {
        async fetchMyPads() {
            const action_hashes: ActionHash[] = await this.client.callZome({
                cap_secret: null,
                role_name: 'meta-pad',
                zome_name: 'pads',
                fn_name: 'list_my_authored_pads',
                payload: null,
            });
            console.log('my pads', action_hashes);

            
            if (action_hashes?.length > 0 ) {            
                this.my_pads_action_hashes = action_hashes;
            }
        },
        async fetchAllPads() {
            const action_hashes: ActionHash[] = await this.client.callZome({
                cap_secret: null,
                role_name: 'meta-pad',
                zome_name: 'pads',
                fn_name: 'list_all_pads',
                payload: null,
            });
            console.log('all pads', action_hashes);
            
            if (action_hashes?.length > 0 ) {            
                this.all_pads_action_hashes = action_hashes;
            }
        }
    },
    async mounted() { 
        this.fetchAllPads(); 
        this.fetchMyPads(); 

        setTimeout(() => { 
            console.log('fetching'); 
            this.fetchAllPads(); 
            this.fetchMyPads(); 
        }, 5000);
    },
    setup() {
        const client = (inject('client') as ComputedRef<AppAgentClient>).value;
        
        return {
          client,
        };
    },
})
</script>

<style scoped>

</style>