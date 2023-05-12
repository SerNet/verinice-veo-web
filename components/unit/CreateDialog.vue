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
  <BaseDialog
    :model-value="modelValue"
    :title="t('createUnit')"
    :persistent="persistent || creatingUnit"
    :close-disabled="creatingUnit"
    v-bind="$attrs"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form
        ref="form"
        v-model="formIsValid"
        class="new-unit-form"
      >
        <v-text-field
          v-model="newUnit.name"
          :rules="[requiredRule]"
          required
          variant="underlined"
          :label="t('name')"
        />
        <v-text-field
          v-model="newUnit.description"
          :rules="[requiredRule]"
          required
          variant="underlined"
          :label="t('description')"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        color="black"
        text
        @click="$emit('update:model-value', false)"
      >
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        :disabled="!formIsValid || ability.cannot('manage', 'units')"
        :loading="creatingUnit"
        color="primary"
        text
        @click="createUnit"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useRules } from '~/composables/utils';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useQuerySync } from '~~/composables/api/utils/query';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  persistent: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:model-value']);


const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const router = useRouter();
const { requiredRule } = useRules();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();

watch(() => props.modelValue, (newValue) => {
  if(!newValue) {
    newUnit.name = undefined;
    newUnit.description = undefined;
    form.value.resetValidation();
  }
});

// Everything unit related
const form = ref();
const formIsValid = ref(false);
const newUnit = reactive<{ name: string | undefined, description: string | undefined }>({ name: undefined, description: undefined });

const { mutateAsync, isLoading: creatingUnit, data: newUnitPayload } = useMutation(unitQueryDefinitions.mutations.create);
const createUnit = async () => {
  if(!formIsValid.value || ability.value.cannot('manage', 'units')) {
    return;
  }
  try {
    await mutateAsync(newUnit);
    displaySuccessMessage(t('unitCreated'));
    emit('update:model-value', false);
    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: newUnitPayload.value?.resourceId as string });
    const domainId = getFirstDomainDomaindId(unit);

    if (domainId) {
      router.push({
        name: 'unit-domains-domain',
        params: {
          unit: createUUIDUrlParam('unit', unit.id),
          domain: createUUIDUrlParam('domain', domainId)
        }
      });
    }
  } catch (error: any) {
    displayErrorMessage(t('createUnitError'), error.message);
  }
};
</script>

<i18n>
{
  "en": {
    "createUnit": "Create unit",
    "createUnitError": "Couldn't create unit",
    "description": "Description",
    "name": "Unit name",
    "unitCreated": "New unit was created successfully"
  },
  "de": {
    "createUnit": "Unit erstellen",
    "createUnitError": "Unit konnte nicht erstellt werden",
    "description": "Beschreibung",
    "name": "Name der Unit",
    "unitCreated": "Unit wurde erfolgreich erstellt"
  }
}
</i18n>
