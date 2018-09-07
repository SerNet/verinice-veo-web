<template>
    <v-card class="elevation-0">
        <v-card-title v-if="$slots.title">
            <slot name="title"></slot>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0" style="height: calc(100% - 54px); overflow: auto">
            <slot name="content"></slot>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions v-if="$slots.actions">
            <slot name="actions"></slot>
        </v-card-actions>
    </v-card>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>
<style lang="stylus" scoped>
</style>
