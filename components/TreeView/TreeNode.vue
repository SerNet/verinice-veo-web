<template>
  <v-list-tile class="tree-item" :style="{paddingLeft: level*20+'px'}" @click="()=>{}" :to="to">
    <v-list-tile-action class="small-action" :style="{visibility: hasChildren?'visible':'hidden'}">
      <v-btn icon @click.stop.prevent="$emit('expand')">
        <v-icon class="chevron" :class="[expanded?'open':'']">chevron_right</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-action class="small-action" @click.prevent>
      <!-- <v-checkbox class="checkbox" :indeterminate="checked === undefined" :value="checked" :input-value="checked" @change="$emit('check')"></v-checkbox> -->
      <selection-icon :value="checked" :indeterminate="checked === undefined" :deep="checked && hasChildren" @change="$emit('check')">
        <v-icon size="16">insert_drive_file</v-icon>
      </selection-icon>
    </v-list-tile-action>
    <v-list-tile-content @click="()=>{}">
      <v-list-tile-title>
        <slot></slot>
      </v-list-tile-title>
    </v-list-tile-content>
    <v-spacer></v-spacer>
    <v-list-tile-action style="min-width: 24px" @click.prevent>
      <!-- click preventDefault: https://github.com/vuetifyjs/vuetify/issues/3333#issuecomment-389775441 -->
      <!-- <v-menu>
        <v-btn slot="activator" icon>
          <v-icon style="color: #aaa">more_vert</v-icon>
        </v-btn>
        <v-list>
          <template v-for="action in actions">
            <v-list-tile :key="action.id" @click="$emit('action', action)">
              <v-list-tile-avatar v-if="action.icon">
                <v-icon>{{ action.icon }}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{action.title}}</v-list-tile-title>
                <v-list-tile-sub-title>{{action.description}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="action.divider" :key="action.id+'.divider'"></v-divider>
          </template>

        </v-list>
      </v-menu> -->
    </v-list-tile-action>
  </v-list-tile>
</template>

<script lang="ts">
import Vue from "vue";
import SelectionIcon from "~/components/SelectionIcon.vue";

export default Vue.extend({
  components: {
    SelectionIcon
  },
  props: {
    //actions: { type: Array, default: [] },
    checkable: { type: Boolean, default: false },
    checked: { type: Boolean, default: undefined },
    expanded: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    to: { type: String }
  }
});
</script>


<style lang="stylus" scoped>
.small-action {
  min-width: 30px;
}

.v-list__tile__avatar {
  min-width: 48px;
  margin-left: -8px;
}

.checkbox {
  zoom: 0.8;

  >>> .v-input__slot {
    margin-bottom: 0;
  }
}

.chevron.open {
  transform: rotate(90deg);
}
</style>

