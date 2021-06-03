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
            mdi-delete
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

import { IVeoFormSchemaCustomTranslationEvent, IVeoFormSchemaItemDeleteEvent, IVeoFormSchemaItemUpdateEvent, IVeoFormSchemaTranslationCollectionItem } from '~/types/VeoTypes';

export default Vue.extend({
  name: 'FseLabel',
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String,
      required: true
    },
    options: Object,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    formSchemaPointer: String
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
    customTranslation: {
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
      this.label = (this.name && this.customTranslation?.[this.name]) || '';
    }
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-label {
  border: 1px solid $grey;
  min-width: 300px;
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
