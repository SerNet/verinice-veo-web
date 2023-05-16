<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <div
    :class="$style['init-wrapper']"
    class="fill-height d-flex flex-column align-center justify-center"
  >
    <v-progress-circular
      color="primary"
      class="mb-4"
      indeterminate
      size="64"
    />
    <BaseCard>
      <v-card-text>
        <span class="text-body-1">{{ t('preparingForFirstUse') }}</span>
      </v-card-text>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { StorageSerializers, useStorage } from '@vueuse/core';
import unitQueryDefinitions, { IVeoUnit } from '~~/composables/api/queryDefinitions/units';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~~/composables/api/utils/query';
import { getFirstDomainDomaindId } from '~~/lib/utils';
import { LOCAL_STORAGE_KEYS } from '~~/types/localStorage';

const { t } = useI18n();

useHead({
  title: t('setup')
});
definePageMeta({ layout: 'plain' });

const { mutateAsync: createUnit } = useMutation(unitQueryDefinitions.mutations.create);

const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, { serializer: StorageSerializers.string });
const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, { serializer: StorageSerializers.string });

// Create first unit if it doesn't exist and navigate the user there afterwards
useQuery(unitQueryDefinitions.queries.fetchAll, undefined, { onSuccess: async (data: any) => {
  let unitId;
  let domainId;
  if(!(data as IVeoUnit[]).length || (data.length === 1 && data[0].name === 'Demo')) {
    const newUnitEvent = await createUnit({
      name: 'Unit 1',
      description: t('yourFirstUnit')
    });

    // Fetch new unit to get domain
    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: newUnitEvent.resourceId });
    unitId = newUnitEvent.resourceId;
    domainId = getFirstDomainDomaindId(unit);
  }
  await navigateTo({
    name: 'unit-domains-domain',
    params: {
      unit: unitId || lastUnit.value,
      domain: domainId || lastDomain.value
    }
  });
}
});
</script>

<i18n>
{
  "en": {
    "preparingForFirstUse": "verinice.veo gets prepared for first use...",
    "setup": "Setup",
    "yourFirstUnit": "Your first unit"
  },
  "de": {
    "preparingForFirstUse": "verinice.veo wird für die erste Verwendung vorbereitet...",
    "setup": "Setup",
    "yourFirstUnit": "Deine erste Unit"
  }
}
</i18n>

<style module lang="scss">
.init-wrapper {
  background: $background-primary;
}
</style>
