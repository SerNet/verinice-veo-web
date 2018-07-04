<template>
  <v-layout row>
    <v-flex>
      <tree-nav class="tree-nav" :groups="groups" :items="treeItems"></tree-nav>
    </v-flex>
    <v-flex xs12 style="margin-left: 300px;">
      <veo-form></veo-form>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { namespace } from 'nuxt-class-component'
import { Store } from 'vuex';
import TreeNav from '~/components/TreeNav/TreeNav.vue';
import Form from '~/components/Form.vue';

const treeStore = namespace('tree');

@Component({
  components: {
    TreeNav: TreeNav,
    'VeoForm': Form
  }
})
export default class extends Vue {
  @treeStore.State('items') treeItems: any[];

  groups: any[] = ['IT Baseline-Catalog', 'BSI Model']

  async fetch({ store, params }: {store: Store<any>, params: Object}) {
    await store.dispatch('tree/getItems');
  }
}
</script>

<style lang="stylus" scoped>
  .tree-nav {
    position: fixed;
    top: 64px;
    left: 80px;
    bottom: 0;
    width: 300px;

  }
</style>
