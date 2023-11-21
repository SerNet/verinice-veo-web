<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
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
    :title="t('assign')"
    v-bind="$attrs"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form
        ref="form"
        v-model="formIsValid"
        class="new-unit-form"
      >
        <div class="mx-4">
          <h3 class="text-h3 mt-4">
            {{ t('domainselection') }}
          </h3>

          <UtilProminentSelectionList
            v-model="selectedDomains"
            :items="availableDomains"
            multiple
          />
        </div>
      </v-form>
    </template>

    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false)"
      >
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn
        :disabled="!actionPermitted"
        color="primary"
        variant="text"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { getEntityDetailsFromLink } from '~/lib/utils';
import domainQueryDefinitions, { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~~/composables/api/utils/query';
import { IVeoLink } from '~/types/VeoTypes';

withDefaults(defineProps<{
  modelValue: boolean
}>(), {
  modelValue: false
});

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const { ability } = useVeoPermissions();

const { createLink } = useCreateLink();

const actionPermitted = computed(() => ability.value.can('manage', 'units') && !!formIsValid.value && unitDetails.domains.length);

const form = ref();
const formIsValid = ref(false);

const unitDetails = reactive<{
  name: string | undefined,
  description: string | undefined
  domains: IVeoLink[]
}>({ name: undefined, description: undefined, domains: [] });

watch(() => unitDetails, () => {
  if (form.value) {
    form.value.validate();
  }
}, { deep: true });

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains, undefined, {
  onSuccess: (data) => {
    unitDetails.domains = (data as IVeoDomain[]).map((domain) => createLink('domains', domain.id));
  }
});
const availableDomains = computed(() => domains.value?.map((domain) => ({
  title: domain.name,
  subtitle: domain.description,
  value: domain.id
})) ?? []);

const selectedDomains = computed({
  get: () => unitDetails.domains.map((domain) => getEntityDetailsFromLink(domain).id),
  set: (newValue) => {
    unitDetails.domains = newValue.map((domainId) => createLink('domains', domainId));
  }
});
</script>

<i18n>
{
  "en": {
  },
  "de": {
  }
}
</i18n>
