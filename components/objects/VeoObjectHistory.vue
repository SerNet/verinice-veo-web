<template>
  <div v-if="$fetchState.pending">
    <div
      v-for="index in [1, 2]"
      :key="index"
      class="my-6"
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
              : {{ (new Date(version.time)).toLocaleString() }}
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
import ObjectSchemaValidator from '~/lib/ObjectSchemaValidator';
import { IBaseObject } from '~/lib/utils';

import { IVeoEntity, IVeoObjectHistoryEntry, IVeoObjectSchema } from '~/types/VeoTypes';

interface IData {
  history: IVeoObjectHistoryEntry[];
  validator: ObjectSchemaValidator;
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
    },
    schema: {
      type: Object as Prop<IVeoObjectSchema>,
      default: () => {}
    }
  },
  data(): IData {
    return {
      history: [],
      validator: new ObjectSchemaValidator()
    };
  },
  async fetch() {
    if (this.object && !this.loading) {
      this.history = (await this.$api.history.fetchVersions(this.object)).sort((a: IVeoObjectHistoryEntry, b: IVeoObjectHistoryEntry) => {
        return a.changeNumber > b.changeNumber ? -1 : a.changeNumber < b.changeNumber ? 1 : 0;
      });
    }
  },
  watch: {
    loading(newValue: boolean) {
      if (!newValue && this.object) {
        this.$nextTick().then(() => {
          this.$fetch();
        });
      }
    }
  },
  methods: {
    canShowData(data: IBaseObject): boolean {
      return this.validator.fitsObjectSchema(this.schema, data);
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
