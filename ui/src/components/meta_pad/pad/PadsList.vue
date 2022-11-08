<template>
    <div>
        <div v-if="action_hashes.length > 0">
            <h1  class="text-2xl text-center text-4xl">{{title}}</h1>
            <div class="flex justify-center">
                <div class="flex flex-col max-w-screen-md">
                    <div v-for="action_hash in action_hashes" class="max-w-screen-xl my-4">
                        <PadListItem :actionHash="action_hash" />
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex justify-center items-center">
            <mwc-circular-progress indeterminate></mwc-circular-progress>
        </div>
    </div>


</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PadListItem from './PadListItem.vue';

export default defineComponent({
    components: {
        PadListItem
    },
    props: {
        title: {
            default: 'Pads'
        },
        action_hashes: {
            default: [],
        },
    },
    setup () {
        

        return {}
    }
})
</script>

<style scoped>

</style>