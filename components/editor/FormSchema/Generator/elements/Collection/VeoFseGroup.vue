<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
    v-if="level === 0"
    flat
    rounded
    outlined
    class="fse-group level-0 fill-width fill-height"
  >
    <div
      v-if="value.elements.length === 0"
      class="dropzone-placeholder"
    >
      <div class="dropzone-placeholder-text subtitle-1">
        {{ $t('dropzonePlaceholder') }}
      </div>
    </div>
    <Draggable
      class="dragArea d-flex fill-width fill-height dropzone"
      tag="div"
      style="overflow: auto;"
      :list="value.elements"
      :class="dynamicClasses"
      handle=".handle"
      :group="{ name: 'g1' }"
    >
      <slot />
    </Draggable>
  </v-card>
  <v-card
    v-else
    flat
    rounded
    outlined
    class="fse-group mx-3 my-2 px-2 pb-2"
  >
    <v-row
      no-gutters
      align="center"
    >
      <v-col cols="auto">
        <v-icon
          dense
          small
          class="handle pr-1"
        >
          mdi-menu
        </v-icon>
      </v-col>
      <v-col>
        <div class="text-h5 font-weight-regular text-truncate">
          {{ $t('group') }} <VeoFseRuleDisplay
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
    <v-row no-gutters>
      <v-col>
        <div
          v-if="label"
          class="text-subtitle-1 mb-2"
        >
          {{ label }}
        </div>
        <Draggable
          class="dragArea d-flex"
          tag="div"
          style="overflow: auto; min-width:300; min-height:100px"
          :list="value.elements"
          :class="dynamicClasses"
          handle=".handle"
          :group="{ name: 'g1' }"
        >
          <slot />
        </Draggable>
      </v-col>
    </v-row>

    <VeoFseEditGroupDialog
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
import Draggable from 'vuedraggable';
import { getRuleEffectIcons } from '~/lib/FormSchemaHelper';

import { IVeoFormSchemaCustomTranslationEvent, IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';

export default Vue.extend({
  name: 'FseGroup',
  components: {
    Draggable
  },
  props: {
    value: {
      type: Object,
      default: undefined
    },
    name: {
      type: String,
      default: undefined
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
    level: {
      type: Number,
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
    directionClass(): string {
      // TODO: this.options does not trigger this computed property, when data is updated.
      if (this.value.options && this.value.options.direction === 'horizontal') {
        return 'flex-row direction-horizontal';
      } else {
        return 'flex-column direction-vertical';
      }
    },
    dynamicClasses(): string[] {
      return [this.directionClass];
    },
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

<i18n>
{
  "en": {
    "dropzonePlaceholder": "Drag in the elements",
    "group": "Group"
  },
  "de": {
    "dropzonePlaceholder": "Ziehen Sie die Steuerelemente herein",
    "group": "Gruppe"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.dropzone-placeholder {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.dropzone-placeholder-text {
  text-align: center;
  color: $medium-grey;
}

.level-0 {
  border: 0;
}
</style>
