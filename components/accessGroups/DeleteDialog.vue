<template>
  <v-dialog max-width="600px" persistent :model-value="visible" @update:model-value="$emit('update:visible', $event)">
    <v-card>
      <v-card-title class="text-h6">
        {{ t('deleteAccessGroupTitle') }}
      </v-card-title>
      <v-card-text>
        <span v-if="group">
          {{ t('deleteAccessGroupConfirmation', { groupName: group.name }) }}
        </span>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancel">
          {{ globalT('global.button.cancel') }}
        </v-btn>
        <v-btn color="error" @click="confirm">
          {{ globalT('global.button.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { IVeoAccessGroup } from '~/composables/api/queryDefinitions/accessGroups';
import { useVeoAlerts } from '~/composables/VeoAlert';

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

defineProps<{
  visible: boolean;
  group: IVeoAccessGroup | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm'): void;
}>();

function cancel() {
  emit('update:visible', false);
}

function confirm() {
  try {
    emit('confirm');
    displaySuccessMessage(t('deletingAccessGroupSuccess').toString());
    emit('update:visible', false);
  } catch {
    displayErrorMessage(t('deletingAccessGroupFailed').toString());
  }
}
</script>

<i18n src="~/locales/base/components/access-group-delete-dialog.json"></i18n>
