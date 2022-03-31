<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann
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
  <v-card
    elevation="0"
    class="fse-label mx-3 my-2 px-2"
  >
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon
          small
          class="handle pr-1"
        >
          mdi-menu
        </v-icon>
      </v-col>
      <v-col>
        <div class="text-caption text-truncate">
          {{ label }} <VeoFseRuleDisplay
            v-if="ruleDisplayIcon"
            :value="ruleDisplayIcon"
          />
        </div>
      </v-col>
      <v-col
        cols="auto"
        class="text-right"
      >
        <v-btn
          icon
          x-small
          @click="showEdit"
        >
          <v-icon
            dense
            small
          >
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-btn
          icon
          x-small
          @click="showDelete"
        >
          <v-icon
            dense
            small
          >
            mdi-trash-can-outline
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <VeoFseEditLabelDialog
      v-if="editDialog"
      v-model="editDialog"
      v-bind="$props"
      :form-schema="value"
      :name="name"
      @edit="onEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <VeoFseDeleteDialog
      v-model="deleteDialog"
      @delete="onDelete"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { getRuleEffectIcons } from '~/lib/FormSchemaHelper';

import { IVeoFormSchemaCustomTranslationEvent, IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';

export default Vue.extend({
  name: 'FseLabel',
  props: {
    value: {
      type: Object,
      default: undefined
    },
    name: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: undefined
    },
    customTranslations: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollection>,
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    language: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      editDialog: false,
      deleteDialog: false,
      label: ''
    };
  },
  computed: {
    ruleDisplayIcon(): string | undefined {
      return getRuleEffectIcons(this.value?.rule?.effect);
    }
  },
  watch: {
    customTranslations: {
      immediate: true,
      handler() {
        this.setLabel();
      }
    }
  },
  methods: {
    showEdit() {
      this.editDialog = true;
    },
    showDelete() {
      this.deleteDialog = true;
    },
    onEdit(data: IVeoFormSchemaItemUpdateEvent['data']) {
      this.$emit('update', { formSchemaPointer: this.formSchemaPointer, data } as IVeoFormSchemaItemUpdateEvent);
      this.editDialog = false;
    },
    onDelete() {
      this.$emit('delete', { formSchemaPointer: this.formSchemaPointer } as IVeoFormSchemaItemDeleteEvent);
      this.deleteDialog = false;
    },
    onUpdateCustomTranslation(event: IVeoFormSchemaCustomTranslationEvent) {
      this.$emit('update-custom-translation', event);
    },
    setLabel() {
      this.label = (this.name && this.customTranslations?.[this.language][this.name]) || '';
    }
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-label {
  border: 1px solid $medium-grey;
  min-width: 250px;
  overflow: hidden;

  .row {
    flex-wrap: nowrap;

    .col {
      align-items: center;
      display: flex;
      height: 36px;
    }
  }
}
</style>
