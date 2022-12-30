<template>
    <div v-if="action_hashes.length > 0" class="w-full">
        <h1 v-if="title" class="text-2xl text-center text-4xl">{{title}}</h1>
        <div class="w-full my-4 flex flex-col space-y-8">
            <PadListItem v-for="action_hash in action_hashes" :actionHash="action_hash"  />
        </div>
    </div>
    <div v-else class="flex justify-center items-center w-full">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
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
            default: undefined
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