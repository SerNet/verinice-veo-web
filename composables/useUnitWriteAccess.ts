/*
 * verinice.veo web
 * Copyright (C) 2025 Haneen Husin
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function useUnitWriteAccess() {
  const isLoading = ref(false);
  const error = ref<TVeoError | undefined>();
  const unitAbility = ref(createMongoAbility());
  const { can, rules } = new AbilityBuilder(createMongoAbility);
  const route = useRoute();
  const unitId = computed(() => route?.params?.unit);
  const { keycloak } = useVeoUser();
  try {
    if (!unitId) return;
    const unitWriteAccess = keycloak.value?.tokenParsed?.unit_write_access ?? [];
    isLoading.value = true;
    if (unitWriteAccess.includes(unitId.value)) {
      can('manage', 'units', { id: unitId.value });
    }
    unitAbility.value.update(rules);
    isLoading.value = false;
  } catch (e) {
    console.error('Error fetching current unit access:', e);
  } finally {
    isLoading.value = false;
  }

  return {
    unitAbility,
    isLoading,
    error
  };
}
