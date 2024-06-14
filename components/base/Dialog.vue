<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <v-dialog
    :model-value="modelValue"
    max-width="80%"
    :fullscreen="fullscreen"
    :width="width"
    :content-class="dialogClasses"
    v-bind="$attrs"
    @update:model-value="closeDialog"
  >
    <v-card class="d-flex flex-column" tile>
      <v-card-title class="d-flex align-center bg-accent small-caps text-h4">
        <LayoutAppLogoMobile v-if="fullscreen" style="height: 36px" />
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn :disabled="closeDisabled" :icon="mdiClose" flat class="close-button bg-accent" @click="closeDialog" />
      </v-card-title>
      <v-card-text
        class="pa-4 overflow-x-hidden overflow-y-auto flex-grow-1"
        :class="innerClass"
        style="position: relative"
        data-veo-test="dialog-card"
      >
        <slot />
        <v-card-actions v-if="!!$slots['dialog-options'] && !fixedFooter" class="pt-3 pb-0 px-0 d-flex">
          <slot name="dialog-options" />
        </v-card-actions>
      </v-card-text>
      <v-card-actions v-if="!!$slots['dialog-options'] && fixedFooter" class="bg-accent px-4 py-3 d-flex">
        <slot name="dialog-options" />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-if="confirmClose" v-model="closeConfirmationDialogVisible" width="450px">
    <v-card>
      <v-card-title class="bg-accent small-caps">
        {{ t('closeDialog') }}
      </v-card-title>
      <v-card-text>
        {{ isString(confirmClose) ? confirmClose : t('confirmationDialogText') }}
        <v-card-actions class="px-0 pb-0">
          <v-btn variant="text" @click="closeConfirmationDialogVisible = false">
            {{ globalT('global.button.cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            ref="confirmButton"
            color="primary"
            variant="text"
            @click="closeDialog(true)"
            @keydown.enter="closeDialog(true)"
          >
            {{ globalT('global.button.yes') }}
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';
import { isString } from 'lodash';
import { useDisplay } from 'vuetify';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    title: string;
    large?: boolean;
    xLarge?: boolean;
    closeDisabled?: boolean; // If set to true, the close button at the top right will be disabled and all other methods of closing the dialog will be ignored.
    confirmClose?: boolean | string; // If set to a string or true, a confirm dialog will be shown before closing
    closeFunction?: () => boolean; // If set, gets called before closing the dialog. If returns true the dialog gets closed, if false it stays open
    fixedFooter?: boolean;
    innerClass?: string;
  }>(),
  {
    modelValue: false,
    large: false,
    xLarge: false,
    closeDisabled: false,
    confirmClose: false,
    closeFunction: () => () => true,
    fixedFooter: false,
    innerClass: ''
  }
);

const emit = defineEmits<{
  (event: 'update:model-value', value: boolean): void;
}>();

const { mdAndDown, smAndDown, xs } = useDisplay();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const fullscreen = computed(() => (props.xLarge && mdAndDown.value) || (props.large && smAndDown.value) || xs.value);

const width = computed(() => {
  if (props.large) return '900px';
  if (props.xLarge) return '1350px';
  return '450px';
});

const dialogClasses = computed(() => {
  const classes = {
    'overflow-hidden': true,
    'd-flex': props.modelValue
  };

  return Object.entries(classes)
    .filter(([_, value]) => !!value)
    .map(([key, _]) => key)
    .join(' ');
});

// Everything regarding closing the dialog
const closeConfirmationDialogVisible = ref(false);
// Focus okay button so the user can leave the dialog by pressing enter
watch(
  () => closeConfirmationDialogVisible.value,
  (value) => {
    if (value) {
      nextTick(() => {
        confirmButton.value.$el.focus();
      });
    } else {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
  }
);

const confirmButton = ref();
const closeDialog = (ignoreConfirmDialog = false) => {
  // Hide confirmation dialog if visible (if the dialog is visible and this function gets called, the user confirmed he wants to close the dialog)
  if (closeConfirmationDialogVisible.value) {
    closeConfirmationDialogVisible.value = false;
  }

  if (props.closeDisabled) {
    return;
  }

  if (props.confirmClose && !ignoreConfirmDialog) {
    closeConfirmationDialogVisible.value = true;
    return;
  }

  if (props.closeFunction()) {
    emit('update:model-value', false);
  }
};
</script>

<i18n>
{
  "en": {
    "closeDialog": "Close dialog",
    "confirmationDialogText": "Are you sure you want to close this dialog? Unsaved changes might be lost."
  },
  "de": {
    "closeDialog": "Dialog schließen",
    "confirmationDialogText": "Möchten Sie den Dialog wirklich schließen? Ungespeicherte Änderungen gehen möglicherweise verloren."
  }
}
</i18n>
