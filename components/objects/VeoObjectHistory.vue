<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Annemarie Bufe
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div v-if="$fetchState.pending || loading">
    <div
      v-for="index in [1, 2]"
      :key="index"
      class="my-6 px-4"
    >
      <v-skeleton-loader type="heading" />
      <v-skeleton-loader
        type="text"
        class="my-2"
      />
      <v-skeleton-loader type="text" />
    </div>
  </div>
  <v-list v-else>
    <v-list-item-group
      color="primary"
      :value="0"
      mandatory
    >
      <div
        v-for="(version, index) of history"
        :key="version.changeNumber"
      >
        <v-divider v-if="index > 0" />
        <v-list-item three-line>
          <v-list-item-content
            @click="$emit('show-revision', {}, version, index === 0 ? false : true)"
          >
            <v-list-item-title>
              {{ $t('version') }}
              <b>{{ version.changeNumber }}</b>
              : {{ (new Date(version.time)).toLocaleString($i18n.locale) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t('by') }}
              <b>{{ version.author }}</b>
            </v-list-item-subtitle>
            <v-list-item-subtitle>{{ $t('type') }}: {{ $t(`revisionType.${version.type}`) }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list-item-group>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

interface IData {
  history: IVeoObjectHistoryEntry[];
}

export default Vue.extend({
  props: {
    object: {
      type: Object as Prop<IVeoEntity>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data(): IData {
    return {
      history: []
    };
  },
  async fetch() {
    if (this.object && !this.loading) {
      this.history = (await this.$api.history.fetchVersions(this.object)).sort((a: IVeoObjectHistoryEntry, b: IVeoObjectHistoryEntry) => {
        return a.changeNumber > b.changeNumber ? -1 : a.changeNumber < b.changeNumber ? 1 : 0;
      });
    }
  },
  // For some reason we have to check on both, as $fetchState.pending will be false in some cases while the object is not set yet.
  watch: {
    loading(newValue: boolean) {
      if (!newValue && this.object) {
        this.$nextTick().then(() => {
          this.$fetch();
        });
      }
    },
    object(newValue: IVeoEntity, oldValue: IVeoEntity | undefined) {
      // Only load if old object data was not existing and the page isn't loading
      if (!this.loading && newValue && JSON.stringify(oldValue) === '{}') {
        this.$nextTick().then(() => {
          this.$fetch();
        });
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "by": "by",
    "restoreRevision": "Restore version",
    "revisionType": {
      "CREATION": "Object created",
      "MODIFICATION": "Object modified",
      "SOFT_DELETION": "Object soft deleted"
    },
    "type": "Type",
    "version": "Version"
  },
  "de": {
    "by": "by",
    "restoreRevision": "Version wiederherstellen",
    "revisionType": {
      "CREATION": "Objekt erstellt",
      "MODIFICATION": "Objekt bearbeitet",
      "SOFT_DELETION": "Objekt als gelöscht markiert"
    },
    "type": "Art",
    "version": "Version"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
